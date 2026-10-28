import { NextResponse } from 'next/server';
// import { Resend } from 'resend'; // Resendを使う場合のインポート

// const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'メールアドレスが指定されていません。' }, { status: 400 });
    }

    // 6桁のランダムな認証コードを生成
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // ==========================================
    // 📨 実際のメール送信処理
    // ==========================================
    /*
    // Resendを使用する場合の例：
    const { data, error } = await resend.emails.send({
      from: 'ネクビジョ求人 運営事務局 <noreply@nexus-vision.net>',
      to: [email],
      subject: '【ネクビジョ求人】認証コードのお知らせ',
      text: `ネクビジョ求人をご利用いただきありがとうございます。\n\n認証コードは以下の6桁です。\n\n${verificationCode}\n\nこのコードを画面に入力してください。`,
    });

    if (error) {
      console.error('メール送信エラー:', error);
      return NextResponse.json({ error: 'メールの送信に失敗しました。' }, { status: 500 });
    }
    */

    // 💡 現在ダミーになっている場合は、上記のコメントアウトを外して本番用の送信処理に切り替えてください。
    console.log(`>>> [本番メール送信] 宛先: ${email} / 認証コード: ${verificationCode}`);

    // セキュリティやセッション管理のため、本来はこのコードをDBやサーバーのメモリ（Redis等）に一時保存します。

    return NextResponse.json({ 
      success: true, 
      message: '認証コードを送信しました。',
      // デバッグ用やテスト段階では残しても良いですが、本番では code はレスポンスに含めないようにします
      // mockCode: verificationCode 
    });

  } catch (error: any) {
    console.error('Send Code API Error:', error);
    return NextResponse.json(
      { error: error.message || '認証コードの送信に失敗しました。' },
      { status: 500 }
    );
  }
}