// src/components/register/Step6Confirm.tsx
import React, { useState } from 'react';

interface Props {
  formData: {
    corporateType: string;
    companyName: string;
    companyNameKana: string;
    representativeName: string;
    contactName: string;
    industry: string | string[];
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

  // 二段階認証用のステート
  const [sentCode, setSentCode] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // 業種が配列の場合を考慮して安全に文字列化するヘルパー
  const renderIndustry = () => {
    if (Array.isArray(formData.industry)) {
      return formData.industry.join('・');
    }
    return typeof formData.industry === 'string' ? formData.industry : '';
  };

  // 二段階認証メールを送信（API経由）
  const handleSendVerificationCode = async () => {
    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    setIsSending(true);

    try {
      const response = await fetch('/api/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          code: mockCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'メールの送信に失敗しました');
      }

      setSentCode(mockCode);
      setIsSent(true);
    } catch (error) {
      alert(`エラー: ${(error as Error).message}`);
    } finally {
      setIsSending(false);
    }
  };

  // 入力されたコードの検証
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setInputCode(val);
    if (val === sentCode && sentCode !== '') {
      setIsVerified(true);
    } else {
      setIsVerified(false);
    }
  };

  const handleClickSubmit = () => {
    if (!agreedAntiSocial || !agreedTerms) {
      alert('反社会的勢力ではないことの確約および、利用規約への同意が必要です。');
      return;
    }
    if (!isVerified) {
      alert('二段階認証の確認コードが一致していません。');
      return;
    }
    onSubmit();
  };

  // すべての条件（反社会的勢力同意 ＋ 利用規約同意 ＋ 二段階認証コード一致）を満たしているか
  const canSubmit = agreedAntiSocial && agreedTerms && isVerified;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {errorMessage && (
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {/* 登録内容の確認表示 */}
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#334151', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p><strong>企業名:</strong> {formData.corporateType} {formData.companyName} ({formData.companyNameKana})</p>
        <p><strong>代表者:</strong> {formData.representativeName} / <strong>担当者:</strong> {formData.contactName}</p>
        <p><strong>業種:</strong> {renderIndustry()}</p>
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

      {/* 二段階認証セクション */}
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>二段階認証（メール確認）</span>
        <span style={{ fontSize: '12px', color: '#64748b' }}>ログイン用メールアドレス（{formData.email}）宛に認証コードを送信します。</span>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            type="button" 
            onClick={handleSendVerificationCode}
            disabled={isSending}
            style={{ padding: '10px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: isSending ? 'not-allowed' : 'pointer', fontSize: '12px' }}
          >
            {isSending ? '送信中...' : (isSent ? '認証コードを再送信' : '認証コードをメールで送信')}
          </button>
          {isSent && <span style={{ fontSize: '12px', color: '#16a34a' }}>✓ 送信済み</span>}
        </div>

        {isSent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#4b5563' }}>送信された6桁の確認コードを入力</label>
            <input 
              type="text" 
              maxLength={6} 
              value={inputCode} 
              onChange={handleCodeChange} 
              placeholder="例: 123456" 
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box', background: '#fff' }} 
            />
            {inputCode.length === 6 && !isVerified && (
              <span style={{ fontSize: '11px', color: '#dc2626' }}>コードが一致しません。</span>
            )}
            {isVerified && (
              <span style={{ fontSize: '11px', color: '#16a34a' }}>✨ 認証コードが一致しました！申請ボタンが有効になります。</span>
            )}
          </div>
        )}
      </div>

      {/* 利用規約等の同意チェックボックス */}
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

      {/* 戻る・申請ボタン */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="button" onClick={onPrev} style={{ width: '50%', padding: '14px', background: '#e2e8f0', color: '#334151', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
          修正する
        </button>
        <button
          type="button"
          onClick={handleClickSubmit}
          disabled={loading || !canSubmit}
          style={{ 
            width: '50%', 
            padding: '14px', 
            background: !canSubmit ? '#cbd5e1' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '10px', 
            fontWeight: '700', 
            cursor: !canSubmit ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {loading ? '登録処理中...' : '登録を申請する (審査待ち)'}
        </button>
      </div>
    </div>
  );
}