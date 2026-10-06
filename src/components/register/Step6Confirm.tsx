// src/components/register/Step6Confirm.tsx
import React, { useState } from 'react';

interface Props {
  formData: {
    corporateType: string;
    companyName: string;
    companyNameKana: string;
    representativeName: string;
    contactName: string;
    industry: string;
    corporateNumber: string;
    invoiceNumber: string;
    establishmentDate: string;
    capital: string;
    fullTimeEmployees: string;
    partTimeEmployees: string;
    businessDescription: string;
    homepageUrl: string;
    licenses: string;
    accountingName: string;
    accountingEmail: string;
    postalCode: string;
    prefecture: string;
    city: string;
    addressLine: string;
    phone: string;
    email: string;
    newsletterOptIn: boolean;
  };
  loading: boolean;
  onPrev: () => void;
  onSubmit: () => void;
  errorMessage: string;
}

export default function Step6Confirm({ formData, loading, onPrev, onSubmit, errorMessage }: Props) {
  const [agreedAntiSocial, setAgreedAntiSocial] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const handleClickSubmit = () => {
    if (!agreedAntiSocial || !agreedTerms) {
      alert('反社会的勢力ではないことの確約および、利用規約への同意が必要です。');
      return;
    }
    onSubmit();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {errorMessage && (
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
          ⚠️ {errorMessage}
        </div>
      )}

      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#334151', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p><strong>企業名:</strong> {formData.corporateType} {formData.companyName} ({formData.companyNameKana})</p>
        <p><strong>代表者:</strong> {formData.representativeName} / <strong>担当者:</strong> {formData.contactName}</p>
        <p><strong>業種:</strong> {formData.industry}</p>
        <p><strong>法人番号 / インボイス:</strong> {formData.corporateNumber} {formData.invoiceNumber ? `(${formData.invoiceNumber})` : ''}</p>
        <p><strong>設立 / 資本金:</strong> {formData.establishmentDate || '未設定'} / {formData.capital}</p>
        <p><strong>従業員規模:</strong> 正社員 {formData.fullTimeEmployees || '0'}名 / パート・アルバイト {formData.partTimeEmployees || '0'}名</p>
        <p><strong>URL:</strong> {formData.homepageUrl}</p>
        <p><strong>事業内容:</strong> {formData.businessDescription}</p>
        <p><strong>経理担当:</strong> {formData.accountingName || '担当者様と同一'} ({formData.accountingEmail || formData.email})</p>
        <p><strong>所在地:</strong> 〒{formData.postalCode} {formData.prefecture}{formData.city}{formData.addressLine}</p>
        <p><strong>連絡先:</strong> {formData.phone} / {formData.email}</p>
        <p><strong>メルマガ配信希望:</strong> {formData.newsletterOptIn ? '希望する' : '希望しない'}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#fdf8f6', padding: '16px', borderRadius: '12px', border: '1px solid #fed7aa' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', cursor: 'pointer', color: '#7c2d12' }}>
          <input type="checkbox" checked={agreedAntiSocial} onChange={e => setAgreedAntiSocial(e.target.checked)} style={{ marginTop: '2px' }} />
          <span>私は、暴力団等の反社会的勢力に一切該当せず、将来にわたっても該当しないことを確約します。</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', cursor: 'pointer', color: '#7c2d12' }}>
          <input type="checkbox" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)} style={{ marginTop: '2px' }} />
          <span>当プラットフォームの利用規約およびプライバシーポリシーに同意します。</span>
        </label>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="button" onClick={onPrev} style={{ width: '50%', padding: '14px', background: '#e2e8f0', color: '#334151', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
          修正する
        </button>
        <button
          type="button"
          onClick={handleClickSubmit}
          disabled={loading || !agreedAntiSocial || !agreedTerms}
          style={{ 
            width: '50%', 
            padding: '14px', 
            background: (!agreedAntiSocial || !agreedTerms) ? '#cbd5e1' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '10px', 
            fontWeight: '700', 
            cursor: (!agreedAntiSocial || !agreedTerms) ? 'not-allowed' : 'pointer' 
          }}
        >
          {loading ? '登録処理中...' : '登録を申請する (審査待ち)'}
        </button>
      </div>
    </div>
  );
}