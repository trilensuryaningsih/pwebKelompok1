const { User, Order, Item, Service, Payment, Fine } = require('../../models');

// Helper functions
const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatNumber = (number) => {
    if (!number) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(number);
};

const getStatusClass = (status) => {
    const statusClasses = {
        'pending': 'badge-warning',
        'paid': 'badge-success',
        'failed': 'badge-danger',
        'refunded': 'badge-info',
        'approved': 'badge-success',
        'rejected': 'badge-danger',
        'active': 'badge-primary',
        'completed': 'badge-success',
        'cancelled': 'badge-secondary'
    };
    return statusClasses[status] || 'badge-secondary';
};

const getStatusText = (status) => {
    const statusTexts = {
        'pending': 'Menunggu',
        'paid': 'Dibayar',
        'failed': 'Gagal',
        'refunded': 'Dikembalikan',
        'approved': 'Disetujui',
        'rejected': 'Ditolak',
        'active': 'Aktif',
        'completed': 'Selesai',
        'cancelled': 'Dibatalkan'
    };
    return statusTexts[status] || status;
};

const pageController = {
    // Render home page
    renderHome: (req, res) => {
        if (!req.session.user) {
            return res.redirect('/user');
        }
        res.render('home', { user: req.session.user });
    },

    // Render dashboard
    renderDashboard: (req, res) => {
        res.render('user/dashboard', { user: req.session.user });
    },

    // Render orders page
    renderOrders: async (req, res) => {
        try {
            const user_id = req.session.user.id;
            
            const orders = await Order.findAll({
                where: { user_id: user_id },
                include: [
                    {
                        model: User,
                        as: 'User',
                        attributes: ['name', 'email']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            // Get item/service details for each order
            const ordersWithDetails = await Promise.all(orders.map(async (order) => {
                const orderData = order.toJSON();
                
                try {
                    if (order.itemType === 'item') {
                        const item = await Item.findByPk(order.itemId);
                        orderData.itemDetails = item ? {
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            image: item.image
                        } : null;
                    } else {
                        const service = await Service.findByPk(order.itemId);
                        orderData.itemDetails = service ? {
                            name: service.name,
                            description: service.description,
                            price: service.price,
                            image: service.image
                        } : null;
                    }
                } catch (error) {
                    console.error(`Error fetching ${order.itemType} details for order ${order.id}:`, error);
                    orderData.itemDetails = null;
                }
                
                return orderData;
            }));

            res.render('user/orders', { 
                user: req.session.user,
                orders: ordersWithDetails 
            });
        } catch (error) {
            console.error('Error fetching orders:', error);
            res.render('user/orders', { 
                user: req.session.user,
                orders: [],
                error: 'Failed to load orders'
            });
        }
    },

    // Render order detail page
    renderOrderDetail: (req, res) => {
        res.render('user/order-detail', { user: req.session.user });
    },

    // Render MOU page
    renderMou: (req, res) => {
        res.render('user/mou', { user: req.session.user });
    },

    // Render cetak MOU page
    renderCetakMou: (req, res) => {
        res.render('user/cetak-mou', { user: req.session.user });
    },

    // Render status page
    renderStatus: (req, res) => {
        res.render('user/status', { user: req.session.user });
    },

    // Render payments history page
    renderPaymentsHistory: async (req, res) => {
        try {
            const user_id = req.session.user.id;
            
            // Get payment history from database
            const { Payment, Fine, Order } = require('../../models');

            // Get all payments for the user
            const payments = await Payment.findAll({
                include: [{ 
                    model: Order, 
                    where: { user_id },
                    attributes: ['id', 'totalAmount', 'itemType', 'itemId', 'status', 'createdAt']
                }],
                order: [['paymentDate', 'DESC']]
            });

            // Get all fines for the user
            const fines = await Fine.findAll({
                include: [{ 
                    model: Order, 
                    where: { user_id },
                    attributes: ['id', 'totalAmount', 'itemType', 'itemId', 'status', 'createdAt']
                }],
                order: [['createdAt', 'DESC']]
            });

            // Get item/service details for payments
            const paymentsWithDetails = await Promise.all(payments.map(async (payment) => {
                const paymentData = payment.toJSON();
                
                try {
                    if (payment.Order.itemType === 'item') {
                        const item = await Item.findByPk(payment.Order.itemId);
                        paymentData.itemDetails = item ? {
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            image: item.image
                        } : null;
                    } else {
                        const service = await Service.findByPk(payment.Order.itemId);
                        paymentData.itemDetails = service ? {
                            name: service.name,
                            description: service.description,
                            price: service.price,
                            image: service.image
                        } : null;
                    }
                } catch (error) {
                    console.error(`Error fetching ${payment.Order.itemType} details for payment ${payment.id}:`, error);
                    paymentData.itemDetails = null;
                }
                
                return paymentData;
            }));

            // Get item/service details for fines
            const finesWithDetails = await Promise.all(fines.map(async (fine) => {
                const fineData = fine.toJSON();
                
                try {
                    if (fine.Order.itemType === 'item') {
                        const item = await Item.findByPk(fine.Order.itemId);
                        fineData.itemDetails = item ? {
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            image: item.image
                        } : null;
                    } else {
                        const service = await Service.findByPk(fine.Order.itemId);
                        fineData.itemDetails = service ? {
                            name: service.name,
                            description: service.description,
                            price: service.price,
                            image: service.image
                        } : null;
                    }
                } catch (error) {
                    console.error(`Error fetching ${fine.Order.itemType} details for fine ${fine.id}:`, error);
                    fineData.itemDetails = null;
                }
                
                return fineData;
            }));

            // Combine and sort all payment history
            const paymentHistory = [
                ...paymentsWithDetails.map(p => ({
                    ...p,
                    type: 'payment',
                    displayType: 'Pembayaran'
                })),
                ...finesWithDetails.map(f => ({
                    ...f,
                    type: 'fine',
                    displayType: 'Denda'
                }))
            ].sort((a, b) => {
                const dateA = a.type === 'payment' ? new Date(a.paymentDate) : new Date(a.createdAt);
                const dateB = b.type === 'payment' ? new Date(b.paymentDate) : new Date(b.createdAt);
                return dateB - dateA;
            });

            // Calculate statistics
            const stats = {
                totalPayments: payments.length,
                totalFines: fines.length,
                totalAmount: payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
                totalFinesAmount: fines.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0)
            };

            res.render('user/payments-history', { 
                user: req.session.user,
                paymentHistory,
                stats,
                formatDate,
                formatNumber,
                getStatusClass,
                getStatusText
            });
        } catch (error) {
            console.error('Error rendering payments history page:', error);
            res.render('user/payments-history', { 
                user: req.session.user,
                paymentHistory: [],
                stats: {
                    totalPayments: 0,
                    totalFines: 0,
                    totalAmount: 0,
                    totalFinesAmount: 0
                },
                error: 'Gagal memuat riwayat pembayaran',
                formatDate,
                formatNumber,
                getStatusClass,
                getStatusText
            });
        }
    },

    // Render payment detail page
    renderPaymentDetail: async (req, res) => {
        try {
            const { type, id } = req.params;
            const user_id = req.session.user.id;
            
            if (type !== 'payment' && type !== 'fine') {
                return res.status(404).render('error', { 
                    message: 'Tipe pembayaran tidak valid',
                    user: req.session.user 
                });
            }

            let paymentData = null;
            let orderData = null;
            let itemDetails = null;

            if (type === 'payment') {
                // Get payment data
                const payment = await Payment.findByPk(id, {
                    include: [{ 
                        model: Order, 
                        where: { user_id },
                        attributes: ['id', 'totalAmount', 'itemType', 'itemId', 'status', 'createdAt', 'returnDate']
                    }]
                });

                if (!payment) {
                    return res.status(404).render('error', { 
                        message: 'Pembayaran tidak ditemukan',
                        user: req.session.user 
                    });
                }

                paymentData = payment.toJSON();
                orderData = payment.Order;

                // Get item/service details
                try {
                    if (orderData.itemType === 'item') {
                        const item = await Item.findByPk(orderData.itemId);
                        itemDetails = item ? {
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            image: item.image,
                            category: item.category
                        } : null;
                    } else {
                        const service = await Service.findByPk(orderData.itemId);
                        itemDetails = service ? {
                            name: service.name,
                            description: service.description,
                            price: service.price,
                            image: service.image,
                            category: service.category
                        } : null;
                    }
                } catch (error) {
                    console.error(`Error fetching ${orderData.itemType} details:`, error);
                    itemDetails = null;
                }

            } else {
                // Get fine data
                const fine = await Fine.findByPk(id, {
                    include: [{ 
                        model: Order, 
                        where: { user_id },
                        attributes: ['id', 'totalAmount', 'itemType', 'itemId', 'status', 'createdAt', 'returnDate']
                    }]
                });

                if (!fine) {
                    return res.status(404).render('error', { 
                        message: 'Denda tidak ditemukan',
                        user: req.session.user 
                    });
                }

                paymentData = fine.toJSON();
                orderData = fine.Order;

                // Get item/service details
                try {
                    if (orderData.itemType === 'item') {
                        const item = await Item.findByPk(orderData.itemId);
                        itemDetails = item ? {
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            image: item.image,
                            category: item.category
                        } : null;
                    } else {
                        const service = await Service.findByPk(orderData.itemId);
                        itemDetails = service ? {
                            name: service.name,
                            description: service.description,
                            price: service.price,
                            image: service.image,
                            category: service.category
                        } : null;
                    }
                } catch (error) {
                    console.error(`Error fetching ${orderData.itemType} details:`, error);
                    itemDetails = null;
                }
            }

            res.render('user/payment-detail', { 
                user: req.session.user,
                paymentData,
                orderData,
                itemDetails,
                type,
                formatDate,
                formatNumber,
                getStatusClass,
                getStatusText
            });

        } catch (error) {
            console.error('Error rendering payment detail page:', error);
            res.status(500).render('error', { 
                message: 'Gagal memuat detail pembayaran',
                user: req.session.user 
            });
        }
    }
};

module.exports = pageController; 