import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const number = searchParams.get('number');

    const apiKey = process.env.MY_HOUJIN_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'APIキーが設定されていません。' },
        { status: 500 }
      );
    }

    if (!number) {
      return NextResponse.json(
        { error: '法人番号を指定してください。' },
        { status: 400 }
      );
    }

    // type=12 を指定して Unicode の XML 形式で取得
    const apiUrl = `https://api.houjin-bangou.nta.go.jp/4/num?id=${apiKey}&number=${encodeURIComponent(
      number
    )}&type=12`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: '国税庁APIへの接続に失敗しました。' },
        { status: response.status }
      );
    }

    const xmlText = await response.text();

    const extractTag = (xml: string, tag: string) => {
      const match = xml.match(new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 's'));
      return match ? match[1].trim() : '';
    };

    const corpName = extractTag(xmlText, 'name');
    const kind = extractTag(xmlText, 'kind');
    const prefectureName = extractTag(xmlText, 'prefectureName');
    const cityName = extractTag(xmlText, 'cityName');
    const streetNumber = extractTag(xmlText, 'streetNumber');
    const postCode = extractTag(xmlText, 'postCode');

    if (!corpName) {
      return NextResponse.json(
        { error: '該当する法人が見つかりませんでした。' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      corporation: [
        {
          name: corpName,
          kind: kind,
          prefectureName: prefectureName,
          cityName: cityName,
          streetNumber: streetNumber,
          postCode: postCode,
        }
      ]
    });
    
  } catch (error: any) {
    console.error('Houjin API Exception:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}