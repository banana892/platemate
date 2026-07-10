/**
 * seed.js — Realistic Seed Data for PlateMate
 *
 * Creates a complete dataset that mirrors a real food delivery platform:
 * - 4 Users (one per role: Customer, Partner, Rider, Admin)
 * - 2 Restaurant Owners with restaurants
 * - 8 Cuisines
 * - Categories and Menu Items for each restaurant
 * - Business Hours (7 days per restaurant)
 * - Sample Orders with OrderItems and Payments
 * - Reviews, Favorites, Notifications
 * - Coupons
 *
 * USAGE:
 *   npm run db:seed
 *
 * IDEMPOTENT:
 *   Clears all data before seeding (safe to run multiple times).
 *   Delete order matters due to FK constraints.
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

// ── Prisma Client Setup ──────────────────────────────────────────────────────
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// ── Helpers ──────────────────────────────────────────────────────────────────

const hashPassword = async (password) => bcrypt.hash(password, 12)

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

const generateUniqueSlug = (text) => {
  const base = slugify(text)
  const suffix = uuidv4().split('-')[0]
  return `${base}-${suffix}`
}

const generateOrderNumber = () => {
  const date = new Date()
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '')
  const randomPart = Math.floor(Math.random() * 99999)
    .toString()
    .padStart(5, '0')
  return `PM-${datePart}-${randomPart}`
}

// ── Business Hours Template ──────────────────────────────────────────────────

const DAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]

const createBusinessHours = (restaurantId, openTime = '09:00', closeTime = '23:00') =>
  DAYS.map((day) => ({
    id: uuidv4(),
    restaurantId,
    dayOfWeek: day,
    openTime,
    closeTime,
    isClosed: false,
  }))

// ── Main Seed Function ───────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Seeding PlateMate database...\n')

  // ── 1. Clear existing data (order matters for FK constraints) ─────────
  console.log('🗑️   Clearing existing data...')

  await prisma.notification.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.review.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.businessHour.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.category.deleteMany()
  await prisma.restaurantCuisine.deleteMany()
  await prisma.restaurant.deleteMany()
  await prisma.restaurantOwner.deleteMany()
  await prisma.deliveryPartner.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.address.deleteMany()
  await prisma.user.deleteMany()
  await prisma.cuisine.deleteMany()

  console.log('   ✅  All tables cleared.\n')

  // ── 2. Create Users ───────────────────────────────────────────────────
  console.log('👤  Creating users...')

  const password = await hashPassword('Password@123')

  const customer = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'Arjun Sharma',
      email: 'arjun@platemate.com',
      phone: '+919876543210',
      password,
      role: 'CUSTOMER',
      isVerified: true,
      isActive: true,
    },
  })

  const partner1 = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'Priya Patel',
      email: 'priya@platemate.com',
      phone: '+919876543211',
      password,
      role: 'PARTNER',
      isVerified: true,
      isActive: true,
    },
  })

  const partner2 = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'Rahul Mehta',
      email: 'rahul@platemate.com',
      phone: '+919876543214',
      password,
      role: 'PARTNER',
      isVerified: true,
      isActive: true,
    },
  })

  const rider = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'Vikram Singh',
      email: 'vikram@platemate.com',
      phone: '+919876543212',
      password,
      role: 'RIDER',
      isVerified: true,
      isActive: true,
    },
  })

  const admin = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'Sneha Reddy',
      email: 'admin@platemate.com',
      phone: '+919876543213',
      password,
      role: 'ADMIN',
      isVerified: true,
      isActive: true,
    },
  })

  console.log(`   ✅  5 users created (Customer, 2 Partners, Rider, Admin)\n`)

  // ── 3. Create Addresses ───────────────────────────────────────────────
  console.log('📍  Creating addresses...')

  await prisma.address.createMany({
    data: [
      {
        id: uuidv4(),
        userId: customer.id,
        label: 'Home',
        type: 'HOME',
        street: '42, 3rd Cross, Indiranagar',
        landmark: 'Near Indiranagar Metro Station',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560038',
        latitude: 12.9716,
        longitude: 77.6412,
        isDefault: true,
      },
      {
        id: uuidv4(),
        userId: customer.id,
        label: 'Office',
        type: 'WORK',
        street: '101, Brigade Gateway, Rajajinagar',
        landmark: 'Near Orion Mall',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560055',
        latitude: 12.9906,
        longitude: 77.5546,
        isDefault: false,
      },
    ],
  })

  console.log(`   ✅  2 addresses created for ${customer.name}\n`)

  // ── 4. Create Restaurant Owners ───────────────────────────────────────
  console.log('🏪  Creating restaurant owners...')

  const owner1 = await prisma.restaurantOwner.create({
    data: {
      id: uuidv4(),
      userId: partner1.id,
      businessName: 'Spice Route Foods Pvt. Ltd.',
      panNumber: 'ABCDE1234F',
      gstNumber: '29ABCDE1234F1Z5',
      isApproved: true,
    },
  })

  const owner2 = await prisma.restaurantOwner.create({
    data: {
      id: uuidv4(),
      userId: partner2.id,
      businessName: 'Urban Bites Food Co.',
      panNumber: 'FGHIJ5678K',
      gstNumber: '29FGHIJ5678K1Z8',
      isApproved: true,
    },
  })

  console.log(`   ✅  2 restaurant owners created\n`)

  // ── 5. Create Cuisines ────────────────────────────────────────────────
  console.log('🍽️   Creating cuisines...')

  const cuisineData = [
    'North Indian',
    'South Indian',
    'Chinese',
    'Italian',
    'Continental',
    'Street Food',
    'Biryani',
    'Desserts',
  ]

  const cuisines = await Promise.all(
    cuisineData.map((name) =>
      prisma.cuisine.create({
        data: { id: uuidv4(), name },
      })
    )
  )

  const cuisineMap = Object.fromEntries(cuisines.map((c) => [c.name, c.id]))

  console.log(`   ✅  ${cuisines.length} cuisines created\n`)

  // ── 6. Create Restaurants ─────────────────────────────────────────────
  console.log('🏬  Creating restaurants...')

  const restaurant1 = await prisma.restaurant.create({
    data: {
      id: uuidv4(),
      ownerId: owner1.id,
      name: 'Spice Route Kitchen',
      slug: generateUniqueSlug('Spice Route Kitchen'),
      description:
        'Authentic North Indian cuisine with a modern twist. Known for our rich curries, tandoori specialties, and aromatic biryanis.',
      phone: '+918011223344',
      email: 'hello@spiceroute.in',
      street: '23, 100 Feet Road, Koramangala',
      landmark: 'Near Forum Mall',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560095',
      latitude: 12.9352,
      longitude: 77.6245,
      deliveryRadius: 8.0,
      minimumOrder: 199,
      deliveryFee: 30,
      averageDeliveryTime: 35,
      averageRating: 4.3,
      totalReviews: 1,
      isActive: true,
      isFeatured: true,
    },
  })

  const restaurant2 = await prisma.restaurant.create({
    data: {
      id: uuidv4(),
      ownerId: owner2.id,
      name: 'Urban Bites Café',
      slug: generateUniqueSlug('Urban Bites Cafe'),
      description:
        'A contemporary café serving global flavors — from classic Italian pastas to gourmet burgers and artisan desserts.',
      phone: '+918022334455',
      email: 'info@urbanbites.in',
      street: '45, Church Street',
      landmark: 'Near MG Road Metro',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560001',
      latitude: 12.9758,
      longitude: 77.6045,
      deliveryRadius: 6.0,
      minimumOrder: 249,
      deliveryFee: 40,
      averageDeliveryTime: 40,
      averageRating: 4.5,
      totalReviews: 1,
      isActive: true,
      isFeatured: true,
    },
  })

  console.log(`   ✅  2 restaurants created\n`)

  // ── 7. Link Cuisines to Restaurants ───────────────────────────────────
  console.log('🔗  Linking cuisines to restaurants...')

  await prisma.restaurantCuisine.createMany({
    data: [
      { id: uuidv4(), restaurantId: restaurant1.id, cuisineId: cuisineMap['North Indian'] },
      { id: uuidv4(), restaurantId: restaurant1.id, cuisineId: cuisineMap['Biryani'] },
      { id: uuidv4(), restaurantId: restaurant1.id, cuisineId: cuisineMap['Chinese'] },
      { id: uuidv4(), restaurantId: restaurant2.id, cuisineId: cuisineMap['Italian'] },
      { id: uuidv4(), restaurantId: restaurant2.id, cuisineId: cuisineMap['Continental'] },
      { id: uuidv4(), restaurantId: restaurant2.id, cuisineId: cuisineMap['Desserts'] },
    ],
  })

  console.log(`   ✅  6 cuisine-restaurant links created\n`)

  // ── 8. Create Business Hours ──────────────────────────────────────────
  console.log('🕐  Creating business hours...')

  await prisma.businessHour.createMany({
    data: [
      ...createBusinessHours(restaurant1.id, '10:00', '23:00'),
      ...createBusinessHours(restaurant2.id, '08:00', '22:30'),
    ],
  })

  console.log(`   ✅  14 business hour records created (7 per restaurant)\n`)

  // ── 9. Create Categories ──────────────────────────────────────────────
  console.log('📂  Creating categories...')

  // Restaurant 1 — Spice Route Kitchen
  const r1Starters = await prisma.category.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant1.id,
      name: 'Starters',
      description: 'Appetizers and small bites to start your meal',
      sortOrder: 1,
    },
  })

  const r1MainCourse = await prisma.category.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant1.id,
      name: 'Main Course',
      description: 'Hearty mains with rice or bread',
      sortOrder: 2,
    },
  })

  const r1Biryani = await prisma.category.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant1.id,
      name: 'Biryani',
      description: 'Our signature dum biryanis',
      sortOrder: 3,
    },
  })

  const r1Breads = await prisma.category.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant1.id,
      name: 'Breads',
      description: 'Freshly baked Indian breads',
      sortOrder: 4,
    },
  })

  // Restaurant 2 — Urban Bites Café
  const r2Appetizers = await prisma.category.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant2.id,
      name: 'Appetizers',
      description: 'Light bites and sharing plates',
      sortOrder: 1,
    },
  })

  const r2Pasta = await prisma.category.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant2.id,
      name: 'Pasta & Risotto',
      description: 'Handmade pastas and creamy risottos',
      sortOrder: 2,
    },
  })

  const r2Burgers = await prisma.category.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant2.id,
      name: 'Gourmet Burgers',
      description: 'Premium burgers with artisan buns',
      sortOrder: 3,
    },
  })

  const r2Desserts = await prisma.category.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant2.id,
      name: 'Desserts',
      description: 'Sweet endings to your meal',
      sortOrder: 4,
    },
  })

  console.log(`   ✅  8 categories created (4 per restaurant)\n`)

  // ── 10. Create Menu Items ─────────────────────────────────────────────
  console.log('🍛  Creating menu items...')

  // Restaurant 1 — Spice Route Kitchen
  const menuItem1 = await prisma.menuItem.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant1.id,
      categoryId: r1Starters.id,
      name: 'Paneer Tikka',
      slug: generateUniqueSlug('Paneer Tikka'),
      description: 'Marinated cottage cheese cubes grilled to perfection in a tandoor',
      price: 279,
      isVeg: true,
      isAvailable: true,
      isFeatured: true,
      sortOrder: 1,
    },
  })

  const menuItem2 = await prisma.menuItem.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant1.id,
      categoryId: r1Starters.id,
      name: 'Chicken 65',
      slug: generateUniqueSlug('Chicken 65'),
      description: 'Spicy deep-fried chicken with curry leaves and red chillies',
      price: 329,
      isVeg: false,
      isAvailable: true,
      sortOrder: 2,
    },
  })

  await prisma.menuItem.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant1.id,
      categoryId: r1MainCourse.id,
      name: 'Dal Makhani',
      slug: generateUniqueSlug('Dal Makhani'),
      description: 'Slow-cooked black lentils in creamy tomato gravy with butter',
      price: 249,
      isVeg: true,
      isAvailable: true,
      isFeatured: true,
      sortOrder: 1,
    },
  })

  await prisma.menuItem.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant1.id,
      categoryId: r1MainCourse.id,
      name: 'Butter Chicken',
      slug: generateUniqueSlug('Butter Chicken'),
      description: 'Tender chicken in a rich, velvety tomato-butter sauce',
      price: 349,
      isVeg: false,
      isAvailable: true,
      isFeatured: true,
      sortOrder: 2,
    },
  })

  const menuItem5 = await prisma.menuItem.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant1.id,
      categoryId: r1Biryani.id,
      name: 'Hyderabadi Chicken Dum Biryani',
      slug: generateUniqueSlug('Hyderabadi Chicken Dum Biryani'),
      description: 'Fragrant basmati rice layered with spiced chicken, slow-cooked on dum',
      price: 399,
      isVeg: false,
      isAvailable: true,
      isFeatured: true,
      sortOrder: 1,
    },
  })

  await prisma.menuItem.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant1.id,
      categoryId: r1Biryani.id,
      name: 'Veg Dum Biryani',
      slug: generateUniqueSlug('Veg Dum Biryani'),
      description: 'Mixed vegetables and paneer with saffron-infused basmati rice',
      price: 329,
      isVeg: true,
      isAvailable: true,
      sortOrder: 2,
    },
  })

  await prisma.menuItem.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant1.id,
      categoryId: r1Breads.id,
      name: 'Garlic Naan',
      slug: generateUniqueSlug('Garlic Naan'),
      description: 'Soft tandoori bread topped with fresh garlic and butter',
      price: 69,
      isVeg: true,
      isAvailable: true,
      sortOrder: 1,
    },
  })

  await prisma.menuItem.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant1.id,
      categoryId: r1Breads.id,
      name: 'Butter Roti',
      slug: generateUniqueSlug('Butter Roti'),
      description: 'Whole wheat bread cooked on tawa and finished with butter',
      price: 39,
      isVeg: true,
      isAvailable: true,
      sortOrder: 2,
    },
  })

  // Restaurant 2 — Urban Bites Café
  const menuItem9 = await prisma.menuItem.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant2.id,
      categoryId: r2Appetizers.id,
      name: 'Bruschetta Trio',
      slug: generateUniqueSlug('Bruschetta Trio'),
      description: 'Three artisan bruschettas — tomato basil, mushroom truffle, and roasted pepper',
      price: 349,
      isVeg: true,
      isAvailable: true,
      isFeatured: true,
      sortOrder: 1,
    },
  })

  await prisma.menuItem.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant2.id,
      categoryId: r2Appetizers.id,
      name: 'Crispy Calamari',
      slug: generateUniqueSlug('Crispy Calamari'),
      description: 'Lightly battered squid rings with sriracha aioli',
      price: 399,
      isVeg: false,
      isAvailable: true,
      sortOrder: 2,
    },
  })

  const menuItem11 = await prisma.menuItem.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant2.id,
      categoryId: r2Pasta.id,
      name: 'Penne Arrabbiata',
      slug: generateUniqueSlug('Penne Arrabbiata'),
      description: 'Penne in a fiery tomato sauce with garlic, chilli flakes, and fresh basil',
      price: 379,
      isVeg: true,
      isAvailable: true,
      isFeatured: true,
      sortOrder: 1,
    },
  })

  await prisma.menuItem.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant2.id,
      categoryId: r2Pasta.id,
      name: 'Chicken Alfredo',
      slug: generateUniqueSlug('Chicken Alfredo'),
      description: 'Fettuccine in a creamy parmesan sauce with grilled chicken breast',
      price: 449,
      isVeg: false,
      isAvailable: true,
      sortOrder: 2,
    },
  })

  await prisma.menuItem.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant2.id,
      categoryId: r2Burgers.id,
      name: 'Classic Smash Burger',
      slug: generateUniqueSlug('Classic Smash Burger'),
      description: 'Double-smashed beef patties, American cheese, caramelized onions, special sauce',
      price: 429,
      isVeg: false,
      isAvailable: true,
      isFeatured: true,
      sortOrder: 1,
    },
  })

  await prisma.menuItem.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant2.id,
      categoryId: r2Burgers.id,
      name: 'Paneer Tikka Burger',
      slug: generateUniqueSlug('Paneer Tikka Burger'),
      description: 'Tandoori spiced paneer patty, mint chutney, pickled onions',
      price: 349,
      isVeg: true,
      isAvailable: true,
      sortOrder: 2,
    },
  })

  await prisma.menuItem.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant2.id,
      categoryId: r2Desserts.id,
      name: 'Tiramisu',
      slug: generateUniqueSlug('Tiramisu'),
      description: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone',
      price: 299,
      isVeg: true,
      isAvailable: true,
      isFeatured: true,
      sortOrder: 1,
    },
  })

  await prisma.menuItem.create({
    data: {
      id: uuidv4(),
      restaurantId: restaurant2.id,
      categoryId: r2Desserts.id,
      name: 'Molten Chocolate Lava Cake',
      slug: generateUniqueSlug('Molten Chocolate Lava Cake'),
      description: 'Warm chocolate cake with a gooey center, served with vanilla ice cream',
      price: 329,
      isVeg: true,
      isAvailable: true,
      sortOrder: 2,
    },
  })

  console.log(`   ✅  16 menu items created (8 per restaurant)\n`)

  // ── 11. Create Delivery Partner ───────────────────────────────────────
  console.log('🏍️   Creating delivery partner...')

  const deliveryPartner = await prisma.deliveryPartner.create({
    data: {
      id: uuidv4(),
      userId: rider.id,
      vehicleType: 'Bike',
      vehicleNumber: 'KA-01-AB-1234',
      licenseNumber: 'KA0520210012345',
      isAvailable: true,
      isApproved: true,
      currentLatitude: 12.9542,
      currentLongitude: 77.6305,
      totalDeliveries: 156,
      averageRating: 4.7,
    },
  })

  console.log(`   ✅  1 delivery partner created (${rider.name})\n`)

  // ── 12. Create Coupons ────────────────────────────────────────────────
  console.log('🎟️   Creating coupons...')

  const couponWelcome = await prisma.coupon.create({
    data: {
      id: uuidv4(),
      code: 'WELCOME50',
      description: '50% off on your first order (up to ₹100)',
      discountPercent: 50,
      maxDiscount: 100,
      minimumOrder: 199,
      usageLimit: 1000,
      usedCount: 42,
      validFrom: new Date('2026-01-01'),
      validUntil: new Date('2026-12-31'),
      isActive: true,
    },
  })

  await prisma.coupon.create({
    data: {
      id: uuidv4(),
      code: 'FLAT100',
      description: 'Flat ₹100 off on orders above ₹499',
      discountAmount: 100,
      minimumOrder: 499,
      usageLimit: 500,
      usedCount: 128,
      validFrom: new Date('2026-06-01'),
      validUntil: new Date('2026-08-31'),
      isActive: true,
    },
  })

  await prisma.coupon.create({
    data: {
      id: uuidv4(),
      code: 'FREEDEL',
      description: 'Free delivery on orders above ₹299',
      discountAmount: 50,
      minimumOrder: 299,
      validFrom: new Date('2026-01-01'),
      validUntil: new Date('2026-12-31'),
      isActive: true,
    },
  })

  console.log(`   ✅  3 coupons created\n`)

  // ── 13. Create Orders ─────────────────────────────────────────────────
  console.log('📦  Creating orders...')

  // Order 1 — Delivered order from Restaurant 1
  const order1 = await prisma.order.create({
    data: {
      id: uuidv4(),
      orderNumber: 'PM-20260708-00001',
      userId: customer.id,
      restaurantId: restaurant1.id,
      deliveryPartnerId: deliveryPartner.id,
      couponId: couponWelcome.id,
      status: 'DELIVERED',
      subtotal: 677,
      deliveryFee: 30,
      discount: 100,
      tax: 36.42,
      totalAmount: 643.42,
      deliveryAddress: '42, 3rd Cross, Indiranagar, Bengaluru 560038',
      deliveryLatitude: 12.9716,
      deliveryLongitude: 77.6412,
      notes: 'Ring the doorbell twice please',
      estimatedDeliveryTime: new Date('2026-07-08T19:35:00Z'),
      deliveredAt: new Date('2026-07-08T19:28:00Z'),
    },
  })

  await prisma.orderItem.createMany({
    data: [
      {
        id: uuidv4(),
        orderId: order1.id,
        menuItemId: menuItem1.id,
        name: 'Paneer Tikka',
        quantity: 1,
        unitPrice: 279,
        totalPrice: 279,
      },
      {
        id: uuidv4(),
        orderId: order1.id,
        menuItemId: menuItem5.id,
        name: 'Hyderabadi Chicken Dum Biryani',
        quantity: 1,
        unitPrice: 399,
        totalPrice: 399,
      },
    ],
  })

  await prisma.payment.create({
    data: {
      id: uuidv4(),
      orderId: order1.id,
      provider: 'RAZORPAY',
      method: 'UPI',
      amount: 643.42,
      currency: 'INR',
      status: 'CAPTURED',
      transactionId: 'pay_' + uuidv4().replace(/-/g, '').slice(0, 14),
      paidAt: new Date('2026-07-08T19:00:00Z'),
    },
  })

  // Order 2 — Pending order from Restaurant 2
  const order2 = await prisma.order.create({
    data: {
      id: uuidv4(),
      orderNumber: 'PM-20260710-00015',
      userId: customer.id,
      restaurantId: restaurant2.id,
      status: 'CONFIRMED',
      subtotal: 728,
      deliveryFee: 40,
      discount: 0,
      tax: 46.08,
      totalAmount: 814.08,
      deliveryAddress: '42, 3rd Cross, Indiranagar, Bengaluru 560038',
      deliveryLatitude: 12.9716,
      deliveryLongitude: 77.6412,
      estimatedDeliveryTime: new Date('2026-07-10T13:45:00Z'),
    },
  })

  await prisma.orderItem.createMany({
    data: [
      {
        id: uuidv4(),
        orderId: order2.id,
        menuItemId: menuItem9.id,
        name: 'Bruschetta Trio',
        quantity: 1,
        unitPrice: 349,
        totalPrice: 349,
      },
      {
        id: uuidv4(),
        orderId: order2.id,
        menuItemId: menuItem11.id,
        name: 'Penne Arrabbiata',
        quantity: 1,
        unitPrice: 379,
        totalPrice: 379,
      },
    ],
  })

  await prisma.payment.create({
    data: {
      id: uuidv4(),
      orderId: order2.id,
      provider: 'RAZORPAY',
      method: 'CARD',
      amount: 814.08,
      currency: 'INR',
      status: 'CAPTURED',
      transactionId: 'pay_' + uuidv4().replace(/-/g, '').slice(0, 14),
      paidAt: new Date('2026-07-10T13:05:00Z'),
    },
  })

  // Order 3 — Cancelled order
  await prisma.order.create({
    data: {
      id: uuidv4(),
      orderNumber: 'PM-20260709-00008',
      userId: customer.id,
      restaurantId: restaurant1.id,
      status: 'CANCELLED',
      subtotal: 329,
      deliveryFee: 30,
      discount: 0,
      tax: 21.54,
      totalAmount: 380.54,
      deliveryAddress: '101, Brigade Gateway, Rajajinagar, Bengaluru 560055',
      deliveryLatitude: 12.9906,
      deliveryLongitude: 77.5546,
      cancelledAt: new Date('2026-07-09T12:15:00Z'),
      cancellationReason: 'Changed my mind',
    },
  })

  console.log(`   ✅  3 orders created (1 delivered, 1 confirmed, 1 cancelled)\n`)

  // ── 14. Create Reviews ────────────────────────────────────────────────
  console.log('⭐  Creating reviews...')

  await prisma.review.create({
    data: {
      id: uuidv4(),
      userId: customer.id,
      restaurantId: restaurant1.id,
      orderId: order1.id,
      rating: 4,
      comment:
        'The Hyderabadi Biryani was absolutely fantastic — perfectly spiced and the meat was tender. Paneer Tikka was good but could be a bit more charred. Overall great experience, will order again!',
    },
  })

  await prisma.review.create({
    data: {
      id: uuidv4(),
      userId: customer.id,
      restaurantId: restaurant2.id,
      orderId: order2.id,
      rating: 5,
      comment:
        'Best Italian food I have had in Bengaluru. The Penne Arrabbiata had the perfect kick and the Bruschetta was fresh and flavorful. Highly recommend!',
    },
  })

  console.log(`   ✅  2 reviews created\n`)

  // ── 15. Create Favorites ──────────────────────────────────────────────
  console.log('❤️   Creating favorites...')

  await prisma.favorite.createMany({
    data: [
      { id: uuidv4(), userId: customer.id, restaurantId: restaurant1.id },
      { id: uuidv4(), userId: customer.id, restaurantId: restaurant2.id },
    ],
  })

  console.log(`   ✅  2 favorites created\n`)

  // ── 16. Create Notifications ──────────────────────────────────────────
  console.log('🔔  Creating notifications...')

  await prisma.notification.createMany({
    data: [
      {
        id: uuidv4(),
        userId: customer.id,
        type: 'ORDER',
        title: 'Order Delivered! 🎉',
        message: 'Your order PM-20260708-00001 from Spice Route Kitchen has been delivered. Enjoy your meal!',
        isRead: true,
        data: JSON.stringify({ orderId: order1.id, restaurantId: restaurant1.id }),
      },
      {
        id: uuidv4(),
        userId: customer.id,
        type: 'ORDER',
        title: 'Order Confirmed ✅',
        message: 'Your order PM-20260710-00015 from Urban Bites Café has been confirmed. Preparing your food!',
        isRead: false,
        data: JSON.stringify({ orderId: order2.id, restaurantId: restaurant2.id }),
      },
      {
        id: uuidv4(),
        userId: customer.id,
        type: 'PROMO',
        title: 'Weekend Special! 🔥',
        message: 'Use code FLAT100 to get ₹100 off on orders above ₹499. Valid till Aug 31!',
        isRead: false,
      },
      {
        id: uuidv4(),
        userId: partner1.id,
        type: 'ORDER',
        title: 'New Order Received',
        message: 'You have a new order PM-20260710-00015. Please confirm within 5 minutes.',
        isRead: false,
        data: JSON.stringify({ orderId: order2.id }),
      },
      {
        id: uuidv4(),
        userId: rider.id,
        type: 'SYSTEM',
        title: 'Welcome to PlateMate! 🏍️',
        message: 'Your rider account has been approved. You can now start accepting deliveries.',
        isRead: true,
      },
    ],
  })

  console.log(`   ✅  5 notifications created\n`)

  // ── 17. Create Cart (active cart for customer) ────────────────────────
  console.log('🛒  Creating cart...')

  const cart = await prisma.cart.create({
    data: {
      id: uuidv4(),
      userId: customer.id,
      restaurantId: restaurant1.id,
    },
  })

  await prisma.cartItem.createMany({
    data: [
      {
        id: uuidv4(),
        cartId: cart.id,
        menuItemId: menuItem1.id,
        quantity: 2,
      },
      {
        id: uuidv4(),
        cartId: cart.id,
        menuItemId: menuItem2.id,
        quantity: 1,
      },
    ],
  })

  console.log(`   ✅  1 cart with 2 items created\n`)

  // ── Done ──────────────────────────────────────────────────────────────
  console.log('━'.repeat(60))
  console.log('')
  console.log('🎉  Seed completed successfully!')
  console.log('')
  console.log('   Summary:')
  console.log('   ────────────────────────────────────')
  console.log('   Users:              5  (Customer, 2 Partners, Rider, Admin)')
  console.log('   Addresses:          2')
  console.log('   Restaurant Owners:  2')
  console.log('   Restaurants:        2')
  console.log('   Cuisines:           8')
  console.log('   Cuisine Links:      6')
  console.log('   Business Hours:     14')
  console.log('   Categories:         8')
  console.log('   Menu Items:         16')
  console.log('   Delivery Partners:  1')
  console.log('   Coupons:            3')
  console.log('   Orders:             3')
  console.log('   Order Items:        4')
  console.log('   Payments:           2')
  console.log('   Reviews:            2')
  console.log('   Favorites:          2')
  console.log('   Notifications:      5')
  console.log('   Carts:              1')
  console.log('   Cart Items:         2')
  console.log('   ────────────────────────────────────')
  console.log('   Total Records:      80')
  console.log('')
  console.log('   All users share password: Password@123')
  console.log('')
  console.log('   Run `npm run db:studio` to browse the data.')
  console.log('')
  console.log('━'.repeat(60))
}

// ── Execute ──────────────────────────────────────────────────────────────────

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
