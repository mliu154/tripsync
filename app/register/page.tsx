'use client'
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
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
                console.error('Failed to load registration secrets:', err);
                setErrorMsg('Failed to initialize registration security settings.');
            }
        }

        loadSecret();
    }, [refreshTrigger]);

    // ... Keep handleRegister and change functions exactly as they were ...
    const handleRegister = async (
        event: FormEvent<HTMLFormElement>
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
                setErrorMsg(result.error || 'Failed to register.');
                setRefreshTrigger(prev => prev + 1);
                setTOTP('');
                return;
            }

            console.log('Submission successful:', result);

            setUsername('');
            setPassword('');
            setConfirmPassword('');
            setTOTP('');
            router.push('/');
        } catch (error: unknown) {
            setErrorMsg('A network error occurred. Please try again.');
            setRefreshTrigger(prev => prev + 1); 
            if (error instanceof Error) {
                console.error('Submission error:', error.message);
            } else {
                console.error('Unknown submission error:', error);
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
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh'
        }}>
            {errorMsg && (
                <div style={{ color: 'red', marginBottom: '15px', fontWeight: 'bold' }}>
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleRegister}>
                <label>Username</label>
                <br />
                <input 
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    style={{
                        border: '1px solid black',
                        padding: '8px',
                        borderRadius: '4px',
                    }}
                />
                <br />
                
                <label>Password</label>
                <br />
                <input 
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}  
                    style={{
                        border: '1px solid black',
                        padding: '8px',
                        borderRadius: '4px',
                    }}
                />
                <br />
                
                <label>Re-enter Password</label>
                <br />
                <input 
                    type="password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}  
                    style={{
                        border: '1px solid black',
                        padding: '8px',
                        borderRadius: '4px',
                    }}
                />
                <br />

                {qrCodeDataUrl && (
                    <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                        <p style={{ fontSize: '14px', margin: '5px 0' }}>
                            Scan this QR code with your authenticator app:
                        </p>
                        <img
                            src={qrCodeDataUrl}
                            alt="TOTP QR Code"
                            width={200}
                            style={{ display: 'block', margin: '10px 0' }}
                        />
                        <p style={{ fontSize: '12px' }}>
                            Secret key:
                            <br />
                            <code>{secret}</code>
                        </p>
                    </div>
                )}

                <label>Initial verification code</label>
                <br />
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={TOTP}
                    onChange={handleTOTPChange}
                    style={{
                        border: '1px solid black',
                        padding: '8px',
                        borderRadius: '4px',
                    }}
                />
                <br /><br />
                
                <input type="submit" value="Submit" style={{ cursor: 'pointer' }} />
            </form>
        </div>
    );
}