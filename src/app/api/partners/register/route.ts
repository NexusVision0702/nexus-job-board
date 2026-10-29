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

// ✉️ 0. 二段階認証コード通知メール送信（行幅・文面調整済み）
async function sendVerificationCodeEmail(email: string, verificationCode: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  
  const subject = `【ネクビジョ求人】企業アカウント登録 ご本人様確認（認証コードのご案内）`;
  const text = `
ネクビジョ求人をご利用いただき、
誠にありがとうございます。

本システムにおける企業アカウントの新規登録にあたり、
ご本人様確認のための二段階認証コードを発行いたしました。

以下の6桁の確認コードを、
登録画面の入力フォームへご入力ください。

--------------------------------------------------
■ 認証コード
${verificationCode}
--------------------------------------------------

【重要・注意事項】
・本コードの有効期限は、送信から10分間となっております。
・有効期限が切れた場合は、お手数ですが
 登録画面よりコードの再送を行ってください。
・セキュリティ保持のため、本コードを第三者に
 共有・開示しないようご注意ください。
・心当たりがない場合や、本登録のお手続きをされていない場合は、
 本メールを速やかに破棄していただき、
 お手数ですが運営事務局までご一報いただけますと幸いです。

引き続き「ネクビジョ求人」を何卒よろしくお願い申し上げます。

--------------------------------------------------
【ネクビジョ求人 運営事務局】
ホームページ: https://company.nexus-vision.net/
お問い合わせ: info@nexus-vision.net
受付時間: 平日 10:00〜17:00
--------------------------------------------------
`;

  await resend.emails.send({
    from: 'ネクビジョ求人 運営事務局 <support@nexus-vision.net>',
    to: [email],
    subject: subject,
    text: text,
  });
}

// ✉️ 1. 社内メーリングリストへの審査通知メール送信（行幅・文面調整済み）
async function sendReviewNotificationToInternal(companyData: any) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  const internalEmail = 'review-nexus-job@nexus-vision.net';
  
  const subject = `【要確認】ネクビジョ求人 新規企業アカウント登録申請における審査依頼（自動保留のご案内）`;
  const text = `
ネクビジョ運営責任者 各位

平素より「ネクビジョ求人」の運営システムを
ご利用いただき、誠にありがとうございます。

本日、新規の企業アカウント登録申請がございましたが、
自動審査システムによる事前検証におきまして、
不審な文字列の検知、または入力情報の不備・要確認事項が検出されました。
そのため、当システムにおきまして
「要確認（保留）」のステータスに自動的に振り分けられております。

つきましては、以下の申請内容および
【自動審査にて検出された保留理由】をご確認のうえ、
管理画面またはデータベース（AWS DynamoDB）にアクセスいただき、
手動による詳細審査およびアカウントの承認・否認の
ご対応をお願い申し上げます。

--------------------------------------------------
■ 自動審査システムの判定・検知理由
・判定ステータス： 保留（pending_review）
・今回システムが検知した保留理由：
  ${companyData.reviewReason}
--------------------------------------------------

■ 申請企業・ご担当者様詳細
・法人番号： ${companyData.corporateNumber}
・企業名（法人格含む）： ${companyData.corporateType || ''} ${companyData.companyName}
・代表者名： ${companyData.representativeName}
・ご担当者様メールアドレス： ${companyData.email}
・ホームページURL： ${companyData.homepageUrl || '未入力'}
・事業内容： ${companyData.businessDescription || '未入力'}
・システム受付日時： ${companyData.createdAt}
・レコードID： ${companyData.id}
--------------------------------------------------

企業の信頼性維持および安全なプラットフォーム運用のために、
ご多忙の折に大変恐縮ではございますが、内容をご確認のうえ、
速やかなご対応を何卒よろしくお願い申し上げます。

--------------------------------------------------
【ネクビジョ求人 運営システム自動通知】
--------------------------------------------------
`;

  await resend.emails.send({
    from: 'ネクビジョ求人 運営事務局 <support@nexus-vision.net>',
    to: [internalEmail],
    subject: subject,
    text: text,
  });
}

