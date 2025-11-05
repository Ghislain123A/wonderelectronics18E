// Main App JavaScript - Storage and Utilities

// Theme Management
function getTheme() {
    return localStorage.getItem('theme') || 'light';
}

function setTheme(theme) {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
}

function applyTheme(theme) {
    const body = document.body;
    if (theme === 'dark') {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
    }

    // Update active state of theme buttons in settings modal
    const lightBtn = document.getElementById('light-theme-btn');
    const darkBtn = document.getElementById('dark-theme-btn');

    if (lightBtn && darkBtn) {
        if (theme === 'dark') {
            lightBtn.classList.remove('active');
            darkBtn.classList.add('active');
        } else {
            lightBtn.classList.add('active');
            darkBtn.classList.remove('active');
        }
    }
}

function toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// Gradient Lines Management
function getGradientLinesEnabled() {
    const stored = localStorage.getItem('gradientLinesEnabled');
    // Default to true (enabled) if not set
    return stored === null ? true : stored === 'true';
}

function setGradientLinesEnabled(enabled) {
    localStorage.setItem('gradientLinesEnabled', enabled.toString());
    applyGradientLinesState(enabled);
}

function applyGradientLinesState(enabled) {
    const body = document.body;
    if (enabled) {
        body.classList.remove('gradient-lines-disabled');
    } else {
        body.classList.add('gradient-lines-disabled');
    }
}

function toggleGradientLines() {
    const checkbox = document.getElementById('gradient-lines-enabled');
    if (checkbox) {
        const enabled = checkbox.checked;
        setGradientLinesEnabled(enabled);
    }
}

// Settings Modal Functions
function openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.style.display = 'block';

        // Update gradient lines checkbox state
        const gradientCheckbox = document.getElementById('gradient-lines-enabled');
        if (gradientCheckbox) {
            gradientCheckbox.checked = getGradientLinesEnabled();
        }
    }
}

function closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// User Guide Modal Functions (Client)
function openUserGuideModal() {
    const modal = document.getElementById('user-guide-modal');
    if (modal) {
        modal.style.display = 'block';
        displayUserGuide();
    }
}

