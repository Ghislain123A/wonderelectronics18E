// Admin-side JavaScript - Product Management

// Display dashboard stats
function updateDashboardStats() {
    const products = getProducts();
    const orders = getOrders();
    
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalRevenueRWF = orders.reduce((sum, order) => sum + order.total, 0);  // Prices are in RWF
    
    const totalProductsEl = document.getElementById('total-products');
    const totalOrdersEl = document.getElementById('total-orders');
    const totalRevenueEl = document.getElementById('total-revenue');
    
    if (totalProductsEl) totalProductsEl.textContent = totalProducts;
    if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
    if (totalRevenueEl) totalRevenueEl.textContent = formatPrice(totalRevenueRWF);
    
    // Update notification count
    updateNotificationCount();
}

// Notification Management
function updateNotificationCount() {
    const requests = getPasswordResetRequests();
    const pendingRequests = requests.filter(r => !r.resolved);
    
    // Get admin notifications (chat and orders)
    const adminNotifications = getAdminNotifications();
    const unreadNotifications = adminNotifications.filter(n => !n.read);
    
    const totalCount = pendingRequests.length + unreadNotifications.length;
    const countEl = document.getElementById('notification-count');
    
    if (countEl) {
        countEl.textContent = totalCount;
        if (totalCount > 0) {
            countEl.style.display = 'inline-block';
        } else {
            countEl.style.display = 'none';
        }
    }
}

function showNotifications() {
    const panel = document.getElementById('notifications-panel');
    if (panel) {
        panel.style.display = 'block';
        displayNotifications();
    }
}

function hideNotifications() {
    const panel = document.getElementById('notifications-panel');
    if (panel) {
        panel.style.display = 'none';
    }
}

function displayNotifications() {
    const requests = getPasswordResetRequests();
    const pendingRequests = requests.filter(r => !r.resolved);
    const adminNotifications = getAdminNotifications();
    const unreadNotifications = adminNotifications.filter(n => !n.read).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const listContainer = document.getElementById('notifications-list');
    
    if (!listContainer) return;
    
    let notificationsHTML = '';
    
    // Display admin notifications (chat and orders)
    if (unreadNotifications.length > 0) {
        notificationsHTML += unreadNotifications.map(notification => {
            const createdDate = new Date(notification.createdAt);
            const formattedDate = createdDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const icon = notification.type === 'chat' ? '💬' : notification.type === 'order' ? '📦' : '🔔';
            const actionButton = notification.type === 'chat' 
                ? `<button class="btn btn-primary btn-small" onclick="markNotificationRead(${notification.id}); openChatAdminModal(); selectChatConversation('${notification.data.userIdentifier}');">View Chat</button>`
                : notification.type === 'order'
                ? `<button class="btn btn-primary btn-small" onclick="markNotificationRead(${notification.id}); window.location.href='admin-orders.html';">View Order</button>`
                : '';
            
            return `
                <div class="notification-item">
                    <div class="notification-content">
                        <div class="notification-icon">${icon}</div>
                        <div class="notification-details">
                            <h4>${notification.title}</h4>
                            <p>${notification.message}</p>
                            <small>${formattedDate}</small>
                        </div>
                    </div>
                    <div class="notification-actions">
                        ${actionButton}
                        <button class="btn btn-secondary btn-small" onclick="markNotificationRead(${notification.id})">Mark as Read</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Display password reset requests
    if (pendingRequests.length > 0) {
        notificationsHTML += pendingRequests.map(request => {
        const requestedDate = new Date(request.requestedAt);
        const formattedDate = requestedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="notification-item">
                <div class="notification-content">
                    <div class="notification-icon">🔑</div>
                    <div class="notification-details">
                        <h4>Password Reset Request</h4>
                        <p><strong>${request.userName}</strong> (${request.email})</p>
                        <small>Requested: ${formattedDate}</small>
                    </div>
                </div>
                <div class="notification-actions">
                    <button class="btn btn-primary btn-small" onclick="handlePasswordReset(${request.id}, ${request.userId})">Reset Password</button>
                    <button class="btn btn-secondary btn-small" onclick="dismissNotification(${request.id})">Dismiss</button>
                </div>
            </div>
        `;
    }).join('');
    }
    
    if (notificationsHTML === '') {
        listContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-light);">No new notifications.</p>';
        return;
    }
    
    listContainer.innerHTML = notificationsHTML;
}

function handlePasswordReset(requestId, userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        alert('User not found!');
        return;
    }
    
    // Generate a temporary password (8 characters)
    const tempPassword = generateTemporaryPassword();
    
    const result = resetUserPassword(userId, tempPassword);
    
    if (result.success) {
        markPasswordResetRequestResolved(requestId);
        updateNotificationCount();
        displayNotifications();
        alert(`Password reset successfully for ${user.name} (${user.email})\n\nNew Password: ${tempPassword}\n\nThis password has been sent to the user's email.`);
    } else {
        alert(result.message);
    }
}

function markNotificationRead(notificationId) {
    markAdminNotificationAsRead(notificationId);
    updateNotificationCount();
    displayNotifications();
}

function dismissNotification(requestId) {
    if (!confirm('Are you sure you want to dismiss this request?')) {
        return;
    }
    
    markPasswordResetRequestResolved(requestId);
    updateNotificationCount();
    displayNotifications();
}

function generateTemporaryPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Featured Products Management
function openFeaturedProductsModal() {
    const modal = document.getElementById('featured-products-modal');
    if (!modal) return;
    
    displayFeaturedProductsManagement();
    modal.style.display = 'block';
}

