// src/components/register/Step1Basic.tsx
import React from 'react';

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
  industry: string;
  setIndustry: (val: string) => void;
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
  onNext, errorMessage
}: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {errorMessage && (
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
          ⚠️ {errorMessage}
        </div>
      )}

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>法人格</label>
        <select 
          value={corporateType} 
          onChange={e => setCorporateType(e.target.value)} 
          style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box', background: '#fff' }}
        >
          <option value="株式会社">株式会社</option>
          <option value="合同会社">合同会社</option>
          <option value="有限会社">有限会社</option>
          <option value="一般社団法人">一般社団法人</option>
          <option value="その他">その他</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>企業名 (法人名)</label>
          <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="例: ネクスビジョン" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
          <span style={{ fontSize: '10px', color: '#64748b' }}>※2文字以上で正確な名称を入力してください</span>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>企業名 フリガナ</label>
          <input type="text" value={companyNameKana} onChange={e => setCompanyNameKana(e.target.value)} placeholder="例: カブシキガイシャネクスビジョン" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>代表者のお名前</label>
          <input type="text" value={representativeName} onChange={e => setRepresentativeName(e.target.value)} placeholder="例: 挾間 義尚" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>採用ご担当者名</label>
          <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} placeholder="例: 採用 太郎" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>業種</label>
        <input type="text" value={industry} onChange={e => setIndustry(e.target.value)} placeholder="例: IT・通信、人材サービスなど" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
      </div>

      <button type="button" onClick={onNext} style={{ width: '100%', padding: '14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', marginTop: '10px' }}>
        次へ進む ➔
      </button>
    </div>
  );
}