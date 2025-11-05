# Wonder Electronics - E-Commerce Website

A complete consumer electronics e-commerce website with both client-side and admin-side functionality, built with HTML, CSS, and JavaScript.

## Features

### Client-Side
- **Homepage** - Hero section, featured products, and category navigation
- **Products Page** - Browse all products with category and price filters
- **Shopping Cart** - Add items, update quantities, and checkout
- **Responsive Design** - Works on desktop, tablet, and mobile devices

### Admin-Side
- **Dashboard** - View statistics (total products, orders, revenue)
- **Product Management** - Add, edit, and delete products
- **Data Management** - Clear all data option (for testing)

## Getting Started

1. Simply open `index.html` in your web browser
2. No server or installation required - everything runs client-side using localStorage

## Pages

- **index.html** - Homepage with featured products
- **products.html** - All products with filtering options
- **cart.html** - Shopping cart and checkout
- **admin.html** - Admin dashboard
- **admin-products.html** - Product management interface

## How to Use

### As a Customer:
1. Browse products on the homepage or products page
2. Click "Add to Cart" to add items to your cart
3. View your cart and update quantities
4. Proceed to checkout

### As an Admin:
1. Navigate to "Admin" in the navigation menu
2. Go to "Products" to manage inventory
3. Click "Add New Product" to add products
4. Edit or delete existing products
5. View dashboard statistics

## File Structure

```
├── index.html          # Homepage
├── products.html       # Products listing page
├── cart.html          # Shopping cart page
├── admin.html         # Admin dashboard
├── admin-products.html # Product management page
├── styles.css         # All styling
├── app.js            # Core functionality (storage, cart)
├── client.js         # Client-side features
└── admin.js          # Admin-side features
```

## Default Products

The website comes with 6 default products:
- iPhone 15 Pro (Smartphones)
- MacBook Pro 14" (Laptops)
- iPad Air (Tablets)
- AirPods Pro (Audio)
- Apple Watch Series 9 (Wearables)
- USB-C Hub (Accessories)

## Data Storage

All data is stored in the browser's localStorage:
- Products are stored in `products` key
- Cart items are stored in `cart` key
- Orders are stored in `orders` key

## Browser Support

Works in all modern browsers that support:
- ES6 JavaScript
- localStorage API
- CSS Grid and Flexbox

## Customization

You can easily customize:
- Colors in `styles.css` (CSS variables at the top)
- Default products in `app.js` (initializeDefaultProducts function)
- Tax rate in `client.js` (updateCartSummary function)