function closeFeaturedProductsModal() {
    const modal = document.getElementById('featured-products-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function displayFeaturedProductsManagement() {
    const allProducts = getProducts();
    const featuredList = getFeaturedProducts();
    const featuredProductIds = featuredList.map(f => f.productId);
    
    const availableContainer = document.getElementById('available-products-list');
    const featuredContainer = document.getElementById('featured-products-list');
    
    if (!availableContainer || !featuredContainer) return;
    
    // Display available products (not featured)
    const availableProducts = allProducts.filter(p => !featuredProductIds.includes(p.id));
    
    if (availableProducts.length === 0) {
        availableContainer.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">All products are featured</p>';
    } else {
        availableContainer.innerHTML = availableProducts.map(product => `
            <div class="featured-product-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; margin-bottom: 0.5rem; background-color: var(--bg-color); border-radius: 0.5rem;">
                <div style="flex: 1;">
                    <strong>${product.name}</strong>
                    <div style="font-size: 0.875rem; color: var(--text-light);">${formatPrice(product.price)}</div>
                </div>
                <button class="btn btn-primary btn-small" onclick="addToFeatured(${product.id})">Add</button>
            </div>
        `).join('');
    }
    
    // Display featured products with ordering controls
    const sortedFeatured = [...featuredList].sort((a, b) => a.order - b.order);
    
    if (sortedFeatured.length === 0) {
        featuredContainer.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">No featured products. Add some from the left!</p>';
    } else {
        featuredContainer.innerHTML = sortedFeatured.map((featuredItem, index) => {
            const product = allProducts.find(p => p.id === featuredItem.productId);
            if (!product) return '';
            
            return `
                <div class="featured-product-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; margin-bottom: 0.5rem; background-color: var(--bg-color); border-radius: 0.5rem; border-left: 4px solid var(--primary-color);">
                    <div style="flex: 1;">
                        <div style="font-size: 0.75rem; color: var(--primary-color); font-weight: 600; margin-bottom: 0.25rem;">Position: ${featuredItem.order}</div>
                        <strong>${product.name}</strong>
                        <div style="font-size: 0.875rem; color: var(--text-light);">${formatPrice(product.price)}</div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <select class="featured-position-select" data-id="${featuredItem.productId}" onchange="updateFeaturedPosition(${featuredItem.productId}, this.value)" style="padding: 0.25rem; font-size: 0.875rem; border: 1px solid var(--border-color); border-radius: 0.25rem;">
                            <option value="">Change Position</option>
                            <option value="top">Move to Top</option>
                            <option value="bottom">Move to Bottom</option>
                            <option value="middle">Move to Middle</option>
                        </select>
                        <input type="number" class="featured-order-input" data-id="${featuredItem.productId}" value="${featuredItem.order}" min="1" style="width: 60px; padding: 0.25rem; text-align: center; border: 1px solid var(--border-color); border-radius: 0.25rem;" onchange="updateFeaturedOrder(${featuredItem.productId}, parseInt(this.value))">
                        <button class="btn btn-danger btn-small" onclick="removeFromFeatured(${featuredItem.productId})">Remove</button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

function addToFeatured(productId) {
    const featuredList = getFeaturedProducts();
    const maxOrder = featuredList.length > 0 ? Math.max(...featuredList.map(f => f.order)) : 0;
    
    // Check if already featured
    if (featuredList.find(f => f.productId === productId)) {
        alert('This product is already featured!');
        return;
    }
    
    featuredList.push({
        productId: productId,
        order: maxOrder + 1
    });
    
    saveFeaturedProducts(featuredList);
    displayFeaturedProductsManagement();
}

function removeFromFeatured(productId) {
    if (!confirm('Remove this product from featured section?')) {
        return;
    }
    
    const featuredList = getFeaturedProducts();
    const filtered = featuredList.filter(f => f.productId !== productId);
    
    // Renumber orders
    filtered.forEach((item, index) => {
        item.order = index + 1;
    });
    
    saveFeaturedProducts(filtered);
    displayFeaturedProductsManagement();
}

function updateFeaturedOrder(productId, newOrder) {
    const featuredList = getFeaturedProducts();
    const item = featuredList.find(f => f.productId === productId);
    
    if (!item) return;
    
    const maxOrder = featuredList.length;
    newOrder = Math.max(1, Math.min(newOrder, maxOrder));
    
    // Temporarily set order to avoid conflicts
    item.order = newOrder;
    
    // Renumber all items
    featuredList.sort((a, b) => a.order - b.order);
    featuredList.forEach((item, index) => {
        item.order = index + 1;
    });
    
    saveFeaturedProducts(featuredList);
    displayFeaturedProductsManagement();
}

function updateFeaturedPosition(productId, position) {
    const featuredList = getFeaturedProducts();
    const item = featuredList.find(f => f.productId === productId);
    
    if (!item || !position) return;
    
    const maxOrder = featuredList.length;
    
    switch(position) {
        case 'top':
            item.order = 0.5; // Less than 1, will become 1
            break;
        case 'bottom':
            item.order = maxOrder + 1; // Will become maxOrder
            break;
        case 'middle':
            item.order = Math.ceil(maxOrder / 2);
            break;
    }
    
    // Sort and renumber
    featuredList.sort((a, b) => a.order - b.order);
    featuredList.forEach((item, index) => {
        item.order = index + 1;
    });
    
    saveFeaturedProducts(featuredList);
    displayFeaturedProductsManagement();
    
    // Reset select
    const select = document.querySelector(`.featured-position-select[data-id="${productId}"]`);
    if (select) select.value = '';
}

// Tax Settings Management
function openTaxSettingsModal() {
    const modal = document.getElementById('tax-settings-modal');
    if (!modal) return;
    
    const settings = getTaxSettings();
    
    document.getElementById('tax-enabled').checked = settings.enabled || false;
    document.getElementById('tax-rate').value = settings.rate || 0;
    
    updateTaxEnabledDisplay();
    modal.style.display = 'block';
}

function closeTaxSettingsModal() {
    const modal = document.getElementById('tax-settings-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function updateTaxEnabledDisplay() {
    const enabled = document.getElementById('tax-enabled').checked;
    const rateGroup = document.getElementById('tax-rate-group');
    
    if (rateGroup) {
        if (enabled) {
            rateGroup.style.opacity = '1';
            rateGroup.style.pointerEvents = 'auto';
        } else {
            rateGroup.style.opacity = '0.5';
            rateGroup.style.pointerEvents = 'none';
        }
    }
}

// Payment Info Management Functions
function openPaymentInfoModal() {
    const modal = document.getElementById('payment-info-modal');
    if (!modal) return;
    
    // Load current payment info
    const paymentInfo = getPaymentInfo();
    document.getElementById('payment-info-number').value = paymentInfo.paymentNumber;
    document.getElementById('payment-info-instructions').value = paymentInfo.instructions;
    
    modal.style.display = 'block';
}

function closePaymentInfoModal() {
    const modal = document.getElementById('payment-info-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function setupPaymentInfoForm() {
    const form = document.getElementById('payment-info-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const paymentInfo = {
            paymentNumber: document.getElementById('payment-info-number').value.trim(),
            instructions: document.getElementById('payment-info-instructions').value.trim()
        };
        
        savePaymentInfo(paymentInfo);
        closePaymentInfoModal();
        alert('Payment information updated successfully! Changes will be visible on the cart page.');
    });
}

// Chat Admin Functions
function openChatAdminModal() {
    const modal = document.getElementById('chat-admin-modal');
    if (!modal) return;
    
    modal.style.display = 'block';
    
    // Clear any existing open windows
    openChatWindows = {};
    const windowsContainer = document.getElementById('chat-windows-container');
    if (windowsContainer) {
        windowsContainer.innerHTML = '';
    }
    
    // Load conversations
    loadChatConversations();
}

function closeChatAdminModal() {
    const modal = document.getElementById('chat-admin-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

let openChatWindows = {}; // Track open chat windows

function loadChatConversations() {
    const messages = getChatMessages();
    const rowContainer = document.getElementById('chat-conversations-row');
    if (!rowContainer) return;
    
    // Group messages by userIdentifier
    const conversationsMap = {};
    
    messages.forEach(msg => {
        const identifier = msg.userIdentifier;
        if (!conversationsMap[identifier]) {
            conversationsMap[identifier] = {
                userIdentifier: identifier,
                userName: msg.userName || 'Guest',
                lastMessage: msg,
                unreadCount: 0
            };
        }
        
        // Update last message if this is newer
        if (new Date(msg.timestamp) > new Date(conversationsMap[identifier].lastMessage.timestamp)) {
            conversationsMap[identifier].lastMessage = msg;
        }
        
        // Count unread client messages
        if (msg.sender === 'client' && !msg.read) {
            conversationsMap[identifier].unreadCount++;
        }
    });
    
    const conversations = Object.values(conversationsMap).sort((a, b) => {
        return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
    });
    
    if (conversations.length === 0) {
        rowContainer.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-light); grid-column: 1 / -1;">No conversations yet</div>';
        return;
    }
    
    rowContainer.innerHTML = conversations.map(conv => {
        const date = new Date(conv.lastMessage.timestamp);
        const timeStr = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        const preview = conv.lastMessage.text.length > 40 
            ? conv.lastMessage.text.substring(0, 40) + '...' 
            : conv.lastMessage.text;
        const isClientMessage = conv.lastMessage.sender === 'client';
        const isOpen = openChatWindows[conv.userIdentifier] ? true : false;
        
        return `
            <div class="chat-conversation-card" onclick="openChatWindow('${conv.userIdentifier}')" id="conv-card-${conv.userIdentifier}" style="background-color: ${isOpen ? '#dbeafe' : 'white'}; border: 2px solid ${isOpen ? '#2563eb' : 'var(--border-color)'}; border-radius: 0.75rem; padding: 1rem; cursor: pointer; transition: all 0.2s; position: relative; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 1rem; color: var(--text-dark); margin-bottom: 0.25rem;">
                            ${conv.userName || 'Guest'}
                </div>
                        <div style="font-size: 0.75rem; color: var(--text-light);">
                            ${timeStr}
                        </div>
                    </div>
                    ${conv.unreadCount > 0 ? `<div style="background-color: var(--danger-color); color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; flex-shrink: 0;">${conv.unreadCount}</div>` : ''}
                </div>
                <div style="font-size: 0.875rem; color: var(--text-light); margin-top: 0.5rem; line-height: 1.4;">
                    <span style="color: ${isClientMessage ? '#2563eb' : '#64748b'}; font-weight: ${isClientMessage ? '500' : '400'};">
                        ${isClientMessage ? '👤' : '👨‍💼'} 
                    </span>
                    ${preview}
                </div>
            </div>
        `;
    }).join('');
}

function openChatWindow(userIdentifier) {
    // If already open, just focus it
    if (openChatWindows[userIdentifier]) {
        const chatWindow = document.getElementById(`chat-window-${userIdentifier}`);
        if (chatWindow) {
            chatWindow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            const input = chatWindow.querySelector('.chat-window-input');
            if (input) input.focus();
        }
        return;
    }
    
    // Mark as open
    openChatWindows[userIdentifier] = true;
    
    // Get messages for this user
    const messages = getChatMessages();
    const userMessages = messages.filter(msg => msg.userIdentifier === userIdentifier)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    const userInfo = userMessages.length > 0 ? userMessages[0] : { userName: 'Guest' };
    const windowsContainer = document.getElementById('chat-windows-container');
    if (!windowsContainer) return;
    
    // Create chat window
    const chatWindow = document.createElement('div');
    chatWindow.id = `chat-window-${userIdentifier}`;
    chatWindow.className = 'chat-window';
    chatWindow.style.cssText = `
        background-color: white;
        border: 2px solid var(--border-color);
        border-radius: 0.75rem;
        display: flex;
        flex-direction: column;
        height: 500px;
        min-height: 500px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        position: relative;
    `;
    
    // Mark client messages as read
    const unreadMessages = userMessages.filter(msg => msg.sender === 'client' && !msg.read);
    if (unreadMessages.length > 0) {
        const allMessages = getChatMessages();
        allMessages.forEach(msg => {
            if (msg.userIdentifier === userIdentifier && msg.sender === 'client' && !msg.read) {
                msg.read = true;
            }
        });
        saveChatMessages(allMessages);
        loadChatConversations(); // Update unread count
    }
    
    // Mark notifications as read
    const adminNotifications = getAdminNotifications();
    adminNotifications.forEach(notif => {
        if (notif.type === 'chat' && notif.data && notif.data.userIdentifier === userIdentifier) {
            markAdminNotificationAsRead(notif.id);
        }
    });
    updateNotificationCount();
    
    chatWindow.innerHTML = `
        <div style="background-color: #2563eb; color: white; padding: 1rem 1.25rem; border-radius: 0.75rem 0.75rem 0 0; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
            <div>
                <h3 style="margin: 0; font-size: 1rem; font-weight: 600;">💬 ${userInfo.userName || 'Guest'}</h3>
                <p style="margin: 0.25rem 0 0 0; font-size: 0.8rem; opacity: 0.9;">${userMessages.length} message${userMessages.length !== 1 ? 's' : ''}</p>
            </div>
            <button onclick="closeChatWindow('${userIdentifier}')" style="background: rgba(255,255,255,0.2); border: none; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'" title="Close Chat">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6L6 18"></path>
                    <path d="M6 6l12 12"></path>
                </svg>
            </button>
        </div>
        <div class="chat-window-messages" id="chat-window-messages-${userIdentifier}" style="flex: 1; overflow-y: auto; padding: 1.25rem; background-color: #f8fafc; display: flex; flex-direction: column; gap: 0.75rem; position: relative;">
            ${userMessages.length === 0 ? '<div style="text-align: center; padding: 2rem; color: var(--text-light);">No messages yet. Start the conversation!</div>' : userMessages.map(msg => {
                const date = new Date(msg.timestamp);
                const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const isAdmin = msg.sender === 'admin';
                
                return `
                    <div style="max-width: 80%; ${isAdmin ? 'align-self: flex-end; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white;' : 'align-self: flex-start; background-color: white; color: var(--text-dark); border: 1px solid var(--border-color);'} padding: 0.875rem 1rem; border-radius: 1rem; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                        <div style="margin-bottom: 0.4rem; word-wrap: break-word; line-height: 1.5; font-size: 0.9rem;">${msg.text}</div>
                        <div style="font-size: 0.65rem; opacity: 0.85;">${dateStr} ${timeStr}</div>
                    </div>
                `;
            }).join('')}
            <button onclick="scrollToTopOfWindow('${userIdentifier}')" class="chat-window-scroll-btn" id="scroll-btn-${userIdentifier}" style="position: absolute; bottom: 1rem; right: 1rem; background-color: #2563eb; color: white; border: none; border-radius: 50%; width: 42px; height: 42px; display: none; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4); z-index: 10; transition: all 0.3s; opacity: 0.9;" title="Scroll to top">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 15l-6-6-6 6"></path>
                </svg>
            </button>
        </div>
        <div style="padding: 1rem 1.25rem; background-color: white; border-top: 2px solid var(--border-color); display: flex; gap: 0.75rem; align-items: center; flex-shrink: 0; border-radius: 0 0 0.75rem 0.75rem;">
            <input type="text" class="chat-window-input" id="chat-input-${userIdentifier}" placeholder="Type your reply..." onkeypress="handleWindowChatKeyPress(event, '${userIdentifier}')" style="flex: 1; padding: 0.75rem 1rem; border: 2px solid var(--border-color); border-radius: 0.5rem; font-size: 0.95rem;">
            <button class="btn btn-primary" onclick="sendWindowReply('${userIdentifier}')" style="padding: 0.75rem 1.25rem; white-space: nowrap; font-weight: 600; font-size: 0.9rem;">Send</button>
        </div>
    `;
    
    windowsContainer.appendChild(chatWindow);
    
    // Setup scroll button
    setupWindowScrollButton(userIdentifier);
    
    // Scroll to bottom
    setTimeout(() => {
        const messagesDiv = chatWindow.querySelector('.chat-window-messages');
        if (messagesDiv) {
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
        const input = chatWindow.querySelector('.chat-window-input');
        if (input) input.focus();
    }, 100);
    
    // Update conversation card styling
    updateConversationCardStyle(userIdentifier, true);
}

function closeChatWindow(userIdentifier) {
    const chatWindow = document.getElementById(`chat-window-${userIdentifier}`);
    if (chatWindow) {
        chatWindow.remove();
    }
    delete openChatWindows[userIdentifier];
    updateConversationCardStyle(userIdentifier, false);
}

function updateConversationCardStyle(userIdentifier, isOpen) {
    const card = document.getElementById(`conv-card-${userIdentifier}`);
    if (card) {
        if (isOpen) {
            card.style.backgroundColor = '#dbeafe';
            card.style.borderColor = '#2563eb';
        } else {
            card.style.backgroundColor = 'white';
            card.style.borderColor = 'var(--border-color)';
        }
    }
}

function sendWindowReply(userIdentifier) {
    const input = document.getElementById(`chat-input-${userIdentifier}`);
    if (!input) return;
    
    const messageText = input.value.trim();
    if (!messageText) return;
    
    // Get user info from messages
    const messages = getChatMessages();
    const userMessages = messages.filter(msg => msg.userIdentifier === userIdentifier);
    const userInfo = userMessages.length > 0 ? userMessages[0] : { userName: 'Guest' };
    
    // Add admin reply
    addChatMessage({
        sender: 'admin',
        text: messageText,
        userIdentifier: userIdentifier,
        userName: userInfo.userName,
        read: true
    });
    
    // Clear input
    input.value = '';
    
    // Reload this window
    closeChatWindow(userIdentifier);
    setTimeout(() => {
        openChatWindow(userIdentifier);
    }, 100);
}

function handleWindowChatKeyPress(event, userIdentifier) {
    if (event.key === 'Enter') {
        sendWindowReply(userIdentifier);
    }
}

function scrollToTopOfWindow(userIdentifier) {
    const messagesDiv = document.getElementById(`chat-window-messages-${userIdentifier}`);
    if (messagesDiv) {
        messagesDiv.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

function setupWindowScrollButton(userIdentifier) {
    const messagesDiv = document.getElementById(`chat-window-messages-${userIdentifier}`);
    const scrollBtn = document.getElementById(`scroll-btn-${userIdentifier}`);
    
    if (!messagesDiv || !scrollBtn) return;
    
    function toggleButton() {
        if (messagesDiv.scrollTop > 300) {
            scrollBtn.style.display = 'flex';
        } else {
            scrollBtn.style.display = 'none';
        }
    }
    
    messagesDiv.addEventListener('scroll', toggleButton);
    setTimeout(toggleButton, 500);
}

function loadAdminChatMessages(userIdentifier) {
    const messages = getChatMessages();
    const container = document.getElementById('chat-admin-messages');
    if (!container) return;
    
    // Get messages for this user
    const userMessages = messages.filter(msg => msg.userIdentifier === userIdentifier)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Mark client messages as read when viewing
    const unreadMessages = userMessages.filter(msg => msg.sender === 'client' && !msg.read);
    if (unreadMessages.length > 0) {
        const allMessages = getChatMessages();
        allMessages.forEach(msg => {
            if (msg.userIdentifier === userIdentifier && msg.sender === 'client' && !msg.read) {
                msg.read = true;
            }
        });
        saveChatMessages(allMessages);
        loadChatConversations(); // Update unread count
    }
    
    // Update header with user info
    const userInfo = userMessages.length > 0 ? userMessages[0] : { userName: 'Guest' };
    const headerTitle = document.getElementById('chat-conversation-header-title');
    const headerInfo = document.getElementById('chat-conversation-header-info');
    
    if (headerTitle) {
        headerTitle.innerHTML = `💬 Conversation with ${userInfo.userName || 'Guest'}`;
    }
    if (headerInfo) {
        headerInfo.textContent = `${userMessages.length} message${userMessages.length !== 1 ? 's' : ''}`;
    }
    
    if (userMessages.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-light);">No messages yet. Start the conversation!</div>';
    } else {
    container.innerHTML = userMessages.map(msg => {
        const date = new Date(msg.timestamp);
        const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined });
        const isAdmin = msg.sender === 'admin';
            const isRead = msg.read !== false;
        
        return `
                <div class="chat-message ${isAdmin ? 'admin' : 'client'}" style="max-width: 75%; ${isAdmin ? 'align-self: flex-end; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white;' : 'align-self: flex-start; background-color: white; color: var(--text-dark); border: 1px solid var(--border-color);'} padding: 1rem 1.25rem; border-radius: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 0.5rem;">
                    <div style="margin-bottom: 0.5rem; word-wrap: break-word; line-height: 1.5; font-size: 0.95rem;">${msg.text}</div>
                    <div style="display: flex; align-items: center; justify-content: ${isAdmin ? 'flex-end' : 'flex-start'}; gap: 0.5rem; font-size: 0.7rem; opacity: 0.85;">
                        <span>${dateStr}</span>
                        <span>${timeStr}</span>
                        ${!isAdmin && !isRead ? '<span style="color: #2563eb;">●</span>' : ''}
                    </div>
            </div>
        `;
    }).join('');
        }
    
    // Reload conversations to update unread count
    loadChatConversations();
    
    // Setup scroll to top button
    setupScrollToTopButton(container);
    
    // Scroll to bottom after rendering
    setTimeout(() => {
        if (container) {
    container.scrollTop = container.scrollHeight;
            // Smooth scroll
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, 100);
}

function closeCurrentConversation() {
    selectedConversationId = null;
    
    // Hide conversation view and show "no conversation" message
    const noConvEl = document.getElementById('chat-no-conversation');
    const messagesContainer = document.getElementById('chat-admin-messages-container');
    
    if (noConvEl) noConvEl.style.display = 'flex';
    if (messagesContainer) messagesContainer.style.display = 'none';
    
    // Remove active state from conversation items
    document.querySelectorAll('.chat-conversation-item').forEach(item => {
        item.classList.remove('active');
    });
}

function scrollToTopOfChat() {
    const container = document.getElementById('chat-admin-messages');
    if (container) {
        container.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

function setupScrollToTopButton(container) {
    if (!container) return;
    
    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
    if (!scrollToTopBtn) return;
    
    // Show/hide button based on scroll position
    function toggleScrollButton() {
        if (!scrollToTopBtn || !container) return;
        
        if (container.scrollTop > 300) {
            scrollToTopBtn.style.display = 'flex';
            scrollToTopBtn.style.opacity = '0.9';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    }
    
    // Remove any existing listeners
    const newContainer = container.cloneNode(true);
    container.parentNode.replaceChild(newContainer, container);
    
    // Re-get references
    const updatedContainer = document.getElementById('chat-admin-messages');
    const updatedBtn = document.getElementById('scroll-to-top-btn');
    
    if (!updatedContainer || !updatedBtn) return;
    
    // Check initially
    setTimeout(() => {
        toggleScrollButton();
    }, 100);
    
    // Listen for scroll events
    updatedContainer.addEventListener('scroll', function() {
        if (updatedContainer.scrollTop > 300) {
            updatedBtn.style.display = 'flex';
            updatedBtn.style.opacity = '0.9';
        } else {
            updatedBtn.style.display = 'none';
        }
    });
    
    // Also check after delays
    setTimeout(() => {
        if (updatedContainer.scrollTop > 300) {
            updatedBtn.style.display = 'flex';
        } else {
            updatedBtn.style.display = 'none';
        }
    }, 500);
    setTimeout(() => {
        if (updatedContainer.scrollTop > 300) {
            updatedBtn.style.display = 'flex';
        } else {
            updatedBtn.style.display = 'none';
        }
    }, 1500);
}

function sendAdminReply() {
    if (!selectedConversationId) return;
    
    const input = document.getElementById('chat-admin-input');
    if (!input) return;
    
    const messageText = input.value.trim();
    if (!messageText) return;
    
    // Get user info from messages
    const messages = getChatMessages();
    const userMessages = messages.filter(msg => msg.userIdentifier === selectedConversationId);
    const userInfo = userMessages.length > 0 ? userMessages[0] : { userName: 'Guest' };
    
    // Add admin reply
    addChatMessage({
        sender: 'admin',
        text: messageText,
        userIdentifier: selectedConversationId,
        userName: userInfo.userName,
        read: true
    });
    
    // Mark chat notifications as read when admin replies
    const adminNotifications = getAdminNotifications();
    adminNotifications.forEach(notif => {
        if (notif.type === 'chat' && notif.data && notif.data.userIdentifier === selectedConversationId) {
            markAdminNotificationAsRead(notif.id);
        }
    });
    updateNotificationCount();
    
    // Clear input
    input.value = '';
    
    // Reload messages
    loadAdminChatMessages(selectedConversationId);
    
    // Ensure input is visible and focused
    setTimeout(() => {
        input.focus();
    }, 100);
}

function handleAdminChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendAdminReply();
    }
}

function setupTaxSettingsForm() {
    const form = document.getElementById('tax-settings-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const enabled = document.getElementById('tax-enabled').checked;
        const rate = parseFloat(document.getElementById('tax-rate').value) || 0;
        
        if (enabled && (rate <= 0 || rate > 100)) {
            alert('Please enter a valid tax rate between 0.01 and 100.');
            return;
        }
        
        const settings = {
            enabled: enabled,
            rate: rate
        };
        
        saveTaxSettings(settings);
        closeTaxSettingsModal();
        
        alert('Tax settings updated successfully! Changes will be reflected on the cart page.');
    });
}

// Currency Rates Management
function openCurrencyRatesModal() {
    const modal = document.getElementById('currency-rates-modal');
    if (!modal) return;
    
    const rates = getCurrencyRates();
    
    // Convert from multiplier format to RWF per unit format for display
    const usdRate = rates.USD ? (1 / rates.USD).toFixed(2) : '1300';
    const eurRate = rates.EUR ? (1 / rates.EUR).toFixed(2) : '1413';
    const gbpRate = rates.GBP ? (1 / rates.GBP).toFixed(2) : '1645';
    
    document.getElementById('usd-rate').value = usdRate;
    document.getElementById('eur-rate').value = eurRate;
    document.getElementById('gbp-rate').value = gbpRate;
    
    displayCurrentRates();
    modal.style.display = 'block';
}

function closeCurrencyRatesModal() {
    const modal = document.getElementById('currency-rates-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function displayCurrentRates() {
    const rates = getCurrencyRates();
    const displayEl = document.getElementById('current-rates-display');
    if (!displayEl) return;
    
    const usdRate = rates.USD ? (1 / rates.USD).toFixed(2) : '1300';
    const eurRate = rates.EUR ? (1 / rates.EUR).toFixed(2) : '1413';
    const gbpRate = rates.GBP ? (1 / rates.GBP).toFixed(2) : '1645';
    
    displayEl.innerHTML = `
        <div><strong>USD:</strong> 1 USD = ${usdRate} RWF</div>
        <div><strong>EUR:</strong> 1 EUR = ${eurRate} RWF</div>
        <div><strong>GBP:</strong> 1 GBP = ${gbpRate} RWF</div>
        <div style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-light);"><em>RWF is the base currency (1 RWF = 1 RWF)</em></div>
    `;
}

function setupCurrencyRatesForm() {
    const form = document.getElementById('currency-rates-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const usdRate = parseFloat(document.getElementById('usd-rate').value);
        const eurRate = parseFloat(document.getElementById('eur-rate').value);
        const gbpRate = parseFloat(document.getElementById('gbp-rate').value);
        
        if (!usdRate || !eurRate || !gbpRate || usdRate <= 0 || eurRate <= 0 || gbpRate <= 0) {
            alert('Please enter valid positive numbers for all currency rates.');
            return;
        }
        
        // Convert from RWF per unit to multiplier format (for calculation)
        // If 1 USD = 1300 RWF, then multiplier = 1/1300
        const rates = {
            RWF: 1, // Base currency
            USD: 1 / usdRate,
            EUR: 1 / eurRate,
            GBP: 1 / gbpRate
        };
        
        saveCurrencyRates(rates);
        closeCurrencyRatesModal();
        
        // Update currency display on current page
        updateCurrencyDisplay();
        
        alert('Currency rates updated successfully! Prices will be converted using the new rates.');
    });
    
    // Update display when rates change
    const inputs = ['usd-rate', 'eur-rate', 'gbp-rate'];
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', function() {
                // Temporarily update display (won't save until form is submitted)
                const usd = parseFloat(document.getElementById('usd-rate').value) || 0;
                const eur = parseFloat(document.getElementById('eur-rate').value) || 0;
                const gbp = parseFloat(document.getElementById('gbp-rate').value) || 0;
                
                const displayEl = document.getElementById('current-rates-display');
                if (displayEl && usd > 0 && eur > 0 && gbp > 0) {
                    displayEl.innerHTML = `
                        <div><strong>USD:</strong> 1 USD = ${usd.toFixed(2)} RWF</div>
                        <div><strong>EUR:</strong> 1 EUR = ${eur.toFixed(2)} RWF</div>
                        <div><strong>GBP:</strong> 1 GBP = ${gbp.toFixed(2)} RWF</div>
                        <div style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-light);"><em>RWF is the base currency (1 RWF = 1 RWF)</em></div>
                    `;
                }
            });
        }
    });
}

// Hero Section Management
function openHeroModal() {
    const modal = document.getElementById('hero-modal');
    if (!modal) return;
    
    const heroContent = getHeroContent();
    
    // Populate form with current values
    document.getElementById('hero-title-input').value = heroContent.title || '';
    document.getElementById('hero-subtitle-input').value = heroContent.subtitle || '';
    document.getElementById('hero-button-text-input').value = heroContent.buttonText || '';
    document.getElementById('hero-button-link-input').value = heroContent.buttonLink || '';
    
    modal.style.display = 'block';
}

function closeHeroModal() {
    const modal = document.getElementById('hero-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function setupHeroForm() {
    const heroForm = document.getElementById('hero-form');
    if (!heroForm) return;
    
    heroForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const buttonLinkInput = document.getElementById('hero-button-link-input').value.trim();
        
        const heroContent = {
            title: document.getElementById('hero-title-input').value,
            subtitle: document.getElementById('hero-subtitle-input').value,
            buttonText: document.getElementById('hero-button-text-input').value,
            buttonLink: buttonLinkInput || 'products.html' // Default to products.html if empty
        };
        
        saveHeroContent(heroContent);
        closeHeroModal();
        alert('Hero section updated successfully! Changes will be visible on the homepage.');
    });
}

// Slideshow Management
function openSlideshowModal() {
    const modal = document.getElementById('slideshow-modal');
    if (!modal) return;
    
    displaySlideshowList();
    modal.style.display = 'block';
}

function closeSlideshowModal() {
    const modal = document.getElementById('slideshow-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function displaySlideshowList() {
    const images = getSlideshowImages();
    const listContainer = document.getElementById('slideshow-list');
    if (!listContainer) return;
    
    if (images.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-light);">No slideshow images. Add your first slide!</p>';
        return;
    }
    
    // Sort by order
    const sortedImages = [...images].sort((a, b) => a.order - b.order);
    
    listContainer.innerHTML = sortedImages.map((image, index) => `
        <div class="social-media-item-admin" style="margin-bottom: 1.5rem; padding: 1.5rem; border: 2px solid var(--border-color); border-radius: 0.5rem;">
            <div style="margin-bottom: 1rem;">
                <img src="${image.imageUrl}" alt="${image.title || 'Slide'}" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 0.5rem;" onerror="this.src='https://via.placeholder.com/800x400'">
            </div>
            <div class="form-group">
                <label>Image Source</label>
                <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem;">
                    <label style="cursor: pointer; padding: 0.5rem 1rem; background-color: var(--primary-color); color: var(--white); border-radius: 0.5rem; display: inline-block;">
                        <input type="file" class="slide-image-upload" data-id="${image.id}" accept="image/*" style="display: none;" onchange="uploadSlideImage(${image.id}, this)">
                        📁 Upload Image
                    </label>
                    <span style="color: var(--text-light);">or</span>
                    <span style="color: var(--text-light); font-size: 0.9rem;">Enter URL below</span>
                </div>
                <input type="url" class="slide-image-input" data-id="${image.id}" value="${image.imageUrl && image.imageUrl.startsWith('data:') ? 'Image uploaded (stored locally)' : image.imageUrl}" placeholder="https://example.com/image.jpg" onchange="updateSlideImage(${image.id}, this.value)">
                <small>Upload an image file or enter an image URL. Uploaded images are stored locally.</small>
            </div>
            <div class="form-group">
                <label>Title</label>
                <input type="text" class="slide-title-input" data-id="${image.id}" value="${image.title || ''}" onchange="updateSlideTitle(${image.id}, this.value)">
            </div>
            <div class="form-group">
                <label>Subtitle</label>
                <input type="text" class="slide-subtitle-input" data-id="${image.id}" value="${image.subtitle || ''}" onchange="updateSlideSubtitle(${image.id}, this.value)">
            </div>
            <div class="form-group">
                <label>Link URL (Optional)</label>
                <input type="url" class="slide-link-input" data-id="${image.id}" value="${image.link || ''}" placeholder="products.html" onchange="updateSlideLink(${image.id}, this.value)">
            </div>
            <div class="form-group">
                <label>Display Order</label>
                <input type="number" class="slide-order-input" data-id="${image.id}" value="${image.order}" min="1" onchange="updateSlideOrder(${image.id}, parseInt(this.value))">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" class="slide-enabled-input" data-id="${image.id}" ${image.enabled ? 'checked' : ''} onchange="updateSlideEnabled(${image.id}, this.checked)">
                    Enabled (show in slideshow)
                </label>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" class="slide-showcard-input" data-id="${image.id}" ${image.showCard !== false ? 'checked' : ''} onchange="updateSlideShowCard(${image.id}, this.checked)">
                    Show Card Overlay (Title, Subtitle, and Shop Now button)
                </label>
                <small>Uncheck to hide the card overlay and display only the image</small>
            </div>
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                <button class="btn btn-danger btn-small" onclick="deleteSlide(${image.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function updateSlideImage(id, imageUrl) {
    const images = getSlideshowImages();
    const image = images.find(img => img.id === id);
    if (image) {
        image.imageUrl = imageUrl;
        saveSlideshowImages(images);
        displaySlideshowList();
    }
}

function uploadSlideImage(id, fileInput) {
    const file = fileInput.files[0];
    if (!file) {
        return;
    }
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
        alert('Please select an image file (jpg, png, gif, etc.)');
        return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB. Please compress the image or choose a smaller file.');
        return;
    }
    
    // Show loading state
    const imageInput = document.querySelector(`.slide-image-input[data-id="${id}"]`);
    if (imageInput) {
        imageInput.value = 'Uploading...';
        imageInput.disabled = true;
    }
    
    // Read file as data URL (base64)
    const reader = new FileReader();
    reader.onload = function(e) {
        const dataUrl = e.target.result;
        
        const images = getSlideshowImages();
        const image = images.find(img => img.id === id);
        if (image) {
            image.imageUrl = dataUrl;
            saveSlideshowImages(images);
            
            // Re-enable input and show success
            const imageInput = document.querySelector(`.slide-image-input[data-id="${id}"]`);
            if (imageInput) {
                imageInput.disabled = false;
                imageInput.value = 'Image uploaded (stored locally)';
            }
            
            displaySlideshowList();
            alert('Image uploaded successfully! The image is now stored locally and will be displayed in the slideshow.');
        }
    };
    
    reader.onerror = function() {
        alert('Error reading image file. Please try again.');
        const imageInput = document.querySelector(`.slide-image-input[data-id="${id}"]`);
        if (imageInput) {
            imageInput.disabled = false;
            imageInput.value = '';
        }
        const images = getSlideshowImages();
        displaySlideshowList();
    };
    
    reader.readAsDataURL(file);
}

function updateSlideTitle(id, title) {
    const images = getSlideshowImages();
    const image = images.find(img => img.id === id);
    if (image) {
        image.title = title;
        saveSlideshowImages(images);
    }
}

function updateSlideSubtitle(id, subtitle) {
    const images = getSlideshowImages();
    const image = images.find(img => img.id === id);
    if (image) {
        image.subtitle = subtitle;
        saveSlideshowImages(images);
    }
}

function updateSlideLink(id, link) {
    const images = getSlideshowImages();
    const image = images.find(img => img.id === id);
    if (image) {
        image.link = link;
        saveSlideshowImages(images);
    }
}

function updateSlideOrder(id, order) {
    const images = getSlideshowImages();
    const image = images.find(img => img.id === id);
    if (image) {
        image.order = order || 1;
        saveSlideshowImages(images);
        displaySlideshowList();
    }
}

function updateSlideEnabled(id, enabled) {
    const images = getSlideshowImages();
    const image = images.find(img => img.id === id);
    if (image) {
        image.enabled = enabled;
        saveSlideshowImages(images);
    }
}

function updateSlideShowCard(id, showCard) {
    const images = getSlideshowImages();
    const image = images.find(img => img.id === id);
    if (image) {
        image.showCard = showCard;
        saveSlideshowImages(images);
    }
}

function deleteSlide(id) {
    if (!confirm('Are you sure you want to delete this slide?')) {
        return;
    }
    
    const images = getSlideshowImages();
    const filteredImages = images.filter(img => img.id !== id);
    saveSlideshowImages(filteredImages);
    displaySlideshowList();
    alert('Slide deleted successfully!');
}

function addNewSlide() {
    const images = getSlideshowImages();
    const maxOrder = images.length > 0 ? Math.max(...images.map(img => img.order)) : 0;
    
    const newSlide = {
        id: images.length > 0 ? Math.max(...images.map(img => img.id)) + 1 : 1,
        imageUrl: '',
        title: '',
        subtitle: '',
        link: '',
        enabled: true,
        order: maxOrder + 1,
        showCard: true
    };
    
    images.push(newSlide);
    saveSlideshowImages(images);
    displaySlideshowList();
}

// Order Management functions are now in app.js

// Display products in admin table
function displayAdminProducts() {
    const products = getProducts();
    const tableBody = document.getElementById('products-table-body');
    
    if (!tableBody) return;
    
    if (products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">No products found. Add your first product!</td></tr>';
        return;
    }
    
    // Sort products by position (if exists) or by ID as fallback
    const sortedProducts = [...products].sort((a, b) => {
        const positionOrder = { 'top': 1, 'middle': 2, 'bottom': 3 };
        const posA = a.position ? positionOrder[a.position] : (a.positionOrder ? a.positionOrder + 1000 : 9999);
        const posB = b.position ? positionOrder[b.position] : (b.positionOrder ? b.positionOrder + 1000 : 9999);
        return posA - posB;
    });
    
    tableBody.innerHTML = sortedProducts.map(product => {
        const discount = product.discount || 0;
        const discountBadge = discount > 0 ? `<span class="discount-badge" style="background-color: #ef4444; color: white; padding: 0.2rem 0.5rem; border-radius: 0.25rem; font-size: 0.85rem; font-weight: 600;">-${discount}%</span>` : '-';
        
        // Position display
        let positionDisplay = product.positionOrder || '-';
        if (product.position === 'top') positionDisplay = 'Top';
        else if (product.position === 'middle') positionDisplay = 'Middle';
        else if (product.position === 'bottom') positionDisplay = 'Bottom';
        
        return `
        <tr>
            <td>
                <img src="${product.image || 'https://via.placeholder.com/60'}" alt="${product.name}" class="table-image" onerror="this.src='https://via.placeholder.com/60'">
            </td>
            <td>${product.name}</td>
            <td>${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</td>
            <td>${formatPrice(product.price)}</td>
            <td style="text-align: center;">${discountBadge}</td>
            <td>${product.stock}</td>
            <td>
                <div style="display: flex; gap: 0.25rem; align-items: center;">
                    <select class="position-select" data-id="${product.id}" style="padding: 0.25rem 0.5rem; font-size: 0.875rem; border: 1px solid var(--border-color); border-radius: 0.25rem; background: var(--white);" onchange="updateProductPosition(${product.id}, this.value)">
                        <option value="number" ${!product.position ? 'selected' : ''}>Number</option>
                        <option value="top" ${product.position === 'top' ? 'selected' : ''}>Top</option>
                        <option value="middle" ${product.position === 'middle' ? 'selected' : ''}>Middle</option>
                        <option value="bottom" ${product.position === 'bottom' ? 'selected' : ''}>Bottom</option>
                    </select>
                    ${!product.position ? `<input type="number" class="position-order-input" data-id="${product.id}" value="${product.positionOrder || ''}" placeholder="#" style="width: 60px; padding: 0.25rem 0.5rem; font-size: 0.875rem; border: 1px solid var(--border-color); border-radius: 0.25rem;" onchange="updateProductPositionOrder(${product.id}, this.value)">` : '<span style="font-size: 0.875rem; color: var(--text-light);">-</span>'}
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-small" onclick="editProduct(${product.id})">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            </td>
        </tr>
        `;
    }).join('');
}

// Open modal for adding/editing product
function openProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const modalTitle = document.getElementById('modal-title');
    
    if (!modal || !form) return;
    
    // Populate category dropdown
    populateCategoryDropdown('product-category');
    
    if (productId) {
        // Edit mode
        const product = getProductById(productId);
        if (!product) return;
        
        modalTitle.textContent = 'Edit Product';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-discount').value = product.discount || 0;
        
        // Handle main image (can be URL or base64)
        const mainImage = product.image || '';
        document.getElementById('product-image').value = mainImage;
        const mainImagePreview = document.getElementById('product-image-preview');
        const mainImagePreviewContainer = document.getElementById('product-image-preview-container');
        const mainImagePreviewText = document.getElementById('product-image-preview-text');
        const mainImageUpload = document.getElementById('product-image-upload');
        const mainImageUrl = document.getElementById('product-image-url');
        
        if (mainImage) {
            if (mainImage.startsWith('data:') || mainImage.startsWith('http://') || mainImage.startsWith('https://')) {
                if (mainImage.startsWith('data:')) {
                    // Base64 image - show in preview
                    mainImagePreview.src = mainImage;
                    mainImagePreview.style.display = 'block';
                    mainImagePreviewText.style.display = 'none';
                    mainImagePreviewContainer.style.display = 'flex';
                    if (mainImageUrl) mainImageUrl.value = '';
                    if (mainImageUpload) mainImageUpload.value = '';
                } else {
                    // URL - show in preview and URL field
                    mainImagePreview.src = mainImage;
                    mainImagePreview.style.display = 'block';
                    mainImagePreviewText.style.display = 'none';
                    mainImagePreviewContainer.style.display = 'flex';
                    if (mainImageUrl) mainImageUrl.value = mainImage;
                    if (mainImageUpload) mainImageUpload.value = '';
                }
            }
        } else {
            mainImagePreview.style.display = 'none';
            mainImagePreviewText.textContent = 'No image';
            mainImagePreviewText.style.display = 'block';
            mainImagePreviewContainer.style.display = 'flex';
        }
        
        // Handle additional images
        const additionalImages = product.additionalImages || [];
        const additionalImagesUrls = document.getElementById('product-additional-images-urls');
        const additionalImagesPreviewContainer = document.getElementById('additional-images-preview-container');
        const additionalImagesHidden = document.getElementById('product-additional-images');
        const additionalImagesUpload = document.getElementById('product-additional-images-upload');
        
        // Clear existing previews
        if (additionalImagesPreviewContainer) {
            additionalImagesPreviewContainer.innerHTML = '';
        }
        
        // Reset additional images data
        if (typeof window.additionalImagesData !== 'undefined') {
            window.additionalImagesData = [];
        }
        
        const urlImages = [];
        const base64Images = [];
        
        additionalImages.forEach(img => {
            if (img.startsWith('data:')) {
                base64Images.push(img);
                // Create preview for base64 image
                const previewDiv = document.createElement('div');
                previewDiv.style.cssText = 'position: relative; border: 2px solid var(--border-color); border-radius: 0.5rem; overflow: hidden; background-color: #f8fafc;';
                previewDiv.innerHTML = `
                    <img src="${img}" alt="Preview" style="width: 100%; height: 100px; object-fit: cover; display: block;">
                    <button type="button" onclick="removeAdditionalImagePreview(this)" style="position: absolute; top: 0.25rem; right: 0.25rem; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 0.75rem; display: flex; align-items: center; justify-content: center;">×</button>
                `;
                previewDiv.dataset.imageData = img;
                if (additionalImagesPreviewContainer) additionalImagesPreviewContainer.appendChild(previewDiv);
            } else if (img.trim()) {
                urlImages.push(img);
            }
        });
        
        if (additionalImagesUrls) {
            additionalImagesUrls.value = urlImages.join('\n');
        }
        
        if (additionalImagesHidden) {
            additionalImagesHidden.value = additionalImages.join('\n');
        }
        
        if (additionalImagesUpload) {
            additionalImagesUpload.value = '';
        }
        
        // Store base64 images for form submission
        window.additionalImagesData = base64Images;
        
        if (additionalImagesPreviewContainer && urlImages.length > 0) {
            // Add URL previews
            urlImages.forEach((url, index) => {
                const previewDiv = document.createElement('div');
                previewDiv.className = 'url-preview';
                previewDiv.style.cssText = 'position: relative; border: 2px solid var(--border-color); border-radius: 0.5rem; overflow: hidden; background-color: #f8fafc;';
                previewDiv.innerHTML = `
                    <img src="${url.trim()}" alt="Preview" style="width: 100%; height: 100px; object-fit: cover; display: block;" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'padding: 1rem; text-align: center; color: var(--text-light); font-size: 0.75rem;\\'>Image not found</div>'">
                    <button type="button" onclick="removeAdditionalImageUrl(${index})" style="position: absolute; top: 0.25rem; right: 0.25rem; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 0.75rem; display: flex; align-items: center; justify-content: center;">×</button>
                `;
                previewDiv.dataset.imageUrl = url.trim();
                additionalImagesPreviewContainer.appendChild(previewDiv);
            });
        }
        
        document.getElementById('product-colors').value = product.colors ? product.colors.join(', ') : '';
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-stock').value = product.stock;
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Product';
        form.reset();
        document.getElementById('product-id').value = '';
        
        // Clear image previews
        const mainImagePreview = document.getElementById('product-image-preview');
        const mainImagePreviewContainer = document.getElementById('product-image-preview-container');
        const mainImagePreviewText = document.getElementById('product-image-preview-text');
        const mainImageUrl = document.getElementById('product-image-url');
        const mainImageUpload = document.getElementById('product-image-upload');
        const additionalImagesPreviewContainer = document.getElementById('additional-images-preview-container');
        const additionalImagesUrls = document.getElementById('product-additional-images-urls');
        const additionalImagesUpload = document.getElementById('product-additional-images-upload');
        
        if (mainImagePreview) {
            mainImagePreview.src = '';
            mainImagePreview.style.display = 'none';
        }
        if (mainImagePreviewText) {
            mainImagePreviewText.textContent = 'No image';
            mainImagePreviewText.style.display = 'block';
        }
        if (mainImagePreviewContainer) {
            mainImagePreviewContainer.style.display = 'flex';
        }
        if (mainImageUrl) mainImageUrl.value = '';
        if (mainImageUpload) mainImageUpload.value = '';
        if (additionalImagesPreviewContainer) additionalImagesPreviewContainer.innerHTML = '';
        if (additionalImagesUrls) additionalImagesUrls.value = '';
        if (additionalImagesUpload) additionalImagesUpload.value = '';
        
        // Clear hidden fields
        const mainImageHidden = document.getElementById('product-image');
        const additionalImagesHidden = document.getElementById('product-additional-images');
        if (mainImageHidden) mainImageHidden.value = '';
        if (additionalImagesHidden) additionalImagesHidden.value = '';
        
        // Reset additional images data
        if (typeof window.additionalImagesData !== 'undefined') {
            window.additionalImagesData = [];
        }
    }
    
    modal.style.display = 'block';
}