function closeUserGuideModal() {
    const modal = document.getElementById('user-guide-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function displayUserGuide() {
    const items = getUserGuideItems();
    const contentEl = document.getElementById('user-guide-content');

    if (!contentEl) return;

    if (items.length === 0) {
        contentEl.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-light);">No user guide content available yet.</p>';
        return;
    }

    contentEl.innerHTML = items.map((item, index) => `
        <div class="user-guide-item" style="margin-bottom: 2rem; padding: 1.5rem; border: 1px solid var(--border-color); border-radius: 0.75rem; background-color: var(--white);">
            <div style="display: flex; align-items: start; gap: 1rem; margin-bottom: 1rem;">
                <span style="font-size: 2rem; font-weight: 700; color: var(--primary-color); min-width: 40px;">${index + 1}</span>
                <h3 style="margin: 0; font-size: 1.5rem; color: var(--text-dark);">${item.title}</h3>
            </div>
            <p style="margin-bottom: 1rem; color: var(--text-light); line-height: 1.6;">${item.description}</p>
            ${item.imageUrl ? `
                <div style="margin-top: 1rem;">
                    <img src="${item.imageUrl}" alt="${item.title}" style="width: 100%; max-width: 800px; border-radius: 0.5rem; box-shadow: var(--shadow);" onerror="this.src='https://via.placeholder.com/800x400'">
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Rules and Policies Modal Functions (Client)
function openRulesPoliciesModal() {
    const modal = document.getElementById('rules-policies-modal');
    if (modal) {
        modal.style.display = 'block';
        displayRulesPolicies();
    }
}

function closeRulesPoliciesModal() {
    const modal = document.getElementById('rules-policies-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function displayRulesPolicies() {
    const items = getRulesPoliciesItems();
    const contentEl = document.getElementById('rules-policies-content');

    if (!contentEl) return;

    if (items.length === 0) {
        contentEl.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-light);">No rules and policies available yet.</p>';
        return;
    }

    contentEl.innerHTML = items.map((item, index) => `
        <div class="rules-policies-item" style="margin-bottom: 2rem; padding: 1.5rem; border: 1px solid var(--border-color); border-radius: 0.75rem; background-color: var(--white);">
            <div style="display: flex; align-items: start; gap: 1rem; margin-bottom: 1rem;">
                <span style="font-size: 2rem; font-weight: 700; color: var(--primary-color); min-width: 40px;">${index + 1}</span>
                <h3 style="margin: 0; font-size: 1.5rem; color: var(--text-dark);">${item.title}</h3>
            </div>
            <p style="margin-bottom: 1rem; color: var(--text-light); line-height: 1.6; white-space: pre-line;">${item.description}</p>
            ${item.imageUrl ? `
                <div style="margin-top: 1rem;">
                    <img src="${item.imageUrl}" alt="${item.title}" style="width: 100%; max-width: 800px; border-radius: 0.5rem; box-shadow: var(--shadow);" onerror="this.src='https://via.placeholder.com/800x400'">
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Initialize default products if storage is empty
function initializeDefaultProducts() {
    const existingProducts = getProducts();
    if (existingProducts.length === 0) {
        const defaultProducts = [
            {
                id: 1,
                name: 'iPhone 15 Pro',
                description: 'Latest iPhone with advanced A17 Pro chip and titanium design',
                price: 1298700,  // RWF (999 USD * 1300)
                image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500',
                category: 'smartphones',
                stock: 50
            },
            {
                id: 2,
                name: 'MacBook Pro 14"',
                description: 'Powerful laptop with M3 chip, perfect for professionals',
                price: 2598700,  // RWF (1999 USD * 1300)
                image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500',
                category: 'laptops',
                stock: 30
            },
            {
                id: 3,
                name: 'iPad Air',
                description: 'Versatile tablet with stunning display and powerful performance',
                price: 778700,  // RWF (599 USD * 1300)
                image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
                category: 'tablets',
                stock: 40
            },
            {
                id: 4,
                name: 'AirPods Pro',
                description: 'Premium wireless earbuds with active noise cancellation',
                price: 323700,  // RWF (249 USD * 1300)
                image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500',
                category: 'audio',
                stock: 100
            },
            {
                id: 5,
                name: 'Apple Watch Series 9',
                description: 'Advanced smartwatch with health monitoring features',
                price: 518700,  // RWF (399 USD * 1300)
                image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500',
                category: 'wearables',
                stock: 60
            },
            {
                id: 6,
                name: 'USB-C Hub',
                description: 'Multi-port USB-C hub with HDMI, USB 3.0, and SD card reader',
                price: 64987,  // RWF (49.99 USD * 1300)
                image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500',
                category: 'accessories',
                stock: 150
            }
        ];
        localStorage.setItem('products', JSON.stringify(defaultProducts));
    }
}

// Product Management Functions
function getProducts() {
    const products = localStorage.getItem('products');
    return products ? JSON.parse(products) : [];
}

function saveProducts(products) {
    try {
        const productsJson = JSON.stringify(products);
        
        // Check storage size (localStorage limit is typically 5-10MB)
        const sizeInBytes = new Blob([productsJson]).size;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        
        if (sizeInMB > 4) {
            console.warn('Products data size is large:', sizeInMB.toFixed(2), 'MB');
        }
        
        localStorage.setItem('products', productsJson);
    } catch (error) {
        if (error.name === 'QuotaExceededError' || error.code === 22) {
            throw new Error('Storage quota exceeded. Some images may be too large. Consider using image URLs instead.');
        }
        throw error;
    }
}

function getProductById(id) {
    const products = getProducts();
    return products.find(p => p.id === parseInt(id));
}

// Contact Info Management Functions
function getContactInfo() {
    const contactInfo = localStorage.getItem('contactInfo');
    if (contactInfo) {
        return JSON.parse(contactInfo);
    }
    // Return default contact info
    return {
        email: 'wonderelectronics50@gmail.com',
        phone: '+250787070049',
        address: 'KN 84 St, Kigali - Rwanda',
        hours: 'Mon - Fri: 9:00 AM - 6:00 PM\nSat: 10:00 AM - 4:00 PM'
    };
}

function saveContactInfo(contactInfo) {
    localStorage.setItem('contactInfo', JSON.stringify(contactInfo));
}

// Social Media Management Functions
function getSocialMedia() {
    const socialMedia = localStorage.getItem('socialMedia');
    if (socialMedia) {
        return JSON.parse(socialMedia);
    }
    // Return default social media
    return [
        {
            platform: 'whatsapp',
            name: 'WhatsApp',
            link: 'https://wa.me/250787070049',
            username: '+250 787 070 049',
            enabled: true
        },
        {
            platform: 'instagram',
            name: 'Instagram',
            link: 'https://www.instagram.com/wonder_electronics?igsh=dGYyZ2xxNG50MWQx',
            username: 'Wonder Electronics',
            enabled: true
        },
        {
            platform: 'facebook',
            name: 'Facebook',
            link: 'https://www.facebook.com/glainictmat',
            username: 'Wonder Electronics',
            enabled: true
        },
        {
            platform: 'tiktok',
            name: 'TikTok',
            link: 'https://tiktok.com/@abintwarighislain3',
            username: 'Wonder Electronics',
            enabled: true
        }
    ];
}

function saveSocialMedia(socialMedia) {
    localStorage.setItem('socialMedia', JSON.stringify(socialMedia));
}

// Sub-Admin Management Functions
function getSubAdmins() {
    const subAdmins = localStorage.getItem('subAdmins');
    if (subAdmins) {
        return JSON.parse(subAdmins);
    }
    return [];
}

function saveSubAdmins(subAdmins) {
    localStorage.setItem('subAdmins', JSON.stringify(subAdmins));
}

function addSubAdmin(email, password, permissions = []) {
    const subAdmins = getSubAdmins();
    // Check if email already exists
    if (subAdmins.find(admin => admin.email === email)) {
        return { success: false, message: 'Email already exists' };
    }

    const newAdmin = {
        id: Date.now(),
        email: email,
        password: password, // In production, this should be hashed
        createdAt: new Date().toISOString(),
        isActive: true,
        permissions: permissions || []
    };

    subAdmins.push(newAdmin);
    saveSubAdmins(subAdmins);
    return { success: true, message: 'Sub-admin added successfully' };
}

function updateSubAdmin(id, email, password, permissions = null) {
    const subAdmins = getSubAdmins();
    const index = subAdmins.findIndex(admin => admin.id === id);

    if (index === -1) {
        return { success: false, message: 'Sub-admin not found' };
    }

    // Check if email is already used by another admin
    const emailExists = subAdmins.find(admin => admin.email === email && admin.id !== id);
    if (emailExists) {
        return { success: false, message: 'Email already exists' };
    }

    subAdmins[index].email = email;
    if (password && password.trim() !== '') {
        subAdmins[index].password = password; // In production, this should be hashed
    }
    if (permissions !== null) {
        subAdmins[index].permissions = permissions;
    }
    saveSubAdmins(subAdmins);
    return { success: true, message: 'Sub-admin updated successfully' };
}

function deleteSubAdmin(id) {
    const subAdmins = getSubAdmins();
    const filtered = subAdmins.filter(admin => admin.id !== id);
    saveSubAdmins(filtered);
    return { success: true, message: 'Sub-admin deleted successfully' };
}

function toggleSubAdminStatus(id) {
    const subAdmins = getSubAdmins();
    const index = subAdmins.findIndex(admin => admin.id === id);

    if (index === -1) {
        return { success: false, message: 'Sub-admin not found' };
    }

    subAdmins[index].isActive = !subAdmins[index].isActive;
    saveSubAdmins(subAdmins);
    return { success: true, message: `Sub-admin ${subAdmins[index].isActive ? 'activated' : 'deactivated'} successfully` };
}

function authenticateSubAdmin(email, password) {
    const subAdmins = getSubAdmins();
    const admin = subAdmins.find(admin => admin.email === email && admin.isActive);

    if (!admin) {
        return { success: false, message: 'Invalid credentials' };
    }

    if (admin.password === password) {
        return { success: true, admin: admin };
    }

    return { success: false, message: 'Invalid credentials' };
}

// Get available permissions list
function getAvailablePermissions() {
    return [
        { id: 'manage-products', name: 'Manage Products', description: 'Add, edit, and delete products' },
        { id: 'manage-orders', name: 'Manage Orders', description: 'View and update order status' },
        { id: 'view-analytics', name: 'View Analytics', description: 'View product analytics' },
        { id: 'manage-categories', name: 'Manage Categories', description: 'Add, edit, and delete categories' },
        { id: 'manage-hero', name: 'Manage Hero Section', description: 'Edit hero section content' },
        { id: 'manage-featured', name: 'Manage Featured Products', description: 'Set featured products' },
        { id: 'manage-footer', name: 'Manage Footer', description: 'Edit footer content' },
        { id: 'manage-about', name: 'Manage About Us', description: 'Edit about us section' },
        { id: 'manage-contact', name: 'Manage Contact Info', description: 'Edit contact information' },
        { id: 'manage-social', name: 'Manage Social Media', description: 'Edit social media links' },
        { id: 'manage-slideshow', name: 'Manage Slideshow', description: 'Edit slideshow images' },
        { id: 'manage-currency', name: 'Manage Currency Rates', description: 'Update currency conversion rates' },
        { id: 'manage-user-guide', name: 'Manage User Guide', description: 'Edit user guide content' },
        { id: 'manage-rules', name: 'Manage Rules & Policies', description: 'Edit rules and policies' },
        { id: 'manage-tax', name: 'Manage Tax Settings', description: 'Configure tax settings' },
        { id: 'manage-payment', name: 'Manage Payment Info', description: 'Edit payment information' },
        { id: 'manage-chat', name: 'Manage Chat Messages', description: 'Respond to customer chat messages' },
        { id: 'manage-users', name: 'Manage Users', description: 'View and manage user accounts' },
        { id: 'manage-logo', name: 'Manage Logo', description: 'Upload and update the site logo' }
    ];
}

// Check if current admin has permission
function hasPermission(permissionId) {
    const adminType = sessionStorage.getItem('adminType');

    // Main admin has all permissions
    if (adminType === 'main') {
        return true;
    }

    // Check sub-admin permissions
    if (adminType === 'sub') {
        const currentAdminStr = sessionStorage.getItem('currentAdmin');
        if (!currentAdminStr) return false;

        try {
            const currentAdmin = JSON.parse(currentAdminStr);
            // If permissions array doesn't exist or is empty, deny access
            if (!currentAdmin.permissions || !Array.isArray(currentAdmin.permissions)) {
                return false;
            }
            // Check if permission is in the list
            return currentAdmin.permissions.includes(permissionId);
        } catch (e) {
            return false;
        }
    }

    return false;
}

// Categories Management Functions
function getCategories() {
    const categories = localStorage.getItem('categories');
    if (categories) {
        return JSON.parse(categories);
    }
    // Return default categories
    return [
        { id: 1, name: 'Smartphones', slug: 'smartphones', icon: '📱', enabled: true },
        { id: 2, name: 'Laptops', slug: 'laptops', icon: '💻', enabled: true },
        { id: 3, name: 'Tablets', slug: 'tablets', icon: '📱', enabled: true },
        { id: 4, name: 'Audio Devices', slug: 'audio', icon: '🎧', enabled: true },
        { id: 5, name: 'Wearables', slug: 'wearables', icon: '⌚', enabled: true },
        { id: 6, name: 'Accessories', slug: 'accessories', icon: '🔌', enabled: true }
    ];
}

function saveCategories(categories) {
    localStorage.setItem('categories', JSON.stringify(categories));
}

// Footer Management Functions
function getFooterContent() {
    const footer = localStorage.getItem('footerContent');
    if (footer) {
        return JSON.parse(footer);
    }
    // Return default footer content
    return {
        brandTitle: 'Wonder Electronics',
        brandDescription: 'Your trusted source for the latest consumer electronics',
        contactEmail: 'wonderelectronics50@gmail.com',
        contactPhone: '+250787070049',
        copyright: '© 2024 Wonder Electronics. All rights reserved.'
    };
}

function saveFooterContent(footerContent) {
    localStorage.setItem('footerContent', JSON.stringify(footerContent));
}

// Payment Info Management Functions
function getPaymentInfo() {
    const paymentInfo = localStorage.getItem('paymentInfo');
    if (paymentInfo) {
        return JSON.parse(paymentInfo);
    }
    // Return default payment info
    return {
        paymentNumber: '+250787070049',
        instructions: 'Please send your payment to this number and fill in your details below.'
    };
}

function savePaymentInfo(paymentInfo) {
    localStorage.setItem('paymentInfo', JSON.stringify(paymentInfo));
}

// User Guide Management Functions
function getUserGuideItems() {
    const items = localStorage.getItem('userGuideItems');
    return items ? JSON.parse(items) : [];
}

function saveUserGuideItems(items) {
    localStorage.setItem('userGuideItems', JSON.stringify(items));
}

// Rules and Policies Management Functions
function getRulesPoliciesItems() {
    const items = localStorage.getItem('rulesPoliciesItems');
    return items ? JSON.parse(items) : [];
}

function saveRulesPoliciesItems(items) {
    localStorage.setItem('rulesPoliciesItems', JSON.stringify(items));
}

// About Us Management Functions
function getAboutContent() {
    const about = localStorage.getItem('aboutContent');
    if (about) {
        return JSON.parse(about);
    }
    // Return default about content
    return {
        title: 'About Wonder Electronics',
        text: 'Welcome to Wonder Electronics, your trusted destination for the latest and greatest in consumer electronics. We are committed to providing high-quality products, exceptional customer service, and competitive prices. Our mission is to make cutting-edge technology accessible to everyone.',
        imageUrl: 'https://via.placeholder.com/600x400'
    };
}

function saveAboutContent(aboutContent) {
    localStorage.setItem('aboutContent', JSON.stringify(aboutContent));
}

// Chat/Messages Management Functions
function getChatMessages() {
    const messages = localStorage.getItem('chatMessages');
    return messages ? JSON.parse(messages) : [];
}

function saveChatMessages(messages) {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
}

function addChatMessage(message) {
    const messages = getChatMessages();
    const newMessage = {
        id: Date.now(),
        ...message,
        timestamp: new Date().toISOString()
    };
    messages.push(newMessage);
    saveChatMessages(messages);

    // Create notification for admin if message is from client
    if (message.sender === 'client') {
        createAdminNotification({
            type: 'chat',
            title: 'New Chat Message',
            message: `New message from ${message.userName || 'Guest'}: ${message.text.substring(0, 50)}${message.text.length > 50 ? '...' : ''}`,
            data: { userIdentifier: message.userIdentifier, messageId: newMessage.id }
        });
    }
    // Create notification for client if message is from admin
    else if (message.sender === 'admin') {
        // Create notification for the specific user
        createClientNotification({
            type: 'chat',
            title: 'New Message from Admin',
            message: `You have a new message: ${message.text.substring(0, 50)}${message.text.length > 50 ? '...' : ''}`,
            data: { messageId: newMessage.id, userIdentifier: message.userIdentifier }
        });

        // Trigger notification event for real-time updates
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('newAdminMessage', {
                detail: { message: newMessage, userIdentifier: message.userIdentifier }
            }));
        }
    }

    return newMessage;
}

// Slideshow Management Functions
function getSlideshowImages() {
    const images = localStorage.getItem('slideshowImages');
    if (images) {
        return JSON.parse(images);
    }
    // Return default marketing images
    return [
        {
            id: 1,
            imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1200',
            title: 'Latest Technology',
            subtitle: 'Discover the future of electronics',
            link: 'products.html',
            enabled: true,
            order: 1,
            showCard: true
        },
        {
            id: 2,
            imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200',
            title: 'Premium Quality',
            subtitle: 'Best devices for your lifestyle',
            link: 'products.html?category=smartphones',
            enabled: true,
            order: 2,
            showCard: true
        },
        {
            id: 3,
            imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200',
            title: 'Summer Sale',
            subtitle: 'Up to 30% off on selected items',
            link: 'products.html',
            enabled: true,
            order: 3,
            showCard: true
        }
    ];
}

function saveSlideshowImages(images) {
    localStorage.setItem('slideshowImages', JSON.stringify(images));
}

// Hero Section Management Functions
function getHeroContent() {
    const heroContent = localStorage.getItem('heroContent');
    if (heroContent) {
        return JSON.parse(heroContent);
    }
    // Return default hero content
    return {
        title: 'Welcome to Wonder Electronics',
        subtitle: 'Discover the latest in consumer electronics',
        buttonText: 'Shop Now',
        buttonLink: 'products.html'
    };
}

function saveHeroContent(heroContent) {
    localStorage.setItem('heroContent', JSON.stringify(heroContent));
}

// Featured Products Management Functions
function getFeaturedProducts() {
    const featured = localStorage.getItem('featuredProducts');
    if (featured) {
        return JSON.parse(featured);
    }
    // Return default: first 6 products by ID
    const products = getProducts();
    return products.slice(0, 6).map((p, index) => ({
        productId: p.id,
        order: index + 1
    }));
}

function saveFeaturedProducts(featuredProducts) {
    localStorage.setItem('featuredProducts', JSON.stringify(featuredProducts));
}

// User Management Functions
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getCurrentUser() {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('currentUser');
    }
}

function validateEmail(email) {
    // Comprehensive email validation regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
}

function registerUser(userData) {
    const users = getUsers();

    // Check if email already exists
    if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        return { success: false, message: 'Email already registered. Please use a different email.' };
    }

    // Validate email format
    if (!validateEmail(userData.email)) {
        return { success: false, message: 'Please enter a valid email address.' };
    }

    // Validate password
    if (!userData.password || userData.password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    // Create new user
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name: userData.name,
        email: userData.email.toLowerCase(),
        phone: userData.phone || '',
        password: userData.password, // Store password (in real app, hash it)
        createdAt: new Date().toISOString(),
        orders: []
    };

    users.push(newUser);
    saveUsers(users);

    return { success: true, user: newUser };
}

