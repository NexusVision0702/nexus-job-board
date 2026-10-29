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

    // 6桁のランダムな認証コードを生成
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 有効期限10分

    // DynamoDBに認証コードを保存
    const codeItem = {
      id: `code_${email}`,
      email,
      verificationCode,
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    try {
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: codeItem,
      }));
    } catch (dbErr: any) {
      console.error('DynamoDB 認証コード保存エラー:', dbErr);
      return NextResponse.json({ error: 'データベースへのコード保存に失敗しました。' }, { status: 500 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ RESEND_API_KEY が設定されていません。');
      return NextResponse.json({ error: 'メール送信機能の環境設定が不足しています。' }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    
    const subject = `【ネクビジョ求人】企業アカウント登録 ご本人様確認（認証コードのご案内）`;
    const text = [
      "ネクビジョ求人をご利用いただき、",
      "誠にありがとうございます。",
      "",
      "本システムにおける企業アカウントの新規登録にあたり、",
      "ご本人様確認のための二段階認証コードを発行いたしました。",
      "",
      "以下の6桁の確認コードを、",
      "登録画面の入力フォームへご入力ください。",
      "",
      "--------------------------------------------------",
      `■ 認証コード: ${verificationCode}`,
      "--------------------------------------------------",
      "",
      "【重要・注意事項】",
      "・本コードの有効期限は、送信から10分間となっております。",
      "・有効期限が切れた場合は、お手数ですが",
      " 登録画面よりコードの再送を行ってください。",
      "・セキュリティ保持のため、本コードを第三者に",
      " 共有・開示しないようご注意ください。",
      "・心当たりがない場合や、本登録のお手続きをされていない場合は、",
      " 本メールを速やかに破棄していただき、",
      " お手数ですが運営事務局までご一報いただけますと幸いです。",
      "",
      "引き続き「ネクビジョ求人」を何卒よろしくお願い申し上げます。",
      "",
      "--------------------------------------------------",
      "【ネクビジョ求人 運営事務局】",
      "ホームページ: https://company.nexus-vision.net/",
      "お問い合わせ: info@nexus-vision.net",
      "受付時間: 平日 10:00〜17:00",
      "--------------------------------------------------",
    ].join("\n");

    // 🔍 Resendからの返り値をキャッチして検証できるように修正
    try {
      const response = await resend.emails.send({
        from: 'ネクビジョ求人 運営事務局 <support@nexus-vision.net>',
        to: [email],
        subject: subject,
        text: text,
      });

      console.log('>>> Resend API 応答:', response);

      if (response.error) {
        console.error('Resend API エラー:', response.error);
        return NextResponse.json({ 
          error: `【Resend送信エラー】 ${JSON.stringify(response.error)}` 
        }, { status: 500 });
      }
    } catch (networkErr: any) {
      console.error('Resend 通信/ネットワーク例外:', networkErr?.message || networkErr);
      return NextResponse.json({ 
        error: `【Resend通信例外】 ${networkErr?.message || networkErr}` 
      }, { status: 500 });
    }

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