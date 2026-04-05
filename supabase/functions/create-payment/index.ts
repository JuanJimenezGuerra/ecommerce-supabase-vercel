import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { order_id, payment_id } = await req.json();

    if (!order_id || !payment_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Get order and payment details
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*, customers(*)')
      .eq('id', order_id)
      .single();

    if (orderErr) throw new Error('Order not found');

    const { data: payment, error: paymentErr } = await supabase
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .single();

    if (paymentErr) throw new Error('Payment not found');

    let responseData = {};

    if (payment.gateway === 'wompi') {
      // Logic for Wompi Sandbox
      // Typically Wompi Widget just needs a signature (integrity checksum)
      // For sandbox we'll mock the required config
      
      const currency = 'COP';
      const amountInCents = Math.round(payment.amount * 100);
      const reference = payment_id; 
      // Example of generating integrity signature (requires integrity secret)
      // const concatString = `${reference}${amountInCents}${currency}${Deno.env.get('WOMPI_INTEGRITY_SECRET')}`;
      // const signature = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(concatString));
      
      responseData = {
        publicKey: Deno.env.get('WOMPI_PUBLIC_KEY') || 'pub_test_mXoOWkEItmO6TeyW3U7E7xU23qBwEDV5',
        currency,
        amountInCents,
        reference,
        redirectUrl: `${req.headers.get('origin') || 'http://localhost:3000'}/order-success/${order_id}`
      };
    } else if (payment.gateway === 'mercadopago') {
      // Logic for Mercado Pago Sandbox
      // Create preference via MP SDK/API
      const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN') || 'TEST-0000000000000000-000000-00000000000000000000000000000000-000000000';
      
      try {
        const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mpAccessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            items: [
              {
                title: 'Pedido en La Abuela Savia',
                quantity: 1,
                currency_id: 'COP',
                unit_price: payment.amount
              }
            ],
            payer: {
              email: order.guest_email || 'test@test.com'
            },
            external_reference: payment_id,
            back_urls: {
              success: `${req.headers.get('origin') || 'http://localhost:3000'}/order-success/${order_id}`,
              failure: `${req.headers.get('origin') || 'http://localhost:3000'}/checkout`,
              pending: `${req.headers.get('origin') || 'http://localhost:3000'}/checkout`
            },
            auto_return: 'approved'
          })
        });

        const mpData = await mpResponse.json();
        
        responseData = {
          preferenceId: mpData.id,
          initPoint: mpData.sandbox_init_point // URL to redirect the user to
        };
      } catch (e) {
        throw new Error('Failed to create MP preference: ' + e.message);
      }
    } else {
      throw new Error('Unsupported gateway');
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
