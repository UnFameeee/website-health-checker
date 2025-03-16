/**
 * Website Health Monitor - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar on mobile
    const sidebarToggle = document.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('active');
            document.querySelector('.content').classList.toggle('active');
        });
    }
    
    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(function(alert) {
        setTimeout(function() {
            const closeButton = alert.querySelector('.btn-close');
            if (closeButton) {
                closeButton.click();
            }
        }, 5000);
    });
    
    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(function(tooltip) {
        new bootstrap.Tooltip(tooltip);
    });
    
    // Initialize popovers
    const popovers = document.querySelectorAll('[data-bs-toggle="popover"]');
    popovers.forEach(function(popover) {
        new bootstrap.Popover(popover);
    });
    
    // Check website status
    const checkButtons = document.querySelectorAll('.check-website-btn');
    checkButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const websiteId = this.getAttribute('data-website-id');
            const statusElement = document.querySelector(`#website-status-${websiteId}`);
            const buttonIcon = this.querySelector('i');
            
            // Show loading state
            buttonIcon.className = 'fas fa-spinner fa-spin me-2';
            this.disabled = true;
            
            // Make AJAX request to check website
            fetch(`/websites/check/${websiteId}`)
                .then(response => response.json())
                .then(data => {
                    // Update status
                    if (data.success) {
                        const checkResult = data.checkResult;
                        
                        // Update status badge
                        if (statusElement) {
                            statusElement.innerHTML = '';
                            const badge = document.createElement('span');
                            badge.className = `badge bg-${checkResult.status === 'up' ? 'success' : 'danger'}`;
                            badge.textContent = checkResult.status === 'up' ? 'Up' : 'Down';
                            statusElement.appendChild(badge);
                        }
                        
                        // Show toast notification
                        const toastContainer = document.querySelector('.toast-container');
                        if (toastContainer) {
                            const toast = document.createElement('div');
                            toast.className = `toast align-items-center text-white bg-${checkResult.status === 'up' ? 'success' : 'danger'} border-0`;
                            toast.setAttribute('role', 'alert');
                            toast.setAttribute('aria-live', 'assertive');
                            toast.setAttribute('aria-atomic', 'true');
                            
                            toast.innerHTML = `
                                <div class="d-flex">
                                    <div class="toast-body">
                                        <i class="fas fa-${checkResult.status === 'up' ? 'check-circle' : 'times-circle'} me-2"></i>
                                        ${data.message || `Website is ${checkResult.status === 'up' ? 'up' : 'down'}`}
                                    </div>
                                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                                </div>
                            `;
                            
                            toastContainer.appendChild(toast);
                            const bsToast = new bootstrap.Toast(toast);
                            bsToast.show();
                        }
                        
                        // Reload page after 1 second to show updated data
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    } else {
                        // Show error
                        alert('Error checking website: ' + (data.message || 'Unknown error'));
                        
                        // Reset button
                        buttonIcon.className = 'fas fa-sync me-2';
                        this.disabled = false;
                    }
                })
                .catch(error => {
                    console.error('Error checking website:', error);
                    alert('Error checking website. Please try again.');
                    
                    // Reset button
                    buttonIcon.className = 'fas fa-sync me-2';
                    this.disabled = false;
                });
        });
    });
    
    // Form validation
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            form.classList.add('was-validated');
        }, false);
    });
    
    // Password toggle
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(function(toggle) {
        toggle.addEventListener('click', function() {
            const passwordInput = document.querySelector(this.getAttribute('data-target'));
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                passwordInput.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    });
    
    // Confirm delete
    const deleteButtons = document.querySelectorAll('.confirm-delete');
    deleteButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
                e.preventDefault();
            }
        });
    });
}); 