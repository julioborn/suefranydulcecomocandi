'use client'

import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import type { Product, Store } from '@/types'
import { TrendingUp, Package, CheckCircle, DollarSign } from 'lucide-react'

type Period = '7d' | '30d' | '90d' | 'all'

interface Props { products: Product[]; store: Store }

function filterByPeriod(products: Product[], period: Period): Product[] {
  if (period === 'all') return products.filter((p) => p.sold)
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return products.filter((p) => p.sold && p.sold_at && new Date(p.sold_at) >= cutoff)
}

function groupByDay(products: Product[]) {
  const map: Record<string, { ingresos: number; cantidad: number }> = {}
  products.forEach((p) => {
    if (!p.sold_at) return
    const day = p.sold_at.slice(0, 10)
    if (!map[day]) map[day] = { ingresos: 0, cantidad: 0 }
    map[day].ingresos += Number(p.price)
    map[day].cantidad += 1
  })
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, v]) => ({ fecha, ...v }))
}

export default function StatsClient({ products, store }: Props) {
  const [period, setPeriod] = useState<Period>('30d')

  const soldProducts = useMemo(() => products.filter((p) => p.sold), [products])
  const activeProducts = useMemo(() => products.filter((p) => !p.sold), [products])
  const filteredSold = useMemo(() => filterByPeriod(products, period), [products, period])

  const totalRevenuePeriod = filteredSold.reduce((s, p) => s + Number(p.price), 0)
  const totalRevenueAll = soldProducts.reduce((s, p) => s + Number(p.price), 0)
  const chartData = useMemo(() => groupByDay(filteredSold), [filteredSold])

  const stats = [
    { label: 'Total vendido', value: `$${totalRevenueAll.toLocaleString('es-AR')}`, icon: DollarSign, bg: 'bg-emerald-50', color: 'text-emerald-500', ring: 'ring-emerald-100' },
    { label: 'Productos vendidos', value: soldProducts.length.toString(), icon: CheckCircle, bg: 'bg-pink-50', color: 'text-pink-400', ring: 'ring-pink-100' },
    { label: 'En catálogo', value: activeProducts.length.toString(), icon: Package, bg: 'bg-violet-50', color: 'text-violet-400', ring: 'ring-violet-100' },
    { label: `Ingresos (${period === 'all' ? 'todo' : period})`, value: `$${totalRevenuePeriod.toLocaleString('es-AR')}`, icon: TrendingUp, bg: 'bg-rose-50', color: 'text-rose-400', ring: 'ring-rose-100' },
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* Cards */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className={`card p-4 flex items-start gap-3`}>
            <div className={`${s.bg} ${s.color} ring-1 ${s.ring} p-2.5 rounded-2xl flex-shrink-0`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#c4a0b8] truncate">{s.label}</p>
              <p className="font-bold text-[#831843] text-lg leading-tight">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Período */}
      <div className="flex gap-1.5 bg-pink-50 rounded-2xl p-1.5 w-fit border border-pink-100">
        {(['7d', '30d', '90d', 'all'] as Period[]).map((p) => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              period === p
                ? 'bg-white text-[#831843] shadow-sm border border-pink-100'
                : 'text-[#c4a0b8] hover:text-[#831843]'
            }`}
          >
            {p === 'all' ? 'Todo' : p}
          </button>
        ))}
      </div>

      {/* Gráfico */}
      <div className="card p-5">
        <h3 className="text-xs font-semibold text-[#c4a0b8] uppercase tracking-wider mb-5">Ingresos por día</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" vertical={false} />
              <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#c4a0b8' }} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#c4a0b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(val) => [`$${Number(val).toLocaleString('es-AR')}`, 'Ingresos']}
                labelFormatter={(l) => `Fecha: ${l}`}
                contentStyle={{ borderRadius: 16, border: '1px solid #fce7f3', boxShadow: '0 4px 16px rgba(244,114,182,0.1)' }}
                cursor={{ fill: '#fce7f3', radius: 8 }}
              />
              <Bar dataKey="ingresos" fill="url(#pinkGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f472b6" />
                  <stop offset="100%" stopColor="#fbcfe8" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-[#c4a0b8] gap-2">
            <span className="text-3xl">📊</span>
            <p className="text-sm">No hay ventas en este período</p>
          </div>
        )}
      </div>

      {/* Últimas ventas */}
      {soldProducts.length > 0 && (
        <div className="card p-5">
          <h3 className="text-xs font-semibold text-[#c4a0b8] uppercase tracking-wider mb-4">Últimas ventas</h3>
          <div className="flex flex-col divide-y divide-pink-50">
            {soldProducts.slice(0, 10).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-[#4a1942] font-medium truncate max-w-[55%]">{p.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-pink-500 font-bold">${Number(p.price).toLocaleString('es-AR')}</span>
                  {p.sold_at && (
                    <span className="text-[#c4a0b8] text-xs">{new Date(p.sold_at).toLocaleDateString('es-AR')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
