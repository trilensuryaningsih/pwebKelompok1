// Main JavaScript file for common functionality
// src/public/js/main.js

// Common utility functions
const Utils = {
    // Format currency
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    },

    // Format date
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Show alert with SweetAlert2
    showAlert: (title, message, type = 'info') => {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: title,
                text: message,
                icon: type,
                confirmButtonText: 'OK'
            });
        } else {
            alert(`${title}: ${message}`);
        }
    },

    // Show confirmation dialog
    showConfirm: (title, message, callback) => {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: title,
                text: message,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Ya',
                cancelButtonText: 'Tidak'
            }).then((result) => {
                if (result.isConfirmed && callback) {
                    callback();
                }
            });
        } else {
            if (confirm(`${title}: ${message}`)) {
                callback();
            }
        }
    },

    // Make API request
    apiRequest: async (url, options = {}) => {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Terjadi kesalahan');
            }
            
            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }
};

// Layout management
const Layout = {
    init: () => {
        console.log('Layout initialized');
        Layout.setupResponsive();
        Layout.setupSidebar();
    },

    setupResponsive: () => {
        window.addEventListener('resize', () => {
            console.log('Window resized to:', window.innerWidth, 'x', window.innerHeight);
            // Force reflow to ensure layout updates
            document.body.offsetHeight;
        });
    },

    setupSidebar: () => {
        const sidebar = document.querySelector('.sidebar-fixed');
        const header = document.querySelector('.header-fixed');
        const footer = document.querySelector('.footer-sticky');
        const content = document.querySelector('.content-scrollable');
        
        console.log('Sidebar found:', !!sidebar);
        console.log('Header found:', !!header);
        console.log('Footer found:', !!footer);
        console.log('Content found:', !!content);
    }
};

// Form validation
const FormValidator = {
    validateRequired: (value, fieldName) => {
        if (!value || value.trim() === '') {
            throw new Error(`${fieldName} harus diisi`);
        }
        return true;
    },

    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Format email tidak valid');
        }
        return true;
    },

    validatePassword: (password) => {
        if (password.length < 6) {
            throw new Error('Password minimal 6 karakter');
        }
        return true;
    },

    validateDateRange: (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (start >= end) {
            throw new Error('Tanggal selesai harus setelah tanggal mulai');
        }
        
        return true;
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Layout.init();
    console.log('Main.js loaded successfully');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Utils, Layout, FormValidator };
} 