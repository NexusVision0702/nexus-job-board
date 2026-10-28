import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { Resend } from 'resend';

const accessKeyId = process.env.MY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.MY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '';
const region = process.env.MY_AWS_REGION || process.env.AWS_REGION || 'ap-northeast-1';
const TABLE_NAME = process.env.MY_DYNAMODB_COMPANY_TABLE || process.env.DYNAMODB_COMPANY_TABLE || 'nexus-job-board';

const client = new DynamoDBClient({
  region,
  credentials: { accessKeyId, secretAccessKey },
});
const docClient = DynamoDBDocumentClient.from(client);

// ✉️ 1. 社内メーリングリストへの審査通知メール送信
async function sendReviewNotificationToInternal(companyData: any) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  const internalEmail = 'review-nexus-job@nexus-vision.net';
  
  const subject = `【要確認】ネクビジョ求人 新規企業登録の審査依頼（自動保留）`;
  const text = `
【要確認】ネクビジョ求人 新規企業登録の審査依頼（自動保留）

ネクビジョ責任者 各位

新規の企業アカウント登録申請がございましたが、自動審査システムにて「要確認（保留）」と判定されました。
以下の詳細をご確認の上、管理画面よりご対応をお願いいたします。

・企業名： ${companyData.corporateType || ''} ${companyData.companyName}
・法人番号： ${companyData.corporateNumber}
・ご担当者メール： ${companyData.email}
`;

  await resend.emails.send({
    from: 'ネクビジョ求人 運営事務局 <support@nexus-vision.net>', // 💡 support@nexus-vision.netに変更
    to: [internalEmail],
    subject: subject,
    text: text,
  });
}

// ✉️ 2. 申請企業への受付完了メール送信
async function sendApplicationConfirmationToApplicant(companyData: any) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  
  const subject = `【ネクビジョ求人】企業アカウント登録申請を受け付けました`;
  const text = `
${companyData.companyName}
${companyData.representativeName} 様

平素より「ネクビジョ求人」をご利用いただき、誠にありがとうございます。
企業アカウントの登録申請を正常に受け付けました。
現在、審査を進めておりますのでいましばらくお待ちください。

--------------------------------------------------
ネクビジョ求人 運営事務局
ホームページ: https://www.nexusuvision-web.nexus-vision.net
お問い合わせ: support@nexus-vision.net
--------------------------------------------------
`;

  await resend.emails.send({
    from: 'ネクビジョ求人 運営事務局 <support@nexus-vision.net>', // 💡 support@nexus-vision.netに変更
    to: [companyData.email],
    subject: subject,
    text: text,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { corporateNumber, companyName, email, homepageUrl, representativeName, businessDescription, verificationCode } = body;

    // ==========================================
    // 🔐 認証コードの検証（10分以内 ＆ 一致確認）
    // ==========================================
    if (!verificationCode) {
      return NextResponse.json({ error: '認証コードが入力されていません。' }, { status: 400 });
    }

    try {
      const codeResult = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: `code_${email}` },
      }));

      const savedData = codeResult.Item;

      if (!savedData) {
        return NextResponse.json({ error: '認証コードが送信されていないか、有効期限が切れています。もう一度送信してください。' }, { status: 400 });
      }

      // 有効期限（10分）のチェック
      if (Date.now() > savedData.expiresAt) {
        return NextResponse.json({ error: '認証コードの有効期限（10分）が切れています。コードを再送信してください。' }, { status: 400 });
      }

      // 入力されたコードと一致するかチェック
      if (savedData.verificationCode !== verificationCode.trim()) {
        return NextResponse.json({ error: 'コードが一致しません。' }, { status: 400 });
      }

    } catch (codeErr) {
      console.error('認証コード検証エラー:', codeErr);
      return NextResponse.json({ error: '認証コードの検証に失敗しました。' }, { status: 500 });
    }

    // ==========================================
    // 🔍 自動審査ロジック
    // ==========================================
    let status = 'approved';
    let reviewReason = '自動審査を通過しました（優良企業認定）。';

    const spamKeywords = ['テスト', 'てすと', 'test', 'サンプル', 'sample', 'あ', 'xxx', 'aaa', '名無し'];
    const isSpamName = spamKeywords.some(keyword => 
      companyName?.toLowerCase().includes(keyword) || representativeName?.toLowerCase().includes(keyword)
    );

    if (isSpamName || !companyName || companyName.length < 2) {
      status = 'pending_review';
      reviewReason = '企業名または代表者名に不審な文字列が検出されたため、手動確認に回されました。';
    }

    if (!corporateNumber || !/^\d{13}$/.test(corporateNumber)) {
      status = 'pending_review';
      reviewReason = '法人番号が13桁の半角数字ではないため、手動確認に回されました。';
    }

    // 重複チェック
    try {
      const existingData = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
      const duplicate = existingData.Items?.find(
        item => (item.corporateNumber === corporateNumber || item.email === email) && !item.id.startsWith('code_')
      );
      if (duplicate) {
        return NextResponse.json(
          { error: 'この法人番号またはメールアドレスはすでに登録されています。' },
          { status: 400 }
        );
      }
    } catch (scanErr) {
      console.warn('重複チェック時のスキャン警告:', scanErr);
    }

    // データベースへ保存
    const companyId = 'comp_' + Date.now();
    const item = {
      id: companyId,
      corporateNumber,
      companyName,
      email,
      homepageUrl,
      representativeName,
      businessDescription,
      status,
      reviewReason,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }));

    // 使用済みの認証コードを削除（セキュリティ向上）
    try {
      await docClient.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id: `code_${email}` },
      }));
    } catch (delErr) {
      console.warn('認証コードの削除に失敗しました:', delErr);
    }

    // メール送信処理
    try {
      await sendApplicationConfirmationToApplicant(item);
      if (status === 'pending_review') {
        await sendReviewNotificationToInternal(item);
      }
    } catch (mailErr) {
      console.error('>>> メール送信エラー:', mailErr);
    }

    return NextResponse.json({ 
      success: true, 
      companyId, 
      status,
      message: status === 'approved' 
        ? '企業アカウントの登録が自動承認されました！' 
        : '企業アカウントの登録申請を受け付けました（現在審査中です）。'
    });

  } catch (error: any) {
    console.error('>>> Registration API Error:', error);
    return NextResponse.json(
      { error: error.message || '登録処理に失敗しました。' },
      { status: 500 }
    );
  }
}