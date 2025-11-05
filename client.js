// Client-side JavaScript - Product Display and Cart Functionality

// Display products on page
function displayProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-light);">No products found.</p>';
        return;
    }

    container.innerHTML = products.map(product => {
        const discount = product.discount || 0;
        const originalPrice = product.price;
        const discountedPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;
        const displayPrice = discount > 0 ? discountedPrice : originalPrice;
        const priceClass = discount > 0 ? 'product-price-discounted' : 'product-price';

        return `
        <div class="product-card" onclick="openProductDetail(${product.id})" style="cursor: pointer;">
            ${discount > 0 ? `<div class="product-discount-badge">-${discount}%</div>` : ''}
            <img src="${product.image || 'https://via.placeholder.com/300'}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300'">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <div class="product-price-container">
                        ${discount > 0 ? `<span class="product-original-price">${formatPrice(originalPrice)}</span>` : ''}
                        <span class="${priceClass}">${formatPrice(displayPrice)}</span>
                    </div>
                    <button class="btn btn-primary add-to-cart" onclick="event.stopPropagation(); handleAddToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Handle add to cart
function handleAddToCart(productId) {
    const product = getProductById(productId);
    if (!product) {
        alert('Product not found!');
        return;
    }

    if (product.stock <= 0) {
        alert('This product is out of stock!');
        return;
    }

    if (addToCart(productId)) {
        // Visual feedback
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Added!';
        btn.style.backgroundColor = '#10b981';

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
        }, 1000);
    }
}

// Display featured products
function displayFeaturedProducts(searchTerm = '') {
    const allProducts = getProducts();
    const featuredList = getFeaturedProducts();

    // Sort featured products by order
    const sortedFeatured = featuredList.sort((a, b) => a.order - b.order);

    // Get actual product objects for featured products
    let featuredProducts = sortedFeatured
        .map(fp => allProducts.find(p => p.id === fp.productId))
        .filter(p => p !== undefined); // Remove any products that don't exist anymore

    // Apply position sorting to featured products
    featuredProducts.sort((a, b) => {
        const positionOrder = { 'top': 1, 'middle': 2, 'bottom': 3 };
        const posA = a.position ? positionOrder[a.position] : (a.positionOrder ? a.positionOrder + 1000 : 9999);
        const posB = b.position ? positionOrder[b.position] : (b.positionOrder ? b.positionOrder + 1000 : 9999);
        return posA - posB;
    });

    // Apply search filter if search term is provided
    if (searchTerm && searchTerm.trim() !== '') {
        const term = searchTerm.trim().toLowerCase();
        featuredProducts = featuredProducts.filter(p =>
            p.name.toLowerCase().includes(term) ||
            (p.description && p.description.toLowerCase().includes(term)) ||
            (p.category && p.category.toLowerCase().includes(term))
        );
    }

    displayProducts(featuredProducts, 'featured-products');

    // Show message if no products found
    if (featuredProducts.length === 0 && searchTerm.trim() !== '') {
        const grid = document.getElementById('featured-products');
        if (grid) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-light);">
                    <p style="font-size: 1.25rem; margin-bottom: 0.5rem;">No featured products found</p>
                    <p>Try adjusting your search term</p>
                </div>
            `;
        }
    }
}

function handleFeaturedSearchAuto() {
    const searchInput = document.getElementById('featured-search-input');
    const searchScope = document.querySelector('input[name="search-scope"]:checked');

    if (!searchInput || !searchScope) return;

    const searchTerm = searchInput.value.trim();

    if (searchScope.value === 'featured') {
        // Search in featured products only - auto search as typing
        displayFeaturedProducts(searchTerm);
    } else {
        // For "All Products", we'll filter on products page
        // But if user wants to search all products, they can click a button or we could redirect
        // For now, let's just show a message or redirect if they want to search all
        if (searchTerm) {
            // Redirect to products page with search term after a short delay
            // But let's make it so they can type and see results first
            clearTimeout(window.featuredSearchTimeout);
            window.featuredSearchTimeout = setTimeout(() => {
                window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
            }, 2000); // Redirect after 2 seconds of no typing
        } else {
            clearTimeout(window.featuredSearchTimeout);
        }
    }
}

function handleFeaturedSearch() {
    const searchInput = document.getElementById('featured-search-input');
    const searchScope = document.querySelector('input[name="search-scope"]:checked');

    if (!searchInput || !searchScope) return;

    const searchTerm = searchInput.value.trim();

    if (searchScope.value === 'featured') {
        // Search in featured products only
        displayFeaturedProducts(searchTerm);
    } else {
        // Search in all products - redirect to products page with search
        if (searchTerm) {
            window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
        } else {
            window.location.href = 'products.html';
        }
    }
}

function clearFeaturedSearch() {
    const searchInput = document.getElementById('featured-search-input');
    if (searchInput) {
        searchInput.value = '';
        displayFeaturedProducts();
    }
}

