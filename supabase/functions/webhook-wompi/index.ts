import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts';

serve(async (req) => {
  try {
    const supabase = getSupabaseAdmin();
    const payload = await req.json();

    // In a real scenario, you should validate Wompi's Event signature here
    // using x-event-checksum header and WOMPI_EVENTS_SECRET.

    if (payload.event === 'transaction.updated') {
      const transaction = payload.data.transaction;
      const payment_id = transaction.reference;
      const status = transaction.status; // APPROVED, DECLINED, ERROR...

      let newStatus = 'pending';
      let orderStatus = 'pending';

      if (status === 'APPROVED') {
        newStatus = 'approved';
        orderStatus = 'paid';
      } else if (status === 'DECLINED' || status === 'ERROR') {
        newStatus = 'rejected';
        orderStatus = 'cancelled';
      }

      // Update payment
      const { data: updatedPayment, error: paymentErr } = await supabase
        .from('payments')
        .update({ 
          status: newStatus,
          transaction_id: transaction.id,
          webhook_payload: payload 
        })
        .eq('id', payment_id)
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
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
