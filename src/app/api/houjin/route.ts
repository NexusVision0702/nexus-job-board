import { NextResponse } from 'next/server';

// 国税庁法人番号システム WebAPI のエンドポイント
const HOUJIN_API_URL = 'https://api.houjin-bangou.nta.go.jp/4/num';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const corporateNumber = searchParams.get('corporateNumber');

    if (!corporateNumber || !/^\d{13}$/.test(corporateNumber)) {
      return NextResponse.json({ error: '有効な13桁の法人番号を指定してください。' }, { status: 400 });
    }

    // 環境変数から国税庁APIアプリケーションIDを取得
    const appId = process.env.HOUJIN_API_APP_ID || process.env.NEXT_PUBLIC_HOUJIN_API_APP_ID;

    if (!appId) {
      console.warn('警告: HOUJIN_API_APP_ID が設定されていません。モックデータを返します。');
      // APIキー未設定時のフォールバック（テスト用）
      return NextResponse.json({
        success: true,
        company: {
          corporateNumber,
          companyName: 'サンプル株式会社',
          prefecture: '東京都',
          city: '千代田区',
          addressSub: '1-1-1',
          representativeName: '代表取締役 山田太郎',
          corporateType: '株式会社'
        }
      });
    }

    // 国税庁APIへリクエスト送信
    const url = `${HOUJIN_API_URL}?id=${appId}&number=${corporateNumber}&type=1&history=0`;
    const apiRes = await fetch(url);

    if (!apiRes.ok) {
      return NextResponse.json({ error: '国税庁法人番号APIとの通信に失敗しました。' }, { status: 502 });
    }

    const data = await apiRes.json();
    const corporations = data?.corporation;

    if (!corporations || corporations.length === 0) {
      return NextResponse.json({ error: '該当する法人番号が見つかりませんでした。' }, { status: 404 });
    }

    const corp = corporations[0];

    // レスポンスデータの整形
    const companyInfo = {
      corporateNumber: corp.corporateNumber,
      companyName: corp.name,
      corporateType: corp.kind === '01' ? '株式会社' : corp.kind === '02' ? '有限会社' : '法人',
      prefecture: corp.prefectureName || '',
      city: (corp.cityName || '') + (corp.streetNumber || ''),
      addressSub: corp.addressDetails || '',
      representativeName: corp.representativeName || '',
    };

    return NextResponse.json({
      success: true,
      company: companyInfo,
    });

  } catch (error: any) {
    console.error('Houjin API Error:', error);
    return NextResponse.json({ error: error.message || '法人番号の取得処理に失敗しました。' }, { status: 500 });
  }
}