// PlateMate — Mock Menu Items

export const menuItems = [
  // Tandoori Trails (Restaurant 1)
  { id: 101, restaurantId: 1, name: "Butter Chicken", description: "Creamy tomato-based curry with tender chicken pieces", price: 320, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80", category: "Main Course", isVeg: false, isBestseller: true, rating: 4.5, ratingCount: 340 },
  { id: 102, restaurantId: 1, name: "Paneer Tikka", description: "Smoky cottage cheese marinated in spices and grilled", price: 280, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80", category: "Starters", isVeg: true, isBestseller: true, rating: 4.3, ratingCount: 210 },
  { id: 103, restaurantId: 1, name: "Dal Makhani", description: "Slow-cooked black lentils in a rich buttery gravy", price: 220, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80", category: "Main Course", isVeg: true, isBestseller: false, rating: 4.4, ratingCount: 180 },
  { id: 104, restaurantId: 1, name: "Tandoori Roti", description: "Whole wheat flatbread baked in clay oven", price: 40, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80", category: "Breads", isVeg: true, isBestseller: false, rating: 4.0, ratingCount: 90 },
  { id: 105, restaurantId: 1, name: "Chicken Biryani", description: "Fragrant basmati rice layered with spiced chicken", price: 350, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80", category: "Rice", isVeg: false, isBestseller: true, rating: 4.6, ratingCount: 520 },
  { id: 106, restaurantId: 1, name: "Gulab Jamun", description: "Soft milk dumplings soaked in rose-flavored syrup", price: 120, image: "https://images.unsplash.com/photo-1666190100555-0ac3464f5674?w=400&q=80", category: "Desserts", isVeg: true, isBestseller: false, rating: 4.2, ratingCount: 70 },

  // Pizza Planet (Restaurant 2)
  { id: 201, restaurantId: 2, name: "Margherita Pizza", description: "Classic pizza with fresh mozzarella and basil", price: 299, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80", category: "Pizza", isVeg: true, isBestseller: true, rating: 4.4, ratingCount: 450 },
  { id: 202, restaurantId: 2, name: "Pepperoni Pizza", description: "Loaded with spicy pepperoni and melted cheese", price: 449, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80", category: "Pizza", isVeg: false, isBestseller: true, rating: 4.6, ratingCount: 380 },
  { id: 203, restaurantId: 2, name: "Alfredo Pasta", description: "Creamy white sauce pasta with mushrooms", price: 349, image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80", category: "Pasta", isVeg: true, isBestseller: false, rating: 4.3, ratingCount: 160 },
  { id: 204, restaurantId: 2, name: "Garlic Bread", description: "Toasted bread with garlic butter and herbs", price: 149, image: "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400&q=80", category: "Sides", isVeg: true, isBestseller: false, rating: 4.1, ratingCount: 200 },
  { id: 205, restaurantId: 2, name: "Tiramisu", description: "Classic Italian coffee-flavored layered dessert", price: 249, image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80", category: "Desserts", isVeg: true, isBestseller: false, rating: 4.5, ratingCount: 90 },

  // Dragon Wok (Restaurant 3)
  { id: 301, restaurantId: 3, name: "Kung Pao Chicken", description: "Stir-fried chicken with peanuts and chili peppers", price: 320, image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&q=80", category: "Main Course", isVeg: false, isBestseller: true, rating: 4.3, ratingCount: 280 },
  { id: 302, restaurantId: 3, name: "Veg Hakka Noodles", description: "Stir-fried noodles with fresh vegetables and soy sauce", price: 220, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80", category: "Noodles", isVeg: true, isBestseller: true, rating: 4.1, ratingCount: 350 },
  { id: 303, restaurantId: 3, name: "Dim Sum Platter", description: "Assorted steamed dumplings with dipping sauces", price: 380, image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&q=80", category: "Starters", isVeg: false, isBestseller: false, rating: 4.4, ratingCount: 120 },
  { id: 304, restaurantId: 3, name: "Fried Rice", description: "Wok-tossed rice with eggs and vegetables", price: 200, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80", category: "Rice", isVeg: false, isBestseller: false, rating: 4.0, ratingCount: 190 },

  // Green Bowl (Restaurant 4)
  { id: 401, restaurantId: 4, name: "Quinoa Power Bowl", description: "Quinoa, avocado, edamame, cherry tomatoes with tahini dressing", price: 350, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80", category: "Bowls", isVeg: true, isBestseller: true, rating: 4.7, ratingCount: 180 },
  { id: 402, restaurantId: 4, name: "Greek Salad", description: "Fresh Mediterranean salad with feta and olives", price: 280, image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80", category: "Salads", isVeg: true, isBestseller: false, rating: 4.5, ratingCount: 140 },
  { id: 403, restaurantId: 4, name: "Smoothie Bowl", description: "Acai berry smoothie topped with granola and fresh fruits", price: 320, image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&q=80", category: "Bowls", isVeg: true, isBestseller: true, rating: 4.6, ratingCount: 110 },
  { id: 404, restaurantId: 4, name: "Green Detox Juice", description: "Cold-pressed spinach, cucumber, and apple juice", price: 180, image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&q=80", category: "Beverages", isVeg: true, isBestseller: false, rating: 4.3, ratingCount: 80 },

  // Burger Barn (Restaurant 6)
  { id: 601, restaurantId: 6, name: "Classic Smash Burger", description: "Double smashed patty with cheese, pickles, and special sauce", price: 249, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80", category: "Burgers", isVeg: false, isBestseller: true, rating: 4.5, ratingCount: 620 },
  { id: 602, restaurantId: 6, name: "Crispy Chicken Burger", description: "Buttermilk fried chicken with coleslaw and mayo", price: 229, image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80", category: "Burgers", isVeg: false, isBestseller: true, rating: 4.3, ratingCount: 410 },
  { id: 603, restaurantId: 6, name: "Loaded Fries", description: "Crispy fries topped with cheese sauce and jalapeños", price: 179, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80", category: "Sides", isVeg: true, isBestseller: false, rating: 4.2, ratingCount: 290 },
  { id: 604, restaurantId: 6, name: "Oreo Milkshake", description: "Thick milkshake blended with Oreo cookies and ice cream", price: 199, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80", category: "Beverages", isVeg: true, isBestseller: false, rating: 4.4, ratingCount: 150 },
]

export function getMenuByRestaurant(restaurantId) {
  return menuItems.filter(item => item.restaurantId === restaurantId)
}

export function getMenuCategories(restaurantId) {
  const items = getMenuByRestaurant(restaurantId)
  return [...new Set(items.map(item => item.category))]
}

export function getBestsellers(restaurantId) {
  return getMenuByRestaurant(restaurantId).filter(item => item.isBestseller)
}