// Display all products with filters
function displayAllProducts() {
    const products = getProducts();
    let filtered = [...products];

    // Search filter
    const searchInput = document.getElementById('search-input');
    if (searchInput && searchInput.value.trim() !== '') {
        const searchTerm = searchInput.value.trim().toLowerCase();
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(searchTerm) ||
            (p.description && p.description.toLowerCase().includes(searchTerm)) ||
            (p.category && p.category.toLowerCase().includes(searchTerm))
        );
    }

    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter && categoryFilter.value !== 'all') {
        filtered = filtered.filter(p => p.category === categoryFilter.value);
    }

    // Apply position sorting (top, middle, bottom, or number order) FIRST
    // This ensures products appear in their designated positions regardless of other sorts
    filtered.sort((a, b) => {
        // First, handle products with named positions
        const positionOrder = { 'top': 1, 'middle': 2, 'bottom': 3 };
        const posA = a.position ? positionOrder[a.position] : (a.positionOrder ? a.positionOrder + 1000 : 9999);
        const posB = b.position ? positionOrder[b.position] : (b.positionOrder ? b.positionOrder + 1000 : 9999);

        if (posA !== posB) {
            return posA - posB;
        }

        // If positions are equal, maintain existing sort order
        return 0;
    });

    // Sort filter (applies after position sorting for products without specific positions)
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) {
        switch (sortFilter.value) {
            case 'price-low':
                filtered.sort((a, b) => {
                    // Maintain position order if products have positions
                    if (a.position || b.position || a.positionOrder !== b.positionOrder) {
                        const positionOrder = { 'top': 1, 'middle': 2, 'bottom': 3 };
                        const posA = a.position ? positionOrder[a.position] : (a.positionOrder ? a.positionOrder + 1000 : 9999);
                        const posB = b.position ? positionOrder[b.position] : (b.positionOrder ? b.positionOrder + 1000 : 9999);
                        if (posA !== posB) return posA - posB;
                    }
                    return a.price - b.price;
                });
                break;
            case 'price-high':
                filtered.sort((a, b) => {
                    if (a.position || b.position || a.positionOrder !== b.positionOrder) {
                        const positionOrder = { 'top': 1, 'middle': 2, 'bottom': 3 };
                        const posA = a.position ? positionOrder[a.position] : (a.positionOrder ? a.positionOrder + 1000 : 9999);
                        const posB = b.position ? positionOrder[b.position] : (b.positionOrder ? b.positionOrder + 1000 : 9999);
                        if (posA !== posB) return posA - posB;
                    }
                    return b.price - a.price;
                });
                break;
            case 'name':
            default:
                filtered.sort((a, b) => {
                    if (a.position || b.position || a.positionOrder !== b.positionOrder) {
                        const positionOrder = { 'top': 1, 'middle': 2, 'bottom': 3 };
                        const posA = a.position ? positionOrder[a.position] : (a.positionOrder ? a.positionOrder + 1000 : 9999);
                        const posB = b.position ? positionOrder[b.position] : (b.positionOrder ? b.positionOrder + 1000 : 9999);
                        if (posA !== posB) return posA - posB;
                    }
                    return a.name.localeCompare(b.name);
                });
                break;
        }
    }

    displayProducts(filtered, 'products-grid');

    // Show message if no products found
    const productsGrid = document.getElementById('products-grid');
    if (filtered.length === 0 && productsGrid) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-light);">
                <p style="font-size: 1.25rem; margin-bottom: 0.5rem;">No products found</p>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
    }
}

// Display cart items
function displayCart() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
                <a href="products.html" class="btn btn-primary">Start Shopping</a>
            </div>
        `;
        if (cartSummary) {
            cartSummary.style.display = 'none';
        }
        return;
    }

    if (cartSummary) {
        cartSummary.style.display = 'block';
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image || 'https://via.placeholder.com/120'}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/120'">
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name}</h3>
                ${item.color ? `<p class="cart-item-color" style="color: var(--primary-color); font-size: 0.9rem; margin-top: 0.25rem;">Color: ${item.color}</p>` : ''}
                <p class="cart-item-price">${formatPrice(item.price)}</p>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1}, '${item.color || ''}')">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" onchange="updateQuantity(${item.id}, parseInt(this.value), '${item.color || ''}')">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1}, '${item.color || ''}')">+</button>
                    </div>
                    <button class="btn btn-danger btn-small" onclick="removeCartItem(${item.id}, '${item.color || ''}')">Remove</button>
                </div>
            </div>
        </div>
    `).join('');

    updateCartSummary();
}

// Update cart summary
function updateCartSummary() {
    const subtotalRWF = getCartTotal();  // Prices are in RWF
    const taxSettings = getTaxSettings();

    let taxRWF = 0;
    let totalRWF = subtotalRWF;

    if (taxSettings.enabled && taxSettings.rate > 0) {
        taxRWF = subtotalRWF * (taxSettings.rate / 100);
        totalRWF = subtotalRWF + taxRWF;
    }

    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const taxLabelEl = document.getElementById('tax-label');
    const taxRowEl = document.getElementById('tax-row');
    const totalEl = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotalRWF);
    if (taxEl) taxEl.textContent = formatPrice(taxRWF);
    if (totalEl) totalEl.textContent = formatPrice(totalRWF);
    if (checkoutBtn) checkoutBtn.disabled = subtotalRWF === 0;

    // Show/hide tax row
    if (taxRowEl) {
        if (taxSettings.enabled && taxSettings.rate > 0) {
            taxRowEl.style.display = 'flex';
            if (taxLabelEl) {
                taxLabelEl.textContent = `Tax (${taxSettings.rate}%):`;
            }
        } else {
            taxRowEl.style.display = 'none';
        }
    }
}

// Update quantity
function updateQuantity(productId, quantity, selectedColor = null) {
    updateCartQuantity(productId, quantity, selectedColor);
    displayCart();
}

// Remove cart item
function removeCartItem(productId, selectedColor = null) {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
        removeFromCart(productId, selectedColor);
        displayCart();
    }
}

// Payment Modal Functions
function openPaymentModal() {
    const modal = document.getElementById('payment-modal');
    const cart = getCart();

    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Display payment info
    displayPaymentInfo();

    if (modal) {
        modal.style.display = 'block';
    }
}

// Display payment information
function displayPaymentInfo() {
    const paymentInfo = getPaymentInfo();

    const paymentNumberEl = document.getElementById('payment-number-display');
    const paymentInstructionsEl = document.getElementById('payment-instructions-display');

    if (paymentNumberEl) {
        paymentNumberEl.textContent = paymentInfo.paymentNumber || '+250787070049';
    }
    if (paymentInstructionsEl) {
        paymentInstructionsEl.textContent = paymentInfo.instructions || 'Please send your payment to this number and fill in your details below.';
    }
}

