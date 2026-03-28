// @ts-nocheck
import { NextResponse } from 'next/server';
import { isSMTPConfigured, getSMTPConfig } from '../../lib/email.js';

export async function GET() {
  try {
    const config = getSMTPConfig();
    const configured = isSMTPConfigured();
    
    // Return sanitized config (without password)
    return NextResponse.json({
      configured,
      host: configured ? config.host : undefined,
      port: configured ? config.port : undefined,
      secure: configured ? config.secure : undefined,
      user: configured ? config.auth?.user : undefined,
      from: configured ? config.from : undefined,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error getting email settings:', error);
    return NextResponse.json({ error: error.message || 'server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // This endpoint would typically require admin authentication
    // For now, we just validate the configuration
    
    const payload = await req.json();
    const { host, port, secure, user, pass, from } = payload;
    
    if (!host || !user || !pass) {
      return NextResponse.json({ 
        error: 'host, user, and pass are required' 
      }, { status: 400 });
    }
    
    // Return the configuration that would be used
    // In a real app, you'd test the connection here
    return NextResponse.json({ 
      success: true, 
      message: 'SMTP configuration received. Update .env.local with these values to enable custom SMTP.',
      config: {
        host,
        port: port || 587,
        secure: secure || false,
        user,
        from: from || 'noreply@example.com',
      }
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error saving email settings:', error);
    return NextResponse.json({ error: error.message || 'server error' }, { status: 500 });
  }
}