// populateCategoryDropdown function is now in app.js

// Close modal
function closeModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.style.display = 'none';
        const form = document.getElementById('product-form');
        if (form) {
            form.reset();
        }
        
        // Clear additional images data
        if (typeof window.additionalImagesData !== 'undefined') {
            window.additionalImagesData = [];
        }
        
        // Clear preview containers
        const mainImagePreview = document.getElementById('product-image-preview');
        const mainImagePreviewText = document.getElementById('product-image-preview-text');
        const mainImagePreviewContainer = document.getElementById('product-image-preview-container');
        const additionalImagesPreviewContainer = document.getElementById('additional-images-preview-container');
        
        if (mainImagePreview) mainImagePreview.src = '';
        if (mainImagePreviewText) {
            mainImagePreviewText.textContent = 'No image';
            mainImagePreviewText.style.display = 'block';
        }
        if (mainImagePreview) mainImagePreview.style.display = 'none';
        if (additionalImagesPreviewContainer) additionalImagesPreviewContainer.innerHTML = '';
        
        // Clear hidden fields
        const mainImageHidden = document.getElementById('product-image');
        const additionalImagesHidden = document.getElementById('product-additional-images');
        if (mainImageHidden) mainImageHidden.value = '';
        if (additionalImagesHidden) additionalImagesHidden.value = '';
    }
}

