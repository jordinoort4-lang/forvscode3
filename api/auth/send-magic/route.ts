import { NextResponse } from 'next/server';
import { checkAndConsume } from '@/app/lib/rateLimiter';
import { callEdge } from '../_lib/edgeCaller';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { email } = payload;
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

    const rl = await checkAndConsume(email);
    if (!rl.allowed) {
      return NextResponse.json({
        error: 'rate_limited',
        reason: rl.reason,
        retry_after: rl.retryAfterSeconds ?? null,
        remaining: rl.remaining ?? null,
        week_reset_in: rl.weekResetInSeconds ?? null,
      }, { status: 429 });
    }

    const redirectTo = `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/auth/callback`;
    const edgeRes = await callEdge('auth-proxy/send-magic', { email, redirectTo });
    return NextResponse.json({ edge: edgeRes.body, rate: rl }, { status: edgeRes.status });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'server error' }, { status: 500 });
  }
}
