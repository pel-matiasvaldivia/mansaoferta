import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { ArrowRight, ShoppingBag, Store, Users } from 'lucide-react'
import { prisma } from '@/lib/db'
import { toProductCard } from '@/lib/serialize'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const dbProducts = await prisma.product.findMany({
    where: { active: true, OR: [{ stock: null }, { stock: { gt: 0 } }] },
    include: { tenant: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 3,
  })
  const featured = dbProducts.map((p) => toProductCard(p, p.tenant))

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
              href="/register"
              className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-500 bg-opacity-30 border-indigo-400 px-8 py-3 text-base font-medium text-white hover:bg-opacity-40 transition-colors backdrop-blur-sm"
            >
              <Store className="mr-2 h-5 w-5" />
              Vendé en MansaOferta
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
            {featured.length > 0 ? (
              featured.map((product) => (
                <ProductCard key={product.id} product={product} />
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
