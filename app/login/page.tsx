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
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }}>
    <form onSubmit={handleLogin}>
    <label>Username</label>
    <br />
    <input type="text"
    value={username}
    onChange={handleUsernameChange}
     style={{
        border: '1px solid black',
        padding: '8px',
        borderRadius: '4px',
    }}></input>
    <br />
    <label>Password</label>
    <br />
    <input type="password"
    value={password}
    onChange={handlePasswordChange}
     style={{
        border: '1px solid black',
        padding: '8px',
        borderRadius: '4px',
    }}></input>
    <br />
    <label>Verification code</label>
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
></input>
<br />
    <input type="submit" value="Login"></input>
    </form>
    </div>
  );
}
