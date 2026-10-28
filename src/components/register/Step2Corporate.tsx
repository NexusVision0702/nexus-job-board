import React from 'react';

interface Props {
  invoiceNumber: string;
  setInvoiceNumber: (val: string) => void;
  establishmentDate: string;
  setEstablishmentDate: (val: string) => void;
  capital: string;
  setCapital: (val: string) => void;
  fullTimeEmployees: string;
  setFullTimeEmployees: (val: string) => void;
  partTimeEmployees: string;
  setPartTimeEmployees: (val: string) => void;
  businessDescription: string;
  setBusinessDescription: (val: string) => void;
  homepageUrl: string;
  setHomepageUrl: (val: string) => void;
  licenses: string;
  setLicenses: (val: string) => void;
  onNext: () => void;
  onPrev: () => void;
  errorMessage: string;
}

export default function Step2Corporate({
  invoiceNumber, setInvoiceNumber,
  establishmentDate, setEstablishmentDate,
  capital, setCapital,
  fullTimeEmployees, setFullTimeEmployees,
  partTimeEmployees, setPartTimeEmployees,
  businessDescription, setBusinessDescription,
  homepageUrl, setHomepageUrl,
  licenses, setLicenses,
  onNext, onPrev, errorMessage
}: Props) {

  // ── 必須項目の判定（事業内容のみ必須） ──
  const isFormComplete = Boolean(String(businessDescription || '').trim());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {errorMessage && (
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
          ⚠️ {errorMessage}
        </div>
      )}

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>
          適格請求書発行事業者登録番号 (インボイス) <span style={{ color: '#64748b', fontWeight: '400' }}>（任意）</span>
        </label>
        <input 
          type="text" 
          value={invoiceNumber || ''} 
          onChange={e => setInvoiceNumber(e.target.value)} 
          placeholder="例: T1234567890123" 
          style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>設立年月日 <span style={{ color: '#64748b', fontWeight: '400' }}>（任意）</span></label>
          <input type="date" value={establishmentDate || ''} onChange={e => setEstablishmentDate(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box', background: '#fff' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>資本金 <span style={{ color: '#64748b', fontWeight: '400' }}>（任意）</span></label>
          <input type="text" value={capital || ''} onChange={e => setCapital(e.target.value)} placeholder="例: 1,000万円" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', background: '#fcfdfd', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#334151' }}>従業員規模の詳細 <span style={{ color: '#64748b', fontWeight: '400' }}>（任意）</span></span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#64748b' }}>正社員数</label>
            <input type="text" value={fullTimeEmployees || ''} onChange={e => setFullTimeEmployees(e.target.value)} placeholder="例: 20名" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#64748b' }}>パート・アルバイト数</label>
            <input type="text" value={partTimeEmployees || ''} onChange={e => setPartTimeEmployees(e.target.value)} placeholder="例: 5名" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
          </div>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>
          ホームページURL <span style={{ color: '#64748b', fontWeight: '400' }}>（任意）</span>
        </label>
        <input type="url" value={homepageUrl || ''} onChange={e => setHomepageUrl(e.target.value)} placeholder="https://example.com" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>事業内容</label>
        <textarea rows={3} value={businessDescription || ''} onChange={e => setBusinessDescription(e.target.value)} placeholder="具体的な事業内容をご記載ください" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box', fontFamily: 'sans-serif' }} />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>許認可・資格の有無 <span style={{ color: '#64748b', fontWeight: '400' }}>（任意）</span></label>
        <input 
          type="text" 
          value={licenses || ''} 
          onChange={e => setLicenses(e.target.value)} 
          placeholder="例: 有料職業紹介事業許可 13-ユ-000000 または 特になし" 
          style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} 
        />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="button" onClick={onPrev} style={{ width: '50%', padding: '14px', background: '#e2e8f0', color: '#334151', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
          戻る
        </button>
        <button 
          type="button" 
          onClick={onNext} 
          disabled={!isFormComplete}
          style={{ 
            width: '50%', 
            padding: '14px', 
            background: isFormComplete ? '#16a34a' : '#94a3b8', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '10px', 
            fontWeight: '700', 
            cursor: isFormComplete ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s'
          }}
        >
          {isFormComplete ? '次へ進む ➔' : '未入力項目があります'}
        </button>
      </div>
    </div>
  );
}