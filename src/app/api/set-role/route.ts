import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { role } = await request.json();

    if (role !== 'colaborador' && role !== 'analista') {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
    }

    // 1. Crear la respuesta
    const response = NextResponse.json({ success: true });

    // 2. Adjuntar la cookie a la respuesta
    response.cookies.set('login-role', role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 5, // 5 minutos
    });

    return response;

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}