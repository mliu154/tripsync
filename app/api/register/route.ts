// Inside /app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as bcrypt from 'bcrypt-ts';
import { authenticator } from '@otplib/preset-default';
import { encryptSecret } from '@/crypto';
import dbConnect from '@/dbConnect'; 
import User from '@/models/User'; 
import { hashUsername } from '@/hashUsername';
export async function POST(request: NextRequest): Promise<Response> {
    try {
        const body = await request.json();
        const { username, password, confirmPassword, TOTP, secret } = body;

        if (!username || !password || !TOTP || !secret) {
            return NextResponse.json(
                { error: 'Username, password, and 2FA verification are required.' }, 
                { status: 400 }
            );
        }

        if (password !== confirmPassword){
            return NextResponse.json(
                { error: 'Password and confirm password do not match.' }, 
                { status: 400 }
            );
        }

        // Await the verify function directly using an options object
        const usernameHash = hashUsername(username);
        const isValidTotp = authenticator.verify({
  token: TOTP,
  secret,
});
        if (!isValidTotp) {
            return NextResponse.json(
                { error: 'Invalid 2FA verification code. Please try again.' }, 
                { status: 400 }
            );
        }

        await dbConnect();
        

        const existingUser = await User.findOne({
  usernameHash,
});
        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists.' }, 
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12); 

        const newUser = await User.create({
  usernameEncrypted: encryptSecret(username),
  usernameHash,
  password: hashedPassword,
  totpSecret: encryptSecret(secret),
});

        return NextResponse.json(
  {
    message: 'User created successfully',
  },
  { status: 201 }
);
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}
