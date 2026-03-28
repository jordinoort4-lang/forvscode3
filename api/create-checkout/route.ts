import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-03-25.dahlia',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eljlxaowizfjmpndmsqc.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the request body
    const body = await request.json();
    const { price_id, mode = 'subscription' } = body;

    if (!price_id) {
      return new Response(JSON.stringify({ error: 'Price ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the price from database to validate it exists
    const { data: price, error: priceError } = await supabase
      .from('prices')
      .select('*')
      .eq('id', price_id)
      .single();

    if (priceError || !price) {
      console.error('Price not found:', priceError);
      // For demo purposes, allow checkout with test prices
      // In production, you would return an error here
    }

    // Create Stripe checkout session
    const siteUrl = process.env.SITE_URL || 'https://osm-tactical.vercel.app';
    
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: mode as 'subscription' | 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/?cancelled=true`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        price_id: price_id,
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