function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function setupPaymentForm() {
    const form = document.getElementById('payment-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const cart = getCart();
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        // Get form data
        const name = document.getElementById('payment-name').value.trim();
        const mobile = document.getElementById('payment-mobile').value.trim();
        const address = document.getElementById('payment-address').value.trim();
        const transactionId = document.getElementById('payment-transaction').value.trim();

        if (!name || !mobile || !address || !transactionId) {
            alert('Please fill in all required fields.');
            return;
        }

        // Calculate totals
        const subtotalRWF = getCartTotal();
        const taxSettings = getTaxSettings();
        let taxRWF = 0;
        let totalRWF = subtotalRWF;

        if (taxSettings.enabled && taxSettings.rate > 0) {
            taxRWF = subtotalRWF * (taxSettings.rate / 100);
            totalRWF = subtotalRWF + taxRWF;
        }

        // Create order
        const orders = getOrders();
        const currentUser = getCurrentUser();
        const newOrder = {
            id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
            items: [...cart],
            customerName: name,
            customerMobile: mobile,
            customerEmail: currentUser ? currentUser.email : null, // Add user email if logged in
            deliveryAddress: address,
            transactionId: transactionId,
            subtotal: subtotalRWF,
            tax: taxRWF,
            total: totalRWF,
            status: 'pending',
            orderDate: new Date().toISOString()
        };

        orders.push(newOrder);
        saveOrders(orders);

        // Create notification for admin about new order
        createAdminNotification({
            type: 'order',
            title: 'New Order Received',
            message: `New order #${newOrder.id} from ${name} - Total: ${formatPrice(totalRWF)}`,
            data: { orderId: newOrder.id }
        });

        // Clear cart and close modal
        clearCart();
        closePaymentModal();
        displayCart();

        alert('Thank you for shopping with Wonder Electronics, your order have been received we are processing it our team will contact you to deliver it to you.');
    });

    // Setup close modal button
    const closeBtn = document.querySelector('#payment-modal .close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closePaymentModal);
    }

    // Close modal when clicking outside
    const modal = document.getElementById('payment-modal');
    if (modal) {
        window.addEventListener('click', function (event) {
            if (event.target === modal) {
                closePaymentModal();
            }
        });
    }
}

// Handle checkout
function handleCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // In a real application, this would process payment
    alert('Thank you for your order! Your items will be shipped soon.');
    clearCart();
    displayCart();
}

// Category navigation
function setupCategoryNavigation() {
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function () {
            const category = this.dataset.category;
            window.location.href = `products.html?category=${category}`;
        });
    });
}

// Display contact information
function displayContactInfo() {
    const contactInfo = getContactInfo();

    const emailEl = document.getElementById('contact-email-display');
    const phoneEl = document.getElementById('contact-phone-display');
    const addressEl = document.getElementById('contact-address-display');
    const hoursEl = document.getElementById('contact-hours-display');

    if (emailEl) {
        emailEl.innerHTML = `<a href="mailto:${contactInfo.email}" style="color: inherit; text-decoration: none; cursor: pointer;">${contactInfo.email}</a>`;
    }
    if (phoneEl) {
        phoneEl.innerHTML = `<a href="tel:${contactInfo.phone.replace(/\s+/g, '')}" style="color: inherit; text-decoration: none; cursor: pointer;">${contactInfo.phone}</a>`;
    }
    if (addressEl) addressEl.textContent = contactInfo.address;
    if (hoursEl) {
        // Replace newlines with <br> for display
        hoursEl.innerHTML = contactInfo.hours.replace(/\n/g, '<br>');
    }
    // Update Google Maps link
    const mapLinkEl = document.getElementById('contact-map-link');
    if (mapLinkEl) {
        // Create Google Maps URL from address
        const encodedAddress = encodeURIComponent(contactInfo.address);
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        mapLinkEl.innerHTML = `<a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--primary-color); text-decoration: none; font-weight: 500;">Open in Google Maps</a>`;
    }
}

// Slideshow Functions
let currentSlideIndex = 0;
let slideshowInterval = null;

function displaySlideshow() {
    const images = getSlideshowImages();
    const enabledImages = images.filter(img => img.enabled).sort((a, b) => a.order - b.order);
    const wrapper = document.getElementById('slideshow-wrapper');
    const dotsContainer = document.getElementById('slideshow-dots');

    if (!wrapper || !dotsContainer) return;

    if (enabledImages.length === 0) {
        wrapper.innerHTML = '<div class="slide" style="background: linear-gradient(135deg, var(--primary-color), var(--primary-dark)); display: flex; align-items: center; justify-content: center;"><div class="slide-content"><h2>Welcome to Wonder Electronics</h2><p>Discover amazing products</p><a href="products.html">Shop Now</a></div></div>';
        return;
    }

    // Create slides
    wrapper.innerHTML = enabledImages.map((image, index) => {
        const showCard = image.showCard !== false; // Default to true if not set
        return `
        <div class="slide">
            <img src="${image.imageUrl}" alt="${image.title || 'Slide'}" onerror="this.style.display='none'; this.parentElement.style.backgroundImage='url(\\'${image.imageUrl}\\')'; this.parentElement.style.backgroundSize='cover';">
            ${showCard ? `
            <div class="slide-content">
                ${image.title ? `<h2>${image.title}</h2>` : ''}
                ${image.subtitle ? `<p>${image.subtitle}</p>` : ''}
                ${image.link ? `<a href="${image.link}">Shop Now</a>` : ''}
            </div>
            ` : ''}
        </div>
        `;
    }).join('');

    // Create dots
    dotsContainer.innerHTML = enabledImages.map((_, index) => `
        <span class="dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></span>
    `).join('');

    // Reset slideshow
    currentSlideIndex = 0;
    updateSlidePosition();
    startSlideshow();
}

function changeSlide(direction) {
    const images = getSlideshowImages();
    const enabledImages = images.filter(img => img.enabled).sort((a, b) => a.order - b.order);

    if (enabledImages.length === 0) return;

    currentSlideIndex += direction;

    if (currentSlideIndex < 0) {
        currentSlideIndex = enabledImages.length - 1;
    } else if (currentSlideIndex >= enabledImages.length) {
        currentSlideIndex = 0;
    }

    updateSlidePosition();
    resetSlideshow();
}

function goToSlide(index) {
    currentSlideIndex = index;
    updateSlidePosition();
    resetSlideshow();
}

