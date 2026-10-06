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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {errorMessage && (
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
          ⚠️ {errorMessage}
        </div>
      )}

      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#334151' }}>請求書送付先・経理担当者情報</span>
        <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>有料プランや掲載料の請求書送付に関する宛先となります（採用担当者さまと同一の場合はその旨またはご担当者様名をご入力ください）。</p>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>経理ご担当者名 (または部署名)</label>
          <input type="text" value={accountingName} onChange={e => setAccountingName(e.target.value)} placeholder="例: 経理部 財務課 鈴木" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>請求書送付用メールアドレス</label>
          <input type="email" value={accountingEmail} onChange={e => setAccountingEmail(e.target.value)} placeholder="accounting@example.co.jp" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
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