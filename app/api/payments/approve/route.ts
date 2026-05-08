import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

let supabaseAdmin: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
  if (supabaseAdmin) return supabaseAdmin;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  return supabaseAdmin;
}

export async function POST(request: NextRequest) {
  try {
    const piApiKey = process.env.PI_API_KEY;
    
    if (!piApiKey) {
      return NextResponse.json(
        { error: 'PI_API_KEY not configured' },
        { status: 500 }
      );
    }

    const { paymentId, productId, quantity } = await request.json();

    console.log('Approve called:', { paymentId, productId, quantity });

    if (!paymentId || !productId) {
      return NextResponse.json(
        { error: 'paymentId and productId are required' },
        { status: 400 }
      );
    }

    let db;
    try {
      db = getSupabaseAdmin();
    } catch (dbError: any) {
      return NextResponse.json(
        { error: 'Database not configured: ' + dbError.message },
        { status: 500 }
      );
    }

    // جلب المنتج
    const { data: product, error: productError } = await db
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.stock < (quantity || 1)) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // الموافقة عبر Pi API
    const piResponse = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Key ${piApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!piResponse.ok) {
      const errorText = await piResponse.text();
      console.error('Pi API approve error:', errorText);
      return NextResponse.json(
        { error: `Pi API error: ${errorText}` },
        { status: 500 }
      );
    }

    // حفظ الطلب
    await db.from('orders').insert({
      payment_id: paymentId,
      product_id: productId,
      quantity: quantity || 1,
      total_amount: product.price * (quantity || 1),
      status: 'approved',
      user_id: 'pending'
    });

    return NextResponse.json({ status: 'approved' });

  } catch (error: any) {
    console.error('Approve server error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
