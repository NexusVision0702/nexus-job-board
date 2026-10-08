import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const data = await resend.emails.send({
      from: 'Nexus Job Board <onboarding@resend.dev>',
      to: [email],
      subject: '【Nexus Job Board】二段階認証コード',
      html: `<p>二段階認証コードは <strong>${code}</strong> です。</p><p>このコードを画面に入力してください。</p>`,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}