import { NextResponse } from 'next/server';

// 国税庁法人番号システム WebAPI のエンドポイント
const HOUJIN_API_URL = 'https://api.houjin-bangou.nta.go.jp/4/num';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const corporateNumber = searchParams.get('number') || searchParams.get('corporateNumber');

    if (!corporateNumber || !/^\d{13}$/.test(corporateNumber)) {
      return NextResponse.json({ error: '有効な13桁の法人番号を指定してください。' }, { status: 400 });
    }

    // 💡 自社（NexusVision株式会社）の法人番号の場合は、郵便番号も含めて確実に最新情報を返す
    if (corporateNumber === '8370001051493') {
      return NextResponse.json({
        success: true,
        company: {
          corporateNumber: '8370001051493',
          companyName: 'NexusVision株式会社',
          corporateType: '株式会社',
          postalCode: '9830005', // 郵便番号を追加
          prefecture: '宮城県',
          city: '仙台市宮城野区',
          addressSub: '福室2丁目8番17号 福室マンション314号',
          representativeName: '挾間義尚',
        }
      });
    }

    const appId = process.env.MY_HOUJIN_API_KEY || process.env.HOUJIN_API_APP_ID;

    if (!appId) {
      console.warn('警告: MY_HOUJIN_API_KEY が設定されていません。モックデータを返します。');
      return NextResponse.json({
        success: true,
        company: {
          corporateNumber,
          companyName: 'サンプル株式会社',
          postalCode: '1000001',
          prefecture: '東京都',
          city: '千代田区',
          addressSub: '1-1-1',
          representativeName: '代表取締役 山田太郎',
          corporateType: '株式会社'
        }
      });
    }

    const url = `${HOUJIN_API_URL}?id=${appId}&number=${corporateNumber}&history=0&format=json`;
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

    const kindMap: { [key: string]: string } = {
      '01': '株式会社',
      '02': '有限会社',
      '03': '合名会社',
      '04': '合資会社',
      '05': '合同会社',
      '31': '国機関',
      '32': '地方公共団体',
      '41': 'その他'
    };

    const companyInfo = {
      corporateNumber: corp.corporateNumber,
      companyName: corp.name,
      corporateType: kindMap[corp.kind] || '法人',
      postalCode: corp.postCode || '', // 郵便番号のマッピングを追加
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