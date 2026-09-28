// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

export default function CompanyRegisterPage() {
  const [companyName, setCompanyName] = useState<string>('');
  const [companyNameKana, setCompanyNameKana] = useState<string>('');
  const [representativeName, setRepresentativeName] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [prefecture, setPrefecture] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [addressLine, setAddressLine] = useState<string>('');
  const [industry, setIndustry] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handlePhoneChange = (val: string) => {
    const numbers = val.replace(/[^0-9]/g, '');
    let formatted = numbers;
    if (numbers.length > 3 && numbers.length <= 7) {
      formatted = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length > 7) {
      formatted = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
    setPhone(formatted);
  };

  const handlePostalCodeChange = async (val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '').slice(0, 7);
    setPostalCode(cleanVal);

    if (cleanVal.length === 7) {
      try {
        const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanVal}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          setPrefecture(result.address1 || '');
          setCity((result.address2 || '') + (result.address3 || ''));
        }
      } catch (e) {
        console.error('住所自動取得エラー', e);
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const q = query(collection(db, 'companies'), where('email', '==', email.trim()));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        throw new Error('このメールアドレスはすでに登録されています。');
      }

      const fullAddress = `〒${postalCode} ${prefecture}${city}${addressLine}`.trim();

      await addDoc(collection(db, 'companies'), {
        companyName: companyName.trim(),
        companyNameKana: companyNameKana.trim(),
        representativeName: representativeName.trim(),
        contactName: contactName.trim(),
        email: email.trim(),
        password: password.trim(),
        phone: phone.trim(),
        postalCode: postalCode.trim(),
        prefecture,
        city,
        addressLine: addressLine.trim(),
        address: fullAddress,
        industry: industry.trim(),
        status: 'active',
        createdAt: new Date().toISOString(),
      });

      alert('企業アカウントの登録が完了しました！');
      setCompanyName('');
      setCompanyNameKana('');
      setRepresentativeName('');
      setContactName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setPostalCode('');
      setPrefecture('');
      setCity('');
      setAddressLine('');
      setIndustry('');
    } catch (err: any) {
      setErrorMessage(err.message || '登録に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#16a34a', margin: '0 0 8px 0' }}>求人掲載企業 アカウント登録</h1>
          <p style={{ fontSize: '13px', color: '#666' }}>求人情報を掲載するための企業情報をご入力ください。</p>
        </div>

        {errorMessage && (
          <div style={{ background: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>企業名 (法人名)</label>
              <input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="例: 株式会社ネクスビジョン" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>企業名 フリガナ</label>
              <input type="text" required value={companyNameKana} onChange={e => setCompanyNameKana(e.target.value)} placeholder="例: カブシキガイシャネクスビジョン" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>代表者のお名前</label>
              <input type="text" required value={representativeName} onChange={e => setRepresentativeName(e.target.value)} placeholder="例: 挾間 義尚" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>採用ご担当者名</label>
              <input type="text" required value={contactName} onChange={e => setContactName(e.target.value)} placeholder="例: 採用 太郎" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>業種</label>
            <input type="text" required value={industry} onChange={e => setIndustry(e.target.value)} placeholder="例: IT・通信、人材サービスなど" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', background: '#fcfdfd', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#334151' }}>所在地</span>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#64748b' }}>郵便番号 (7桁入力で自動反映)</label>
              <input type="text" maxLength={7} value={postalCode} onChange={e => handlePostalCodeChange(e.target.value)} placeholder="9830821" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#64748b' }}>都道府県</label>
                <input type="text" value={prefecture} readOnly style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#f1f5f9', color: '#64748b' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#64748b' }}>市区町村・町域</label>
                <input type="text" value={city} readOnly style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#f1f5f9', color: '#64748b' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#64748b' }}>それ以降の住所 (番地・ビル名など)</label>
              <input type="text" required value={addressLine} onChange={e => setAddressLine(e.target.value)} placeholder="例: 宮城野区岩切字鴻巣28-7" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>電話番号 (自動ハイフン)</label>
              <input type="text" required maxLength={13} value={phone} onChange={e => handlePhoneChange(e.target.value)} placeholder="0220000000" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>ログイン用メールアドレス</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="info@example.com" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>パスワード</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', marginTop: '10px' }}
          >
            {loading ? '登録処理中...' : '企業アカウントを登録する'}
          </button>
        </form>
      </div>
    </div>
  );
}