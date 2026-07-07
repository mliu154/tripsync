'use client'
import React, {
    useState,
    ChangeEvent,
    FormEvent,
} from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from Next.js

export default function Home() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [TOTP, setTOTP] = useState('');
    const router = useRouter();
    const handleLogin = async (
        event: FormEvent<HTMLFormElement>
    ): Promise<void> => {
        event.preventDefault();

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                    TOTP
                }),
            });


            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error);
            }
            console.log('Submission successful:', result);

            setUsername('');
            setPassword('');
            setTOTP('');
            router.push('/trips');
        } catch (error) {
            if (error instanceof Error) {
                console.error('Submission error:', error.message);
            } else {
                console.error('Unknown submission error:', error);
            }
        }
    };
    
    const handleUsernameChange = (
        event: ChangeEvent<HTMLInputElement>
    ): void => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (
        event: ChangeEvent<HTMLInputElement>
    ): void => {
        setPassword(event.target.value);
    };
    const handleTOTPChange = (
    event: ChangeEvent<HTMLInputElement>
): void => {
    const value = event.target.value.replace(/\D/g, '');
    setTOTP(value);
};

  return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-slate-900">
            <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full border border-gray-100">
                <h2 className="text-3xl font-bold text-center mb-6 text-slate-800">Welcome to TripSync</h2>
                
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input 
                            type="text"
                            value={username}
                            onChange={handleUsernameChange}
                            className="w-full rounded-md border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Enter your username"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input 
                            type="password"
                            value={password}
                            onChange={handlePasswordChange}
                            className="w-full rounded-md border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-center mt-2">Verification code (TOTP)</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            value={TOTP}
                            onChange={handleTOTPChange}
                            className="w-full rounded-md border border-gray-300 p-3 text-center text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="000000"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors mt-4"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
