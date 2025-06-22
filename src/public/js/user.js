// User-specific JavaScript functionality
// src/public/js/user.js

// Order management
const OrderManager = {
    orders: [],
    currentOrderId: null,

    // Load orders from API
    async loadOrders() {
        try {
            const result = await Utils.apiRequest('/user/api/orders');
            this.orders = result.data;
            this.displayOrders(this.orders);
            this.loadOrderStats();
        } catch (error) {
            console.error('Error loading orders:', error);
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
                <td class="px-4 py-3 text-sm">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getStatusClass(order.status)}">
                        ${this.getStatusText(order.status)}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">${Utils.formatDate(order.createdAt)}</td>
                <td class="px-4 py-3 text-sm font-medium">
                    <div class="flex space-x-2">
                        <button onclick="OrderManager.viewOrderDetail(${order.id})" 
                                class="text-blue-600 hover:text-blue-900">
                            Detail
                        </button>
                        ${order.status === 'pending' ? 
                            `<button onclick="OrderManager.cancelOrder(${order.id})" 
                                     class="text-red-600 hover:text-red-900">
                                Batalkan
                            </button>` : ''
                        }
                    </div>
                </td>
            </tr>
        `).join('');

        emptyState.classList.add('hidden');
    },

    // Filter orders by status
    filterOrders(status) {
        if (!status) {
            this.displayOrders(this.orders);
            return;
        }

        const filteredOrders = this.orders.filter(order => order.status === status);
        this.displayOrders(filteredOrders);
    },

    // Search orders
    searchOrders(searchTerm) {
        if (!searchTerm) {
            this.displayOrders(this.orders);
            return;
        }

        const filteredOrders = this.orders.filter(order => 
            order.id.toString().includes(searchTerm) ||
            order.itemType.toLowerCase().includes(searchTerm) ||
            order.quantity.toString().includes(searchTerm)
        );
        this.displayOrders(filteredOrders);
    },

    // Show empty state
    showEmptyState() {
        const tableBody = document.getElementById('ordersTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (tableBody) tableBody.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
    },

    // Load order statistics
    async loadOrderStats() {
        try {
            const result = await Utils.apiRequest('/user/api/orders/stats');
            this.displayOrderStats(result.data);
        } catch (error) {
            console.error('Error loading order stats:', error);
        }
    },

    // Display order statistics
    displayOrderStats(stats) {
        const totalElement = document.getElementById('totalOrders');
        const pendingElement = document.getElementById('pendingOrders');
        const completedElement = document.getElementById('completedOrders');

        if (totalElement) totalElement.textContent = stats.total || 0;
        if (pendingElement) pendingElement.textContent = stats.pending || 0;
        if (completedElement) completedElement.textContent = stats.completed || 0;
    },

    // View order detail
    viewOrderDetail(orderId) {
        window.location.href = `/user/orders/${orderId}`;
    },

    // Cancel order
    async cancelOrder(orderId) {
        Utils.showConfirm(
            'Batalkan Pesanan',
            'Yakin ingin membatalkan pesanan ini?',
            async () => {
                try {
                    const result = await Utils.apiRequest(`/user/orders/${orderId}/cancel`, {
                        method: 'POST'
                    });
                    
                    Utils.showAlert('Sukses', 'Pesanan berhasil dibatalkan!', 'success');
                    this.loadOrders();
                } catch (error) {
                    Utils.showAlert('Error', error.message || 'Gagal membatalkan pesanan', 'error');
                }
            }
        );
    },

    // Get status class for styling
    getStatusClass(status) {
        const statusClasses = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-blue-100 text-blue-800',
            rejected: 'bg-red-100 text-red-800',
            active: 'bg-green-100 text-green-800',
            completed: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return statusClasses[status] || 'bg-gray-100 text-gray-800';
    },

    // Get status text
    getStatusText(status) {
        const statusTexts = {
            pending: 'Menunggu',
            approved: 'Disetujui',
            rejected: 'Ditolak',
            active: 'Aktif',
            completed: 'Selesai',
            cancelled: 'Dibatalkan'
        };
        return statusTexts[status] || status;
    }
};

// Order detail management
const OrderDetail = {
    currentOrder: null,

    // Load order detail
    async loadOrderDetail(orderId) {
        try {
            const result = await Utils.apiRequest(`/user/api/orders/${orderId}`);
            this.currentOrder = result.data;
            this.displayOrderDetail(this.currentOrder);
        } catch (error) {
            console.error('Error loading order detail:', error);
            this.showError('Terjadi kesalahan saat memuat detail pesanan');
        }
    },

    // Display order detail
    displayOrderDetail(order) {
        const content = document.getElementById('orderDetailContent');
        if (!content) return;

        content.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Informasi Pesanan</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-gray-600">ID Pesanan:</span>
                                <span class="font-medium">#${order.id}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Status:</span>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getStatusClass(order.status)}">
                                    ${this.getStatusText(order.status)}
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Tanggal Pesanan:</span>
                                <span class="font-medium">${Utils.formatDate(order.createdAt)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Total Harga:</span>
                                <span class="font-medium text-lg text-green-600">${Utils.formatCurrency(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Detail Item</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Tipe:</span>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    order.itemType === 'tool' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                }">
                                    ${order.itemType === 'tool' ? 'Item' : 'Jasa'}
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Nama:</span>
                                <span class="font-medium">${order.itemName}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Jumlah:</span>
                                <span class="font-medium">${order.quantity}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Harga Satuan:</span>
                                <span class="font-medium">${Utils.formatCurrency(order.unitPrice)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${order.notes ? `
                    <div class="mt-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Catatan</h3>
                        <p class="text-gray-700 bg-gray-50 p-3 rounded">${order.notes}</p>
                    </div>
                ` : ''}
                
                <div class="mt-6 flex justify-between">
                    <button onclick="window.location.href='/user/orders'" 
                            class="btn btn-secondary">
                        <i class="fas fa-arrow-left mr-2"></i>Kembali
                    </button>
                    ${order.status === 'approved' ? `
                        <button onclick="window.location.href='/user/mou'" 
                                class="btn btn-primary">
                            <i class="fas fa-file-contract mr-2"></i>Lihat MOU
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        document.getElementById('loadingState').classList.add('hidden');
        content.classList.remove('hidden');
    },

    // Show error state
    showError(message) {
        const errorState = document.getElementById('errorState');
        const content = document.getElementById('orderDetailContent');
        
        if (errorState) {
            errorState.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h3>
                    <p class="text-gray-600 mb-4">${message}</p>
                    <button onclick="window.location.href='/user/orders'" 
                            class="btn btn-primary">
                        Kembali ke Daftar Pesanan
                    </button>
                </div>
            `;
            errorState.classList.remove('hidden');
        }
        
        if (content) content.classList.add('hidden');
        document.getElementById('loadingState').classList.add('hidden');
    },

    // Get status class for styling
    getStatusClass(status) {
        const statusClasses = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-blue-100 text-blue-800',
            rejected: 'bg-red-100 text-red-800',
            active: 'bg-green-100 text-green-800',
            completed: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return statusClasses[status] || 'bg-gray-100 text-gray-800';
    },

    // Get status text
    getStatusText(status) {
        const statusTexts = {
            pending: 'Menunggu',
            approved: 'Disetujui',
            rejected: 'Ditolak',
            active: 'Aktif',
            completed: 'Selesai',
            cancelled: 'Dibatalkan'
        };
        return statusTexts[status] || status;
    }
};

// Initialize user functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize order management if on orders page
    if (document.getElementById('ordersTableBody')) {
        OrderManager.loadOrders();
        
        // Setup event listeners
        const statusFilter = document.getElementById('statusFilter');
        const searchInput = document.getElementById('searchInput');
        const refreshBtn = document.getElementById('refreshBtn');
        const newOrderBtn = document.getElementById('newOrderBtn');

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                OrderManager.filterOrders(e.target.value);
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                OrderManager.searchOrders(e.target.value.toLowerCase());
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                OrderManager.loadOrders();
            });
        }

        if (newOrderBtn) {
            newOrderBtn.addEventListener('click', () => {
                window.location.href = '/user/pemesanan';
            });
        }
    }

    // Initialize order detail if on order detail page
    if (window.location.pathname.includes('/user/orders/')) {
        const orderId = window.location.pathname.split('/').pop();
        if (orderId && !isNaN(orderId)) {
            OrderDetail.loadOrderDetail(orderId);
        }
    }

    console.log('User.js loaded successfully');
}); 