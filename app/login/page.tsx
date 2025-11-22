'use client';

import AuthButton from '@/components/AuthButton';

export default function LoginPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold text-wood-800 mb-4">登入</h1>
      <p className="text-wood-600 mb-6">
        輸入 Email 取得 6 位數驗證碼，完成登入。若要切換使用者，先登出再輸入另一個 Email。
      </p>
      <div className="card">
        <AuthButton />
      </div>
    </div>
  );
}


