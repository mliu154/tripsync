import { NextResponse } from 'next/server';
import { authenticator } from '@otplib/preset-default';

// This is fully isolated from your main database files and actions
export async function GET() {
    try {
        const secret = authenticator.generateSecret();
        const otpAuthUrl = authenticator.keyuri('PendingUser', 'YourAppName', secret);

        return NextResponse.json({ secret, otpAuthUrl });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to generate 2FA' }, { status: 500 });
    }
}