function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        return { success: false, message: 'No account found with this email. Please sign up first.' };
    }

    // Verify password
    if (!password || user.password !== password) {
        return { success: false, message: 'Incorrect password. Please try again.' };
    }

    setCurrentUser(user);
    return { success: true, user: user };
}

function resetUserPassword(userId, newPassword) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
        return { success: false, message: 'User not found.' };
    }

    if (!newPassword || newPassword.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    user.password = newPassword;
    saveUsers(users);

    // Remove the password reset request if it exists
    removePasswordResetRequest(user.email);

    return { success: true, message: 'Password reset successfully.' };
}

// Password Reset Request Management
function getPasswordResetRequests() {
    const requests = localStorage.getItem('passwordResetRequests');
    return requests ? JSON.parse(requests) : [];
}

function savePasswordResetRequests(requests) {
    localStorage.setItem('passwordResetRequests', JSON.stringify(requests));
}

function submitPasswordResetRequest(email) {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        return { success: false, message: 'No account found with this email address.' };
    }

    // Validate email format
    if (!validateEmail(email)) {
        return { success: false, message: 'Please enter a valid email address.' };
    }

    const requests = getPasswordResetRequests();

    // Check if request already exists
    const existingRequest = requests.find(r => r.email.toLowerCase() === email.toLowerCase() && !r.resolved);

    if (existingRequest) {
        return { success: false, message: 'A password reset request for this email is already pending.' };
    }

    // Create new request
    const newRequest = {
        id: requests.length > 0 ? Math.max(...requests.map(r => r.id)) + 1 : 1,
        email: email.toLowerCase(),
        userName: user.name,
        userId: user.id,
        requestedAt: new Date().toISOString(),
        resolved: false
    };

    requests.push(newRequest);
    savePasswordResetRequests(requests);

    return { success: true, message: 'Password reset request submitted successfully.' };
}