// Edit product
function editProduct(productId) {
    openProductModal(productId);
}

// Delete product
function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    const products = getProducts();
    const filteredProducts = products.filter(p => p.id !== productId);
    saveProducts(filteredProducts);
    displayAdminProducts();
    updateDashboardStats();
    updateProductAnalytics(); // Update analytics when product is deleted
    
    alert('Product deleted successfully!');
}

// Save product (add or update)
function saveProduct(productData) {
    try {
        const products = getProducts();
        
        // Process additional images
        const additionalImages = productData.additionalImages 
            ? productData.additionalImages.split('\n').filter(url => url.trim())
            : [];
        
        // Process colors
        const colors = productData.colors 
            ? productData.colors.split(',').map(color => color.trim()).filter(color => color)
            : [];
        
        // Validate image data
        if (!productData.image || !productData.image.trim()) {
            throw new Error('Product image is required');
        }
        
        if (productData.id) {
            // Update existing product
            const index = products.findIndex(p => p.id === parseInt(productData.id));
            if (index !== -1) {
                products[index] = {
                    ...products[index],
                    name: productData.name,
                    description: productData.description,
                    price: parseFloat(productData.price),
                    discount: parseFloat(productData.discount || 0),
                    image: productData.image.trim(),
                    additionalImages: additionalImages,
                    colors: colors,
                    category: productData.category,
                    stock: parseInt(productData.stock)
                };
            } else {
                throw new Error('Product not found for update');
            }
        } else {
            // Add new product
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            const newProduct = {
                id: newId,
                name: productData.name,
                description: productData.description,
                price: parseFloat(productData.price),
                discount: parseFloat(productData.discount || 0),
                image: productData.image.trim(),
                additionalImages: additionalImages,
                colors: colors,
                category: productData.category,
                stock: parseInt(productData.stock)
            };
            products.push(newProduct);
        }
        
        // Save products with error handling
        try {
            saveProducts(products);
        } catch (storageError) {
            // Check if it's a storage quota error
            if (storageError.name === 'QuotaExceededError' || storageError.code === 22) {
                throw new Error('Storage quota exceeded. The image file may be too large. Please try using an image URL instead or compress the image.');
            }
            throw storageError;
        }
        
        // Verify the product was saved
        const savedProducts = getProducts();
        const savedProduct = savedProducts.find(p => 
            p.name === productData.name && 
            (productData.id ? p.id === parseInt(productData.id) : true)
        );
        
        if (!savedProduct) {
            throw new Error('Product was not saved. Please check browser console for details.');
        }
        
        displayAdminProducts();
        updateDashboardStats();
        updateProductAnalytics(); // Update analytics when product is added/updated
        closeModal();
        
        alert(productData.id ? 'Product updated successfully!' : 'Product added successfully!');
    } catch (error) {
        console.error('Error in saveProduct:', error);
        alert('Error saving product: ' + error.message);
        throw error;
    }
}

// Update product position (top, middle, bottom, or number)
function updateProductPosition(productId, position) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    if (position === 'number') {
        // Switch to number mode
        product.position = null;
        product.positionOrder = product.positionOrder || 0;
    } else {
        // Switch to named position mode
        product.position = position;
        product.positionOrder = null;
    }
    
    saveProducts(products);
    displayAdminProducts();
}

// Update product position order (number)
function updateProductPositionOrder(productId, order) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    product.positionOrder = parseInt(order) || 0;
    product.position = null; // Clear named position if using number
    
    saveProducts(products);
    displayAdminProducts();
}

// Handle product form submission
function setupProductForm() {
    const form = document.getElementById('product-form');
    if (!form) return;
    
    // Handle main image upload
    const mainImageUpload = document.getElementById('product-image-upload');
    const mainImageUrl = document.getElementById('product-image-url');
    const mainImagePreview = document.getElementById('product-image-preview');
    const mainImagePreviewContainer = document.getElementById('product-image-preview-container');
    const mainImagePreviewText = document.getElementById('product-image-preview-text');
    const mainImageHidden = document.getElementById('product-image');
    
    if (mainImageUpload) {
        mainImageUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (!file.type.match('image.*')) {
                    alert('Please select an image file.');
                    e.target.value = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(event) {
                    const dataUrl = event.target.result;
                    
                    // Check data URL size
                    const dataUrlSize = dataUrl.length;
                    const sizeInMB = (dataUrlSize * 0.75) / (1024 * 1024); // Approximate size
                    
                    if (sizeInMB > 2) {
                        if (!confirm(`Warning: The image is approximately ${sizeInMB.toFixed(2)} MB. Large images may cause storage issues. Continue anyway?`)) {
                            e.target.value = '';
                            return;
                        }
                    }
                    
                    // Set the hidden field value
                    if (mainImageHidden) {
                        mainImageHidden.value = dataUrl;
                        console.log('Main image data URL set, length:', dataUrl.length);
                    } else {
                        console.error('Main image hidden field not found!');
                    }
                    
                    // Update preview
                    if (mainImagePreview) {
                        mainImagePreview.src = dataUrl;
                        mainImagePreview.style.display = 'block';
                    }
                    if (mainImagePreviewText) {
                        mainImagePreviewText.style.display = 'none';
                    }
                    if (mainImagePreviewContainer) {
                        mainImagePreviewContainer.style.display = 'flex';
                    }
                    
                    // Clear URL input when file is uploaded
                    if (mainImageUrl) mainImageUrl.value = '';
                };
                reader.onerror = function(error) {
                    console.error('Error reading file:', error);
                    alert('Error reading image file. Please try again.');
                    e.target.value = '';
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Handle main image URL input
    if (mainImageUrl) {
        mainImageUrl.addEventListener('input', function(e) {
            const url = e.target.value.trim();
            if (url) {
                mainImageHidden.value = url;
                mainImagePreview.src = url;
                mainImagePreview.style.display = 'block';
                mainImagePreviewText.style.display = 'none';
                mainImagePreviewContainer.style.display = 'flex';
                mainImagePreview.onerror = function() {
                    mainImagePreview.style.display = 'none';
                    mainImagePreviewText.textContent = 'Image not found';
                    mainImagePreviewText.style.display = 'block';
                };
                
                // Clear file input when URL is entered
                if (mainImageUpload) mainImageUpload.value = '';
            } else if (!mainImageUpload.files[0]) {
                mainImagePreview.style.display = 'none';
                mainImagePreviewText.textContent = 'No image';
                mainImagePreviewText.style.display = 'block';
            }
        });
    }
    
    // Handle additional images upload
    const additionalImagesUpload = document.getElementById('product-additional-images-upload');
    const additionalImagesUrls = document.getElementById('product-additional-images-urls');
    const additionalImagesPreviewContainer = document.getElementById('additional-images-preview-container');
    const additionalImagesHidden = document.getElementById('product-additional-images');
    
    // Use global variable to persist across function calls
    if (typeof window.additionalImagesData === 'undefined') {
        window.additionalImagesData = [];
    }
    let additionalImagesData = window.additionalImagesData;
    
    if (additionalImagesUpload) {
        additionalImagesUpload.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;
            
            files.forEach(file => {
                if (!file.type.match('image.*')) {
                    alert(`File ${file.name} is not an image. Skipping.`);
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(event) {
                    const dataUrl = event.target.result;
                    window.additionalImagesData.push(dataUrl);
                    
                    // Create preview
                    const previewDiv = document.createElement('div');
                    previewDiv.style.cssText = 'position: relative; border: 2px solid var(--border-color); border-radius: 0.5rem; overflow: hidden; background-color: #f8fafc;';
                    previewDiv.innerHTML = `
                        <img src="${dataUrl}" alt="Preview" style="width: 100%; height: 100px; object-fit: cover; display: block;">
                        <button type="button" onclick="removeAdditionalImagePreview(this)" style="position: absolute; top: 0.25rem; right: 0.25rem; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 0.75rem; display: flex; align-items: center; justify-content: center;">×</button>
                    `;
                    previewDiv.dataset.imageData = dataUrl;
                    additionalImagesPreviewContainer.appendChild(previewDiv);
                    
                    // Update hidden field - combine with URLs
                    const urlImages = additionalImagesUrls ? additionalImagesUrls.value.split('\n').filter(url => url.trim()) : [];
                    additionalImagesHidden.value = [...window.additionalImagesData, ...urlImages].join('\n');
                };
                reader.readAsDataURL(file);
            });
            
            // Clear file input
            e.target.value = '';
        });
    }
    
    // Handle additional images URLs
    if (additionalImagesUrls) {
        additionalImagesUrls.addEventListener('input', function(e) {
            const urls = e.target.value.split('\n').filter(url => url.trim());
            
            // Clear existing URL previews
            const urlPreviews = additionalImagesPreviewContainer.querySelectorAll('.url-preview');
            urlPreviews.forEach(preview => preview.remove());
            
            urls.forEach((url, index) => {
                if (url.trim()) {
                    const previewDiv = document.createElement('div');
                    previewDiv.className = 'url-preview';
                    previewDiv.style.cssText = 'position: relative; border: 2px solid var(--border-color); border-radius: 0.5rem; overflow: hidden; background-color: #f8fafc;';
                    previewDiv.innerHTML = `
                        <img src="${url.trim()}" alt="Preview" style="width: 100%; height: 100px; object-fit: cover; display: block;" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'padding: 1rem; text-align: center; color: var(--text-light); font-size: 0.75rem;\\'>Image not found</div>'">
                        <button type="button" onclick="removeAdditionalImageUrl(${index})" style="position: absolute; top: 0.25rem; right: 0.25rem; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 0.75rem; display: flex; align-items: center; justify-content: center;">×</button>
                    `;
                    previewDiv.dataset.imageUrl = url.trim();
                    additionalImagesPreviewContainer.appendChild(previewDiv);
                }
            });
            
            // Update hidden field with URLs - combine with uploaded images
            const allUrls = urls.map(url => url.trim()).filter(url => url);
            additionalImagesHidden.value = [...window.additionalImagesData, ...allUrls].join('\n');
        });
    }
    
    // Function to remove uploaded image preview
    window.removeAdditionalImagePreview = function(button) {
        const previewDiv = button.parentElement;
        const imageData = previewDiv.dataset.imageData;
        window.additionalImagesData = window.additionalImagesData.filter(data => data !== imageData);
        previewDiv.remove();
        const urlImages = additionalImagesUrls.value.split('\n').filter(url => url.trim());
        additionalImagesHidden.value = [...window.additionalImagesData, ...urlImages].join('\n');
    };
    
    // Function to remove URL image
    window.removeAdditionalImageUrl = function(index) {
        const urls = additionalImagesUrls.value.split('\n').filter(url => url.trim());
        urls.splice(index, 1);
        additionalImagesUrls.value = urls.join('\n');
        
        // Trigger input event to update previews
        additionalImagesUrls.dispatchEvent(new Event('input'));
    };
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Ensure main image is set
        const mainImageValue = mainImageHidden ? mainImageHidden.value.trim() : '';
        if (!mainImageValue) {
            alert('Please upload an image or enter an image URL for the main product image.');
            console.error('Main image hidden field value is empty');
            console.log('Main image hidden field:', mainImageHidden);
            return;
        }
        
        console.log('Form submission - Main image value length:', mainImageValue.length);
        console.log('Form submission - Main image starts with:', mainImageValue.substring(0, 50));
        
        // Validate required fields
        const productName = document.getElementById('product-name').value.trim();
        const productPrice = document.getElementById('product-price').value;
        const productCategory = document.getElementById('product-category').value;
        const productStock = document.getElementById('product-stock').value;
        
        if (!productName) {
            alert('Please enter a product name.');
            return;
        }
        
        if (!productPrice || parseFloat(productPrice) <= 0) {
            alert('Please enter a valid price.');
            return;
        }
        
        if (!productCategory) {
            alert('Please select a category.');
            return;
        }
        
        if (!productStock || parseInt(productStock) < 0) {
            alert('Please enter a valid stock quantity.');
            return;
        }
        
        const productData = {
            id: document.getElementById('product-id').value,
            name: productName,
            description: document.getElementById('product-description').value.trim(),
            price: productPrice,
            discount: document.getElementById('product-discount').value || 0,
            image: mainImageValue,
            additionalImages: additionalImagesHidden ? additionalImagesHidden.value : '',
            colors: document.getElementById('product-colors').value.trim(),
            category: productCategory,
            stock: productStock
        };
        
        try {
            saveProduct(productData);
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error saving product: ' + error.message + '. Please check the browser console for details.');
        }
    });
}

