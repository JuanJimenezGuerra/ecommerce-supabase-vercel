// Servicio unificado de pagos - abstrae Wompi y MercadoPago
// Cambia de sandbox a producción solo con las variables de entorno

export type PaymentGateway = 'wompi' | 'mercadopago'

export interface PaymentRequest {
  amount: number
  currency: string
  customerEmail: string
  customerName: string
  reference: string
  gateway: PaymentGateway
}

export interface PaymentResponse {
  success: boolean
  transactionId?: string
  redirectUrl?: string
  error?: string
}

/**
 * Abre el widget de pago apropiado según la pasarela seleccionada.
 * Recibe los datos de la Edge Function create-payment y actúa según la pasarela.
 */
export async function openPaymentUI(
  paymentData: Record<string, unknown>,
  onSuccess: (transactionId: string) => void,
  onError: (message: string) => void
): Promise<void> {
  const gateway = paymentData.gateway as PaymentGateway

  if (gateway === 'wompi') {
    // El Widget de Wompi se invoca con el script en el HTML
    // Aquí construimos la URL de checkout directa (alternativa al widget)
    const params = new URLSearchParams({
      'public-key': paymentData.publicKey as string,
      currency: paymentData.currency as string,
      'amount-in-cents': String(paymentData.amountInCents),
      reference: paymentData.reference as string,
      'redirect-url': paymentData.redirectUrl as string,
      ...(paymentData.signature ? { 'signature:integrity': paymentData.signature as string } : {})
    })

    const wompiUrl = `https://checkout.wompi.co/p/?${params.toString()}`
    window.location.href = wompiUrl

  } else if (gateway === 'mercadopago') {
    // Redirigir al checkout de MercadoPago (Sandbox: sandbox_init_point)
    const initPoint = paymentData.initPoint as string
    if (!initPoint) {
      onError('No se pudo obtener el enlace de pago de MercadoPago')
      return
    }
    window.location.href = initPoint

  } else {
    onError('Pasarela de pago no reconocida')
  }
}
