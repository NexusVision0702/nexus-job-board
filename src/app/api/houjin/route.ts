import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name'); // 会社名
    const number = searchParams.get('number'); // 法人番号（13桁）

    // AWS Amplifyの予約語制限（AWS_）を回避するため MY_ を付与
    const apiKey = process.env.MY_HOUJIN_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'APIキーが設定されていません。' },
        { status: 500 }
      );
    }

    if (!name && !number) {
      return NextResponse.json(
        { error: '検索条件（会社名または法人番号）を指定してください。' },
        { status: 400 }
      );
    }

    // 国税庁 法人番号APIのエンドポイント（タイプ: 1=商号または名称, 2=法人番号）
    const type = number ? '2' : '1';
    const query = number || name;
    
    // 💡 &format=json を追加して、確実にJSONでレスポンスをもらうように指定
    const apiUrl = `https://api.houjin-bangou.nta.go.jp/4/app?id=${apiKey}&${type}=${encodeURIComponent(
      query!
    )}&mode=1&kind=01&format=json`;

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: '国税庁APIへの接続に失敗しました。' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Houjin API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}