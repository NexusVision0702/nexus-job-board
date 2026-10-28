import React, { useState } from 'react';

const INDUSTRIES = [
  // IT・Web・通信
  'ソフトウェア開発・エンジニア', 'インフラ・ネットワークエンジニア', 'AI・データサイエンティスト',
  'Webデザイナー・UI/UX', 'フロントエンドエンジニア', 'バックエンドエンジニア',
  'プロジェクトマネージャー・ディレクター', '社内SE・情報システム', 'セキュリティエンジニア',
  'ITセールス・プリセールス', 'カスタマーサクセス・サポート', 'ゲーム開発・クリエイター',
  'Webマーケティング・SEO', 'SNS運用・PR担当', '通信インフラ・工事',
  
  // 営業・マーケティング
  '法人営業（B2B）', '個人営業（B2C）', 'ルートセールス', '海外営業・貿易',
  '営業企画・セールスオペレーション', 'マーケティング・商品企画', '広報・PR',
  '広告運用・Web広告', 'イベント企画・運営', 'テレマーケティング・インサイドセールス',

  // 事務・管理・バックオフィス
  '一般事務・アシスタント', '営業事務・受発注', '人事・採用・労務',
  '経理・財務・税務', '法務・コンプライアンス', '総務・ファシリティ',
  '秘書・受付', '広報・IR', '購買・調達・サプライチェーン',
  'データ入力・キータッチ', 'コールセンター管理・SV', '経営企画・事業戦略',

  // 製造・生産・品質管理
  '機械設計・CADオペレーター', '電気・電子回路設計', '生産管理・工程管理',
  '品質管理・品質保証', '工場製造・組立・加工', '溶接・板金・塗装',
  'メンテナンス・保守・修理', '研究開発・R&D', '化学・素材開発',
  '食品加工・製造', '包装・梱包・検品', 'プラント運転・管理',

  // 建築・土木・不動産
  '施工管理（建築・土木）', 'CADオペレーター（建築）', '設計・意匠（建築）',
  '測量・地質調査', '不動産営業・仲介', 'プロパティマネジメント',
  'ビルメンテナンス・管理', 'リフォーム・内装施工', '土木作業員・施工',

  // 医療・福祉・介護
  '看護師・准看護師', '介護職・ヘルパー', 'ケアマネージャー',
  '理学療法士・作業療法士', '薬剤師', '医療事務・クラーク',
  '保育士・幼稚園教諭', '生活相談員', '歯科助手・衛生士',

  // 飲食・フードサービス
  '店長・店舗マネージャー候補', 'ホールスタッフ・接客', '調理師・シェフ・板前',
  'キッチンスタッフ・調理補助', 'カフェバリスタ・パティシエ', '居酒屋・ダイニングスタッフ',
  'デリバリー・配達スタッフ', '栄養士・調理師',

  // 小売・販売・アパレル
  '店長・エリアマネージャー', '販売スタッフ・接客', 'VMD・店舗設計',
  'バイヤー・MD（マーチャンダイザー）', 'ECサイト運営・店長', 'スーパー・コンビニスタッフ',
  'アパレル販売・店員', 'コスメ・美容部員',

  // 物流・運輸・ドライバー
  '配送ドライバー・配達員', '大型トラック・長距離ドライバー', 'フォークリフト・倉庫作業',
  '物流管理・配車係', 'ピッキング・梱包スタッフ', 'タクシー・送迎ドライバー',
  '通関士・貿易事務', '倉庫管理・在庫管理',

  // 専門職・コンサル・その他
  '経営コンサルタント', '財務・M&Aコンサル', '公認会計士・税理士',
  '弁護士・司法書士・行政書士', '通訳・翻訳', 'グラフィックデザイナー',
  'コピーライター・編集者', 'カメラマン・映像クリエイター', '美容師・スタイリスト',
  'エステティシャン・セラピスト', 'フィットネストレーナー', '警備・セキュリティ',
  '清掃・ビルクリーニング', 'ホテル・フロントスタッフ', '旅行代理店・ツアープランナー'
];

