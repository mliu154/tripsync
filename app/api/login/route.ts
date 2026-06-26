import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import { authenticator } from '@otplib/preset-default';
import User from '@/models/User';
import * as bcrypt from 'bcrypt-ts';
import { decryptSecret } from '@/crypto';
import { hashUsername } from '@/hashUsername';
export async function POST(request: NextRequest): Promise<Response> {
    try {
        await dbConnect();
        const authFailed = () =>
  NextResponse.json(
    { error: 'Authentication failed.' },
    { status: 401 }
  );
      const body = await request.json();
      const { username, password, TOTP } = body;
      const usernameHash = hashUsername(username);
      const userData = await User.findOne({ usernameHash });
      if (!userData) return authFailed();
      const passwordMatches = await bcrypt.compare(password, userData.password);
      if (!passwordMatches) return authFailed();
      const decryptedSecret = decryptSecret(userData.totpSecret);
const validTotp = authenticator.verify({
  token: TOTP,
  secret: decryptedSecret,
});

if (!validTotp) return authFailed();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET)  throw new Error('JWT_SECRET is not configured');

const token = jwt.sign(
  { userId: userData._id.toString() }, JWT_SECRET, { expiresIn: '7d'});
    const response = NextResponse.json({
  success: true });

response.cookies.set('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
});



return response;        
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}