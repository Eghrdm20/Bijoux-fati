
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, productId, quantity } = body;

    console.log('Approve called:', { paymentId, productId, quantity }); // للتشخيص

    // 1. التحقق من البيانات
    if (!paymentId) {
      return NextResponse.json(
        { error: 'paymentId is required' }, 
        { status: 400 }
      );
    }

    // 2. التحقق من المنتج في Supabase
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      console.error('Product error:', productError);
      return NextResponse.json(
        { error: 'Product not found' }, 
        { status: 404 }
      );
    }

    // 3. التحقق من المخزون
    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' }, 
        { status: 400 }
      );
    }

    // 4. استدعاء Pi API للموافقة
    const piResponse = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Key ${process.env.PI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!piResponse.ok) {
      const errorText = await piResponse.text();
      console.error('Pi API error:', errorText);
      return NextResponse.json(
        { error: `Pi API error: ${errorText}` }, 
        { status: 500 }
      );
    }

    // 5. حفظ الطلب في Supabase
    const { error: insertError } = await supabaseAdmin
      .from('orders')
      .insert({
        payment_id: paymentId,
        product_id: productId,
        quantity,
        total_amount: product.price * quantity,
        status: 'approved',
        user_id: 'pending' // سيتم تحديثه لاحقاً
      });

    if (insertError) {
      console.error('Insert error:', insertError);
    }

    return NextResponse.json({ status: 'approved' });

  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}
