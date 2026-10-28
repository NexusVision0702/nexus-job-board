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
  const [newsletterOptIn, setNewsletterOptIn] = useState<boolean>(true);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

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
          setPrefecture(result.address1 || '');
          setCity((result.address2 || '') + (result.address3 || ''));
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
      if (!companyName || !companyNameKana || !representativeName || !contactName || !industry) {
        setErrorMessage('すべての項目を入力してください。');
        return;
      }
      if (safeCompanyName.length < 2 || safeCompanyName === 's' || safeCompanyName === 'テスト' || safeCompanyName === 'あ') {
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
        capital: String(capital || '').trim(),
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
        newsletterOptIn,
      };

      // AWSのAPIエンドポイントへPOST送信
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

      alert('企業アカウントの登録申請を受け付けました。\n\n審査には最大1週間程かかる場合があります。');
      
      // フォームリセット
      setStep(1);
      setCompanyName('');
      setCompanyNameKana('');
      setRepresentativeName('');
      setContactName('');
      setIndustry('');
      setCorporateNumber('');
      setInvoiceNumber('');
      setEstablishmentDate('');
      setCapital('');
      setFullTimeEmployees('');
      setPartTimeEmployees('');
      setBusinessDescription('');
      setHomepageUrl('');
      setLicenses('');
      setAccountingName('');
      setAccountingEmail('');
      setOfficeType('本社');
      setPostalCode('');
      setPrefecture('');
      setCity('');
      setAddressLine('');
      setStores([]);
      setPhone('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      console.error('>>> 登録処理エラー:', err);
      setErrorMessage(err.message || '登録に失敗しました。');
      alert('登録に失敗しました: ' + (err.message || '通信エラー'));
    } finally {
      setLoading(false);
    }
  };

  const formData = {
    corporateType, companyName, companyNameKana, representativeName, contactName, industry,
    corporateNumber, invoiceNumber, establishmentDate, capital, fullTimeEmployees, partTimeEmployees,
    businessDescription, homepageUrl, licenses, accountingName, accountingEmail,
    officeType, postalCode, prefecture, city, addressLine, stores, phone, email, newsletterOptIn
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
      alignItems: 'flex-start'
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
            <img 
              src="/nv-logo.png" 
              alt="NV Logo" 
              style={{ width: '70px', height: '70px', minWidth: '70px', objectFit: 'contain' }} 
            />
            <img 
              src="/logo.png" 
              alt="logo" 
              style={{ width: '70px', height: '70px', minWidth: '70px', objectFit: 'contain' }} 
            />
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

        {/* ステップ1：基本情報（法人番号自動取得付き） */}
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
              setAddress: setAddressLine,
              setPostalCode,
              setPrefecture,
              setCity,
              setStreet: setAddressLine
            }}
            onNext={nextStep}
            errorMessage={errorMessage}
          />
        )}

        {/* ステップ2：詳細情報（法人番号欄を削除） */}
        {step === 2 && (
          <Step2Corporate
            {...{ 
              invoiceNumber, setInvoiceNumber, 
              establishmentDate, setEstablishmentDate, 
              capital, setCapital, 
              fullTimeEmployees, setFullTimeEmployees, 
              partTimeEmployees, setPartTimeEmployees, 
              businessDescription, setBusinessDescription, 
              homepageUrl, setHomepageUrl, 
              licenses, setLicenses 
            }}
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
            loading={loading}
            onPrev={prevStep}
            onSubmit={handleRegister}
            errorMessage={errorMessage}
          />
        )}

      </div>
    </div>
  );
}