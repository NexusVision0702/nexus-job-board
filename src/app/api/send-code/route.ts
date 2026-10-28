import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const accessKeyId = process.env.MY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.MY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '';
const region = process.env.MY_AWS_REGION || process.env.AWS_REGION || 'ap-northeast-1';
const TABLE_NAME = process.env.MY_DYNAMODB_COMPANY_TABLE || process.env.DYNAMODB_COMPANY_TABLE || 'nexus-job-board';

const client = new DynamoDBClient({
  region,
  credentials: { accessKeyId, secretAccessKey },
});
const docClient = DynamoDBDocumentClient.from(client);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'メールアドレスが指定されていません。' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'メール送信機能の環境設定が不足しています。' }, { status: 500 });
    }

    const resend = new Resend(apiKey);

    // 6桁のランダムな認証コードを生成
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 💡 有効期限を10分後に設定（現在時刻 + 10分）
    const expiresAt = Date.now() + 10 * 60 * 1000;

    // DynamoDBに認証コードと有効期限を一時保存（キーはメールアドレスなど、識別しやすい形式）
    // ※ 既存の本登録データと混ざらないよう、プレフィックスとして 'code_' を付与
    const codeItem = {
      id: `code_${email}`,
      email,
      verificationCode,
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: codeItem,
    }));

    // メール送信処理
    const { error } = await resend.emails.send({
      from: 'ネクビジョ求人 運営事務局 <noreply@nexus-vision.net>',
      to: [email],
      subject: '【ネクビジョ求人】認証コードのお知らせ',
      text: `ネクビジョ求人をご利用いただきありがとうございます。\n\n認証コードは以下の6桁です（有効期限：10分）。\n\n${verificationCode}\n\nこのコードを画面に入力してください。`,
    });

    if (error) {
      console.error('Resend メール送信エラー:', error);
      return NextResponse.json({ error: `メールの送信に失敗しました: ${error.message || '詳細不明'}` }, { status: 500 });
    }

    console.log(`>>> [認証コード送信] 宛先: ${email} / コード: ${verificationCode}`);

    return NextResponse.json({ 
      success: true, 
      message: '認証コードを送信しました。'
    });

  } catch (error: any) {
    console.error('Send Code API Error:', error);
    return NextResponse.json(
      { error: error.message || '認証コードの送信に失敗しました。' },
      { status: 500 }
    );
  }
}