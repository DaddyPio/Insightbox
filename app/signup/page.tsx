'use client';

import AuthButton from '@/components/AuthButton';

export default function SignupPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold text-wood-800 mb-4">註冊</h1>
      <p className="text-wood-600 mb-6">
        輸入 Email 取得註冊連結（無密碼）。若你已經有帳號，也可直接到登入頁使用相同 Email 登入。
      </p>
      <div className="card">
        <AuthButton submitLabel="註冊連結" />
      </div>
    </div>
  );
}


