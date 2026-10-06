// src/components/register/Step5Contact.tsx
import React from 'react';

interface Props {
  phone: string;
  handlePhoneChange: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  newsletterOptIn: boolean;
  setNewsletterOptIn: (val: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
  errorMessage: string;
}

export default function Step5Contact({
  phone, handlePhoneChange,
  email, setEmail,
  password, setPassword,
  newsletterOptIn, setNewsletterOptIn,
  onNext, onPrev, errorMessage
}: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {errorMessage && (
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
          ⚠️ {errorMessage}
        </div>
      )}

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>電話番号 (自動ハイフン)</label>
        <input type="text" maxLength={13} value={phone} onChange={e => handlePhoneChange(e.target.value)} placeholder="0220000000" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>ログイン用メールアドレス</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="info@example.co.jp" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>パスワード</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
      </div>

      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', color: '#334151' }}>
          <input type="checkbox" checked={newsletterOptIn} onChange={e => setNewsletterOptIn(e.target.checked)} />
          <span>運営からのお得なお知らせや求人ノウハウメールマガジンの受領を希望する</span>
        </label>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="button" onClick={onPrev} style={{ width: '50%', padding: '14px', background: '#e2e8f0', color: '#334151', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
          戻る
        </button>
        <button type="button" onClick={onNext} style={{ width: '50%', padding: '14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
          確認画面へ ➔
        </button>
      </div>
    </div>
  );
}