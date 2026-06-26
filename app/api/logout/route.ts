import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<Response> {
    try {
        // 1. Create a successful JSON response
        const response = NextResponse.json({ success: true });

        // 2. Overwrite the existing cookie with an expired, empty one
        response.cookies.set('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0, // Tells browser to expire it instantly
            path: '/',
        });
        
        return response;        
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}

