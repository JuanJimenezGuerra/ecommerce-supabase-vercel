"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/utils"
import {
  Package, Users, CreditCard, TrendingUp,
  Search, RefreshCw, ChevronDown, ChevronUp,
  CheckCircle2, Clock, XCircle, Truck, Eye
} from "lucide-react"

type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'shipped'
type AdminOrder = {
  id: string
  status: OrderStatus
  total_amount: number
  customer_name: string
  guest_email: string
  customer_email: string
  customer_phone: string
  customer_address: string
  customer_city: string
  customer_department: string
  created_at: string
  updated_at: string
  payment_status: string
  payment_gateway: string
  transaction_id: string
  items: { product_name: string; quantity: number; unit_price: number }[]
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pendiente',  color: 'bg-amber-100 text-amber-700 border-amber-200',   icon: <Clock className="w-3.5 h-3.5" /> },
  paid:      { label: 'Pagado',     color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  shipped:   { label: 'Enviado',    color: 'bg-blue-100 text-blue-700 border-blue-200',       icon: <Truck className="w-3.5 h-3.5" /> },
  cancelled: { label: 'Cancelado',  color: 'bg-red-100 text-red-700 border-red-200',          icon: <XCircle className="w-3.5 h-3.5" /> },
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  )
}

export function AdminOrdersClient({ orders: initialOrders }: { orders: AdminOrder[] }) {
  const [orders, setOrders] = React.useState<AdminOrder[]>(initialOrders)
  const [search, setSearch] = React.useState('')
  const [filterStatus, setFilterStatus] = React.useState<string>('all')
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)
  const [refreshing, setRefreshing] = React.useState(false)

  const supabase = createClient()

  // Estadísticas
  const stats = React.useMemo(() => ({
    total: orders.length,
    revenue: orders.filter(o => o.status === 'paid' || o.status === 'shipped').reduce((s, o) => s + Number(o.total_amount), 0),
    paid: orders.filter(o => o.status === 'paid').length,
    pending: orders.filter(o => o.status === 'pending').length,
  }), [orders])

  const filtered = React.useMemo(() => {
    return orders.filter(o => {
      const matchStatus = filterStatus === 'all' || o.status === filterStatus
      const q = search.toLowerCase()
      const matchSearch = !q || o.customer_name?.toLowerCase().includes(q)
        || o.guest_email?.toLowerCase().includes(q)
        || o.id.includes(q)
      return matchStatus && matchSearch
    })
  }, [orders, search, filterStatus])

  const refresh = async () => {
    setRefreshing(true)
    const { data } = await supabase
      .from('orders_admin_view')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setOrders(data as AdminOrder[])
    setRefreshing(false)
  }

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId)
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    }
    setUpdatingId(null)
  }

  const fmt = (d: string) => new Intl.DateTimeFormat('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(new Date(d))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-pine">Panel Administrativo</h1>
            <p className="text-sm text-gray-500">La Abuela Savia · Gestión de Pedidos</p>
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-pine border border-gray-200 rounded-lg px-3 py-2 transition-colors hover:border-sage/50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Pedidos', value: stats.total, icon: <Package className="w-5 h-5 text-sage" />, sub: 'Todos los estados' },
            { label: 'Ingresos', value: formatPrice(stats.revenue), icon: <TrendingUp className="w-5 h-5 text-emerald-600" />, sub: 'Pagados + Enviados' },
            { label: 'Pagados', value: stats.paid, icon: <CreditCard className="w-5 h-5 text-blue-600" />, sub: 'Listos para enviar' },
            { label: 'Pendientes', value: stats.pending, icon: <Clock className="w-5 h-5 text-amber-500" />, sub: 'Esperando pago' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-gray-50 rounded-xl">{s.icon}</div>
              </div>
              <div className="text-2xl font-bold text-pine">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              <div className="text-xs text-gray-400">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/30"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'paid', 'shipped', 'cancelled'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                    filterStatus === s
                      ? 'bg-pine text-white border-pine'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-sage/50'
                  }`}
                >
                  {s === 'all' ? 'Todos' : STATUS_CONFIG[s as OrderStatus]?.label || s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No hay pedidos que coincidan con tu búsqueda</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Table header */}
              <div className="hidden md:grid grid-cols-12 px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <div className="col-span-3">Cliente</div>
                <div className="col-span-2">Fecha</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-2">Estado</div>
                <div className="col-span-2">Pasarela</div>
                <div className="col-span-1 text-right">Acciones</div>
              </div>

              {filtered.map(order => (
                <div key={order.id}>
                  {/* Row */}
                  <div
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  >
                    <div className="md:col-span-3">
                      <p className="font-medium text-pine text-sm">{order.customer_name || '—'}</p>
                      <p className="text-xs text-gray-500">{order.guest_email || order.customer_email}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{order.id.slice(0, 8)}...</p>
                    </div>
                    <div className="md:col-span-2 text-sm text-gray-600 flex items-center">
                      {fmt(order.created_at)}
                    </div>
                    <div className="md:col-span-2 text-sm font-bold text-pine flex items-center">
                      {formatPrice(Number(order.total_amount))}
                    </div>
                    <div className="md:col-span-2 flex items-center">
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="md:col-span-2 text-xs text-gray-500 flex items-center capitalize">
                      {order.payment_gateway || '—'}
                    </div>
                    <div className="md:col-span-1 flex items-center justify-end">
                      {expandedId === order.id
                        ? <ChevronUp className="w-4 h-4 text-gray-400" />
                        : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {expandedId === order.id && (
                    <div className="bg-gray-50 border-t border-gray-100 px-6 py-5">
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Info cliente */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" /> Cliente
                          </h4>
                          <div className="space-y-1.5 text-sm">
                            <p className="text-gray-700">{order.customer_name}</p>
                            <p className="text-gray-500">{order.guest_email || order.customer_email}</p>
                            <p className="text-gray-500">{order.customer_phone}</p>
                            <p className="text-gray-400 text-xs mt-2">
                              {order.customer_address}<br/>
                              {order.customer_city}, {order.customer_department}
                            </p>
                          </div>
                        </div>

                        {/* Productos */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5" /> Productos
                          </h4>
                          <div className="space-y-2">
                            {(order.items || []).map((item, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-gray-700">{item.product_name} × {item.quantity}</span>
                                <span className="font-medium text-pine">{formatPrice(item.unit_price * item.quantity)}</span>
                              </div>
                            ))}
                            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-sm">
                              <span className="text-gray-700">Total</span>
                              <span className="text-pine">{formatPrice(Number(order.total_amount))}</span>
                            </div>
                          </div>
                        </div>

                        {/* Pago + Cambiar estado */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5" /> Pago & Estado
                          </h4>
                          <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Pasarela</span>
                              <span className="font-medium capitalize">{order.payment_gateway || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Estado pago</span>
                              <span className="font-medium capitalize">{order.payment_status || '—'}</span>
                            </div>
                            {order.transaction_id && (
                              <div className="text-xs text-gray-400 font-mono break-all">
                                TXN: {order.transaction_id}
                              </div>
                            )}
                          </div>

                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cambiar estado</p>
                          <div className="flex flex-wrap gap-2">
                            {(['pending', 'paid', 'shipped', 'cancelled'] as OrderStatus[]).map(s => (
                              <button
                                key={s}
                                disabled={order.status === s || updatingId === order.id}
                                onClick={() => updateStatus(order.id, s)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                  order.status === s
                                    ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-500 border-gray-200'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-pine hover:text-pine'
                                }`}
                              >
                                {updatingId === order.id ? '...' : STATUS_CONFIG[s].label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
