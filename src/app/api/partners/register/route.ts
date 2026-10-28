import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
// ※ 必要に応じてメール送信ライブラリをインポートしてください（例: import { Resend } from 'resend';）

const accessKeyId = process.env.MY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.MY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '';
const region = process.env.MY_AWS_REGION || process.env.AWS_REGION || 'ap-northeast-1';
const TABLE_NAME = process.env.MY_DYNAMODB_COMPANY_TABLE || process.env.DYNAMODB_COMPANY_TABLE || 'nexus-job-board';

const client = new DynamoDBClient({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

// ✉️ 社内メーリングリストへのスマホ最適化版通知メール送信関数
async function sendReviewNotificationToInternal(companyData: any) {
  const internalEmail = 'review-nexus-job@nexus-vision.net';
  
  const subject = `【要確認】ネクビジョ求人 新規企業登録の審査依頼（自動保留）`;
  const text = `
【要確認】ネクビジョ求人 新規企業登録の審査依頼（自動保留）

ネクビジョ責任者 各位

平素より「ネクビジョ求人」の運営にご尽力いただきありがとうございます。
新規の企業アカウント登録申請がございましたが、自動審査システムにて「要確認（保留：pending_review）」と判定されました。

以下の詳細およびチェックリストをご確認の上、管理画面よりご対応をお願いいたします。

━━━━━━━━━━━━━━━━━━━━━
■ 申請企業 詳細情報
━━━━━━━━━━━━━━━━━━━━━
・企業名：
 ${companyData.corporateType || ''} ${companyData.companyName}
・法人番号：
 ${companyData.corporateNumber}
・代表者名：
 ${companyData.representativeName}
・ご担当者名：
 ${companyData.contactName || '未記載'}
・連絡先メール：
 ${companyData.email}
・電話番号：
 ${companyData.phone || '未記載'}
・ホームページ：
 ${companyData.homepageUrl || '未記載'}
・事業内容：
 ${companyData.businessDescription}

━━━━━━━━━━━━━━━━━━━━━
■ 自動審査の判定結果
━━━━━━━━━━━━━━━━━━━━━
・判定ステータス：
 要手動確認（pending_review）
・検知された理由：
 ${companyData.reviewReason}

━━━━━━━━━━━━━━━━━━━━━
■ 責任者・担当者向けチェックリスト
━━━━━━━━━━━━━━━━━━━━━
1. 国税庁法人番号システム等で、実在の企業であるか確認してください。
2. ホームページURLにアクセスし、実態のある事業を行っているか目視で確認してください。
3. 事業内容や企業名に不審な点がないか確認の上、管理画面から「承認」または「否認」の処理を行ってください。

━━━━━━━━━━━━━━━━━━━━━
以上、ご確認のほどよろしくお願い申し上げます。
`;

  // 💡 [メール送信の実装部分]
  // プロジェクトで導入しているメール送信手段に合わせて書き換えてください。
  // 例 (Resendの場合):
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'noreply@nexus-vision.net',
  //   to: internalEmail,
  //   subject: subject,
  //   text: text,
  // });

  console.log(`>>> 審査依頼メールを社内メーリングリスト (${internalEmail}) 宛てに送信しました。`);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { corporateNumber, companyName, email, homepageUrl, representativeName, businessDescription } = body;

    // ==========================================
    // 🔍 レベル2：スタンダード審査（自動バリデーション＆NGワード検知）
    // ==========================================
    let status = 'approved'; // デフォルトは条件クリアで自動承認
    let reviewReason = '自動審査を通過しました（優良企業認定）。';

    // 1. スパム・テスト入力の検知（企業名・代表者名）
    const spamKeywords = ['テスト', 'てすと', 'test', 'サンプル', 'sample', 'あ', 'xxx', 'aaa', '名無し'];
    const isSpamName = spamKeywords.some(keyword => 
      companyName?.toLowerCase().includes(keyword) || representativeName?.toLowerCase().includes(keyword)
    );

    if (isSpamName || !companyName || companyName.length < 2) {
      status = 'pending_review';
      reviewReason = '企業名または代表者名にテスト入力または不審な文字列が検出されたため、手動確認に回されました。';
    }

    // 2. 法人番号の形式チェック (13桁の半角数字)
    if (!corporateNumber || !/^\d{13}$/.test(corporateNumber)) {
      status = 'pending_review';
      reviewReason = '法人番号が13桁の半角数字ではないため、手動確認に回されました。';
    }

    // 3. ホームページURLの形式チェック
    if (homepageUrl && !homepageUrl.startsWith('http://') && !homepageUrl.startsWith('https://')) {
      status = 'pending_review';
      reviewReason = 'ホームページURLの形式が正しくないため、手動確認に回されました。';
    }

    // 4. 事業内容のチェック（他社媒体基準のNGワード・文字数判定）
    const restrictedWords = [
      '副業紹介', '誰でも簡単', 'スマホをポチポチ', 'ワンクリック', '高収入アルバイト', 
      '即日即金', '高額報酬', 'マルチ商法', 'ネットワークビジネス', '内職詐欺',
      '投資勧誘', '暗号資産の運用代行', 'FX自動売買システム', 'キャッシング紹介', 
      '裏バイト', '即日融資', 'アダルト', '出会い系', 'チャットレディ', 'パパ活', '裏DVD'
    ];
    
    const hasRestrictedWord = restrictedWords.some(word => businessDescription?.includes(word));

    if (!businessDescription || businessDescription.length < 10) {
      status = 'pending_review';
      reviewReason = '事業内容の記載が短すぎる（または未記入）ため、詳細確認のため手動審査に回されました。';
    } else if (hasRestrictedWord) {
      status = 'pending_review';
      reviewReason = '事業内容に要確認のキーワード（不適切な表現・グレー案件等）が含まれているため、手動審査に回されました。';
    }

    // 5. DynamoDBでの重複登録チェック
    try {
      const existingData = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
      const duplicate = existingData.Items?.find(
        item => item.corporateNumber === corporateNumber || item.email === email
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

    // ==========================================
    // 💾 データベースへ保存
    // ==========================================
    const companyId = 'comp_' + Date.now();
    const item = {
      id: companyId,
      ...body,
      status, // 'approved' または 'pending_review'
      reviewReason,
      createdAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    });

    await docClient.send(command);
    console.log(`>>> 登録完了 [ID: ${companyId}] 判定ステータス: ${status} (${reviewReason})`);

    // ==========================================
    // 📨 要手動確認（pending_review）の場合の社内メール通知
    // ==========================================
    if (status === 'pending_review') {
      try {
        await sendReviewNotificationToInternal(item);
      } catch (mailErr) {
        console.error('>>> 社内通知メールの送信に失敗しました:', mailErr);
      }
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