// Clear all data (for testing) - Requires admin credentials
function clearAllData() {
    // Open verification modal instead of direct confirmation
    openClearDataModal();
}

function openClearDataModal() {
    const modal = document.getElementById('clear-data-modal');
    if (modal) {
        modal.style.display = 'block';
        // Clear form fields
        const emailInput = document.getElementById('clear-data-email');
        const passwordInput = document.getElementById('clear-data-password');
        if (emailInput) emailInput.value = '';
        if (passwordInput) passwordInput.value = '';
        // Focus on email input
        setTimeout(() => {
            if (emailInput) emailInput.focus();
        }, 100);
    }
}

function closeClearDataModal() {
    const modal = document.getElementById('clear-data-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function verifyAndClearData() {
    const email = document.getElementById('clear-data-email').value.trim();
    const password = document.getElementById('clear-data-password').value;
    
    // Admin credentials (same as login)
    const ADMIN_EMAIL = 'abintwarighislain@gmail.com';
    const ADMIN_PASSWORD = 'Possible123@Ghislain';
    
    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }
    
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        alert('Invalid email or password. Access denied.');
        return;
    }
    
    // Final confirmation
    if (!confirm('⚠️ WARNING: Are you sure you want to clear ALL data?\n\nThis will permanently delete:\n- All products\n- All orders\n- All cart items\n\nThis cannot be undone!')) {
        return;
    }
    
    // Clear data
    localStorage.removeItem('products');
    localStorage.removeItem('cart');
    localStorage.removeItem('orders');
    
    // Reinitialize default products
    initializeDefaultProducts();
    
    // Update displays
    if (typeof displayAdminProducts === 'function') {
        displayAdminProducts();
    }
    if (typeof updateDashboardStats === 'function') {
        updateDashboardStats();
    }
    if (typeof updateProductAnalytics === 'function') {
        updateProductAnalytics();
    }
    
    // Close modal
    closeClearDataModal();
    
    alert('All data cleared! Default products restored.');
}

// Contact Info Management
function openContactModal() {
    const modal = document.getElementById('contact-modal');
    const contactInfo = getContactInfo();
    
    if (!modal) return;
    
    // Populate form with current contact info
    document.getElementById('contact-email').value = contactInfo.email;
    document.getElementById('contact-phone').value = contactInfo.phone;
    document.getElementById('contact-address').value = contactInfo.address;
    document.getElementById('contact-hours').value = contactInfo.hours;
    
    modal.style.display = 'block';
}

function closeContactModal() {
    const modal = document.getElementById('contact-modal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('contact-form').reset();
    }
}

function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const contactInfo = {
            email: document.getElementById('contact-email').value,
            phone: document.getElementById('contact-phone').value,
            address: document.getElementById('contact-address').value,
            hours: document.getElementById('contact-hours').value
        };
        
        saveContactInfo(contactInfo);
        
        // Dispatch event to update client pages
        window.dispatchEvent(new CustomEvent('contactInfoUpdated'));
        
        // Also trigger storage event for cross-tab communication
        localStorage.setItem('contactInfoUpdated', Date.now().toString());
        
        closeContactModal();
        alert('Contact information updated successfully! The changes will be visible on client pages immediately.');
    });
}

// Logo Management Functions
function openLogoModal() {
    if (!hasPermission('manage-logo')) {
        alert('You do not have permission to manage the logo.');
        return;
    }
    
    const modal = document.getElementById('logo-modal');
    if (modal) {
        modal.style.display = 'block';
        loadLogoPreview();
    }
}

function closeLogoModal() {
    const modal = document.getElementById('logo-modal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        const urlInput = document.getElementById('logo-url-input');
        const fileInput = document.getElementById('logo-file-upload');
        if (urlInput) urlInput.value = '';
        if (fileInput) fileInput.value = '';
    }
}

function loadLogoPreview() {
    const logoUrl = getLogoUrl();
    const preview = document.getElementById('logo-preview');
    if (preview) {
        preview.src = logoUrl;
        preview.onerror = function() {
            this.style.display = 'none';
        };
        preview.onload = function() {
            this.style.display = 'block';
        };
    }
    
    // Set URL input value if it's not a data URL
    const urlInput = document.getElementById('logo-url-input');
    if (urlInput && logoUrl && !logoUrl.startsWith('data:') && logoUrl !== 'logo.png') {
        urlInput.value = logoUrl;
    } else if (urlInput && logoUrl.startsWith('data:')) {
        urlInput.value = 'Image uploaded (stored locally)';
    } else if (urlInput) {
        urlInput.value = '';
    }
}

function handleLogoFileUpload(fileInput) {
    const file = fileInput.files[0];
    if (!file) {
        return;
    }
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
        alert('Please select an image file (jpg, png, gif, etc.)');
        fileInput.value = '';
        return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB. Please compress the image or choose a smaller file.');
        fileInput.value = '';
        return;
    }
    
    // Show loading state
    const urlInput = document.getElementById('logo-url-input');
    const preview = document.getElementById('logo-preview');
    if (urlInput) {
        urlInput.value = 'Uploading...';
        urlInput.disabled = true;
    }
    
    // Read file as data URL (base64)
    const reader = new FileReader();
    reader.onload = function(e) {
        const dataUrl = e.target.result;
        
        // Update preview
        if (preview) {
            preview.src = dataUrl;
            preview.style.display = 'block';
        }
        
        // Update URL input
        if (urlInput) {
            urlInput.disabled = false;
            urlInput.value = 'Image uploaded (stored locally)';
        }
        
        // Save to localStorage
        saveLogoUrl(dataUrl);
        
        alert('Logo uploaded successfully! The logo will appear on all pages immediately.');
    };
    
    reader.onerror = function() {
        alert('Error reading image file. Please try again.');
        if (urlInput) {
            urlInput.disabled = false;
            urlInput.value = '';
        }
        fileInput.value = '';
    };
    
    reader.readAsDataURL(file);
}

function handleLogoUrlInput(url) {
    const preview = document.getElementById('logo-preview');
    if (preview && url && url.trim() !== '' && !url.startsWith('data:') && url !== 'Image uploaded (stored locally)') {
        preview.src = url;
        preview.onerror = function() {
            this.style.display = 'none';
        };
        preview.onload = function() {
            this.style.display = 'block';
        };
    }
}

function saveLogo(event) {
    event.preventDefault();
    
    const urlInput = document.getElementById('logo-url-input');
    const fileInput = document.getElementById('logo-file-upload');
    
    let logoUrl = '';
    
    // Priority: uploaded file > URL input
    if (fileInput.files[0]) {
        // File upload already handled in handleLogoFileUpload
        closeLogoModal();
        return;
    } else if (urlInput && urlInput.value.trim() !== '' && urlInput.value !== 'Image uploaded (stored locally)') {
        logoUrl = urlInput.value.trim();
    } else {
        alert('Please upload an image file or enter an image URL.');
        return;
    }
    
    // Validate URL
    try {
        new URL(logoUrl);
    } catch (e) {
        alert('Please enter a valid image URL.');
        return;
    }
    
    // Save logo
    saveLogoUrl(logoUrl);
    
    alert('Logo saved successfully! The logo will appear on all pages immediately.');
    closeLogoModal();
}

// Social Media Management
function openSocialMediaModal() {
    const modal = document.getElementById('social-media-modal');
    if (!modal) return;
    
    displaySocialMediaList();
    modal.style.display = 'block';
}

