class NotificationUI {
    static show(message, type = 'success') {
        // Create container if it doesn't exist
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
            `;
            document.body.appendChild(container);
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Icon based on type
        const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
        
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icon}</span>
                <span class="notification-message">${message}</span>
            </div>
            <button class="notification-close">×</button>
        `;

        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            .notification {
                background: white;
                border-radius: 8px;
                padding: 12px 24px;
                margin-bottom: 10px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 500px;
                animation: slideIn 0.3s ease-out forwards;
                border-left: 4px solid;
            }

            .notification.success {
                border-left-color: #10B981;
            }

            .notification.error {
                border-left-color: #EF4444;
            }

            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .notification-icon {
                font-size: 20px;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }

            .notification.success .notification-icon {
                color: #10B981;
            }

            .notification.error .notification-icon {
                color: #EF4444;
            }

            .notification-message {
                color: #1F2937;
                font-size: 14px;
            }

            .notification-close {
                background: none;
                border: none;
                color: #9CA3AF;
                cursor: pointer;
                font-size: 18px;
                padding: 4px;
                margin-left: 12px;
                transition: color 0.2s;
            }

            .notification-close:hover {
                color: #4B5563;
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(styles);

        // Add to container
        container.appendChild(notification);

        // Handle close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.onclick = () => {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        };

        // Auto remove after delay
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease-out forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);

        // Handle navigation after success
        if (type === 'success' && message.includes('successful')) {
            setTimeout(() => {
                window.location.href = message.includes('sign in') ? 'index.html' : 'signin.html';
            }, 2000);
        }
    }
}

// Export for use in other files
window.NotificationUI = NotificationUI; 