import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts';

serve(async (req) => {
  try {
    const supabase = getSupabaseAdmin();
    const url = new URL(req.url);
    
    // MP can send via query params (IPN) or JSON body (Webhooks)
    // We'll handle both basic cases
    let payment_id: string | null = null;
    let payload: any = {};

    if (req.method === 'POST') {
      payload = await req.json();
      if (payload.action === 'payment.created' || payload.type === 'payment') {
        payment_id = payload.data?.id;
      }
    } else if (req.method === 'GET') {
      payment_id = url.searchParams.get('data.id');
    }

    if (!payment_id) {
      return new Response('No payment ID found', { status: 400 });
    }

    // Fetch actual payment details from MercadoPago
    const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN');
    if (!mpAccessToken) {
      console.error('MP_ACCESS_TOKEN not set');
      return new Response('Config error', { status: 500 });
    }

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
      headers: { 'Authorization': `Bearer ${mpAccessToken}` }
    });

    if (!mpRes.ok) {
      throw new Error(`MP API returned ${mpRes.status}`);
    }

    const paymentData = await mpRes.json();
    
    // Our local payment row is tracked via external_reference
    const localPaymentId = paymentData.external_reference;
    if (!localPaymentId) {
      return new Response('No external reference', { status: 200 }); // Can't link to our DB, maybe test ping
    }

    const status = paymentData.status; // approved, rejected, cancelled, pending...
    let newStatus = 'pending';
    let orderStatus = 'pending';

    if (status === 'approved') {
      newStatus = 'approved';
      orderStatus = 'paid';
    } else if (status === 'rejected' || status === 'cancelled') {
      newStatus = 'rejected';
      orderStatus = 'cancelled';
    }

    // Update payment
    const { data: updatedPayment, error: paymentErr } = await supabase
      .from('payments')
      .update({ 
        status: newStatus,
        transaction_id: payment_id.toString(),
        webhook_payload: paymentData 
      })
      .eq('id', localPaymentId)
      .select()
      .single();
    
    if (paymentErr) throw new Error('Payment update failed: ' + paymentErr.message);

    // Update order
    if (orderStatus !== 'pending') {
      const { error: orderErr } = await supabase
        .from('orders')
        .update({ status: orderStatus })
        .eq('id', updatedPayment.order_id);
      
      if (orderErr) throw new Error('Order update failed: ' + orderErr.message);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook MP Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