function closeSocialMediaModal() {
    const modal = document.getElementById('social-media-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function displaySocialMediaList() {
    const socialMedia = getSocialMedia();
    const listContainer = document.getElementById('social-media-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = socialMedia.map((item, index) => `
        <div class="social-media-item-admin" style="margin-bottom: 1.5rem; padding: 1.5rem; border: 2px solid var(--border-color); border-radius: 0.5rem;">
            <div class="form-group">
                <label>Platform</label>
                <select class="social-platform-select" data-index="${index}" onchange="updateSocialPlatform(${index}, this.value)">
                    <option value="whatsapp" ${item.platform === 'whatsapp' ? 'selected' : ''}>WhatsApp</option>
                    <option value="instagram" ${item.platform === 'instagram' ? 'selected' : ''}>Instagram</option>
                    <option value="facebook" ${item.platform === 'facebook' ? 'selected' : ''}>Facebook</option>
                    <option value="tiktok" ${item.platform === 'tiktok' ? 'selected' : ''}>TikTok</option>
                    <option value="twitter" ${item.platform === 'twitter' ? 'selected' : ''}>Twitter</option>
                    <option value="youtube" ${item.platform === 'youtube' ? 'selected' : ''}>YouTube</option>
                    <option value="linkedin" ${item.platform === 'linkedin' ? 'selected' : ''}>LinkedIn</option>
                    <option value="other" ${!['whatsapp', 'instagram', 'facebook', 'tiktok', 'twitter', 'youtube', 'linkedin'].includes(item.platform) ? 'selected' : ''}>Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Username/Handle</label>
                <input type="text" class="social-username-input" data-index="${index}" value="${item.username}" onchange="updateSocialUsername(${index}, this.value)">
            </div>
            <div class="form-group">
                <label>Link</label>
                <input type="url" class="social-link-input" data-index="${index}" value="${item.link}" onchange="updateSocialLink(${index}, this.value)">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" class="social-enabled-input" data-index="${index}" ${item.enabled ? 'checked' : ''} onchange="updateSocialEnabled(${index}, this.checked)">
                    Enabled (show on website)
                </label>
            </div>
            <button type="button" class="btn btn-danger btn-small" onclick="deleteSocialMedia(${index})">Delete</button>
        </div>
    `).join('');
}

function updateSocialPlatform(index, platform) {
    const socialMedia = getSocialMedia();
    if (socialMedia[index]) {
        socialMedia[index].platform = platform;
        socialMedia[index].name = platform.charAt(0).toUpperCase() + platform.slice(1);
        saveSocialMedia(socialMedia);
        displaySocialMediaList();
    }
}

function updateSocialUsername(index, username) {
    const socialMedia = getSocialMedia();
    if (socialMedia[index]) {
        socialMedia[index].username = username;
        saveSocialMedia(socialMedia);
    }
}

function updateSocialLink(index, link) {
    const socialMedia = getSocialMedia();
    if (socialMedia[index]) {
        socialMedia[index].link = link;
        saveSocialMedia(socialMedia);
    }
}

function updateSocialEnabled(index, enabled) {
    const socialMedia = getSocialMedia();
    if (socialMedia[index]) {
        socialMedia[index].enabled = enabled;
        saveSocialMedia(socialMedia);
    }
}

function deleteSocialMedia(index) {
    if (!confirm('Are you sure you want to delete this social media platform?')) {
        return;
    }
    
    const socialMedia = getSocialMedia();
    socialMedia.splice(index, 1);
    saveSocialMedia(socialMedia);
    displaySocialMediaList();
}

function addNewSocialMedia() {
    const socialMedia = getSocialMedia();
    socialMedia.push({
        platform: 'other',
        name: 'New Platform',
        link: '',
        username: '',
        enabled: true
    });
    saveSocialMedia(socialMedia);
    displaySocialMediaList();
}

// Initialize admin pages
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Check admin authentication first
    checkAdminAuth();
    setupAdminLogin();
    
    // Setup currency selector
    const currencySelector = document.getElementById('currency-selector');
    if (currencySelector) {
        currencySelector.value = getCurrency();
        currencySelector.addEventListener('change', function() {
            setCurrency(this.value);
        });
    }
    
    // Admin Dashboard
    if (currentPage === 'admin.html') {
        updateDashboardStats();
        updateProductAnalytics(); // Initialize analytics on page load
        setupContactForm();
        setupHeroForm();
        setupFooterForm();
        setupAboutForm();
        setupCurrencyRatesForm();
        setupTaxSettingsForm();
        setupPaymentInfoForm();
        updateNotificationCount();
        applyDashboardPermissions();
        
        // Setup product analytics modal close on outside click
        const analyticsModal = document.getElementById('product-analytics-modal');
        if (analyticsModal) {
            window.addEventListener('click', function (event) {
                if (event.target === analyticsModal) {
                    closeProductAnalyticsModal();
                }
            });
        }
        
        // Setup clear data modal close on outside click
        const clearDataModal = document.getElementById('clear-data-modal');
        if (clearDataModal) {
            window.addEventListener('click', function (event) {
                if (event.target === clearDataModal) {
                    closeClearDataModal();
                }
            });
        }
        
        // Setup clear data form Enter key
        const clearDataForm = document.getElementById('clear-data-form');
        if (clearDataForm) {
            const passwordInput = document.getElementById('clear-data-password');
            if (passwordInput) {
                passwordInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        verifyAndClearData();
                    }
                });
            }
        }
        
        // Setup chat admin modal close
        const chatAdminModal = document.getElementById('chat-admin-modal');
        if (chatAdminModal) {
            window.addEventListener('click', function(event) {
                if (event.target === chatAdminModal) {
                    closeChatAdminModal();
                }
            });
        }
        
        // Reload chat conversations when storage changes
        window.addEventListener('storage', function(e) {
            if (e.key === 'chatMessages') {
                const chatAdminModalEl = document.getElementById('chat-admin-modal');
                if (chatAdminModalEl && chatAdminModalEl.style.display !== 'none') {
                    loadChatConversations();
                    if (selectedConversationId) {
                        loadAdminChatMessages(selectedConversationId);
                    }
                }
            }
        });
        
        // Listen for notification updates
        window.addEventListener('adminNotificationsUpdated', function() {
            updateNotificationCount();
            if (document.getElementById('notifications-panel') && 
                document.getElementById('notifications-panel').style.display !== 'none') {
                displayNotifications();
            }
        });
        
        // Check for notifications on page load
        const requests = getPasswordResetRequests();
        const pendingRequests = requests.filter(r => !r.resolved);
        const adminNotifications = getAdminNotifications();
        const unreadNotifications = adminNotifications.filter(n => !n.read);
        if (pendingRequests.length > 0 || unreadNotifications.length > 0) {
            // Auto-show notifications if there are pending requests or unread notifications
            setTimeout(function() {
                showNotifications();
            }, 500);
        }
        
        // Listen for storage changes to update notifications
        window.addEventListener('storage', function(e) {
            if (e.key === 'passwordResetRequests') {
                updateNotificationCount();
                const panel = document.getElementById('notifications-panel');
                if (panel && panel.style.display !== 'none') {
                    displayNotifications();
                }
            }
            // Listen for logo updates
            if (e.key === 'logoUrl') {
                updateLogoOnAllPages();
            }
        });
        
        // Setup close modal button for contact modal
        const contactCloseBtn = document.querySelector('#contact-modal .close');
        if (contactCloseBtn) {
            contactCloseBtn.addEventListener('click', closeContactModal);
        }
        
        // Close contact modal when clicking outside
        const contactModal = document.getElementById('contact-modal');
        if (contactModal) {
            window.addEventListener('click', function(event) {
                if (event.target === contactModal) {
                    closeContactModal();
                }
            });
        }
        
        // Setup close logo modal button
        const logoCloseBtn = document.querySelector('#logo-modal .close');
        if (logoCloseBtn) {
            logoCloseBtn.addEventListener('click', closeLogoModal);
        }
        
        // Close logo modal when clicking outside
        const logoModal = document.getElementById('logo-modal');
        if (logoModal) {
            window.addEventListener('click', function(event) {
                if (event.target === logoModal) {
                    closeLogoModal();
                }
            });
        }
        
        // Setup close social media modal button
        const socialCloseBtn = document.querySelector('#social-media-modal .close');
        if (socialCloseBtn) {
            socialCloseBtn.addEventListener('click', closeSocialMediaModal);
        }
        
        // Close social media modal when clicking outside
        const socialModal = document.getElementById('social-media-modal');
        if (socialModal) {
            window.addEventListener('click', function(event) {
                if (event.target === socialModal) {
                    closeSocialMediaModal();
                }
            });
        }
        
        // Setup close tax settings modal button
        const taxSettingsCloseBtn = document.querySelector('#tax-settings-modal .close');
        if (taxSettingsCloseBtn) {
            taxSettingsCloseBtn.addEventListener('click', closeTaxSettingsModal);
        }
        
        // Close tax settings modal when clicking outside
        const taxSettingsModal = document.getElementById('tax-settings-modal');
        if (taxSettingsModal) {
            window.addEventListener('click', function(event) {
                if (event.target === taxSettingsModal) {
                    closeTaxSettingsModal();
                }
            });
        }
        
        // Setup close currency rates modal button
        const currencyRatesCloseBtn = document.querySelector('#currency-rates-modal .close');
        if (currencyRatesCloseBtn) {
            currencyRatesCloseBtn.addEventListener('click', closeCurrencyRatesModal);
        }
        
        // Close currency rates modal when clicking outside
        const currencyRatesModal = document.getElementById('currency-rates-modal');
        if (currencyRatesModal) {
            window.addEventListener('click', function(event) {
                if (event.target === currencyRatesModal) {
                    closeCurrencyRatesModal();
                }
            });
        }
        
        // Setup close featured products modal button
        const featuredCloseBtn = document.querySelector('#featured-products-modal .close');
        if (featuredCloseBtn) {
            featuredCloseBtn.addEventListener('click', closeFeaturedProductsModal);
        }
        
        // Close featured products modal when clicking outside
        const featuredModal = document.getElementById('featured-products-modal');
        if (featuredModal) {
            window.addEventListener('click', function(event) {
                if (event.target === featuredModal) {
                    closeFeaturedProductsModal();
                }
            });
        }
        
        // Setup close hero modal button
        const heroCloseBtn = document.querySelector('#hero-modal .close');
        if (heroCloseBtn) {
            heroCloseBtn.addEventListener('click', closeHeroModal);
        }
        
        // Close hero modal when clicking outside
        const heroModal = document.getElementById('hero-modal');
        if (heroModal) {
            window.addEventListener('click', function(event) {
                if (event.target === heroModal) {
                    closeHeroModal();
                }
            });
        }
        
        // Setup close slideshow modal button
        const slideshowCloseBtn = document.querySelector('#slideshow-modal .close');
        if (slideshowCloseBtn) {
            slideshowCloseBtn.addEventListener('click', closeSlideshowModal);
        }
        
        // Close slideshow modal when clicking outside
        const slideshowModal = document.getElementById('slideshow-modal');
        if (slideshowModal) {
            window.addEventListener('click', function(event) {
                if (event.target === slideshowModal) {
                    closeSlideshowModal();
                }
            });
        }
        
        // Setup close categories modal button
        const categoriesCloseBtn = document.querySelector('#categories-modal .close');
        if (categoriesCloseBtn) {
            categoriesCloseBtn.addEventListener('click', closeCategoriesModal);
        }
        
        // Close categories modal when clicking outside
        const categoriesModal = document.getElementById('categories-modal');
        if (categoriesModal) {
            window.addEventListener('click', function(event) {
                if (event.target === categoriesModal) {
                    closeCategoriesModal();
                }
            });
        }
        
        // Setup close footer modal button
        const footerCloseBtn = document.querySelector('#footer-modal .close');
        if (footerCloseBtn) {
            footerCloseBtn.addEventListener('click', closeFooterModal);
        }
        
        // Close footer modal when clicking outside
        const footerModal = document.getElementById('footer-modal');
        if (footerModal) {
            window.addEventListener('click', function(event) {
                if (event.target === footerModal) {
                    closeFooterModal();
                }
            });
        }
        
        // Setup close payment info modal button
        const paymentInfoCloseBtn = document.querySelector('#payment-info-modal .close');
        if (paymentInfoCloseBtn) {
            paymentInfoCloseBtn.addEventListener('click', closePaymentInfoModal);
        }
        
        // Close payment info modal when clicking outside
        const paymentInfoModal = document.getElementById('payment-info-modal');
        if (paymentInfoModal) {
            window.addEventListener('click', function(event) {
                if (event.target === paymentInfoModal) {
                    closePaymentInfoModal();
                }
            });
        }
        
        // Setup User Guide Admin event listeners
        setupUserGuideAdminEventListeners();
        
        // Setup Rules and Policies Admin event listeners
        setupRulesPoliciesAdminEventListeners();
    }
    
    // Admin Products Page
    if (currentPage === 'admin-products.html') {
        displayAdminProducts();
        setupProductForm();
        
        // Populate category dropdown on page load (in case modal was already opened)
        if (typeof populateCategoryDropdown === 'function') {
            populateCategoryDropdown('product-category');
        }
        
        // Setup add product button
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', function() {
                openProductModal();
            });
        }
        
        // Setup close modal button
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        
        // Close modal when clicking outside
        const modal = document.getElementById('product-modal');
        if (modal) {
            window.addEventListener('click', function(event) {
                if (event.target === modal) {
                    closeModal();
                }
            });
        }
    }
    
    // Admin Users Page
    if (currentPage === 'admin-users.html') {
        displayUsers();
    }
    
    // Admin Orders Page
    if (currentPage === 'admin-orders.html') {
        displayOrders();
        
        // Setup close order details modal button
        const orderCloseBtn = document.querySelector('#order-details-modal .close');
        if (orderCloseBtn) {
            orderCloseBtn.addEventListener('click', closeOrderDetailsModal);
        }
        
        // Close order details modal when clicking outside
        const orderModal = document.getElementById('order-details-modal');
        if (orderModal) {
            window.addEventListener('click', function(event) {
                if (event.target === orderModal) {
                    closeOrderDetailsModal();
                }
            });
        }
    }
});

// Order Display Functions
function displayOrders() {
    const orders = getOrders();
    const tableBody = document.getElementById('orders-table-body');
    const totalOrdersEl = document.getElementById('total-orders-count');
    
    if (!tableBody) return;
    
    // Filter orders by search term if present
    const searchInput = document.getElementById('orders-search-input');
    let filteredOrders = orders;
    
    if (searchInput && searchInput.value.trim() !== '') {
        const searchTerm = searchInput.value.trim().toLowerCase();
        filteredOrders = orders.filter(order => 
            order.customerName.toLowerCase().includes(searchTerm) ||
            order.customerMobile.toLowerCase().includes(searchTerm)
        );
    }
    
    if (totalOrdersEl) totalOrdersEl.textContent = filteredOrders.length;
    
    if (filteredOrders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem;">No orders found.</td></tr>';
        return;
    }
    
    // Sort orders by date (newest first)
    const sortedOrders = [...filteredOrders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    tableBody.innerHTML = sortedOrders.map(order => {
        const orderDate = new Date(order.orderDate);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const statusClass = order.status === 'pending' ? 'status-pending' : 
                           order.status === 'processing' ? 'status-processing' : 
                           order.status === 'completed' ? 'status-completed' : 'status-cancelled';
        
        return `
            <tr>
                <td>#${order.id}</td>
                <td>
                    <div><strong>${order.customerName}</strong></div>
                    <div style="font-size: 0.875rem; color: var(--text-light);">${order.customerMobile}</div>
                </td>
                <td>
                    <div>${order.items.length} item(s)</div>
                    <div style="font-size: 0.875rem; color: var(--text-light);">${order.items[0]?.name || 'N/A'}${order.items.length > 1 ? ' +' + (order.items.length - 1) : ''}</div>
                </td>
                <td>
                    <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${order.deliveryAddress}">
                        ${order.deliveryAddress || 'N/A'}
                    </div>
                </td>
                <td style="font-family: monospace; font-size: 0.875rem;">${order.transactionId}</td>
                <td><strong>${formatPrice(order.total)}</strong></td>
                <td>
                    <span class="status-badge ${statusClass}">${order.status}</span>
                </td>
                <td style="font-size: 0.875rem;">${formattedDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-small" onclick="viewOrderDetails(${order.id})">View</button>
                        <button class="btn btn-danger btn-small" onclick="deleteOrder(${order.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function viewOrderDetails(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        alert('Order not found!');
        return;
    }
    
    const modal = document.getElementById('order-details-modal');
    const contentEl = document.getElementById('order-details-content');
    
    if (!modal || !contentEl) return;
    
    const orderDate = new Date(order.orderDate);
    const formattedDate = orderDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const statusClass = order.status === 'pending' ? 'status-pending' : 
                       order.status === 'processing' ? 'status-processing' : 
                       order.status === 'completed' ? 'status-completed' : 'status-cancelled';
    
    contentEl.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="margin: 0;">Order #${order.id}</h3>
                <span class="status-badge ${statusClass}">${order.status}</span>
            </div>
            
            <div class="form-group">
                <label><strong>Order Date:</strong></label>
                <p>${formattedDate}</p>
            </div>
            
            <div class="form-group">
                <label><strong>Customer Information:</strong></label>
                <p>Name: ${order.customerName}</p>
                <p>Mobile: ${order.customerMobile}</p>
            </div>
            
            <div class="form-group">
                <label><strong>Delivery Address:</strong></label>
                <p>${order.deliveryAddress}</p>
            </div>
            
            <div class="form-group">
                <label><strong>Transaction ID:</strong></label>
                <p style="font-family: monospace; font-size: 1.1rem;">${order.transactionId}</p>
            </div>
            
            <div class="form-group">
                <label><strong>Ordered Items (${order.items.length}):</strong></label>
                <table style="width: 100%; border-collapse: collapse; margin-top: 0.5rem;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--border-color);">
                            <th style="padding: 0.5rem; text-align: left;">Item</th>
                            ${order.items.some(item => item.color) ? '<th style="padding: 0.5rem; text-align: center;">Color</th>' : ''}
                            <th style="padding: 0.5rem; text-align: center;">Qty</th>
                            <th style="padding: 0.5rem; text-align: right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 0.5rem;">${item.name}</td>
                                ${order.items.some(i => i.color) ? `<td style="padding: 0.5rem; text-align: center; color: ${item.color ? 'var(--primary-color)' : 'var(--text-light)'};">${item.color || '-'}</td>` : ''}
                                <td style="padding: 0.5rem; text-align: center;">${item.quantity}</td>
                                <td style="padding: 0.5rem; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div style="background-color: var(--bg-color); padding: 1.5rem; border-radius: 0.5rem; margin-top: 1.5rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Subtotal:</span>
                    <strong>${formatPrice(order.subtotal)}</strong>
                </div>
                ${order.tax > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Tax:</span>
                    <strong>${formatPrice(order.tax)}</strong>
                </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; font-size: 1.2rem; margin-top: 1rem; padding-top: 1rem; border-top: 2px solid var(--border-color);">
                    <span><strong>Total:</strong></span>
                    <strong style="color: var(--primary-color);">${formatPrice(order.total)}</strong>
                </div>
            </div>
            
            <div class="form-group">
                <label><strong>Admin Notes:</strong></label>
                <textarea id="order-notes-input" rows="4" placeholder="Add notes about this order (delivery info, customer communication, etc.)">${order.notes || ''}</textarea>
            </div>
            
            <div class="form-actions" style="margin-top: 2rem;">
                ${order.status === 'pending' ? `
                    <button type="button" class="btn btn-success btn-small" onclick="approveOrder(${order.id})">✓ Approve</button>
                    <button type="button" class="btn btn-warning btn-small" onclick="rejectOrder(${order.id})">✗ Reject</button>
                ` : ''}
                ${order.status === 'processing' ? `
                    <button type="button" class="btn btn-success btn-small" onclick="completeOrder(${order.id})">✓ Complete</button>
                    <button type="button" class="btn btn-warning btn-small" onclick="rejectOrder(${order.id})">✗ Cancel</button>
                ` : ''}
                <button type="button" class="btn btn-primary btn-small" onclick="saveOrderNotes(${order.id})">Save Notes</button>
                <button type="button" class="btn btn-secondary btn-small" onclick="closeOrderDetailsModal()">Close</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function closeOrderDetailsModal() {
    const modal = document.getElementById('order-details-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function approveOrder(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        alert('Order not found!');
        return;
    }
    
    if (confirm(`Approve order #${orderId}? This will mark it as processing.`)) {
        order.status = 'processing';
        saveOrders(orders);
        displayOrders();
        closeOrderDetailsModal();
        alert('Order approved successfully!');
    }
}

function completeOrder(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        alert('Order not found!');
        return;
    }
    
    if (confirm(`Mark order #${orderId} as completed?`)) {
        order.status = 'completed';
        saveOrders(orders);
        displayOrders();
        closeOrderDetailsModal();
        alert('Order marked as completed!');
    }
}

function rejectOrder(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        alert('Order not found!');
        return;
    }
    
    if (confirm(`Reject order #${orderId}? This will mark it as cancelled.`)) {
        order.status = 'cancelled';
        saveOrders(orders);
        displayOrders();
        closeOrderDetailsModal();
        alert('Order rejected.');
    }
}

function saveOrderNotes(orderId) {
    const notesInput = document.getElementById('order-notes-input');
    if (!notesInput) return;
    
    const notes = notesInput.value.trim();
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        alert('Order not found!');
        return;
    }
    
    order.notes = notes;
    saveOrders(orders);
    alert('Notes saved successfully!');
}

function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) {
        return;
    }
    
    const orders = getOrders();
    const filteredOrders = orders.filter(o => o.id !== orderId);
    saveOrders(filteredOrders);
    displayOrders();
    updateDashboardStats();
    alert('Order deleted successfully!');
}

// Filter Orders Function
function filterOrders() {
    displayOrders();
}

// Clear Orders Search Function
function clearOrdersSearch() {
    const searchInput = document.getElementById('orders-search-input');
    if (searchInput) {
        searchInput.value = '';
        displayOrders();
    }
}

// Categories Management Functions
function openCategoriesModal() {
    const modal = document.getElementById('categories-modal');
    if (!modal) return;
    
    displayCategoriesList();
    modal.style.display = 'block';
}

function closeCategoriesModal() {
    const modal = document.getElementById('categories-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function displayCategoriesList() {
    const categories = getCategories();
    const listContainer = document.getElementById('categories-list');
    if (!listContainer) return;
    
    if (categories.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: var(--text-light);">No categories found. Click "Add New Category" to create one.</p>';
        return;
    }
    
    listContainer.innerHTML = categories.map((category, index) => `
        <div class="social-media-item-admin" style="margin-bottom: 1.5rem; padding: 1.5rem; border: 2px solid var(--border-color); border-radius: 0.5rem;">
            <div class="form-group">
                <label>Category Name</label>
                <input type="text" class="category-name-input" data-index="${index}" value="${category.name}" onchange="updateCategoryName(${index}, this.value)">
            </div>
            <div class="form-group">
                <label>Slug (URL-friendly)</label>
                <input type="text" class="category-slug-input" data-index="${index}" value="${category.slug}" onchange="updateCategorySlug(${index}, this.value)">
                <small>Lowercase letters and hyphens only (e.g., smartphones, gaming-pcs)</small>
            </div>
            <div class="form-group">
                <label>Icon</label>
                <input type="text" class="category-icon-input" data-index="${index}" value="${category.icon}" maxlength="2" placeholder="📱" onchange="updateCategoryIcon(${index}, this.value)">
                <small>Enter an emoji to represent this category</small>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" class="category-enabled-input" data-index="${index}" ${category.enabled ? 'checked' : ''} onchange="updateCategoryEnabled(${index}, this.checked)">
                    Enabled (show on website)
                </label>
            </div>
            <button type="button" class="btn btn-danger btn-small" onclick="deleteCategory(${index})">Delete</button>
        </div>
    `).join('');
}

function updateCategoryName(index, name) {
    const categories = getCategories();
    if (categories[index]) {
        categories[index].name = name;
        saveCategories(categories);
        displayCategoriesList();
    }
}

function updateCategorySlug(index, slug) {
    const categories = getCategories();
    if (categories[index]) {
        categories[index].slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '');
        saveCategories(categories);
        displayCategoriesList();
    }
}

