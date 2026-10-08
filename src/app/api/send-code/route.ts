import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY is not configured' }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const data = await resend.emails.send({
      from: 'ネクビジョ求人 運営チーム <support@nexus-vision.net>',
      to: [email],
      subject: '【ネクビジョ求人】二段階認証コードのお知らせ',
      text: `
平素より「ネクビジョ求人」をご利用いただき、誠にありがとうございます。

企業アカウントの登録申請を進めるための二段階認証コードをお送りいたします。
以下の認証コードを登録画面にご入力ください。

--------------------------------------------------
認証コード： ${code}
（有効期限：10分）
--------------------------------------------------

※本メールにお心当たりがない場合は、お手数ですがこのメールを破棄していただきますようお願い申し上げます。
※本メールはシステムより自動送信されています。

--------------------------------------------------
NexusVision株式会社 / ネクビジョ求人 運営チーム
https://www.nexusuvision-web.nexus-vision.net/
--------------------------------------------------
      `.trim(),
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}