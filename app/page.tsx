// app/page.tsx

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Navigation */}
      <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold tracking-wider text-white">✈️旅行同步计划</h1>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-white text-sm font-medium hover:text-blue-400 transition-colors">
            登录
          </Link>
          <Link href="/register" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-bold transition-colors shadow-sm">
            免费注册
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="grow flex flex-col justify-center items-center text-center px-6 py-20">
        <h2 className="text-5xl md:text-6xl font-extrabold text-slate-800 mb-6 max-w-4xl leading-tight">
          在一个共享的空间中计划您的旅行
        </h2>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/register" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all">
            开始
          </Link>
          <Link href="/login" className="bg-white text-slate-800 font-bold py-3 px-8 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-all">
            进入您的旅程
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mt-24 text-left">
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">实时行程表</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
            创建详细的，实时更新的行程表。所有参与者都可以查看最新的计划，确保每个人都知道大家在做什么。
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">极高的安全性</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
             你的旅行计划是被保护的。旅行同步计划强制所有的用户使用基于时间的一次性密码技术来确保你的数据可以被安全地存取。
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">完美的合作</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
             立即在你的旅程增加或删除用户。请分享您的工作坊，使得所有人都可以查看这个时间表和参与计划。
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-center py-8 text-sm mt-auto">
              <p>&copy; {new Date().getFullYear()} 旅行同步计划，为完美的旅行而建。</p>
      </footer>
    </div>
  );
}