// ✉️ 2. 申請企業への受付完了メール送信（行幅・文面調整済み）
async function sendApplicationConfirmationToApplicant(companyData: any) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  
  const subject = `【ネクビジョ求人】企業アカウント登録申請の受付完了および今後の審査に関するご案内`;
  const text = `
${companyData.corporateType || ''} ${companyData.companyName}
${companyData.representativeName} 様

平素より「ネクビジョ求人」をご利用いただき、
誠にありがとうございます。
この度、企業アカウントの新規登録申請を
正常に受理いたしました。

ご登録いただいた以下の法人情報につきましては、
現在、運営事務局にて厳重な確認および審査を進めております。

--------------------------------------------------
■ ご登録内容の確認
・法人番号： ${companyData.corporateNumber}
・企業名： ${companyData.corporateType || ''} ${companyData.companyName}
・ご担当者様メールアドレス： ${companyData.email}
--------------------------------------------------

正式な審査結果（アカウントの承認または追加確認のご連絡）につきましては、
通常1〜3営業日以内に本メールアドレス宛へご通知いたします。

なお、審査の進行状況やご登録内容によりましては、
担当者よりお電話またはメールにて詳細の確認や
追加書類のご提出をお願いする場合がございます。
あらかじめご了承くださいますようお願い申し上げます。

審査完了まで今しばらくお待ちいただけますよう、
何卒よろしくお願い申し上げます。

--------------------------------------------------
【ネクビジョ求人 運営事務局】
ホームページ: https://company.nexus-vision.net/
お問い合わせ: info@nexus-vision.net
受付時間: 平日 10:00〜17:00
--------------------------------------------------
`;

  await resend.emails.send({
    from: 'ネクビジョ求人 運営事務局 <support@nexus-vision.net>',
    to: [companyData.email],
    subject: subject,
    text: text,
  });
}

// ✉️ 3. 申請企業への承認完了（利用開始）メール送信（行幅・文面調整済み）
async function sendApprovalNotificationToApplicant(companyData: any) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  
  const subject = `【ネクビジョ求人】企業アカウントの審査完了およびサービスご利用開始のお知らせ`;
  const text = `
${companyData.corporateType || ''} ${companyData.companyName}
${companyData.representativeName} 様

平素より「ネクビジョ求人」をご利用いただき、
誠にありがとうございます。

ご申請いただきました企業アカウントの審査が無事に完了し、
運営事務局にて正式にアカウントの承認を行いましたので
お知らせいたします。

本日より、「ネクビジョ求人」における求人のご掲載および
応募者管理などの各種サービスをご利用いただけます。

以下の専用ログインページより、
ご登録いただいたメールアドレスとパスワードを入力して
ログインしてください。

--------------------------------------------------
■ 企業様ログインページ
https://company.nexus-vision.net/login
--------------------------------------------------

貴社の採用活動が実りあるものとなり、
優秀な人材との素晴らしい出会いにつながりますよう、
「ネクビジョ求人」運営事務局一同、全力でサポートしてまいります。

操作方法のご不明点や、サービスに関するご質問などがございましたら、
いつでもお気軽に下記のお問い合わせ窓口までご連絡ください。

引き続き「ネクビジョ求人」を何卒よろしくお願い申し上げます。

--------------------------------------------------
【ネクビジョ求人 運営事務局】
ホームページ: https://company.nexus-vision.net/
お問い合わせ: info@nexus-vision.net
受付時間: 平日 10:00〜17:00
--------------------------------------------------
`;

  await resend.emails.send({
    from: 'ネクビジョ求人 運営事務局 <support@nexus-vision.net>',
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
      reviewReason = '企業名または代表者名に不審な文字列（テスト・スパム等）が検出されたため、手動確認に回されました。';
    }

    if (!corporateNumber || !/^\d{13}$/.test(corporateNumber)) {
      status = 'pending_review';
      reviewReason = '法人番号が13桁の半角数字ではない（桁数不足またはフォーマット不正）ため、手動確認に回されました。';
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
      // 1. まず受付完了メールを送信
      await sendApplicationConfirmationToApplicant(item);

      // 2. 自動承認（approved）の場合は、続けて「利用開始のお知らせメール」を送信
      if (status === 'approved') {
        await sendApprovalNotificationToApplicant(item);
      }

      // 3. 保留（pending_review）の場合は社内へ詳細な通知を送信
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