// app/register/page.tsx


'use client'
import React, { useState, useEffect, ChangeEvent, SubmitEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [TOTP, setTOTP] = useState('');
    const [secret, setSecret] = useState('');
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0); 
    const router = useRouter();

    useEffect(() => {
        async function loadSecret() {
            try {
                // Fetch directly from our new isolated API endpoint
                const res = await fetch('/api/register-secret');
                const data = await res.json();
                
                if (!res.ok) throw new Error(data.error);

                setSecret(data.secret);

                // Dynamically load the qr code generator purely inside the browser scope
		const QRCodeModule = await import('qrcode');
                const QRCode = QRCodeModule.default ?? QRCodeModule;
                const clientSideQrUrl = await QRCode.toDataURL(data.otpAuthUrl);
                setQrCodeDataUrl(clientSideQrUrl);
            } catch (err) {
                console.error('加载注册秘密失败:', err);
                setErrorMsg('无法对注册安全设置初始化。');
            }
        }

        loadSecret();
    }, [refreshTrigger]);

    // ... Keep handleRegister and change functions exactly as they were ...
    const handleRegister = async (
        event: SubmitEvent<HTMLFormElement>
    ): Promise<void> => {
        event.preventDefault();
        setErrorMsg(''); 

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                    confirmPassword,
                    TOTP,
                    secret
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setErrorMsg(result.error || '注册失败。');
                setRefreshTrigger(prev => prev + 1);
                setTOTP('');
                return;
            }

            console.log('注册成功:', result);

            setUsername('');
            setPassword('');
            setConfirmPassword('');
            setTOTP('');
            router.push('/');
        } catch (error: unknown) {
            setErrorMsg('出现网络故障，請稍後再試。');
            setRefreshTrigger(prev => prev + 1); 
            if (error instanceof Error) {
                console.error('提交错误:', error.message);
            } else {
                console.error('未知提交错误:', error);
            }
        }
    };

    const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setPassword(event.target.value);
    };

    const handleConfirmPasswordChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setConfirmPassword(event.target.value);
    };
    
    const handleTOTPChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const value = event.target.value.replace(/\D/g, ''); 
        setTOTP(value);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-slate-900">
            <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full border border-gray-100">
                <h2 className="text-3xl font-bold text-center mb-2 text-slate-800">创建账户</h2>
                <p className="text-center text-gray-500 mb-6 text-sm">加入旅行同步计划以开始合作</p>

                {errorMsg && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm border border-red-200 font-medium">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                        <input 
                            type="text" value={username} onChange={handleUsernameChange}
                            className="w-full rounded-md border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                        <input 
                            type="password" value={password} onChange={handlePasswordChange}  
                            className="w-full rounded-md border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">再次输入密码</label>
                        <input 
                            type="password" value={confirmPassword} onChange={handleConfirmPasswordChange}  
                            className="w-full rounded-md border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {qrCodeDataUrl && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col items-center mt-6">
                            <p className="text-sm font-medium text-gray-700 mb-2 text-center">使用身份核对程序扫描</p>
                            <img src={qrCodeDataUrl} alt="TOTP QR Code" className="w-40 h-40 mb-2 rounded-md shadow-sm" />
                            <p className="text-xs text-gray-500 text-center break-all">
                                秘密: <code className="font-bold bg-gray-200 px-1 rounded">{secret}</code>
                            </p>
                        </div>
                    )}

                    <div className="pt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-center">初始验证码</label>
                        <input
                            type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={TOTP} onChange={handleTOTPChange}
                            className="w-full rounded-md border border-gray-300 p-3 text-center text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="000000"
                        />
                    </div>
                    
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors mt-4">
                        提交并注册
                    </button>
                </form>
            </div>
        </div>
    );
}