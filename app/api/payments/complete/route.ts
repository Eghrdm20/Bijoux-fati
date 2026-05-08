import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// تهيئة Supabase - نؤجلها إلى وقت التشغيل
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

    const { paymentId, txid } = await request.json();

    console.log('Complete called:', { paymentId, txid });

    if (!paymentId || !txid) {
      return NextResponse.json(
        { error: 'paymentId and txid are required' },
        { status: 400 }
      );
    }

    // إكمال الدفع عبر Pi API
    const piResponse = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Key ${piApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ txid })
      }
    );

    if (!piResponse.ok) {
      const errorText = await piResponse.text();
      console.error('Pi API complete error:', errorText);
      return NextResponse.json(
        { error: `Pi API error: ${errorText}` },
        { status: 500 }
      );
    }

    // جلب Supabase
    let db;
    try {
      db = getSupabaseAdmin();
    } catch (dbError: any) {
      console.error('Supabase init error:', dbError);
      return NextResponse.json(
        { error: 'Database not configured: ' + dbError.message },
        { status: 500 }
      );
    }

    // جلب الطلب
    const { data: order, error: orderError } = await db
      .from('orders')
      .select('*, products(*)')
      .eq('payment_id', paymentId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // تحديث الحالة
    await db
      .from('orders')
      .update({
        status: 'completed',
        txid: txid,
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', paymentId);

    // إنقاص المخزون
    if (order.products && order.quantity > 0) {
      const newStock = Math.max(0, order.products.stock - order.quantity);
      await db
        .from('products')
        .update({ stock: newStock })
        .eq('id', order.product_id);
    }

    return NextResponse.json({
      status: 'completed',
      orderId: order.id,
      message: 'Payment completed successfully'
    });

  } catch (error: any) {
    console.error('Complete server error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