function removePasswordResetRequest(email) {
    const requests = getPasswordResetRequests();
    const filteredRequests = requests.filter(r => r.email.toLowerCase() !== email.toLowerCase() || r.resolved);
    savePasswordResetRequests(filteredRequests);
}

function markPasswordResetRequestResolved(requestId) {
    const requests = getPasswordResetRequests();
    const request = requests.find(r => r.id === requestId);

    if (request) {
        request.resolved = true;
        request.resolvedAt = new Date().toISOString();
        savePasswordResetRequests(requests);
    }
}

function logoutUser() {
    setCurrentUser(null);
    // This will be overridden by client.js to update UI
}

// Cart Management Functions
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId, quantity = 1, selectedColor = null) {
    const cart = getCart();
    const product = getProductById(productId);

    if (!product) return false;

    // Calculate price with discount
    const discount = product.discount || 0;
    const finalPrice = discount > 0 ? product.price * (1 - discount / 100) : product.price;

    // Create a unique cart item key based on product ID and color
    const itemKey = `${productId}_${selectedColor || 'default'}`;

    const existingItem = cart.find(item => {
        const existingKey = `${item.id}_${item.color || 'default'}`;
        return existingKey === itemKey;
    });

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: finalPrice,
            image: product.image,
            quantity: quantity,
            color: selectedColor
        });
    }

    saveCart(cart);
    updateCartCount();
    return true;
}

