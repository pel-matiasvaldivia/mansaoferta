import { PrismaClient } from '@prisma/client'
import { hash } from '@node-rs/argon2'
import { slugify } from '../lib/slug'

const prisma = new PrismaClient()

async function main() {
  const password = await hash('password123', {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  })

  // Demo pyme owner + tenant
  const owner = await prisma.user.upsert({
    where: { email: 'pyme@demo.com' },
    update: {},
    create: { email: 'pyme@demo.com', name: 'Dueño Demo', passwordHash: password },
  })

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'panaderia-la-manzana' },
    update: {},
    create: {
      slug: 'panaderia-la-manzana',
      name: 'Panadería La Manzana',
      city: 'Rosario',
      phone: '+54 341 555 0100',
      plan: 'FREE',
      memberships: { create: { userId: owner.id, role: 'OWNER' } },
    },
  })

  const catalog = [
    { type: 'PRODUCT' as const, title: 'Combo Docena de Facturas', price: 3500, stock: 40 },
    { type: 'PRODUCT' as const, title: 'Pan de Masa Madre', price: 2800, stock: 25 },
    { type: 'SERVICE' as const, title: 'Torta por Encargue', price: 15000, stock: null },
  ]
  for (const item of catalog) {
    const slug = slugify(`${item.title}-${tenant.slug}`)
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        tenantId: tenant.id,
        type: item.type,
        title: item.title,
        slug,
        description: 'Producto de demostración.',
        price: item.price,
        stock: item.stock,
      },
    })
  }

  // Demo consumer
  await prisma.user.upsert({
    where: { email: 'cliente@demo.com' },
    update: {},
    create: { email: 'cliente@demo.com', name: 'Cliente Demo', passwordHash: password },
  })

  // Demo superadmin (SaaS operator)
  await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: { globalRole: 'SUPERADMIN' },
    create: {
      email: 'admin@demo.com',
      name: 'Operador SaaS',
      passwordHash: password,
      globalRole: 'SUPERADMIN',
    },
  })

  console.log('Seed completo:')
  console.log('  pyme@demo.com / password123 (dueño de tenant)')
  console.log('  cliente@demo.com / password123 (consumidor)')
  console.log('  admin@demo.com / password123 (superadmin)')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
