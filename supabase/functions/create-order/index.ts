import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { items, customer, gateway } = await req.json();

    if (!items || !items.length || !customer || !customer.email || !gateway) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 1. Find or create customer
    let { data: currCustomer, error: customerErr } = await supabase
      .from('customers')
      .select('id')
      .eq('email', customer.email)
      .single();

    if (!currCustomer) {
      const { data: newCustomer, error: newCustomerErr } = await supabase
        .from('customers')
        .insert({
          email: customer.email,
          first_name: customer.name.split(' ')[0],
          last_name: customer.name.split(' ').slice(1).join(' '),
          phone: customer.phone
        })
        .select()
        .single();
      
      if (newCustomerErr) throw new Error('Error creating customer: ' + newCustomerErr.message);
      currCustomer = newCustomer;
    }

    // Calculate total amount from items (could be done by DB but simpler here)
    const total_amount = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

    // 2. Create order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        customer_id: currCustomer.id,
        guest_email: customer.email,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address,
        customer_department: customer.department,
        customer_city: customer.city,
        total_amount: total_amount,
        status: 'pending'
      })
      .select()
      .single();

    if (orderErr) throw new Error('Error creating order: ' + orderErr.message);

    // 3. Create order_items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price
    }));

    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsErr) throw new Error('Error creating order items: ' + itemsErr.message);

    // 4. Create initial payment record
    const { data: payment, error: paymentErr } = await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        gateway: gateway,
        amount: total_amount,
        status: 'pending'
      })
      .select()
      .single();

    if (paymentErr) throw new Error('Error creating payment: ' + paymentErr.message);

    return new Response(JSON.stringify({ order_id: order.id, payment_id: payment.id }), {
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
