/**
 * Authentication JavaScript for Website Health Monitor
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a protected page (not login, register, or public status page)
    const isProtectedPage = !window.location.pathname.startsWith('/auth/') && 
                           !window.location.pathname.startsWith('/status');
    
    // If we're on a protected page, check for token
    if (isProtectedPage) {
        const token = localStorage.getItem('authToken');
        
        // If no token is found, redirect to login
        if (!token) {
            window.location.href = '/auth/login';
            return;
        }
        
        // Set token as cookie for server-side access
        document.cookie = `authToken=${token}; path=/; max-age=${60*60*24*7}`; // 7 days
        
        // Add token to all AJAX requests
        addTokenToAjaxRequests(token);
        
        // Add token to all forms
        addTokenToForms(token);
    }
    
    // Add logout functionality to logout links
    const logoutLinks = document.querySelectorAll('a[href="/auth/logout"]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // Remove token from localStorage
            localStorage.removeItem('authToken');
            // Remove token cookie
            document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            // Redirect to logout page
            window.location.href = '/auth/logout';
        });
    });
});

/**
 * Add token to all AJAX requests
 * @param {string} token - JWT token
 */
function addTokenToAjaxRequests(token) {
    // Add token to all fetch requests
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
        // Create headers if they don't exist
        if (!options.headers) {
            options.headers = {};
        }
        
        // Add token to headers
        if (options.headers instanceof Headers) {
            options.headers.append('X-Auth-Token', token);
            options.headers.append('Authorization', `Bearer ${token}`);
        } else {
            options.headers['X-Auth-Token'] = token;
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return originalFetch(url, options);
    };
    
    // Add token to all XMLHttpRequest requests
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        const originalSend = this.send;
        this.send = function(data) {
            this.setRequestHeader('X-Auth-Token', token);
            this.setRequestHeader('Authorization', `Bearer ${token}`);
            return originalSend.apply(this, arguments);
        };
        return originalOpen.apply(this, arguments);
    };
    
    // Add token to jQuery AJAX requests if jQuery is available
    if (typeof $ !== 'undefined' && $.ajax) {
        $(document).ajaxSend(function(event, jqXHR, settings) {
            jqXHR.setRequestHeader('X-Auth-Token', token);
            jqXHR.setRequestHeader('Authorization', `Bearer ${token}`);
        });
    }
}

/**
 * Add token to all forms
 * @param {string} token - JWT token
 */
function addTokenToForms(token) {
    document.querySelectorAll('form').forEach(form => {
        // Skip login and register forms
        if (form.action.includes('/auth/login') || form.action.includes('/auth/register')) {
            return;
        }
        
        // Create hidden input for token if it doesn't exist
        let tokenInput = form.querySelector('input[name="token"]');
        if (!tokenInput) {
            tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = 'token';
            form.appendChild(tokenInput);
        }
        
        // Set token value
        tokenInput.value = token;
    });
} 