interface Props {
  corporateType: string;
  setCorporateType: (val: string) => void;
  companyName: string;
  setCompanyName: (val: string) => void;
  companyNameKana: string;
  setCompanyNameKana: (val: string) => void;
  representativeName: string;
  setRepresentativeName: (val: string) => void;
  contactName: string;
  setContactName: (val: string) => void;
  industry: string | string[];
  setIndustry: (val: any) => void;
  corporateNumber?: string;
  setCorporateNumber?: (val: string) => void;
  setAddress?: (val: string) => void;
  setPostalCode?: (val: string) => void;
  setPrefecture?: (val: string) => void;
  setCity?: (val: string) => void;
  setStreet?: (val: string) => void;
  onNext: () => void;
  errorMessage: string;
}

export default function Step1Basic({
  corporateType, setCorporateType,
  companyName, setCompanyName,
  companyNameKana, setCompanyNameKana,
  representativeName, setRepresentativeName,
  contactName, setContactName,
  industry, setIndustry,
  corporateNumber = '', setCorporateNumber,
  setAddress, setPostalCode, setPrefecture, setCity, setStreet,
  onNext, errorMessage
}: Props) {

  const [loadingHoujin, setLoadingHoujin] = useState(false);
  const [houjinError, setHoujinError] = useState('');
  const [houjinSuccess, setHoujinSuccess] = useState('');

  const handleFetchHoujin = async () => {
    if (!corporateNumber || corporateNumber.length !== 13) {
      setHoujinError('13桁の法人番号を入力してください。');
      return;
    }
    setLoadingHoujin(true);
    setHoujinError('');
    setHoujinSuccess('');

    try {
      const res = await fetch(`/api/houjin?number=${corporateNumber}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '国税庁APIへの接続に失敗しました。');
      }

      const corporations = data?.corporation;
      if (corporations && corporations.length > 0) {
        const corp = corporations[0];
        
        const name = corp.name || '';
        const kind = corp.kind === '01' ? '株式会社' : corp.kind === '02' ? '有限会社' : corp.kind === '03' ? '合同会社' : '';
        if (setCompanyName) setCompanyName(name);
        if (kind && setCorporateType) setCorporateType(kind);

        const pref = corp.prefectureName || '';
        const city = corp.cityName || '';
        const street = corp.streetNumber || '';

        if (setPostalCode && corp.postCode) setPostalCode(corp.postCode);
        if (setPrefecture && pref) setPrefecture(pref);
        if (setCity && city) setCity(city);

        // 💡 都道府県名や市区町村名が street に含まれている場合は自動でカットして番地のみにする
        let cleanStreet = street;
        if (pref && cleanStreet.startsWith(pref)) {
          cleanStreet = cleanStreet.slice(pref.length);
        }
        if (city && cleanStreet.startsWith(city)) {
          cleanStreet = cleanStreet.slice(city.length);
        }
        const trimmedStreet = cleanStreet.trim();

        if (setStreet) setStreet(trimmedStreet);
        if (setAddress) setAddress(trimmedStreet);

        setHoujinSuccess('企業情報を自動取得しました！');
      } else {
        setHoujinError('該当する法人が見つかりませんでした。');
      }
    } catch (err: any) {
      setHoujinError(err.message || 'エラーが発生しました。');
    } finally {
      setLoadingHoujin(false);
    }
  };

  const selectedIndustries: string[] = Array.isArray(industry) 
    ? industry 
    : (industry ? String(industry).split(',').map(s => String(s || '').trim()).filter(Boolean) : []);

  const handleIndustryToggle = (ind: string) => {
    if (selectedIndustries.includes(ind)) {
      const updated = selectedIndustries.filter(item => item !== ind);
      setIndustry(updated);
    } else {
      const updated = [...selectedIndustries, ind];
      setIndustry(updated);
    }
  };

  // すべての項目が入力・選択されているかどうかの判定
  const isFormComplete = 
    Boolean(String(corporateNumber || '').trim().length === 13) &&
    Boolean(String(companyName || '').trim() && String(companyName || '').length >= 2) &&
    Boolean(String(companyNameKana || '').trim()) &&
    Boolean(String(representativeName || '').trim()) &&
    Boolean(String(contactName || '').trim()) &&
    selectedIndustries.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {errorMessage && (
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {/* 法人番号検索セクション */}
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>
          法人番号 (13桁) <span style={{ color: '#dc2626' }}>*必須</span> ※自動取得に対応
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            value={corporateNumber || ''} 
            onChange={e => setCorporateNumber && setCorporateNumber(e.target.value)} 
            placeholder="例: 8370001051493" 
            maxLength={13}
            style={{ flex: 1, padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#fff' }} 
          />
          <button 
            type="button"
            onClick={handleFetchHoujin}
            disabled={loadingHoujin}
            style={{ 
              padding: '0 20px', 
              background: '#2563eb', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: '700', 
              cursor: loadingHoujin ? 'not-allowed' : 'pointer' 
            }}
          >
            {loadingHoujin ? '取得中...' : '自動取得'}
          </button>
        </div>
        {houjinError && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '6px' }}>{houjinError}</div>}
        {houjinSuccess && <div style={{ color: '#16a34a', fontSize: '12px', marginTop: '6px' }}>{houjinSuccess}</div>}
        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '6px' }}>
          法人番号を入力して「自動取得」を押すと、企業名や住所が自動で反映されます。
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>
            企業名 (法人名) <span style={{ color: '#dc2626' }}>*必須</span>
          </label>
          <input 
            type="text" 
            value={companyName || ''} 
            onChange={e => setCompanyName(e.target.value)} 
            placeholder="NexusVision株式会社" 
            style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} 
          />
          <span style={{ fontSize: '10px', color: '#64748b' }}>※2文字以上で正確な名称を入力してください</span>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>
            企業名 フリガナ <span style={{ color: '#dc2626' }}>*必須</span>
          </label>
          <input 
            type="text" 
            value={companyNameKana || ''} 
            onChange={e => setCompanyNameKana(e.target.value)} 
            placeholder="ネクサスビジョンカブシキガイシャ" 
            style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} 
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>
            代表者のお名前 <span style={{ color: '#dc2626' }}>*必須</span>
          </label>
          <input 
            type="text" 
            value={representativeName || ''} 
            onChange={e => setRepresentativeName(e.target.value)} 
            placeholder="求人 太郎" 
            style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} 
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>
            採用ご担当者名 <span style={{ color: '#dc2626' }}>*必須</span>
          </label>
          <input 
            type="text" 
            value={contactName || ''} 
            onChange={e => setContactName(e.target.value)} 
            placeholder="求人 次郎" 
            style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} 
          />
        </div>
      </div>

      {/* 複数選択可能な業種セクション */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>
          業種・職種（複数選択可） <span style={{ color: '#dc2626' }}>*必須</span> （現在 {selectedIndustries.length}件選択中）
        </label>
        <div style={{ 
          maxHeight: '180px', 
          overflowY: 'auto', 
          border: '1px solid #d1d5db', 
          borderRadius: '8px', 
          padding: '12px', 
          background: '#fff',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '8px'
        }}>
          {INDUSTRIES.map((ind, idx) => {
            const isChecked = selectedIndustries.includes(ind);
            return (
              <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', color: '#334151' }}>
                <input 
                  type="checkbox" 
                  checked={isChecked} 
                  onChange={() => handleIndustryToggle(ind)}
                  style={{ cursor: 'pointer' }}
                />
                {ind}
              </label>
            );
          })}
        </div>
      </div>

      <button 
        type="button" 
        onClick={onNext} 
        disabled={!isFormComplete}
        style={{ 
          width: '100%', 
          padding: '14px', 
          background: isFormComplete ? '#16a34a' : '#94a3b8', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '10px', 
          fontWeight: '700', 
          cursor: isFormComplete ? 'pointer' : 'not-allowed', 
          marginTop: '10px',
          transition: 'background 0.2s'
        }}
      >
        {isFormComplete ? '次へ進む ➔' : 'すべての必須項目を入力・選択してください'}
      </button>
    </div>
  );
}