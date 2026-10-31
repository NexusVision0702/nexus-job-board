'use client';

import React, { useState } from 'react';

import Step1Basic from '../components/register/Step1Basic';
import Step2Corporate from '../components/register/Step2Corporate';
import Step3Accounting from '../components/register/Step3Accounting';
import Step4Address, { StoreLocation } from '../components/register/Step4Address';
import Step5Contact from '../components/register/Step5Contact';
import Step6Confirm from '../components/register/Step6Confirm';

export default function CompanyRegisterPage() {
  const [step, setStep] = useState<number>(1);

  // フォームステート
  const [corporateType, setCorporateType] = useState<string>('株式会社');
  const [companyName, setCompanyName] = useState<string>('');
  const [companyNameKana, setCompanyNameKana] = useState<string>('');
  const [representativeName, setRepresentativeName] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [industry, setIndustry] = useState<any>('');

  const [corporateNumber, setCorporateNumber] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [establishmentDate, setEstablishmentDate] = useState<string>('');
  const [capital, setCapital] = useState<string>('');
  const [fullTimeEmployees, setFullTimeEmployees] = useState<string>('');
  const [partTimeEmployees, setPartTimeEmployees] = useState<string>('');
  const [businessDescription, setBusinessDescription] = useState<string>('');
  const [homepageUrl, setHomepageUrl] = useState<string>('');
  const [licenses, setLicenses] = useState<string>('');

  const [accountingName, setAccountingName] = useState<string>('');
  const [accountingEmail, setAccountingEmail] = useState<string>('');

  // 所在地関連（本社/支社）
  const [officeType, setOfficeType] = useState<string>('本社');
  const [postalCode, setPostalCode] = useState<string>('');
  const [prefecture, setPrefecture] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [addressLine, setAddressLine] = useState<string>('');
  const [stores, setStores] = useState<StoreLocation[]>([]);

  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // 認証コード用のステート
  const [verificationCode, setVerificationCode] = useState<string>('');

  const [newsletterOptIn, setNewsletterOptIn] = useState<boolean>(true);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // ✨ カスタム通知（トースト）用のステート
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000); // 4秒後に自動で消える
  };

  // 登録完了モーダル用ステート
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);

  const handlePhoneChange = (val: string) => {
    const numbers = String(val || '').replace(/[^0-9]/g, '');
    let formatted = numbers;
    if (numbers.length > 3 && numbers.length <= 7) {
      formatted = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length > 7) {
      formatted = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
    setPhone(formatted);
  };

  const handlePostalCodeChange = async (val: string) => {
    const cleanVal = String(val || '').replace(/[^0-9]/g, '').slice(0, 7);
    setPostalCode(cleanVal);

    if (cleanVal.length === 7) {
      try {
        const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanVal}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          const pref = result.address1 || '';
          const c = (result.address2 || '') + (result.address3 || '');
          setPrefecture(pref);
          setCity(c);

          let currentAddr = addressLine;
          if (pref && currentAddr.startsWith(pref)) {
            currentAddr = currentAddr.slice(pref.length);
          }
          if (c && currentAddr.startsWith(c)) {
            currentAddr = currentAddr.slice(c.length);
          }
          setAddressLine(currentAddr.trim());
        }
      } catch (e) {
        console.error('住所自動取得エラー', e);
      }
    }
  };

  const nextStep = () => {
    setErrorMessage('');
    const safeCompanyName = String(companyName || '');
    if (step === 1) {
      if (!corporateNumber || corporateNumber.length !== 13) {
        setErrorMessage('13桁の法人番号を正しく入力してください。');
        return;
      }
      if (!companyName || !companyNameKana || !representativeName || !contactName || !industry) {
        setErrorMessage('すべての項目を入力してください。');
        return;
      }
      if (safeCompanyName.length < 2) {
        setErrorMessage('有効な企業名（正式名称）を入力してください。');
        return;
      }
    } else if (step === 2) {
      if (homepageUrl && String(homepageUrl).trim() !== '' && (!homepageUrl.startsWith('http://') && !homepageUrl.startsWith('https://'))) {
        setErrorMessage('有効なホームページURL（https://...）を入力してください。');
        return;
      }
      if (String(businessDescription || '').length < 5) {
        setErrorMessage('事業内容をもう少し具体的にご記載ください。');
        return;
      }
    } else if (step === 4) {
      if (!postalCode || !prefecture || !city || !addressLine) {
        setErrorMessage('所在地を正しく入力してください。');
        return;
      }
    } else if (step === 5) {
      if (!phone || !email || !password) {
        setErrorMessage('連絡先とパスワードを入力してください。');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setErrorMessage('');
    setStep(prev => prev - 1);
  };

  // 登録完了時の処理（AWSのAPIルートへ送信）
  const handleRegister = async () => {
    console.log('>>> handleRegister 実行開始 (AWS DynamoDB連携)');
    
    if (!verificationCode || verificationCode.length !== 6) {
      setErrorMessage('6桁の二段階認証確認コードを入力してください。');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const safePostal = String(postalCode || '');
      const safePref = String(prefecture || '');
      const safeCity = String(city || '');
      const safeAddr = String(addressLine || '');
      const fullAddress = `〒${safePostal} ${safePref}${safeCity}${safeAddr}`.trim();

      const industryStr = Array.isArray(industry) 
        ? industry.join(', ') 
        : String(industry || '');

      // ✨ 設立日（"YYYY-MM-DD"）を自動で年・月・日に分解
      let establishYear = '';
      let establishMonth = '';
      let establishDay = '';
      if (establishmentDate && String(establishmentDate).includes('-')) {
        const parts = String(establishmentDate).split('-');
        if (parts.length === 3) {
          establishYear = parts[0];
          establishMonth = parts[1];
          establishDay = parts[2];
        }
      }

      const payload = {
        corporateType: String(corporateType || '').trim(),
        companyName: String(companyName || '').trim(),
        companyNameKana: String(companyNameKana || '').trim(),
        representativeName: String(representativeName || '').trim(),
        contactName: String(contactName || '').trim(),
        industry: industryStr.trim(),
        corporateNumber: String(corporateNumber || '').trim(),
        invoiceNumber: String(invoiceNumber || '').trim(),
        
        establishmentDate: String(establishmentDate || ''),
        establishYear,
        establishMonth,
        establishDay,

        capital: String(capital || '').trim(),

        // 💡 従業員数をバックエンドが期待するキー名にマッピング
        employeeRegular: String(fullTimeEmployees || '').trim(),
        employeePart: String(partTimeEmployees || '').trim(),
        fullTimeEmployees: String(fullTimeEmployees || '').trim(),
        partTimeEmployees: String(partTimeEmployees || '').trim(),

        businessDescription: String(businessDescription || '').trim(),
        homepageUrl: String(homepageUrl || '').trim(),
        licenses: String(licenses || '').trim(),
        accountingName: String(accountingName || '').trim(),
        accountingEmail: String(accountingEmail || '').trim(),
        officeType: String(officeType || '').trim(),
        postalCode: safePostal.trim(),
        prefecture: safePref.trim(),
        city: safeCity.trim(),
        addressLine: safeAddr.trim(),
        address: fullAddress,
        stores,
        phone: String(phone || '').trim(),
        email: String(email || '').trim(),
        password: String(password || '').trim(),
        verificationCode: String(verificationCode || '').trim(), 
        
        // 💡 メルマガ希望フラグを確実にする
        newsletter: Boolean(newsletterOptIn),
        newsletterOptIn: Boolean(newsletterOptIn),
      };

      const res = await fetch('/api/partners/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '登録処理に失敗しました。');
      }

      console.log('>>> DynamoDBへの保存成功！', data);

      setShowCompleteModal(true);
    } catch (err: any) {
      console.error('>>> 登録処理エラー:', err);
      setErrorMessage(err.message || '登録に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const formData = {
    corporateType, companyName, companyNameKana, representativeName, contactName, industry,
    corporateNumber, invoiceNumber, establishmentDate, capital, fullTimeEmployees, partTimeEmployees,
    businessDescription, homepageUrl, licenses, accountingName, accountingEmail,
    officeType, postalCode, prefecture, city, addressLine, stores, phone, email, verificationCode, newsletterOptIn
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc', 
      padding: '20px 10px', 
      fontFamily: 'sans-serif',
      boxSizing: 'border-box',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      position: 'relative'
    }}>
      <style>{`
        @media (min-width: 640px) {
          .responsive-container {
            padding: 40px !important;
          }
          .header-wrapper {
            flex-direction: row !important;
            text-align: left !important;
          }
          .header-titles {
            text-align: left !important;
          }
        }
      `}</style>

      {/* ✨ トースト通知（画面上の洗練されたポップアップバナー） */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#16a34a',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          zIndex: 9999,
          fontSize: '13px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <span>✓</span> {toastMessage}
        </div>
      )}

      <div className="responsive-container" style={{ 
        width: '100%', 
        maxWidth: '680px', 
        background: '#fff', 
        padding: '24px 16px', 
        borderRadius: '16px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        boxSizing: 'border-box'
      }}>
        
        {/* ヘッダー部分 */}
        <div className="header-wrapper" style={{ 
          marginBottom: '30px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center',
          gap: '16px' 
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/nv-logo.png" alt="NV Logo" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
            <img src="/logo.png" alt="logo" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
          </div>
          <div className="header-titles" style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a', margin: '0 0 6px 0', lineHeight: '1.4' }}>
              ネクビジョ求人 企業登録
            </h1>
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>安全な求人掲載のため、詳細情報をご入力ください。</p>
          </div>
        </div>

        {/* ステップインジケーター */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', position: 'relative', overflowX: 'auto', paddingBottom: '5px' }}>
          {[
            { num: 1, label: '基本' },
            { num: 2, label: '詳細' },
            { num: 3, label: '経理' },
            { num: 4, label: '所在地' },
            { num: 5, label: '連絡先' },
            { num: 6, label: '確認' },
          ].map((item) => (
            <div key={item.num} style={{ textAlign: 'center', flex: 1, zIndex: 1, minWidth: '40px' }}>
              <div style={{
                width: '26px',
                height: '26px',
                margin: '0 auto 4px auto',
                borderRadius: '50%',
                background: step === item.num ? '#16a34a' : step > item.num ? '#dcfce7' : '#e2e8f0',
                color: step === item.num ? '#fff' : step > item.num ? '#16a34a' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '11px'
              }}>
                {step > item.num ? '✓' : item.num}
              </div>
              <span style={{ fontSize: '10px', color: step === item.num ? '#16a34a' : '#64748b', fontWeight: step === item.num ? 'bold' : 'normal', whiteSpace: 'nowrap' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* 各ステップのコンポーネント */}
        {step === 1 && (
          <Step1Basic
            {...{ 
              corporateType, setCorporateType, 
              companyName, setCompanyName, 
              companyNameKana, setCompanyNameKana, 
              representativeName, setRepresentativeName, 
              contactName, setContactName, 
              industry, setIndustry,
              corporateNumber, setCorporateNumber,
              setPostalCode, setPrefecture, setCity,
              setAddress: (addr: string) => setAddressLine(addr.trim()),
              setStreet: (street: string) => setAddressLine(street.trim())
            }}
            onNext={nextStep}
            errorMessage={errorMessage}
          />
        )}

        {step === 2 && (
          <Step2Corporate
            {...{ invoiceNumber, setInvoiceNumber, establishmentDate, setEstablishmentDate, capital, setCapital, fullTimeEmployees, setFullTimeEmployees, partTimeEmployees, setPartTimeEmployees, businessDescription, setBusinessDescription, homepageUrl, setHomepageUrl, licenses, setLicenses }}
            onNext={nextStep}
            onPrev={prevStep}
            errorMessage={errorMessage}
          />
        )}

        {step === 3 && (
          <Step3Accounting
            {...{ accountingName, setAccountingName, accountingEmail, setAccountingEmail }}
            onNext={nextStep}
            onPrev={prevStep}
            errorMessage={errorMessage}
          />
        )}

        {step === 4 && (
          <Step4Address
            {...{ officeType, setOfficeType, postalCode, handlePostalCodeChange, prefecture, city, addressLine, setAddressLine, stores, setStores }}
            onNext={nextStep}
            onPrev={prevStep}
            errorMessage={errorMessage}
          />
        )}

        {step === 5 && (
          <Step5Contact
            {...{ phone, handlePhoneChange, email, setEmail, password, setPassword, newsletterOptIn, setNewsletterOptIn }}
            onNext={nextStep}
            onPrev={prevStep}
            errorMessage={errorMessage}
          />
        )}

        {step === 6 && (
          <Step6Confirm
            formData={formData}
            setVerificationCode={setVerificationCode}
            loading={loading}
            onPrev={prevStep}
            onSubmit={handleRegister}
            errorMessage={errorMessage}
            showToast={showToast}
          />
        )}

      </div>

      {/* 登録完了モーダル */}
      {showCompleteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px'
        }}>
          <div style={{
            background: '#fff', width: '100%', maxWidth: '440px', padding: '32px 24px',
            borderRadius: '20px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', textAlign: 'center'
          }}>
            <div style={{
              width: '60px', height: '60px', background: '#dcfce7', color: '#16a34a',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', margin: '0 auto 20px auto', fontWeight: 'bold'
            }}>✓</div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px' }}>
              企業アカウントの登録申請を受け付けました
            </h2>
            <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.8', marginBottom: '24px', textAlign: 'left', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
              <p style={{ margin: '0 0 8px 0' }}>ご登録いただき誠にありがとうございます。</p>
              <p style={{ margin: '0 0 8px 0' }}>審査完了まで今しばらくお待ちください。（通常1〜3営業日程度）</p>
            </div>
            <button
              type="button"
              onClick={() => { setShowCompleteModal(false); setStep(1); }}
              style={{
                width: '100%', padding: '12px', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer'
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}