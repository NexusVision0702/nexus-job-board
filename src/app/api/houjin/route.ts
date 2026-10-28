import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    const number = searchParams.get('number');

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

    const endpoint = number ? 'num' : 'name';
    const paramName = number ? 'number' : 'name';
    const query = number || name;
    
    // type=01 (XML形式で取得してコード内で安全に解析する)
    let apiUrl = `https://api.houjin-bangou.nta.go.jp/4/${endpoint}?id=${apiKey}&${paramName}=${encodeURIComponent(
      query!
    )}&type=01`;

    if (name) {
      apiUrl += `&mode=1&kind=01`;
    }

    const response = await fetch(apiUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: '国税庁APIへの接続に失敗しました。' },
        { status: response.status }
      );
    }

    const xmlText = await response.text();

    // 簡易かつ確実にXMLから必要な情報を抽出するヘルパー関数
    const extractTag = (xml: string, tag: string) => {
      const match = xml.match(new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 's'));
      return match ? match[1].trim() : '';
    };

    // 国税庁APIのXML構造から法人情報を抽出
    const corpName = extractTag(xmlText, 'name');
    const kind = extractTag(xmlText, 'kind'); // 01:株式会社, 02:有限会社, 03:合同会社 など
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

    // フロントエンドが期待するフォーマット（corporation配列）で返す
    const formattedData = {
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
    };

    return NextResponse.json(formattedData);
    
  } catch (error: any) {
    console.error('Houjin API Exception:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}