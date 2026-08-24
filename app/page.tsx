import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import ComboCard from '@/components/ComboCard'
import { ArrowRight, ShoppingBag, Store, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()

  // Fetch featured combos
  const { data: dbCombos } = await supabase
    .from('combos')
    .select('*')
    .eq('active', true)
    .gt('stock', 0)
    .limit(3)
    .order('created_at', { ascending: false })

  const EXAMPLE_COMBOS = [
    {
      id: 'ex-1',
      title: 'Combo Familiar',
      description: '2 Pizzas grandes + 1 Gaseosa 1.5L. Ideal para compartir el fin de semana.',
      price: 15000,
      stock: 10,
      image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300&auto=format&fit=crop',
      pyme_id: 'example',
      active: true
    },
    {
      id: 'ex-2',
      title: 'Pack Desayuno',
      description: 'Café molido 500g + 2 Medialunas. Empezá tu día con energía.',
      price: 4500,
      stock: 5,
      image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=300&auto=format&fit=crop',
      pyme_id: 'example',
      active: true
    },
    {
      id: 'ex-3',
      title: 'Kit Limpieza',
      description: 'Lavandina 2L + Detergente + Esponjas. Todo lo que necesitas para tu hogar.',
      price: 8900,
      stock: 20,
      image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?q=80&w=300&auto=format&fit=crop',
      pyme_id: 'example',
      active: true
    }
  ]

  const featuredCombos = dbCombos && dbCombos.length > 0 ? dbCombos : EXAMPLE_COMBOS

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
            Conectando <span className="text-yellow-300">Pymes</span> con vos.
          </h1>
          <p className="mt-4 text-xl text-indigo-100 max-w-3xl mx-auto mb-10">
            MansaOferta es el lugar donde encuentras las mejores promociones de tus comercios locales favoritos. Ahorra comprando directo.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/browse"
              className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-base font-bold text-indigo-600 hover:bg-gray-50 transition-colors shadow-lg"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Explorar Ofertas
            </Link>
            <Link
              href="/login?role=pyme"
              className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-500 bg-opacity-30 border-indigo-400 px-8 py-3 text-base font-medium text-white hover:bg-opacity-40 transition-colors backdrop-blur-sm"
            >
              <Store className="mr-2 h-5 w-5" />
              Soy Vendedor
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-16 bg-gray-50 dark:bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Ofertas Destacadas
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Descubre lo que otros están comprando ahora mismo.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCombos && featuredCombos.length > 0 ? (
              featuredCombos.map((combo) => (
                <ComboCard key={combo.id} combo={combo} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-500">Aún no hay ofertas activas. ¡Sé el primero en publicar!</p>
              </div>
            )}
          </div>

          <div className="mt-12 text-center">
            <Link href="/browse" className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-500 hover:underline">
              Ver todas las ofertas <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="p-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 mb-6">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Precios Bajos</h3>
              <p className="text-gray-500">Accede a precios directos de fábrica y promociones exclusivas.</p>
            </div>
            <div className="p-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-6">
                <Store className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Apoyo Local</h3>
              <p className="text-gray-500">Impulsa la economía de tu barrio comprando a Pymes cercanas.</p>
            </div>
            <div className="p-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600 mb-6">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Comunidad</h3>
              <p className="text-gray-500">Únete a miles de usuarios que ya ahorran con MansaOferta.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-2xl font-bold">MansaOferta</span>
            <p className="text-gray-400 text-sm mt-1">© 2024 MansaOferta.com.ar</p>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="text-gray-400 hover:text-white">Términos</Link>
            <Link href="#" className="text-gray-400 hover:text-white">Privacidad</Link>
            <Link href="#" className="text-gray-400 hover:text-white">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
