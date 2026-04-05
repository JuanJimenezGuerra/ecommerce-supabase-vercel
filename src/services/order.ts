import { createClient } from '@/lib/supabase/client'
import type { CartItem } from '@/hooks/useCart'

export interface CustomerData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  department: string
}

export interface CreateOrderResult {
  order_id: string
  payment_id: string
}

/**
 * Crea un pedido en Supabase llamando a la Edge Function create-order
 */
export async function createOrder(
  items: CartItem[],
  customer: CustomerData,
  gateway: 'wompi' | 'mercadopago'
): Promise<CreateOrderResult> {
  const supabase = createClient()

  const { data, error } = await supabase.functions.invoke('create-order', {
    body: { items, customer, gateway }
  })

  if (error) throw new Error(error.message || 'Error al crear el pedido')
  if (data?.error) throw new Error(data.error)

  return data as CreateOrderResult
}

/**
 * Obtiene la URL/datos de pago llamando a la Edge Function create-payment
 */
export async function initiatePayment(order_id: string, payment_id: string) {
  const supabase = createClient()

  const { data, error } = await supabase.functions.invoke('create-payment', {
    body: { order_id, payment_id }
  })

  if (error) throw new Error(error.message || 'Error al iniciar el pago')
  if (data?.error) throw new Error(data.error)

  return data
}