function removeFromCart(productId, selectedColor = null) {
    const cart = getCart();
    const itemKey = `${productId}_${selectedColor || 'default'}`;
    const filteredCart = cart.filter(item => {
        const existingKey = `${item.id}_${item.color || 'default'}`;
        return existingKey !== itemKey;
    });
    saveCart(filteredCart);
    updateCartCount();
}

function updateCartQuantity(productId, quantity, selectedColor = null) {
    const cart = getCart();
    const itemKey = `${productId}_${selectedColor || 'default'}`;
    const item = cart.find(item => {
        const existingKey = `${item.id}_${item.color || 'default'}`;
        return existingKey === itemKey;
    });

    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId, selectedColor);
        } else {
            item.quantity = quantity;
            saveCart(cart);
        }
    }
    updateCartCount();
}

function clearCart() {
    localStorage.removeItem('cart');
    updateCartCount();
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(el => {
        if (el) el.textContent = count;
    });
    // Update mobile cart badge
    const mobileCartCount = document.getElementById('mobile-cart-count');
    if (mobileCartCount) {
        mobileCartCount.textContent = count;
        // Hide badge if cart is empty
        if (count === 0) {
            mobileCartCount.style.display = 'none';
        } else {
            mobileCartCount.style.display = 'flex';
        }
    }
}