function updateCategoryIcon(index, icon) {
    const categories = getCategories();
    if (categories[index]) {
        categories[index].icon = icon;
        saveCategories(categories);
    }
}

function updateCategoryEnabled(index, enabled) {
    const categories = getCategories();
    if (categories[index]) {
        categories[index].enabled = enabled;
        saveCategories(categories);
    }
}

function deleteCategory(index) {
    if (!confirm('Are you sure you want to delete this category? This will not remove products in this category.')) {
        return;
    }
    
    const categories = getCategories();
    categories.splice(index, 1);
    saveCategories(categories);
    displayCategoriesList();
    alert('Category deleted successfully!');
}

function addNewCategory() {
    const categories = getCategories();
    const newCategory = {
        id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
        name: 'New Category',
        slug: 'new-category',
        icon: '📦',
        enabled: true
    };
    categories.push(newCategory);
    saveCategories(categories);
    displayCategoriesList();
}

// Footer Management Functions
function openFooterModal() {
    const modal = document.getElementById('footer-modal');
    if (!modal) return;
    
    // Load current footer content
    const footer = getFooterContent();
    document.getElementById('footer-brand-title-input').value = footer.brandTitle;
    document.getElementById('footer-brand-description-input').value = footer.brandDescription;
    document.getElementById('footer-contact-email-input').value = footer.contactEmail;
    document.getElementById('footer-contact-phone-input').value = footer.contactPhone;
    document.getElementById('footer-copyright-input').value = footer.copyright;
    
    modal.style.display = 'block';
}

function closeFooterModal() {
    const modal = document.getElementById('footer-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function setupFooterForm() {
    const form = document.getElementById('footer-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const footerContent = {
            brandTitle: document.getElementById('footer-brand-title-input').value,
            brandDescription: document.getElementById('footer-brand-description-input').value,
            contactEmail: document.getElementById('footer-contact-email-input').value,
            contactPhone: document.getElementById('footer-contact-phone-input').value,
            copyright: document.getElementById('footer-copyright-input').value
        };
        
        saveFooterContent(footerContent);
        closeFooterModal();
        alert('Footer updated successfully! Changes will be visible on all client pages.');
    });
}

// User Management Functions
function displayUsers() {
    const users = getUsers();
    const tableBody = document.getElementById('users-table-body');
    const totalUsersEl = document.getElementById('total-users-count');
    
    if (totalUsersEl) {
        totalUsersEl.textContent = users.length;
    }
    
    if (!tableBody) return;
    
    if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No users registered yet.</td></tr>';
        return;
    }
    
    tableBody.innerHTML = users.map(user => {
        const registeredDate = new Date(user.createdAt);
        const formattedDate = registeredDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        return `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>${formattedDate}</td>
                <td>${user.orders ? user.orders.length : 0}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-small" onclick="viewUserDetails(${user.id})">View</button>
                        <button class="btn btn-warning btn-small" onclick="openResetPasswordModal(${user.id})" style="background-color: var(--warning-color);">Reset Password</button>
                        <button class="btn btn-danger btn-small" onclick="deleteUser(${user.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function viewUserDetails(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        alert('User not found!');
        return;
    }
    
    const registeredDate = new Date(user.createdAt);
    const formattedDate = registeredDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const details = `
User Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID: ${user.id}
Name: ${user.name}
Email: ${user.email}
Phone: ${user.phone || 'Not provided'}
Registered: ${formattedDate}
Total Orders: ${user.orders ? user.orders.length : 0}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;
    
    alert(details);
}

function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone!')) {
        return;
    }
    
    const users = getUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    saveUsers(filteredUsers);
    displayUsers();
    alert('User deleted successfully!');
}

function openResetPasswordModal(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        alert('User not found!');
        return;
    }
    
    const newPassword = prompt(`Reset password for ${user.name} (${user.email})\n\nEnter new password (minimum 6 characters):`, '');
    
    if (newPassword === null) {
        return; // User cancelled
    }
    
    if (!newPassword || newPassword.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
    }
    
    const result = resetUserPassword(userId, newPassword);
    
    if (result.success) {
        alert(`Password reset successfully for ${user.name}.\nNew password: ${newPassword}`);
    } else {
        alert(result.message);
    }
}

// User Guide Admin Management Functions
function openUserGuideAdminModal() {
    const modal = document.getElementById('user-guide-admin-modal');
    if (modal) {
        modal.style.display = 'block';
        displayUserGuideAdminList();
    }
}

function closeUserGuideAdminModal() {
    const modal = document.getElementById('user-guide-admin-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function displayUserGuideAdminList() {
    const items = getUserGuideItems();
    const listContainer = document.getElementById('user-guide-admin-list');
    
    if (!listContainer) return;
    
    if (items.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-light);">No user guide items yet. Add your first item!</p>';
        return;
    }
    
    listContainer.innerHTML = items.map((item, index) => `
        <div class="user-guide-admin-item" style="margin-bottom: 1.5rem; padding: 1.5rem; border: 2px solid var(--border-color); border-radius: 0.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                        <span style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">${index + 1}</span>
                        <h3 style="margin: 0; font-size: 1.25rem; color: var(--text-dark);">${item.title}</h3>
                    </div>
                    <p style="margin: 0; color: var(--text-light);">${item.description}</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-primary btn-small" onclick="editUserGuideItem(${item.id})">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteUserGuideItem(${item.id})">Delete</button>
                </div>
            </div>
            ${item.imageUrl ? `
                <div style="margin-top: 1rem;">
                    <img src="${item.imageUrl}" alt="${item.title}" style="width: 100%; max-width: 600px; border-radius: 0.5rem; max-height: 300px; object-fit: contain;" onerror="this.src='https://via.placeholder.com/600x300'">
                </div>
            ` : ''}
        </div>
    `).join('');
}

function addNewUserGuideItem() {
    const title = prompt('Enter guide item title:');
    if (!title) return;
    
    const description = prompt('Enter guide item description:');
    if (!description) return;
    
    const imageUrl = prompt('Enter image URL (optional):') || '';
    
    const items = getUserGuideItems();
    const newItem = {
        id: Date.now(),
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        order: items.length + 1
    };
    
    items.push(newItem);
    saveUserGuideItems(items);
    displayUserGuideAdminList();
    alert('User guide item added successfully!');
}

function editUserGuideItem(itemId) {
    const items = getUserGuideItems();
    const item = items.find(i => i.id === itemId);
    
    if (!item) {
        alert('Item not found!');
        return;
    }
    
    const title = prompt('Enter guide item title:', item.title);
    if (title === null || !title) return;
    
    const description = prompt('Enter guide item description:', item.description);
    if (description === null || !description) return;
    
    const imageUrl = prompt('Enter image URL (optional):', item.imageUrl) || '';
    
    item.title = title.trim();
    item.description = description.trim();
    item.imageUrl = imageUrl.trim();
    
    saveUserGuideItems(items);
    displayUserGuideAdminList();
    alert('User guide item updated successfully!');
}

function deleteUserGuideItem(itemId) {
    if (!confirm('Are you sure you want to delete this guide item?')) {
        return;
    }
    
    const items = getUserGuideItems();
    const filteredItems = items.filter(i => i.id !== itemId);
    saveUserGuideItems(filteredItems);
    displayUserGuideAdminList();
    alert('User guide item deleted successfully!');
}

// Setup event listeners for User Guide Admin Modal
function setupUserGuideAdminEventListeners() {
    const userGuideAdminModal = document.getElementById('user-guide-admin-modal');
    if (userGuideAdminModal) {
        window.addEventListener('click', function(event) {
            if (event.target === userGuideAdminModal) {
                closeUserGuideAdminModal();
            }
        });
    }
}

// Rules and Policies Admin Management Functions
function openRulesPoliciesAdminModal() {
    const modal = document.getElementById('rules-policies-admin-modal');
    if (modal) {
        modal.style.display = 'block';
        displayRulesPoliciesAdminList();
    }
}

function closeRulesPoliciesAdminModal() {
    const modal = document.getElementById('rules-policies-admin-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function displayRulesPoliciesAdminList() {
    const items = getRulesPoliciesItems();
    const listContainer = document.getElementById('rules-policies-admin-list');
    
    if (!listContainer) return;
    
    if (items.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-light);">No rules and policies items yet. Add your first item!</p>';
        return;
    }
    
    listContainer.innerHTML = items.map((item, index) => `
        <div class="rules-policies-admin-item" style="margin-bottom: 1.5rem; padding: 1.5rem; border: 2px solid var(--border-color); border-radius: 0.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                        <span style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">${index + 1}</span>
                        <h3 style="margin: 0; font-size: 1.25rem; color: var(--text-dark);">${item.title}</h3>
                    </div>
                    <p style="margin: 0; color: var(--text-light); white-space: pre-line;">${item.description}</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-primary btn-small" onclick="editRulesPoliciesItem(${item.id})">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteRulesPoliciesItem(${item.id})">Delete</button>
                </div>
            </div>
            ${item.imageUrl ? `
                <div style="margin-top: 1rem;">
                    <img src="${item.imageUrl}" alt="${item.title}" style="width: 100%; max-width: 600px; border-radius: 0.5rem; max-height: 300px; object-fit: contain;" onerror="this.src='https://via.placeholder.com/600x300'">
                </div>
            ` : ''}
        </div>
    `).join('');
}

function addNewRulesPoliciesItem() {
    const title = prompt('Enter policy/rules item title:');
    if (!title) return;
    
    const description = prompt('Enter policy/rules item description (you can use line breaks):');
    if (!description) return;
    
    const imageUrl = prompt('Enter image URL (optional):') || '';
    
    const items = getRulesPoliciesItems();
    const newItem = {
        id: Date.now(),
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        order: items.length + 1
    };
    
    items.push(newItem);
    saveRulesPoliciesItems(items);
    displayRulesPoliciesAdminList();
    alert('Rules & Policies item added successfully!');
}

function editRulesPoliciesItem(itemId) {
    const items = getRulesPoliciesItems();
    const item = items.find(i => i.id === itemId);
    
    if (!item) {
        alert('Item not found!');
        return;
    }
    
    const title = prompt('Enter policy/rules item title:', item.title);
    if (title === null || !title) return;
    
    const description = prompt('Enter policy/rules item description:', item.description);
    if (description === null || !description) return;
    
    const imageUrl = prompt('Enter image URL (optional):', item.imageUrl) || '';
    
    item.title = title.trim();
    item.description = description.trim();
    item.imageUrl = imageUrl.trim();
    
    saveRulesPoliciesItems(items);
    displayRulesPoliciesAdminList();
    alert('Rules & Policies item updated successfully!');
}

function deleteRulesPoliciesItem(itemId) {
    if (!confirm('Are you sure you want to delete this policy item?')) {
        return;
    }
    
    const items = getRulesPoliciesItems();
    const filteredItems = items.filter(i => i.id !== itemId);
    saveRulesPoliciesItems(filteredItems);
    displayRulesPoliciesAdminList();
    alert('Rules & Policies item deleted successfully!');
}

// Setup event listeners for Rules and Policies Admin Modal
function setupRulesPoliciesAdminEventListeners() {
    const rulesPoliciesAdminModal = document.getElementById('rules-policies-admin-modal');
    if (rulesPoliciesAdminModal) {
        window.addEventListener('click', function(event) {
            if (event.target === rulesPoliciesAdminModal) {
                closeRulesPoliciesAdminModal();
            }
        });
    }
}

// About Us Management
function openAboutModal() {
    const modal = document.getElementById('about-modal');
    if (!modal) return;
    
    const aboutContent = getAboutContent();
    
    // Populate form with current values
    document.getElementById('about-title').value = aboutContent.title || '';
    document.getElementById('about-text').value = aboutContent.text || '';
    document.getElementById('about-image').value = aboutContent.imageUrl || '';
    
    modal.style.display = 'block';
}

function closeAboutModal() {
    const modal = document.getElementById('about-modal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('about-form').reset();
    }
}

function setupAboutForm() {
    const form = document.getElementById('about-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const aboutContent = {
            title: document.getElementById('about-title').value.trim(),
            text: document.getElementById('about-text').value.trim(),
            imageUrl: document.getElementById('about-image').value.trim()
        };
        
        if (!aboutContent.title || !aboutContent.text) {
            alert('Please fill in the required fields.');
            return;
        }
        
        saveAboutContent(aboutContent);
        
        alert('About Us content updated successfully!');
        closeAboutModal();
        
        // Trigger refresh on client-side if possible
        window.dispatchEvent(new Event('storage'));
    });
}

// Admin Login Authentication
function checkAdminAuth() {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) {
        // Hide admin content and show login modal
        const adminContent = document.getElementById('admin-content');
        const loginModal = document.getElementById('admin-login-modal');
        const navbar = document.querySelector('.navbar');
        
        if (adminContent) adminContent.style.display = 'none';
        if (loginModal) loginModal.style.display = 'block';
        if (navbar) navbar.style.display = 'none';
    } else {
        // Show admin content and hide login modal
        const adminContent = document.getElementById('admin-content');
        const loginModal = document.getElementById('admin-login-modal');
        const navbar = document.querySelector('.navbar');
        
        if (adminContent) adminContent.style.display = 'block';
        if (loginModal) loginModal.style.display = 'none';
        if (navbar) navbar.style.display = 'flex';
    }
}

function setupAdminLogin() {
    const form = document.getElementById('admin-login-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('admin-email').value.trim();
        const password = document.getElementById('admin-password').value;

        // Main admin credentials
        const ADMIN_EMAIL = 'abintwarighislain@gmail.com';
        const ADMIN_PASSWORD = 'Possible123@Ghislain';

        let authenticated = false;
        let adminType = 'main';

        // Check main admin credentials
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            authenticated = true;
            adminType = 'main';
        } else {
            // Check sub-admin credentials
            const subAdminResult = authenticateSubAdmin(email, password);
            if (subAdminResult.success) {
                authenticated = true;
                adminType = 'sub';
                sessionStorage.setItem('currentAdmin', JSON.stringify(subAdminResult.admin));
            }
        }

        if (authenticated) {
            // Authentication successful
            sessionStorage.setItem('adminAuthenticated', 'true');
            sessionStorage.setItem('adminType', adminType);
            
            // Hide login modal and show admin content
            const loginModal = document.getElementById('admin-login-modal');
            const adminContent = document.getElementById('admin-content');
            const navbar = document.querySelector('.navbar');
            
            if (loginModal) loginModal.style.display = 'none';
            if (adminContent) adminContent.style.display = 'block';
            if (navbar) navbar.style.display = 'flex';
            
            // Apply permissions to dashboard buttons
            applyDashboardPermissions();
            
            // Trigger any initialization needed
            if (typeof updateDashboardStats === 'function') {
                updateDashboardStats();
            }
        } else {
            alert('Invalid email or password. Please try again.');
        }
    });
}

// Product Analytics Functions
function openProductAnalyticsModal() {
    const modal = document.getElementById('product-analytics-modal');
    if (modal) {
        modal.style.display = 'block';
        updateProductAnalytics();
    }
}

