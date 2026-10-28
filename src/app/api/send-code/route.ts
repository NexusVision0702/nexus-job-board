import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    // 💡 ローカル＆テスト用：実際にメールを送らず、サーバーのコンソールに認証コードを大きく表示する
    console.log('\n========================================');
    console.log(`🔑 【ローカルテスト用 認証コード】`);
    console.log(`📧 宛先: ${email}`);
    console.log(`🔢 認証コード: ${code}`);
    console.log('========================================\n');

    // テスト成功としてレスポンスを返す
    return NextResponse.json({ 
      success: true, 
      message: 'Mock email sent successfully (Console logged)',
      mockCode: code // 画面側でも確認したい場合はここに含められます
    });

  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}