import { redirect } from 'next/navigation'

// The dashboard index just lands on the products tab.
export default function DashboardPage() {
  redirect('/dashboard/products')
}
