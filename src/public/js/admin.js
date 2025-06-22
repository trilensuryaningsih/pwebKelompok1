// Admin-specific JavaScript functionality
// src/public/js/admin.js

// Item management
const ItemManager = {
    items: [],

    // Load items from API
    async loadItems() {
        try {
            const result = await Utils.apiRequest('/admin/api/items');
            this.items = result.data;
            this.displayItems(this.items);
        } catch (error) {
            console.error('Error loading items:', error);
            this.showEmptyState();
        }
    },

    // Display items in table
    displayItems(items) {
        const tableBody = document.getElementById('itemsTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (!tableBody) return;

        if (items.length === 0) {
            this.showEmptyState();
            return;
        }

        tableBody.innerHTML = items.map(item => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 text-sm text-gray-900">${item.id}</td>
                <td class="px-4 py-3 text-sm text-gray-900">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.type === 'tool' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }">
                        ${item.type === 'tool' ? 'Item' : 'Jasa'}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">${item.name}</td>
                <td class="px-4 py-3 text-sm text-gray-900">${item.quantity}</td>
                <td class="px-4 py-3 text-sm text-gray-900">${Utils.formatCurrency(item.price)}</td>
                <td class="px-4 py-3 text-sm">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getStatusClass(item.status)}">
                        ${this.getStatusText(item.status)}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">${Utils.formatDate(item.createdAt)}</td>
                <td class="px-4 py-3 text-sm font-medium">
                    <div class="flex space-x-2">
                        <button onclick="ItemManager.editItem(${item.id})" 
                                class="text-blue-600 hover:text-blue-900">
                            Edit
                        </button>
                        <button onclick="ItemManager.deleteItem(${item.id})" 
                                class="text-red-600 hover:text-red-900">
                            Hapus
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        emptyState.classList.add('hidden');
    },

    // Filter items by type
    filterItems(type) {
        if (!type) {
            this.displayItems(this.items);
            return;
        }

        const filteredItems = this.items.filter(item => item.type === type);
        this.displayItems(filteredItems);
    },

    // Search items
    searchItems(searchTerm) {
        if (!searchTerm) {
            this.displayItems(this.items);
            return;
        }

        const filteredItems = this.items.filter(item => 
            item.id.toString().includes(searchTerm) ||
            item.name.toLowerCase().includes(searchTerm) ||
            item.type.toLowerCase().includes(searchTerm)
        );
        this.displayItems(filteredItems);
    },

    // Show empty state
    showEmptyState() {
        const tableBody = document.getElementById('itemsTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (tableBody) tableBody.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
    },

    // Edit item
    editItem(itemId) {
        window.location.href = `/admin/items/${itemId}/edit`;
    },

    // Delete item
    async deleteItem(itemId) {
        Utils.showConfirm(
            'Hapus Item',
            'Yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.',
            async () => {
                try {
                    const result = await Utils.apiRequest(`/admin/items/${itemId}`, {
                        method: 'DELETE'
                    });
                    
                    Utils.showAlert('Sukses', 'Item berhasil dihapus!', 'success');
                    this.loadItems();
                } catch (error) {
                    Utils.showAlert('Error', error.message || 'Gagal menghapus item', 'error');
                }
            }
        );
    },

    // Get status class for styling
    getStatusClass(status) {
        const statusClasses = {
            available: 'bg-green-100 text-green-800',
            unavailable: 'bg-red-100 text-red-800',
            maintenance: 'bg-yellow-100 text-yellow-800',
            damaged: 'bg-red-100 text-red-800',
            lost: 'bg-gray-100 text-gray-800'
        };
        return statusClasses[status] || 'bg-gray-100 text-gray-800';
    },

    // Get status text
    getStatusText(status) {
        const statusTexts = {
            available: 'Tersedia',
            unavailable: 'Tidak Tersedia',
            maintenance: 'Dalam Perbaikan',
            damaged: 'Rusak',
            lost: 'Hilang'
        };
        return statusTexts[status] || status;
    }
};

// Order verification management
const OrderVerification = {
    orders: [],

    // Load pending orders
    async loadPendingOrders() {
        try {
            const result = await Utils.apiRequest('/admin/api/orders/pending');
            this.orders = result.data;
            this.displayOrders(this.orders);
        } catch (error) {
            console.error('Error loading pending orders:', error);
            this.showEmptyState();
        }
    },

    // Display orders in table
    displayOrders(orders) {
        const tableBody = document.getElementById('ordersTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (!tableBody) return;

        if (orders.length === 0) {
            this.showEmptyState();
            return;
        }

        tableBody.innerHTML = orders.map(order => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 text-sm text-gray-900">${order.id}</td>
                <td class="px-4 py-3 text-sm text-gray-900">${order.userName}</td>
                <td class="px-4 py-3 text-sm text-gray-900">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.itemType === 'tool' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }">
                        ${order.itemType === 'tool' ? 'Item' : 'Jasa'}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">${order.itemName}</td>
                <td class="px-4 py-3 text-sm text-gray-900">${order.quantity}</td>
                <td class="px-4 py-3 text-sm text-gray-900">${Utils.formatCurrency(order.totalAmount)}</td>
                <td class="px-4 py-3 text-sm text-gray-900">${Utils.formatDate(order.createdAt)}</td>
                <td class="px-4 py-3 text-sm font-medium">
                    <div class="flex space-x-2">
                        <button onclick="OrderVerification.approveOrder(${order.id})" 
                                class="text-green-600 hover:text-green-900">
                            Setujui
                        </button>
                        <button onclick="OrderVerification.rejectOrder(${order.id})" 
                                class="text-red-600 hover:text-red-900">
                            Tolak
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        emptyState.classList.add('hidden');
    },

    // Show empty state
    showEmptyState() {
        const tableBody = document.getElementById('ordersTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (tableBody) tableBody.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
    },

    // Approve order
    async approveOrder(orderId) {
        Utils.showConfirm(
            'Setujui Pesanan',
            'Yakin ingin menyetujui pesanan ini?',
            async () => {
                try {
                    const result = await Utils.apiRequest(`/admin/orders/${orderId}/approve`, {
                        method: 'POST'
                    });
                    
                    Utils.showAlert('Sukses', 'Pesanan berhasil disetujui!', 'success');
                    this.loadPendingOrders();
                } catch (error) {
                    Utils.showAlert('Error', error.message || 'Gagal menyetujui pesanan', 'error');
                }
            }
        );
    },

    // Reject order
    async rejectOrder(orderId) {
        const reason = prompt('Alasan penolakan:');
        if (!reason) return;

        try {
            const result = await Utils.apiRequest(`/admin/orders/${orderId}/reject`, {
                method: 'POST',
                body: JSON.stringify({ reason })
            });
            
            Utils.showAlert('Sukses', 'Pesanan berhasil ditolak!', 'success');
            this.loadPendingOrders();
        } catch (error) {
            Utils.showAlert('Error', error.message || 'Gagal menolak pesanan', 'error');
        }
    }
};

// Dashboard statistics
const DashboardStats = {
    // Load dashboard statistics
    async loadStats() {
        try {
            const result = await Utils.apiRequest('/admin/api/dashboard/stats');
            this.displayStats(result.data);
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    },

    // Display statistics
    displayStats(stats) {
        const totalUsersElement = document.getElementById('totalUsers');
        const totalItemsElement = document.getElementById('totalItems');
        const totalOrdersElement = document.getElementById('totalOrders');
        const pendingOrdersElement = document.getElementById('pendingOrders');

        if (totalUsersElement) totalUsersElement.textContent = stats.totalUsers || 0;
        if (totalItemsElement) totalItemsElement.textContent = stats.totalItems || 0;
        if (totalOrdersElement) totalOrdersElement.textContent = stats.totalOrders || 0;
        if (pendingOrdersElement) pendingOrdersElement.textContent = stats.pendingOrders || 0;
    }
};

// Initialize admin functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize item management if on items page
    if (document.getElementById('itemsTableBody') && !window.location.pathname.includes('/verification')) {
        ItemManager.loadItems();
        
        // Setup event listeners
        const typeFilter = document.getElementById('typeFilter');
        const searchInput = document.getElementById('searchInput');
        const refreshBtn = document.getElementById('refreshBtn');
        const addItemBtn = document.getElementById('addItemBtn');

        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                ItemManager.filterItems(e.target.value);
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                ItemManager.searchItems(e.target.value.toLowerCase());
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                ItemManager.loadItems();
            });
        }

        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => {
                window.location.href = '/admin/items/create';
            });
        }
    }

    // Initialize order verification if on verification page
    if (window.location.pathname.includes('/verification')) {
        OrderVerification.loadPendingOrders();
        
        // Setup refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                OrderVerification.loadPendingOrders();
            });
        }
    }

    // Initialize dashboard stats if on dashboard
    if (window.location.pathname === '/admin' || window.location.pathname === '/admin/dashboard') {
        DashboardStats.loadStats();
    }

    console.log('Admin.js loaded successfully');
}); 