// src/components/register/Step3Accounting.tsx
import React from 'react';

interface Props {
  accountingName: string;
  setAccountingName: (val: string) => void;
  accountingEmail: string;
  setAccountingEmail: (val: string) => void;
  onNext: () => void;
  onPrev: () => void;
  errorMessage: string;
}

export default function Step3Accounting({
  accountingName, setAccountingName,
  accountingEmail, setAccountingEmail,
  onNext, onPrev, errorMessage
}: Props) {
  const isFormComplete = 
    Boolean(String(accountingName || '').trim()) &&
    Boolean(String(accountingEmail || '').trim());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {errorMessage && (
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
          ⚠️ {errorMessage}
        </div>
      )}

      <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', background: '#fcfdfd', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '4px' }}>請求書送付先・経理担当者情報</span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>有料プランや掲載料の請求書送付に関する宛先となります。</span>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>経理ご担当者名 (または部署名)</label>
          <input 
            type="text" 
            value={accountingName || ''} 
            onChange={e => setAccountingName(e.target.value)} 
            placeholder="例: 経理部 財務課 求人太郎" 
            style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box', background: '#fff' }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>請求書送付用メールアドレス</label>
          <input 
            type="email" 
            value={accountingEmail || ''} 
            onChange={e => setAccountingEmail(e.target.value)} 
            placeholder="accounting@example.co.jp" 
            style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box', background: '#fff' }} 
          />
        </div>
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