import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Resendクライアントの初期化（環境変数からAPIキーを読み込み）
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'メールアドレスが指定されていません。' }, { status: 400 });
    }

    // 6桁のランダムな認証コードを生成
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // ==========================================
    // 📨 実際のメール送信処理（Resend）
    // ==========================================
    const { data, error } = await resend.emails.send({
      from: 'ネクビジョ求人 運営事務局 <noreply@nexus-vision.net>',
      to: [email],
      subject: '【ネクビジョ求人】認証コードのお知らせ',
      text: `ネクビジョ求人をご利用いただきありがとうございます。\n\n認証コードは以下の6桁です。\n\n${verificationCode}\n\nこのコードを画面に入力してください。`,
    });

    if (error) {
      console.error('Resend メール送信エラー:', error);
      return NextResponse.json({ error: 'メールの送信に失敗しました。' }, { status: 500 });
    }

    console.log(`>>> [メール送信成功] 宛先: ${email} / 認証コード: ${verificationCode}`);

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