// Order Management Functions
function getOrders() {
    const orders = localStorage.getItem('orders');
    return orders ? JSON.parse(orders) : [];
}

function saveOrders(orders) {
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Notification Management Functions
function getAdminNotifications() {
    const notifications = localStorage.getItem('adminNotifications');
    return notifications ? JSON.parse(notifications) : [];
}

function saveAdminNotifications(notifications) {
    localStorage.setItem('adminNotifications', JSON.stringify(notifications));
}

function createAdminNotification(notification) {
    const notifications = getAdminNotifications();
    const newNotification = {
        id: Date.now(),
        ...notification,
        read: false,
        createdAt: new Date().toISOString()
    };
    notifications.push(newNotification);
    saveAdminNotifications(notifications);

    // Trigger storage event for other tabs/windows
    window.dispatchEvent(new Event('adminNotificationsUpdated'));

    return newNotification;
}

function markAdminNotificationAsRead(notificationId) {
    const notifications = getAdminNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        saveAdminNotifications(notifications);
        window.dispatchEvent(new Event('adminNotificationsUpdated'));
    }
}

function getClientNotifications() {
    const notifications = localStorage.getItem('clientNotifications');
    return notifications ? JSON.parse(notifications) : [];
}

function saveClientNotifications(notifications) {
    localStorage.setItem('clientNotifications', JSON.stringify(notifications));
}

function createClientNotification(notification) {
    const notifications = getClientNotifications();
    const newNotification = {
        id: Date.now(),
        ...notification,
        read: false,
        createdAt: new Date().toISOString()
    };
    notifications.push(newNotification);
    saveClientNotifications(notifications);

    // Trigger storage event for other tabs/windows
    window.dispatchEvent(new Event('clientNotificationsUpdated'));

    return newNotification;
}

function markClientNotificationAsRead(notificationId) {
    const notifications = getClientNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        saveClientNotifications(notifications);
        window.dispatchEvent(new Event('clientNotificationsUpdated'));
    }
}

