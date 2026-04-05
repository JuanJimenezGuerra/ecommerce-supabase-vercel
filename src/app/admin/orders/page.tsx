import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminOrdersClient } from '@/components/admin/AdminOrdersClient'

export const metadata = { title: 'Panel Admin | La Abuela Savia' }

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  // Verificar sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // Verificar rol admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/')

  // Obtener pedidos con la vista admin (RLS no aplica por service_role en server)
  const { data: orders, error } = await supabase
    .from('orders_admin_view')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) console.error('[admin/orders] Error cargando pedidos:', error.message)

  return (
    <main>
      <AdminOrdersClient orders={orders ?? []} />
    </main>
  )
}
