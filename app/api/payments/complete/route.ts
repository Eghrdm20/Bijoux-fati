import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// التحقق من المتغيرات
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const piApiKey = process.env.PI_API_KEY;

if (!supabaseUrl || !serviceRoleKey || !piApiKey) {
  console.error('Missing env vars:', {
    supabaseUrl: !!supabaseUrl,
    serviceRoleKey: !!serviceRoleKey,
    piApiKey: !!piApiKey
  });
  throw new Error('Missing required environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export async function POST(request: NextRequest)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// تهيئة Supabase Admin (للعمليات الإدارية)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PI_API_KEY = process.env.PI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    
    const { paymentId, txid } = await request.json();

    console.log('Complete called:', { paymentId, txid });

    // 1. التحقق من البيانات
    if (!paymentId || !txid) {
      return NextResponse.json(
        { error: 'paymentId and txid are required' },
        { status: 400 }
      );
    }

    // 2. إكمال الدفع عبر Pi API
    const piResponse = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Key ${PI_API_KEY}`,
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

    // 3. جلب الطلب من Supabase
    const { data: order, error: orderError } = await supabaseAdmin
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

    // 4. تحديث حالة الطلب
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'completed',
        txid: txid,
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', paymentId);

    if (updateError) {
      console.error('Update order error:', updateError);
    }

    // 5. إنقاص المخزون
    if (order.products && order.quantity > 0) {
      const newStock = Math.max(0, order.products.stock - order.quantity);
      
      const { error: stockError } = await supabaseAdmin
        .from('products')
        .update({ stock: newStock })
        .eq('id', order.product_id);

      if (stockError) {
        console.error('Stock update error:', stockError);
      }
    }

    // 6. إرسال إشعار (اختياري - يمكن إضافته لاحقاً)
    // TODO: إرسال إشعار للمستخدم أو البائع

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