// Category Dropdown Population Helper Function
function populateCategoryDropdown(selectId, includeAll = false) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const categories = getCategories();

    // Clear existing options except the first one if it's "All Categories"
    if (includeAll && select.options.length > 0 && select.options[0].value === 'all') {
        select.innerHTML = '<option value="all">All Categories</option>';
    } else {
        select.innerHTML = includeAll ? '<option value="all">All Categories</option>' : '<option value="">Select Category</option>';
    }

    // Populate with enabled categories
    categories.filter(cat => cat.enabled).forEach(category => {
        const option = document.createElement('option');
        option.value = category.slug;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

// Currency Management
// RWF is the base currency - prices are stored in RWF
// Currency Rates Management Functions
function getCurrencyRates() {
    const rates = localStorage.getItem('currencyRates');
    if (rates) {
        return JSON.parse(rates);
    }
    // Return default rates (RWF as base currency)
    return {
        RWF: 1,
        USD: 1 / 1300,
        EUR: 0.92 / 1300,
        GBP: 0.79 / 1300
    };
}

function saveCurrencyRates(rates) {
    localStorage.setItem('currencyRates', JSON.stringify(rates));
}

// Tax Management Functions
function getTaxSettings() {
    const settings = localStorage.getItem('taxSettings');
    if (settings) {
        return JSON.parse(settings);
    }
    // Return default settings
    return {
        enabled: false,
        rate: 0
    };
}

function saveTaxSettings(settings) {
    localStorage.setItem('taxSettings', JSON.stringify(settings));
}

const CURRENCY_SYMBOLS = {
    'RWF': 'RWF',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
};

function getCurrency() {
    const currency = localStorage.getItem('currency');
    return currency || 'RWF'; // Default to RWF
}

function setCurrency(currency) {
    localStorage.setItem('currency', currency);
    updateCurrencyDisplay();
}

function convertPrice(priceRWF, currency) {
    const rates = getCurrencyRates();
    const rate = rates[currency] || 1;
    return priceRWF * rate;
}

function formatPrice(priceRWF, currency = null) {
    const selectedCurrency = currency || getCurrency();
    const convertedPrice = convertPrice(priceRWF, selectedCurrency);
    const symbol = CURRENCY_SYMBOLS[selectedCurrency];

    if (selectedCurrency === 'RWF') {
        // RWF typically doesn't use decimals
        return `RWF ${Math.round(convertedPrice).toLocaleString()}`;
    } else {
        return `${symbol}${convertedPrice.toFixed(2)}`;
    }
}

function updateCurrencyDisplay() {
    const currencySelector = document.getElementById('currency-selector');
    const mobileCurrencySelector = document.getElementById('mobile-currency-selector');
    const currentCurrency = getCurrency();

    if (currencySelector) {
        currencySelector.value = currentCurrency;
    }

    if (mobileCurrencySelector) {
        mobileCurrencySelector.value = currentCurrency;
    }

    // Trigger page refresh if functions are available
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Homepage - featured products
    if (currentPage === 'index.html' || currentPage === '') {
        if (typeof displayFeaturedProducts === 'function') {
            displayFeaturedProducts();
        }
    }

    // Products page
    if (currentPage === 'products.html') {
        if (typeof displayAllProducts === 'function') {
            displayAllProducts();
        }
    }

    // Cart page
    if (currentPage === 'cart.html') {
        if (typeof displayCart === 'function') {
            displayCart();
        }
    }

    // Admin pages
    if (currentPage === 'admin.html') {
        if (typeof updateDashboardStats === 'function') {
            updateDashboardStats();
        }
    }

    if (currentPage === 'admin-products.html') {
        if (typeof displayAdminProducts === 'function') {
            displayAdminProducts();
        }
    }
}

// Handle smooth scroll to contact section
function scrollToContact() {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        // Calculate offset accounting for fixed navbar
        const navbar = document.querySelector('.navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : 80;
        const offsetTop = contactSection.offsetTop - navbarHeight;

        // Use scrollIntoView as fallback if scrollTo doesn't work
        try {
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        } catch (e) {
            // Fallback for older browsers
            contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Manual scroll adjustment
            setTimeout(function () {
                window.scrollBy(0, -navbarHeight);
            }, 100);
        }
    }
}

// Handle smooth scroll to about section
function scrollToAbout() {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        // Calculate offset accounting for fixed navbar
        const navbar = document.querySelector('.navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : 80;
        const offsetTop = aboutSection.offsetTop - navbarHeight;

        // Use scrollIntoView as fallback if scrollTo doesn't work
        try {
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        } catch (e) {
            // Fallback for older browsers
            aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Manual scroll adjustment
            setTimeout(function () {
                window.scrollBy(0, -navbarHeight);
            }, 100);
        }
    }
}

// Close mobile menu
function closeMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
    }
    if (hamburger && hamburger.classList.contains('active')) {
        hamburger.classList.remove('active');
    }
}