function closeProductAnalyticsModal() {
    const modal = document.getElementById('product-analytics-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function calculateProductAnalytics() {
    const products = getProducts();
    const categories = getCategories();
    
    // Calculate total products
    const totalProducts = products.length;
    
    // Calculate products by category
    const productsByCategory = {};
    categories.forEach(category => {
        productsByCategory[category.name] = products.filter(p => p.category === category.name).length;
    });
    
    // Also count products with categories not in the categories list
    products.forEach(product => {
        if (product.category && !categories.find(c => c.name === product.category)) {
            if (!productsByCategory[product.category]) {
                productsByCategory[product.category] = 0;
            }
            productsByCategory[product.category]++;
        }
    });
    
    // Calculate stock statistics
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const lowStockProducts = products.filter(p => (p.stock || 0) <= 10 && (p.stock || 0) > 0);
    const outOfStockProducts = products.filter(p => (p.stock || 0) === 0);
    const inStockProducts = products.filter(p => (p.stock || 0) > 0);
    
    // Calculate products with discounts
    const discountedProducts = products.filter(p => (p.discount || 0) > 0);
    
    // Calculate price statistics
    const prices = products.map(p => {
        const discount = p.discount || 0;
        const originalPrice = p.price || 0;
        return discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;
    }).filter(p => p > 0);
    
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const avgPrice = prices.length > 0 ? prices.reduce((sum, p) => sum + p, 0) / prices.length : 0;
    
    // Calculate price ranges
    const priceRanges = {
        '0 - 100,000': products.filter(p => {
            const discount = p.discount || 0;
            const price = discount > 0 ? (p.price || 0) * (1 - discount / 100) : (p.price || 0);
            return price >= 0 && price <= 100000;
        }).length,
        '100,001 - 500,000': products.filter(p => {
            const discount = p.discount || 0;
            const price = discount > 0 ? (p.price || 0) * (1 - discount / 100) : (p.price || 0);
            return price > 100000 && price <= 500000;
        }).length,
        '500,001 - 1,000,000': products.filter(p => {
            const discount = p.discount || 0;
            const price = discount > 0 ? (p.price || 0) * (1 - discount / 100) : (p.price || 0);
            return price > 500000 && price <= 1000000;
        }).length,
        '1,000,001 - 5,000,000': products.filter(p => {
            const discount = p.discount || 0;
            const price = discount > 0 ? (p.price || 0) * (1 - discount / 100) : (p.price || 0);
            return price > 1000000 && price <= 5000000;
        }).length,
        '5,000,001+': products.filter(p => {
            const discount = p.discount || 0;
            const price = discount > 0 ? (p.price || 0) * (1 - discount / 100) : (p.price || 0);
            return price > 5000000;
        }).length
    };
    
    return {
        totalProducts,
        productsByCategory,
        totalStock,
        lowStockProducts: lowStockProducts.length,
        outOfStockProducts: outOfStockProducts.length,
        inStockProducts: inStockProducts.length,
        discountedProducts: discountedProducts.length,
        priceRanges,
        minPrice,
        maxPrice,
        avgPrice
    };
}

function updateProductAnalytics() {
    const analytics = calculateProductAnalytics();
    const content = document.getElementById('analytics-content');
    if (!content) return;
    
    // Sort categories by product count (descending)
    const sortedCategories = Object.entries(analytics.productsByCategory)
        .sort((a, b) => b[1] - a[1]);
    
    content.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 1.5rem; border-radius: 0.75rem; box-shadow: var(--shadow-lg);">
                <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">${analytics.totalProducts}</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">Total Products</div>
            </div>
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 1.5rem; border-radius: 0.75rem; box-shadow: var(--shadow-lg);">
                <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">${analytics.inStockProducts}</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">In Stock Products</div>
            </div>
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 1.5rem; border-radius: 0.75rem; box-shadow: var(--shadow-lg);">
                <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">${analytics.lowStockProducts}</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">Low Stock (≤10)</div>
            </div>
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 1.5rem; border-radius: 0.75rem; box-shadow: var(--shadow-lg);">
                <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">${analytics.outOfStockProducts}</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">Out of Stock</div>
            </div>
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 1.5rem; border-radius: 0.75rem; box-shadow: var(--shadow-lg);">
                <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">${analytics.discountedProducts}</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">Discounted Products</div>
            </div>
            <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 1.5rem; border-radius: 0.75rem; box-shadow: var(--shadow-lg);">
                <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">${analytics.totalStock}</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">Total Stock Units</div>
            </div>
        </div>
        
        <div style="background-color: var(--white); border-radius: 0.75rem; padding: 1.5rem; box-shadow: var(--shadow); margin-bottom: 1.5rem;">
            <h3 style="margin: 0 0 1.5rem 0; color: var(--text-dark); display: flex; align-items: center; gap: 0.5rem;">
                <span>📦</span>
                <span>Products by Category</span>
            </h3>
            ${sortedCategories.length === 0 ? 
                '<p style="text-align: center; padding: 2rem; color: var(--text-light);">No categories found.</p>' :
                `
                <div style="display: grid; gap: 1rem;">
                    ${sortedCategories.map(([categoryName, count]) => {
                        const percentage = analytics.totalProducts > 0 ? ((count / analytics.totalProducts) * 100).toFixed(1) : 0;
                        return `
                            <div style="border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 1rem; background-color: #f8fafc;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <h4 style="margin: 0; color: var(--text-dark); font-size: 1rem; font-weight: 600;">${categoryName}</h4>
                                    <div style="display: flex; align-items: center; gap: 1rem;">
                                        <span style="color: var(--text-light); font-size: 0.9rem;">${percentage}%</span>
                                        <span style="background-color: var(--primary-color); color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.9rem; font-weight: 600; min-width: 50px; text-align: center;">${count}</span>
                                    </div>
                                </div>
                                <div style="background-color: #e2e8f0; border-radius: 0.25rem; height: 8px; overflow: hidden;">
                                    <div style="background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-dark) 100%); height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                `
            }
        </div>
        
        <div style="background-color: var(--white); border-radius: 0.75rem; padding: 1.5rem; box-shadow: var(--shadow);">
            <h3 style="margin: 0 0 1.5rem 0; color: var(--text-dark); display: flex; align-items: center; gap: 0.5rem;">
                <span>💰</span>
                <span>Price Statistics</span>
            </h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div style="border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 1rem; background-color: #f8fafc;">
                    <p style="margin: 0 0 0.5rem 0; color: var(--text-light); font-size: 0.85rem;">Minimum Price</p>
                    <p style="margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--primary-color);">${analytics.minPrice > 0 ? formatPrice(analytics.minPrice) : 'N/A'}</p>
                </div>
                <div style="border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 1rem; background-color: #f8fafc;">
                    <p style="margin: 0 0 0.5rem 0; color: var(--text-light); font-size: 0.85rem;">Maximum Price</p>
                    <p style="margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--primary-color);">${analytics.maxPrice > 0 ? formatPrice(analytics.maxPrice) : 'N/A'}</p>
                </div>
                <div style="border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 1rem; background-color: #f8fafc;">
                    <p style="margin: 0 0 0.5rem 0; color: var(--text-light); font-size: 0.85rem;">Average Price</p>
                    <p style="margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--primary-color);">${analytics.avgPrice > 0 ? formatPrice(analytics.avgPrice) : 'N/A'}</p>
                </div>
            </div>
            
            <div>
                <h4 style="margin: 0 0 1rem 0; color: var(--text-dark); font-size: 0.95rem; font-weight: 600;">Products by Price Range</h4>
                <div style="display: grid; gap: 0.75rem;">
                    ${Object.entries(analytics.priceRanges).map(([range, count]) => {
                        const percentage = analytics.totalProducts > 0 ? ((count / analytics.totalProducts) * 100).toFixed(1) : 0;
                        return `
                            <div style="border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 1rem; background-color: #f8fafc;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <span style="color: var(--text-dark); font-size: 0.9rem; font-weight: 600;">${range} RWF</span>
                                    <div style="display: flex; align-items: center; gap: 1rem;">
                                        <span style="color: var(--text-light); font-size: 0.85rem;">${percentage}%</span>
                                        <span style="background-color: var(--primary-color); color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.85rem; font-weight: 600; min-width: 45px; text-align: center;">${count}</span>
                                    </div>
                                </div>
                                <div style="background-color: #e2e8f0; border-radius: 0.25rem; height: 6px; overflow: hidden;">
                                    <div style="background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-dark) 100%); height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

// Admin Logout Function
function logoutAdmin() {
    // Clear authentication
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('currentAdmin');
    
    // Redirect to admin login page
    window.location.href = 'admin.html';
}

// Sub-Admins Management Functions
function openSubAdminsModal() {
    const modal = document.getElementById('sub-admins-modal');
    if (modal) {
        modal.style.display = 'block';
        displaySubAdminsList();
        cancelSubAdminForm();
    }
}

function closeSubAdminsModal() {
    const modal = document.getElementById('sub-admins-modal');
    if (modal) {
        modal.style.display = 'none';
        cancelSubAdminForm();
    }
}

function displaySubAdminsList() {
    const subAdmins = getSubAdmins();
    const listContainer = document.getElementById('sub-admins-list');
    
    if (!listContainer) return;
    
    if (subAdmins.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">No sub-admins added yet. Click "Add New Sub-Admin" to create one.</p>';
        return;
    }
    
    const availablePermissions = getAvailablePermissions();
    
    listContainer.innerHTML = subAdmins.map(admin => {
        const createdDate = new Date(admin.createdAt);
        const formattedDate = createdDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const permissions = admin.permissions || [];
        const permissionsList = permissions.length > 0 
            ? permissions.map(permId => {
                const perm = availablePermissions.find(p => p.id === permId);
                return perm ? perm.name : permId;
            }).join(', ')
            : 'No permissions assigned';
        
        return `
            <div style="border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 1.5rem; margin-bottom: 1rem; background-color: ${admin.isActive ? 'var(--white)' : '#f8f9fa'};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                    <div style="flex: 1; min-width: 200px;">
                        <h4 style="margin: 0 0 0.5rem 0; color: var(--text-dark);">${admin.email}</h4>
                        <p style="margin: 0; color: var(--text-light); font-size: 0.9rem;">Created: ${formattedDate}</p>
                        <div style="margin-top: 0.5rem;">
                            <span style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.85rem; font-weight: 600; background-color: ${admin.isActive ? '#10b981' : '#ef4444'}; color: white;">
                                ${admin.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color);">
                            <p style="margin: 0 0 0.25rem 0; color: var(--text-dark); font-size: 0.85rem; font-weight: 600;">Permissions (${permissions.length}):</p>
                            <p style="margin: 0; color: var(--text-light); font-size: 0.85rem; line-height: 1.4;">${permissionsList}</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button class="btn btn-primary btn-small" onclick="editSubAdmin(${admin.id})">Edit</button>
                        <button class="btn btn-secondary btn-small" onclick="toggleSubAdmin(${admin.id})">${admin.isActive ? 'Deactivate' : 'Activate'}</button>
                        <button class="btn btn-danger btn-small" onclick="deleteSubAdminConfirm(${admin.id}, '${admin.email}')">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function openAddSubAdminForm() {
    const formContainer = document.getElementById('sub-admin-form-container');
    const formTitle = document.getElementById('sub-admin-form-title');
    const form = document.getElementById('sub-admin-form');
    const idInput = document.getElementById('sub-admin-id');
    const emailInput = document.getElementById('sub-admin-email');
    const passwordInput = document.getElementById('sub-admin-password');
    
    if (formContainer && formTitle && form && idInput && emailInput && passwordInput) {
        idInput.value = '';
        emailInput.value = '';
        passwordInput.value = '';
        passwordInput.required = true;
        formTitle.textContent = 'Add New Sub-Admin';
        formContainer.style.display = 'block';
        loadPermissionsList([]);
        emailInput.focus();
    }
}

function editSubAdmin(id) {
    const subAdmins = getSubAdmins();
    const admin = subAdmins.find(a => a.id === id);
    
    if (!admin) {
        alert('Sub-admin not found');
        return;
    }
    
    const formContainer = document.getElementById('sub-admin-form-container');
    const formTitle = document.getElementById('sub-admin-form-title');
    const form = document.getElementById('sub-admin-form');
    const idInput = document.getElementById('sub-admin-id');
    const emailInput = document.getElementById('sub-admin-email');
    const passwordInput = document.getElementById('sub-admin-password');
    
    if (formContainer && formTitle && form && idInput && emailInput && passwordInput) {
        idInput.value = admin.id;
        emailInput.value = admin.email;
        passwordInput.value = '';
        passwordInput.required = false;
        formTitle.textContent = 'Edit Sub-Admin';
        formContainer.style.display = 'block';
        loadPermissionsList(admin.permissions || []);
        emailInput.focus();
    }
}

function cancelSubAdminForm() {
    const formContainer = document.getElementById('sub-admin-form-container');
    const form = document.getElementById('sub-admin-form');
    
    if (formContainer && form) {
        formContainer.style.display = 'none';
        form.reset();
        loadPermissionsList([]);
    }
}

function loadPermissionsList(selectedPermissions) {
    const permissionsList = document.getElementById('permissions-list');
    if (!permissionsList) return;
    
    const availablePermissions = getAvailablePermissions();
    
    permissionsList.innerHTML = availablePermissions.map(perm => {
        const isChecked = selectedPermissions.includes(perm.id);
        return `
            <div style="margin-bottom: 0.75rem; padding: 0.75rem; background-color: #f8f9fa; border-radius: 0.5rem;">
                <label style="display: flex; align-items: start; cursor: pointer; gap: 0.75rem;">
                    <input type="checkbox" 
                           class="permission-checkbox" 
                           data-permission-id="${perm.id}" 
                           ${isChecked ? 'checked' : ''}
                           style="margin-top: 0.25rem; cursor: pointer;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: var(--text-dark); margin-bottom: 0.25rem;">${perm.name}</div>
                        <div style="font-size: 0.85rem; color: var(--text-light);">${perm.description}</div>
                    </div>
                </label>
            </div>
        `;
    }).join('');
}

function selectAllPermissions() {
    const checkboxes = document.querySelectorAll('.permission-checkbox');
    checkboxes.forEach(cb => cb.checked = true);
}

function deselectAllPermissions() {
    const checkboxes = document.querySelectorAll('.permission-checkbox');
    checkboxes.forEach(cb => cb.checked = false);
}

function getSelectedPermissions() {
    const checkboxes = document.querySelectorAll('.permission-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.getAttribute('data-permission-id'));
}

function saveSubAdmin(event) {
    event.preventDefault();
    
    const idInput = document.getElementById('sub-admin-id');
    const emailInput = document.getElementById('sub-admin-email');
    const passwordInput = document.getElementById('sub-admin-password');
    
    if (!idInput || !emailInput || !passwordInput) return;
    
    const id = idInput.value ? parseInt(idInput.value) : null;
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const permissions = getSelectedPermissions();
    
    if (!email) {
        alert('Please enter an email address');
        return;
    }
    
    if (permissions.length === 0) {
        if (!confirm('No permissions selected. This sub-admin will not be able to access any features. Continue?')) {
            return;
        }
    }
    
    let result;
    if (id) {
        // Update existing
        if (!password) {
            result = updateSubAdmin(id, email, '', permissions);
        } else {
            result = updateSubAdmin(id, email, password, permissions);
        }
    } else {
        // Add new
        if (!password) {
            alert('Password is required for new sub-admins');
            return;
        }
        result = addSubAdmin(email, password, permissions);
    }
    
    if (result.success) {
        alert(result.message);
        displaySubAdminsList();
        cancelSubAdminForm();
    } else {
        alert(result.message);
    }
}

function toggleSubAdmin(id) {
    const result = toggleSubAdminStatus(id);
    if (result.success) {
        alert(result.message);
        displaySubAdminsList();
    } else {
        alert(result.message);
    }
}

function deleteSubAdminConfirm(id, email) {
    if (!confirm(`Are you sure you want to delete the sub-admin "${email}"? This action cannot be undone.`)) {
        return;
    }
    
    const result = deleteSubAdmin(id);
    if (result.success) {
        alert(result.message);
        displaySubAdminsList();
    } else {
        alert(result.message);
    }
}

// Apply dashboard permissions based on logged-in admin
function applyDashboardPermissions() {
    // Show "Manage Sub-Admins" button only for main admin
    const subAdminsBtn = document.getElementById('manage-subadmins-btn');
    if (subAdminsBtn) {
        const adminType = sessionStorage.getItem('adminType');
        if (adminType === 'main') {
            subAdminsBtn.style.display = 'inline-block';
        } else {
            subAdminsBtn.style.display = 'none';
        }
    }
    
    // Show/hide other buttons based on permissions
    const buttons = document.querySelectorAll('[data-permission]');
    buttons.forEach(button => {
        const permission = button.getAttribute('data-permission');
        if (hasPermission(permission)) {
            button.style.display = 'inline-block';
        } else {
            button.style.display = 'none';
        }
    });
}

// Setup sub-admins modal close on outside click
document.addEventListener('DOMContentLoaded', function() {
    const subAdminsModal = document.getElementById('sub-admins-modal');
    if (subAdminsModal) {
        window.addEventListener('click', function(event) {
            if (event.target === subAdminsModal) {
                closeSubAdminsModal();
            }
        });
    }
    
    // Setup close sub-admins modal button
    const subAdminsCloseBtn = document.querySelector('#sub-admins-modal .close');
    if (subAdminsCloseBtn) {
        subAdminsCloseBtn.addEventListener('click', closeSubAdminsModal);
    }
    
    // Apply permissions on page load
    if (sessionStorage.getItem('adminAuthenticated') === 'true') {
        applyDashboardPermissions();
    }
    
    // Load logo on page load
    updateLogoOnAllPages();
});