function updateSlidePosition() {
    const wrapper = document.getElementById('slideshow-wrapper');
    const dots = document.querySelectorAll('.dot');

    if (wrapper) {
        wrapper.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    }

    dots.forEach((dot, index) => {
        if (index === currentSlideIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function startSlideshow() {
    clearInterval(slideshowInterval);
    slideshowInterval = setInterval(() => {
        changeSlide(1);
    }, 5000); // Change slide every 5 seconds
}

function resetSlideshow() {
    startSlideshow();
}

// Refresh slideshow when admin updates
window.addEventListener('storage', function (e) {
    if (e.key === 'slideshowImages') {
        displaySlideshow();
    }
    if (e.key === 'heroContent') {
        displayHeroSection();
    }
    if (e.key === 'categories') {
        displayCategories();
    }
    if (e.key === 'footerContent') {
        displayFooter();
    }
    if (e.key === 'paymentInfo') {
        displayPaymentInfo();
    }
    if (e.key === 'aboutContent') {
        displayAbout();
    }
});

// Display Hero Section
function displayHeroSection() {
    const heroContent = getHeroContent();
    const titleEl = document.getElementById('hero-title');
    const subtitleEl = document.getElementById('hero-subtitle');
    const buttonEl = document.getElementById('hero-button');

    if (titleEl) titleEl.textContent = heroContent.title || 'Welcome to Wonder Electronics';
    if (subtitleEl) subtitleEl.textContent = heroContent.subtitle || 'Discover the latest in consumer electronics';
    if (buttonEl) {
        buttonEl.textContent = heroContent.buttonText || 'Shop Now';
        buttonEl.href = heroContent.buttonLink || 'products.html';
    }
}

// Display footer
function displayFooter() {
    const footer = getFooterContent();

    const brandTitleEl = document.getElementById('footer-brand-title');
    const brandDescEl = document.getElementById('footer-brand-description');
    const contactEmailEl = document.getElementById('footer-contact-email');
    const contactPhoneEl = document.getElementById('footer-contact-phone');
    const copyrightEl = document.getElementById('footer-copyright');

    if (brandTitleEl) brandTitleEl.textContent = footer.brandTitle || 'Wonder Electronics';
    if (brandDescEl) brandDescEl.textContent = footer.brandDescription || 'Your trusted source for the latest consumer electronics';
    if (contactEmailEl) contactEmailEl.textContent = `Email: ${footer.contactEmail || 'wonderelectronics50@gmail.com'}`;
    if (contactPhoneEl) contactPhoneEl.textContent = `Phone: ${footer.contactPhone || '+250787070049'}`;
    if (copyrightEl) copyrightEl.textContent = footer.copyright || '© 2024 Wonder Electronics. All rights reserved.';
}

// Product Detail Modal Functions
function openProductDetail(productId) {
    const product = getProductById(productId);
    if (!product) {
        alert('Product not found!');
        return;
    }

    const modal = document.getElementById('product-detail-modal');
    const content = document.getElementById('product-detail-content');

    if (!modal || !content) return;

    // Get category name
    const categories = getCategories();
    const category = categories.find(c => c.slug === product.category);
    const categoryName = category ? category.name : product.category;

    // Determine stock status
    let stockStatus = '';
    let stockClass = '';
    if (product.stock > 10) {
        stockStatus = 'In Stock';
        stockClass = 'stock-in';
    } else if (product.stock > 0) {
        stockStatus = `Low Stock (${product.stock} remaining)`;
        stockClass = 'stock-low';
    } else {
        stockStatus = 'Out of Stock';
        stockClass = 'stock-out';
    }

    const discount = product.discount || 0;
    const originalPrice = product.price;
    const discountedPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;
    const displayPrice = discount > 0 ? discountedPrice : originalPrice;

    // Get additional images
    const additionalImages = product.additionalImages || [];
    const allImages = [product.image, ...additionalImages].filter(img => img);

    // Get available colors
    const colors = product.colors || [];

    content.innerHTML = `
        <div class="product-detail-container">
            <div class="product-detail-image-section">
                <div class="product-detail-image-container">
                    ${discount > 0 ? `<div class="product-detail-discount-badge">-${discount}% OFF</div>` : ''}
                    <img src="${allImages[0] || 'https://via.placeholder.com/500'}" alt="${product.name}" class="product-detail-image" id="product-detail-main-image" onerror="this.src='https://via.placeholder.com/500'">
                </div>
                ${allImages.length > 1 ? `
                <div class="product-detail-gallery">
                    ${allImages.map((img, idx) => `
                        <img src="${img}" alt="${product.name}" class="product-detail-gallery-thumb ${idx === 0 ? 'active' : ''}" onclick="changeProductDetailImage('${img}', this)" onerror="this.src='https://via.placeholder.com/100'">
                    `).join('')}
                </div>
                ` : ''}
            </div>
            <div class="product-detail-info">
                <h2 class="product-detail-name">${product.name}</h2>
                <div class="product-detail-meta">
                    <span class="product-detail-category">Category: ${categoryName}</span>
                    <span class="product-detail-stock ${stockClass}">${stockStatus}</span>
                </div>
                <div class="product-detail-price-section">
                    ${discount > 0 ? `<span class="product-detail-original-price">${formatPrice(originalPrice)}</span>` : ''}
                    <span class="${discount > 0 ? 'product-detail-price-discounted' : 'product-detail-price'}">${formatPrice(displayPrice)}</span>
                </div>
                ${colors.length > 0 ? `
                <div class="product-detail-colors-section">
                    <h3>Available Colors</h3>
                    <div class="product-color-selector" id="product-color-selector-${product.id}">
                        ${colors.map((color, idx) => `
                            <button class="color-option ${idx === 0 ? 'selected' : ''}" data-color="${color}" onclick="selectProductColor('${color}', this, 'product-color-selector-${product.id}')">${color}</button>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                <div class="product-detail-description">
                    <h3>Description</h3>
                    <p>${product.description || 'No description available.'}</p>
                </div>
                <div class="product-detail-actions">
                    <button class="btn btn-primary add-to-cart-large" onclick="handleAddToCartFromDetail(${product.id})" ${product.stock <= 0 ? 'disabled' : ''}>
                        ${product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <button class="btn btn-secondary" onclick="closeProductDetailModal()">Close</button>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

function closeProductDetailModal() {
    const modal = document.getElementById('product-detail-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function handleAddToCartFromDetail(productId) {
    // Get selected color
    const modal = document.getElementById('product-detail-modal');
    let selectedColor = null;
    if (modal) {
        const selectedColorBtn = modal.querySelector('.color-option.selected');
        if (selectedColorBtn) {
            selectedColor = selectedColorBtn.getAttribute('data-color');
        }
    }

    handleAddToCartWithColor(productId, selectedColor);
    closeProductDetailModal();
}

function handleAddToCartWithColor(productId, selectedColor) {
    const product = getProductById(productId);
    if (!product) {
        alert('Product not found!');
        return;
    }

    if (product.stock <= 0) {
        alert('This product is out of stock!');
        return;
    }

    if (addToCart(productId, 1, selectedColor)) {
        // Visual feedback
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Added!';
        btn.style.backgroundColor = '#10b981';

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
        }, 1000);
    }
}

function changeProductDetailImage(imageUrl, thumbElement) {
    const mainImage = document.getElementById('product-detail-main-image');
    if (mainImage) {
        mainImage.src = imageUrl;
    }

    // Update active state
    document.querySelectorAll('.product-detail-gallery-thumb').forEach(thumb => {
        thumb.classList.remove('active');
    });
    if (thumbElement) {
        thumbElement.classList.add('active');
    }
}

function selectProductColor(color, buttonElement, containerId) {
    // Update active state
    const container = document.getElementById(containerId);
    if (container) {
        container.querySelectorAll('.color-option').forEach(btn => {
            btn.classList.remove('selected');
        });
    }
    if (buttonElement) {
        buttonElement.classList.add('selected');
    }
}

// Chat Functions
function openChatModal() {
    const modal = document.getElementById('chat-modal');
    if (modal) {
        // Ensure guest ID is initialized before loading messages
        getClientIdentifier();
        modal.style.display = 'block';
        loadChatMessages();
        // Focus on input
        setTimeout(() => {
            const input = document.getElementById('chat-input');
            if (input) input.focus();
        }, 100);
    }
}

function closeChatModal() {
    const modal = document.getElementById('chat-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function getClientIdentifier() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        return currentUser.email;
    }

    // Use localStorage for guest ID to persist across sessions
    let guestId = localStorage.getItem('guestId');
    if (!guestId) {
        guestId = 'guest-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('guestId', guestId);
    }
    return guestId;
}

function loadChatMessages() {
    const messages = getChatMessages();
    const container = document.getElementById('chat-messages');
    if (!container) return;

    // Get user identifier (logged in user email or persistent guest ID)
    const userIdentifier = getClientIdentifier();

    // Get messages for this user (both client and admin messages)
    let userMessages = messages.filter(msg => {
        if (!msg.userIdentifier) return false;
        return msg.userIdentifier === userIdentifier;
    });

    // If no messages found, check for old sessionStorage-based guest IDs as fallback
    if (userMessages.length === 0) {
        const sessionGuestId = sessionStorage.getItem('guestId');
        if (sessionGuestId && sessionGuestId !== 'default') {
            const sessionMessages = messages.filter(msg => msg.userIdentifier === sessionGuestId);
            if (sessionMessages.length > 0) {
                // Migrate old messages to new identifier
                const messagesToMigrate = messages.filter(msg => msg.userIdentifier === sessionGuestId);
                messagesToMigrate.forEach(msg => {
                    msg.userIdentifier = userIdentifier;
                });
                saveChatMessages(messages);
                userMessages = messagesToMigrate;
            }
        }
    }

    // Sort messages by timestamp
    userMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (userMessages.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-light);">No messages yet. Start a conversation!</div>';
        return;
    }

    container.innerHTML = userMessages.map(msg => {
        const date = new Date(msg.timestamp);
        const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const isClient = msg.sender === 'client';

        return `
            <div class="chat-message ${isClient ? 'client' : 'admin'}">
                <div>${msg.text}</div>
                <div class="chat-message-time">${timeStr}</div>
            </div>
        `;
    }).join('');

    // Scroll to bottom
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    if (!input) return;

    const messageText = input.value.trim();
    if (!messageText) return;

    // Get user identifier (logged in user email or persistent guest ID)
    const userIdentifier = getClientIdentifier();

    // Get user name
    const currentUser = getCurrentUser();
    const userName = currentUser ? currentUser.name : 'Guest';

    // Add message
    addChatMessage({
        sender: 'client',
        text: messageText,
        userIdentifier: userIdentifier,
        userName: userName,
        read: false
    });

    // Clear input
    input.value = '';

    // Reload messages
    loadChatMessages();
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

// Display About Section
function displayAbout() {
    const aboutContent = getAboutContent();
    const container = document.getElementById('about-content');
    if (!container) return;

    container.innerHTML = `
        <div class="about-card">
            <div class="about-text-side">
                <h3>${aboutContent.title}</h3>
                <p>${aboutContent.text.split('\n').join('<br>')}</p>
            </div>
            <div class="about-image-side">
                <img src="${aboutContent.imageUrl}" alt="${aboutContent.title}" onerror="this.src='https://via.placeholder.com/600x400'">
            </div>
        </div>
    `;
}

// Display categories
function displayCategories() {
    const categories = getCategories();
    const gridContainer = document.getElementById('categories-grid');
    if (!gridContainer) return;

    const enabledCategories = categories.filter(item => item.enabled);

    if (enabledCategories.length === 0) {
        gridContainer.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: var(--text-light);">No categories available.</p>';
        return;
    }

    gridContainer.innerHTML = enabledCategories.map(category => `
        <div class="category-card" data-category="${category.slug}">
            <div class="category-icon">${category.icon}</div>
            <h3>${category.name}</h3>
        </div>
    `).join('');
}

// Display social media cards
function displaySocialMedia() {
    const socialMedia = getSocialMedia();
    const gridContainer = document.getElementById('social-media-grid');
    if (!gridContainer) return;

    const enabledMedia = socialMedia.filter(item => item.enabled);

    if (enabledMedia.length === 0) {
        gridContainer.innerHTML = '<p style="text-align: center; color: var(--text-light);">No social media links available.</p>';
        return;
    }

    gridContainer.innerHTML = enabledMedia.map(item => {
        const platformColors = {
            whatsapp: '#25D366',
            instagram: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
            facebook: '#1877F2',
            tiktok: 'linear-gradient(135deg, #000000 0%, #FE2C55 100%)',
            twitter: '#1DA1F2',
            youtube: '#FF0000',
            linkedin: '#0077B5',
            other: '#64748b'
        };

        const icons = {
            whatsapp: `
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
            `,
            instagram: `
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
            `,
            facebook: `
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="white">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
            `,
            tiktok: `
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19.321 5.32a4.32 4.32 0 0 1-.41-2.32h-3.434v14.89c0 2.29-1.86 4.14-4.14 4.14a4.15 4.15 0 0 1-4.14-4.14c0-2.29 1.86-4.14 4.14-4.14.74 0 1.43.2 2.02.54V9.89h-1.8v2.4c-.59-.41-1.25-.61-1.96-.61a5.75 5.75 0 0 0 0 11.51c3.17 0 5.74-2.58 5.74-5.75V7.21c1.14.79 2.48 1.22 3.85 1.22-.01-.37-.01-.76-.01-1.13z"/>
                </svg>
            `,
            twitter: `
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="white">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
            `,
            youtube: `
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="white">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z"/>
                </svg>
            `,
            linkedin: `
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="white">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
                    <circle cx="4" cy="4" r="2"/>
                </svg>
            `,
            other: `
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
            `
        };

        const bgColor = platformColors[item.platform] || platformColors.other;
        const icon = icons[item.platform] || icons.other;

        return `
            <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="social-media-card" style="background: ${bgColor};">
                <div class="social-media-icon">${icon}</div>
                <div class="social-media-name">${item.name}</div>
                <div class="social-media-username">${item.username}</div>
            </a>
        `;
    }).join('');
}

// Login/Signup Functions
function openLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.display = 'block';
        showLoginForm();
        // Reset forms
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        if (loginForm) loginForm.reset();
        if (signupForm) signupForm.reset();
    }
}

function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showLoginForm() {
    document.getElementById('login-form-container').style.display = 'block';
    document.getElementById('signup-form-container').style.display = 'none';
    document.getElementById('forgot-password-container').style.display = 'none';
}

function showSignupForm() {
    document.getElementById('login-form-container').style.display = 'none';
    document.getElementById('signup-form-container').style.display = 'block';
    document.getElementById('forgot-password-container').style.display = 'none';
}

function showForgotPassword() {
    document.getElementById('login-form-container').style.display = 'none';
    document.getElementById('signup-form-container').style.display = 'none';
    document.getElementById('forgot-password-container').style.display = 'block';
}

function setupLoginForms() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginModal = document.getElementById('login-modal');

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                alert('Please enter both email and password.');
                return;
            }

            const result = loginUser(email, password);

            if (result.success) {
                alert('Welcome back, ' + result.user.name + '!');
                closeLoginModal();
                updateUserInterface();
                loginForm.reset();
            } else {
                alert(result.message);
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const phone = document.getElementById('signup-phone').value.trim();
            const password = document.getElementById('signup-password').value;

            if (!name) {
                alert('Please enter your full name.');
                return;
            }

            if (!password || password.length < 6) {
                alert('Password must be at least 6 characters long.');
                return;
            }

            const result = registerUser({ name, email, phone, password });

            if (result.success) {
                alert('Account created successfully! Welcome, ' + result.user.name + '!');
                setCurrentUser(result.user);
                closeLoginModal();
                updateUserInterface();
                signupForm.reset();
            } else {
                alert(result.message);
            }
        });
    }

    // Close modal when clicking outside
    if (loginModal) {
        window.addEventListener('click', function (event) {
            if (event.target === loginModal) {
                closeLoginModal();
            }
        });
    }

    // Close modal with close button
    const closeBtn = document.querySelector('#login-modal .close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeLoginModal);
    }

    // Setup forgot password form
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = document.getElementById('reset-email').value.trim();

            if (!email) {
                alert('Please enter your email address.');
                return;
            }

            const result = submitPasswordResetRequest(email);

            if (result.success) {
                // Show success message
                const successDiv = document.getElementById('reset-request-success');
                const form = document.getElementById('forgot-password-form');
                if (successDiv) successDiv.style.display = 'block';
                if (form) form.style.display = 'none';
            } else {
                alert(result.message);
            }
        });
    }
}

function updateUserInterface() {
    const currentUser = getCurrentUser();
    const loginMenuItem = document.getElementById('login-menu-item');
    const userMenuItem = document.getElementById('user-menu-item');
    const userNameDisplay = document.getElementById('user-name-display');

    if (currentUser) {
        if (loginMenuItem) loginMenuItem.style.display = 'none';
        if (userMenuItem) userMenuItem.style.display = 'inline-block';
        if (userNameDisplay) userNameDisplay.textContent = currentUser.name;
    } else {
        if (loginMenuItem) loginMenuItem.style.display = 'inline-block';
        if (userMenuItem) userMenuItem.style.display = 'none';
    }
}

// Override logoutUser from app.js to update UI
window.logoutUser = function () {
    if (confirm('Are you sure you want to logout?')) {
        setCurrentUser(null);
        updateUserInterface();
        alert('You have been logged out successfully.');
    }
};

// Initialize page-specific functionality
document.addEventListener('DOMContentLoaded', function () {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Load logo on page load
    updateLogoOnAllPages();

    // Setup login/signup and user interface on all pages
    setupLoginForms();
    updateUserInterface();

    // Make sure updateUserInterface is called when navigating
    window.addEventListener('storage', function (e) {
        if (e.key === 'currentUser') {
            updateUserInterface();
        }
        // Listen for contact info updates
        if (e.key === 'contactInfo' || e.key === 'contactInfoUpdated') {
            displayContactInfo();
        }
        // Listen for logo updates
        if (e.key === 'logoUrl') {
            updateLogoOnAllPages();
        }
    });
    
    // Listen for custom contact info update event
    window.addEventListener('contactInfoUpdated', function() {
        displayContactInfo();
    });

    // Homepage
    if (currentPage === 'index.html' || currentPage === '') {
        displaySlideshow();
        displayHeroSection();
        displayFeaturedProducts();
        displayCategories();
        displayAbout();
        setupCategoryNavigation();
        displayContactInfo();
        displaySocialMedia();
        displayFooter();

        // Auto-search is already set up via oninput attribute
        // Enter key still works for "All Products" mode to redirect immediately
        const featuredSearchInput = document.getElementById('featured-search-input');
        if (featuredSearchInput) {
            featuredSearchInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    const searchScope = document.querySelector('input[name="search-scope"]:checked');
                    if (searchScope && searchScope.value === 'all') {
                        handleFeaturedSearch();
                    }
                }
            });
        }
    }

    // Products page
    if (currentPage === 'products.html') {
        // Populate category filter dropdown
        if (typeof populateCategoryDropdown === 'function') {
            populateCategoryDropdown('category-filter', true);
        }

        // Check for search parameter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('search');
        if (searchParam) {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = searchParam;
            }
        }

        displayAllProducts();
        displaySocialMedia();
        displayFooter();

        // Setup filters
        const categoryFilter = document.getElementById('category-filter');
        const sortFilter = document.getElementById('sort-filter');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', displayAllProducts);

            // Check for category in URL
            const category = urlParams.get('category');
            if (category) {
                categoryFilter.value = category;
                displayAllProducts();
            }
        }

        if (sortFilter) {
            sortFilter.addEventListener('change', displayAllProducts);
        }
    }

    // Cart page
    if (currentPage === 'cart.html') {
        displayCart();
        displaySocialMedia();
        displayFooter();
        setupPaymentForm();
    }

    // Setup product detail modal close on outside click
    const productDetailModal = document.getElementById('product-detail-modal');
    if (productDetailModal) {
        window.addEventListener('click', function (event) {
            if (event.target === productDetailModal) {
                closeProductDetailModal();
            }
        });
    }

    // Setup chat modal close on outside click
    const chatModal = document.getElementById('chat-modal');
    if (chatModal) {
        window.addEventListener('click', function (event) {
            if (event.target === chatModal) {
                closeChatModal();
            }
        });
    }
    
    // Setup history modal close on outside click
    const historyModal = document.getElementById('history-modal');
    if (historyModal) {
        window.addEventListener('click', function (event) {
            if (event.target === historyModal) {
                closeHistoryModal();
            }
        });
    }

    // Load chat messages when storage changes
    window.addEventListener('storage', function (e) {
        if (e.key === 'chatMessages') {
            const chatModalEl = document.getElementById('chat-modal');
            if (chatModalEl && chatModalEl.style.display !== 'none') {
                loadChatMessages();
            }
            // Check for new admin messages and show notification
            checkForNewAdminMessages();
        }
        if (e.key === 'clientNotifications') {
            checkForNewClientNotifications();
        }
    });
    
    // Listen for client notification updates
    window.addEventListener('clientNotificationsUpdated', function() {
        checkForNewClientNotifications();
    });
    
    // Check for new admin messages periodically
    let lastMessageCheck = Date.now();
    function checkForNewAdminMessages() {
        const messages = getChatMessages();
        const userIdentifier = getClientIdentifier();
        const userMessages = messages.filter(msg => msg.userIdentifier === userIdentifier);
        const latestMessage = userMessages.length > 0 
            ? userMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
            : null;
        
        if (latestMessage && latestMessage.sender === 'admin' && new Date(latestMessage.timestamp).getTime() > lastMessageCheck) {
            // Check if chat modal is open
            const chatModal = document.getElementById('chat-modal');
            if (!chatModal || chatModal.style.display === 'none') {
                // Show notification alert
                showClientNotificationAlert({
                    title: 'New Message',
                    message: latestMessage.text,
                    type: 'chat'
                });
            }
            lastMessageCheck = new Date(latestMessage.timestamp).getTime();
        }
    }
    
    function checkForNewClientNotifications() {
        const notifications = getClientNotifications();
        const unreadNotifications = notifications.filter(n => !n.read);
        
        unreadNotifications.forEach(notification => {
            if (notification.type === 'chat') {
                const chatModal = document.getElementById('chat-modal');
                if (!chatModal || chatModal.style.display === 'none') {
                    showClientNotificationAlert({
                        title: notification.title,
                        message: notification.message,
                        type: notification.type
                    });
                    markClientNotificationAsRead(notification.id);
                }
            }
        });
    }
    
    function showClientNotificationAlert(notification) {
        // Create notification element
        const notificationEl = document.createElement('div');
        notificationEl.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.75rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            max-width: 350px;
            animation: slideInRight 0.3s ease-out;
        `;
        notificationEl.innerHTML = `
            <div style="display: flex; align-items: start; gap: 1rem;">
                <div style="font-size: 1.5rem;">💬</div>
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem;">${notification.title}</h4>
                    <p style="margin: 0; font-size: 0.875rem; opacity: 0.9;">${notification.message.substring(0, 100)}${notification.message.length > 100 ? '...' : ''}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove(); openChatModal();" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0; line-height: 1;">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notificationEl);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notificationEl.parentElement) {
                notificationEl.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => notificationEl.remove(), 300);
            }
        }, 5000);
    }
    
    // Check for new messages every 5 seconds
    setInterval(checkForNewAdminMessages, 5000);
    
    // Initial check
    checkForNewAdminMessages();
    
    // Listen for new admin messages
    window.addEventListener('newAdminMessage', function(event) {
        const userIdentifier = getClientIdentifier();
        if (event.detail.userIdentifier === userIdentifier) {
            showClientNotificationAlert('New message from admin: ' + event.detail.message.text);
        }
    });
});

// History Modal Functions
function openHistoryModal() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Please log in to view your history.');
        return;
    }
    
    const modal = document.getElementById('history-modal');
    if (modal) {
        modal.style.display = 'block';
        switchHistoryTab('orders'); // Default to orders tab
    }
}

function closeHistoryModal() {
    const modal = document.getElementById('history-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function switchHistoryTab(tab) {
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.history-tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    if (tab === 'orders') {
        document.getElementById('history-tab-orders').classList.add('active');
        displayOrderHistory();
    } else if (tab === 'messages') {
        document.getElementById('history-tab-messages').classList.add('active');
        displayMessageHistory();
    }
}

function displayOrderHistory() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const orders = getOrders();
    const userOrders = orders.filter(order => order.customerEmail === currentUser.email)
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    const content = document.getElementById('history-content');
    if (!content) return;
    
    if (userOrders.length === 0) {
        content.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-light);">No orders found. Start shopping to see your order history here!</p>';
        return;
    }
    
    content.innerHTML = userOrders.map(order => {
        const orderDate = new Date(order.orderDate);
        const formattedDate = orderDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const statusColors = {
            'pending': '#f59e0b',
            'processing': '#3b82f6',
            'shipped': '#8b5cf6',
            'delivered': '#10b981',
            'cancelled': '#ef4444'
        };
        
        const statusColor = statusColors[order.status] || '#64748b';
        
        return `
            <div class="history-item" style="border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 1.5rem; margin-bottom: 1rem; background-color: var(--white);">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div>
                        <h3 style="margin: 0 0 0.5rem 0; color: var(--text-dark);">Order #${order.id}</h3>
                        <p style="margin: 0; color: var(--text-light); font-size: 0.9rem;">${formattedDate}</p>
                    </div>
                    <span style="background-color: ${statusColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.85rem; font-weight: 600; text-transform: capitalize;">
                        ${order.status}
                    </span>
                </div>
                <div style="margin-bottom: 1rem;">
                    <p style="margin: 0.5rem 0 1rem 0; color: var(--text-dark);"><strong>Items:</strong> ${order.items.length} item(s)</p>
                    
                    <!-- Product Details List -->
                    <div style="background-color: #f8fafc; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
                        ${order.items.map((item, index) => {
                            const itemTotal = (item.price || 0) * (item.quantity || 1);
                            const isLast = index === order.items.length - 1;
                            return `
                                <div style="display: flex; gap: 1rem; padding: 0.75rem 0; ${!isLast ? 'border-bottom: 1px solid var(--border-color);' : ''} align-items: start;">
                                    ${item.image ? `
                                    <img src="${item.image}" alt="${item.name || 'Product'}" 
                                         style="width: 60px; height: 60px; object-fit: cover; border-radius: 0.5rem; flex-shrink: 0;" 
                                         onerror="this.style.display='none';">
                                    ` : ''}
                                    <div style="flex: 1; min-width: 0;">
                                        <h4 style="margin: 0 0 0.25rem 0; color: var(--text-dark); font-size: 0.95rem; font-weight: 600;">${item.name || 'Product'}</h4>
                                        ${item.color ? `<p style="margin: 0.25rem 0; color: var(--text-light); font-size: 0.85rem;">Color: <span style="color: var(--primary-color); font-weight: 600;">${item.color}</span></p>` : ''}
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                                            <div>
                                                <p style="margin: 0; color: var(--text-light); font-size: 0.85rem;">Quantity: <strong>${item.quantity || 1}</strong></p>
                                                <p style="margin: 0.25rem 0 0 0; color: var(--text-light); font-size: 0.85rem;">Unit Price: <strong>${formatPrice(item.price || 0)}</strong></p>
                                            </div>
                                            <div style="text-align: right;">
                                                <p style="margin: 0; color: var(--primary-color); font-size: 1rem; font-weight: 700;">${formatPrice(itemTotal)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <p style="margin: 0.5rem 0; color: var(--text-dark);"><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
                    <p style="margin: 0.5rem 0; color: var(--text-dark);"><strong>Mobile:</strong> ${order.customerMobile}</p>
                    ${order.transactionId ? `<p style="margin: 0.5rem 0; color: var(--text-dark);"><strong>Transaction ID:</strong> ${order.transactionId}</p>` : ''}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                    <div>
                        ${order.subtotal !== order.total ? `
                            <div style="margin-bottom: 0.5rem;">
                                <p style="margin: 0; color: var(--text-light); font-size: 0.9rem;">Subtotal: <span style="color: var(--text-dark);">${formatPrice(order.subtotal)}</span></p>
                                ${order.tax > 0 ? `<p style="margin: 0.25rem 0; color: var(--text-light); font-size: 0.9rem;">Tax: <span style="color: var(--text-dark);">${formatPrice(order.tax)}</span></p>` : ''}
                            </div>
                        ` : ''}
                        <p style="margin: 0; color: var(--text-light); font-size: 0.9rem;">Total Amount</p>
                        <p style="margin: 0; font-size: 1.25rem; font-weight: 700; color: var(--primary-color);">${formatPrice(order.total)}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function displayMessageHistory() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const messages = getChatMessages();
    const userIdentifier = getClientIdentifier();
    
    // Get messages for this user (both sent and received)
    const userMessages = messages.filter(msg => 
        (msg.sender === 'client' && msg.userIdentifier === userIdentifier) ||
        (msg.sender === 'admin' && msg.userIdentifier === userIdentifier)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    const content = document.getElementById('history-content');
    if (!content) return;
    
    if (userMessages.length === 0) {
        content.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-light);">No messages found. Start a conversation with our support team!</p>';
        return;
    }
    
    content.innerHTML = userMessages.map(msg => {
        const msgDate = new Date(msg.timestamp);
        const formattedDate = msgDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const isAdmin = msg.sender === 'admin';
        const bgColor = isAdmin ? 'rgba(37, 99, 235, 0.1)' : 'rgba(100, 116, 139, 0.1)';
        const textAlign = isAdmin ? 'left' : 'right';
        const senderName = isAdmin ? 'Admin' : (msg.userName || 'You');
        
        return `
            <div style="margin-bottom: 1rem;">
                <div style="background-color: ${bgColor}; padding: 1rem; border-radius: 0.5rem; max-width: 70%; margin-${textAlign === 'left' ? 'right' : 'left'}: auto; margin-${textAlign}: 0;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                        <strong style="color: var(--text-dark);">${senderName}</strong>
                        <span style="color: var(--text-light); font-size: 0.85rem;">${formattedDate}</span>
                    </div>
                    <p style="margin: 0; color: var(--text-dark); white-space: pre-wrap;">${msg.text}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Use existing getClientIdentifier function for consistency