// Handle contact link clicks
function setupContactLinks() {
    // Use event delegation for better reliability
    document.addEventListener('click', function (e) {
        const link = e.target.closest('a[href*="contact"], a[href*="about"]');
        if (!link) return;

        const href = link.getAttribute('href');
        const currentPage = window.location.pathname.split('/').pop() || '';
        const isIndexPage = currentPage === 'index.html' || currentPage === '' || currentPage.includes('index.html');

        // Handle contact links
        if (href.includes('contact')) {
            // If it's a link to index.html#contact from another page, let browser navigate
            if (href.includes('index.html#contact')) {
                setTimeout(closeMobileMenu, 100);
                return;
            }

            // If we're on index.html and clicking #contact
            if (href === '#contact' && isIndexPage) {
                e.preventDefault();
                scrollToContact();
                window.history.pushState(null, null, '#contact');
                closeMobileMenu();
            }
        }

        // Handle about links
        if (href.includes('about')) {
            // If it's a link to index.html#about from another page, let browser navigate
            if (href.includes('index.html#about')) {
                setTimeout(closeMobileMenu, 100);
                return;
            }

            // If we're on index.html and clicking #about
            if (href === '#about' && isIndexPage) {
                e.preventDefault();
                scrollToAbout();
                window.history.pushState(null, null, '#about');
                closeMobileMenu();
            }
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    initializeDefaultProducts();
    updateCartCount();

    // Apply saved theme
    applyTheme(getTheme());

    // Apply gradient lines state
    applyGradientLinesState(getGradientLinesEnabled());

    // Setup currency selector
    const currencySelector = document.getElementById('currency-selector');
    if (currencySelector) {
        currencySelector.value = getCurrency();
        currencySelector.addEventListener('change', function () {
            setCurrency(this.value);
        });
    }

    // Setup mobile currency selector
    const mobileCurrencySelector = document.getElementById('mobile-currency-selector');
    if (mobileCurrencySelector) {
        mobileCurrencySelector.value = getCurrency();
        mobileCurrencySelector.addEventListener('change', function () {
            setCurrency(this.value);
            // Sync with main currency selector
            if (currencySelector) {
                currencySelector.value = this.value;
            }
        });
    }

    // Sync mobile selector when main selector changes
    if (currencySelector && mobileCurrencySelector) {
        currencySelector.addEventListener('change', function () {
            mobileCurrencySelector.value = this.value;
        });
    }

    // Setup contact links
    setupContactLinks();

    // Check if page was loaded with #contact or #about hash
    if (window.location.hash === '#contact') {
        // Wait for page to fully load, then scroll
        setTimeout(function () {
            scrollToContact();
        }, 300);
    }
    if (window.location.hash === '#about') {
        // Wait for page to fully load, then scroll
        setTimeout(function () {
            scrollToAbout();
        }, 300);
    }

    // Handle hash changes (for when navigating from other pages)
    window.addEventListener('hashchange', function () {
        if (window.location.hash === '#contact') {
            setTimeout(function () {
                scrollToContact();
            }, 100);
        }
        if (window.location.hash === '#about') {
            setTimeout(function () {
                scrollToAbout();
            }, 100);
        }
    });

    // Also check on load if hash is present after a delay
    window.addEventListener('load', function () {
        if (window.location.hash === '#contact') {
            setTimeout(function () {
                scrollToContact();
            }, 200);
        }
        if (window.location.hash === '#about') {
            setTimeout(function () {
                scrollToAbout();
            }, 200);
        }
    });

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Close mobile menu when clicking on any nav link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                // Close menu with a small delay to allow navigation
                setTimeout(function () {
                    closeMobileMenu();
                }, 100);
            });
        });

        // Close mobile menu when clicking on settings button
        const settingsMenuItem = navMenu.querySelector('.settings-menu-item button');
        if (settingsMenuItem) {
            settingsMenuItem.addEventListener('click', function () {
                setTimeout(function () {
                    closeMobileMenu();
                }, 300); // Slightly longer delay to allow modal to open
            });
        }

        // Close mobile menu when currency selector changes
        const mobileCurrencySelector = document.getElementById('mobile-currency-selector');
        if (mobileCurrencySelector) {
            mobileCurrencySelector.addEventListener('change', function () {
                setTimeout(function () {
                    closeMobileMenu();
                }, 200);
            });
        }
    }

    // Setup settings modal close on outside click
    window.addEventListener('click', function (e) {
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal && e.target === settingsModal) {
            closeSettingsModal();
        }

        const userGuideModal = document.getElementById('user-guide-modal');
        if (userGuideModal && e.target === userGuideModal) {
            closeUserGuideModal();
        }

        const rulesPoliciesModal = document.getElementById('rules-policies-modal');
        if (rulesPoliciesModal && e.target === rulesPoliciesModal) {
            closeRulesPoliciesModal();
        }
    });
});

// Logo Management Functions
function getLogoUrl() {
    const logoUrl = localStorage.getItem('logoUrl');
    return logoUrl || 'logo.png'; // Default to logo.png if not set
}

function saveLogoUrl(logoUrl) {
    localStorage.setItem('logoUrl', logoUrl);
    // Update logo on all pages immediately
    updateLogoOnAllPages();
}

function updateLogoOnAllPages() {
    const logoUrl = getLogoUrl();
    const logoImages = document.querySelectorAll('.nav-brand img, #site-logo');
    logoImages.forEach(img => {
        img.src = logoUrl;
        img.onerror = function() {
            this.style.display = 'none';
            this.parentElement.style.background = 'rgba(255,255,255,0.2)';
        };
        img.onload = function() {
            this.style.display = 'block';
            this.parentElement.style.background = 'transparent';
        };
    });
}

