import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F6]">
      <AdminNav userEmail={user.email ?? ''} userName={user.user_metadata?.nombre} />
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
