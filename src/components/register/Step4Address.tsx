// src/components/register/Step4Address.tsx
import React, { useState } from 'react';

// 店舗データの型定義
export interface StoreLocation {
  name: string; // 店舗名（例: 仙台支店、泉店）
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine: string;
}

interface Props {
  officeType: string; // '本社' or '支社'
  setOfficeType: (val: string) => void;
  postalCode: string;
  handlePostalCodeChange: (val: string) => void;
  prefecture: string;
  city: string;
  addressLine: string;
  setAddressLine: (val: string) => void;
  
  // 追加の店舗リスト
  stores: StoreLocation[];
  setStores: React.Dispatch<React.SetStateAction<StoreLocation[]>>;
  
  onNext: () => void;
  onPrev: () => void;
  errorMessage: string;
}

export default function Step4Address({
  officeType, setOfficeType,
  postalCode, handlePostalCodeChange,
  prefecture, city, addressLine, setAddressLine,
  stores, setStores,
  onNext, onPrev, errorMessage
}: Props) {
  // 店舗追加用のローカルステート
  const [storeName, setStoreName] = useState('');
  const [storePostalCode, setStorePostalCode] = useState('');
  const [storePrefecture, setStorePrefecture] = useState('');
  const [storeCity, setStoreCity] = useState('');
  const [storeAddressLine, setStoreAddressLine] = useState('');

  // 店舗の郵便番号自動取得
  const handleStorePostalChange = async (val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '').slice(0, 7);
    setStorePostalCode(cleanVal);
    if (cleanVal.length === 7) {
      try {
        const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanVal}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          setStorePrefecture(result.address1 || '');
          setStoreCity((result.address2 || '') + (result.address3 || ''));
        }
      } catch (e) {
        console.error('店舗住所自動取得エラー', e);
      }
    }
  };

  const handleAddStore = () => {
    if (!storeName || !storePostalCode || !storePrefecture || !storeCity || !storeAddressLine) {
      alert('追加する店舗の情報をすべて入力してください。');
      return;
    }
    setStores([...stores, {
      name: storeName.trim(),
      postalCode: storePostalCode.trim(),
      prefecture: storePrefecture,
      city: storeCity,
      addressLine: storeAddressLine.trim()
    }]);
    // 入力欄をクリア
    setStoreName('');
    setStorePostalCode('');
    setStorePrefecture('');
    setStoreCity('');
    setStoreAddressLine('');
  };

  const handleRemoveStore = (index: number) => {
    setStores(stores.filter((_, i) => i !== index));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {errorMessage && (
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {/* メイン拠点（本社・支社）の選択 */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#374151' }}>拠点の種類</label>
        <div style={{ display: 'flex', gap: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
            <input 
              type="radio" 
              name="officeType" 
              value="本社" 
              checked={officeType === '本社'} 
              onChange={e => setOfficeType(e.target.value)} 
            />
            本社
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
            <input 
              type="radio" 
              name="officeType" 
              value="支社" 
              checked={officeType === '支社'} 
              onChange={e => setOfficeType(e.target.value)} 
            />
            支社・支店
          </label>
        </div>
      </div>

      {/* メイン所在地入力 */}
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#16a34a' }}>{officeType}の所在地</span>
        
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#4b5563' }}>郵便番号 (7桁入力で自動反映)</label>
          <input 
            type="text" 
            maxLength={7} 
            value={postalCode} 
            onChange={e => handlePostalCodeChange(e.target.value)} 
            placeholder="例: 9830821" 
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box', background: '#fff' }} 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#4b5563' }}>都道府県</label>
            <input type="text" value={prefecture} readOnly placeholder="自動入力" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box', background: '#f3f4f6' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#4b5563' }}>市区町村・町域</label>
            <input type="text" value={city} readOnly placeholder="自動入力" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box', background: '#f3f4f6' }} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#4b5563' }}>それ以降の住所 (番地・ビル名など)</label>
          <input 
            type="text" 
            value={addressLine} 
            onChange={e => setAddressLine(e.target.value)} 
            placeholder="例: 岩切1-1-1 ビル名2F" 
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box', background: '#fff' }} 
          />
        </div>
      </div>

      {/* 任意追加の店舗セクション */}
      <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#334151' }}>店舗・その他の拠点追加（任意）</span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>登録済店舗数: {stores.length}件</span>
        </div>

        {/* 登録済み店舗リスト表示 */}
        {stores.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stores.map((st, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f5f9', padding: '10px 12px', borderRadius: '8px', fontSize: '12px' }}>
                <div>
                  <strong>{st.name}</strong>（〒{st.postalCode} {st.prefecture}{st.city}{st.addressLine}）
                </div>
                <button type="button" onClick={() => handleRemoveStore(idx)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '10px' }}>
                  削除
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 店舗新規追加フォーム */}
        <div style={{ background: '#fdfbf7', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#4b5563' }}>店舗名・拠点名</label>
            <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="例: 仙台駅前店" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box', background: '#fff' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#4b5563' }}>郵便番号</label>
              <input type="text" maxLength={7} value={storePostalCode} onChange={e => handleStorePostalChange(e.target.value)} placeholder="例: 9800021" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box', background: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#4b5563' }}>都道府県・市区町村</label>
              <input type="text" value={`${storePrefecture} ${storeCity}`} readOnly placeholder="郵便番号入力で自動取得" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box', background: '#f3f4f6' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#4b5563' }}>それ以降の住所</label>
            <input type="text" value={storeAddressLine} onChange={e => setStoreAddressLine(e.target.value)} placeholder="例: 中央1-1-2" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box', background: '#fff' }} />
          </div>
          <button type="button" onClick={handleAddStore} style={{ padding: '8px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}>
            + この店舗を追加する
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button type="button" onClick={onPrev} style={{ width: '50%', padding: '14px', background: '#e2e8f0', color: '#334151', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
          戻る
        </button>
        <button type="button" onClick={onNext} style={{ width: '50%', padding: '14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
          次へ進む ➔
        </button>
      </div>
    </div>
  );
}