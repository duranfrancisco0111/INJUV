// Search functionality
const searchToggle = document.querySelector('.search-toggle');
const searchBar = document.getElementById('searchBar');
const searchClose = document.querySelector('.search-close');
const searchInput = document.querySelector('.search-input');
const searchSubmit = document.querySelector('.search-submit');

// Toggle search bar
searchToggle.addEventListener('click', () => {
    searchBar.classList.toggle('active');
    if (searchBar.classList.contains('active')) {
        searchInput.focus();
    }
});

searchClose.addEventListener('click', () => {
    searchBar.classList.remove('active');
});

// Search functionality
searchSubmit.addEventListener('click', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        performSearch(query);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query);
        }
    }
});

function performSearch(query) {
    // Simulate search functionality
    showSearchResults(query);
}

function showSearchResults(query) {
    // Create search results modal
    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Resultados de búsqueda para: "${query}"</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="search-results">
                    <div class="search-result-item">
                        <h4>Programa de Voluntariado Internacional</h4>
                        <p>Oportunidades de voluntariado en más de 140 países</p>
                        <span class="result-type">INJUV</span>
                    </div>
                    <div class="search-result-item">
                        <h4>Trámites INJUV</h4>
                        <p>Accede a todos los trámites disponibles para jóvenes</p>
                        <span class="result-type">Servicio</span>
                    </div>
                    <div class="search-result-item">
                        <h4>Participación Ciudadana</h4>
                        <p>Espacios de participación y compromiso social</p>
                        <span class="result-type">Programa</span>
                    </div>
                </div>
                <div class="search-footer">
                    <button class="btn-primary">Ver todos los resultados</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mainNav.classList.toggle('active');
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// Search functionality
const searchBtn = document.querySelector('.search-btn');
const destinationInput = document.getElementById('destination');
const datesInput = document.getElementById('dates');
const workTypeSelect = document.getElementById('work-type');

searchBtn.addEventListener('click', () => {
    const destination = destinationInput.value;
    const dates = datesInput.value;
    const workType = workTypeSelect.value;
    
    if (destination || dates || workType) {
        // Simulate search functionality
        showSearchResults(destination, dates, workType);
    } else {
        showNotification('Por favor, completa al menos un campo de búsqueda', 'warning');
    }
});

function showSearchResults(destination, dates, workType) {
    // Create a simple search results modal
    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Resultados de búsqueda</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <p><strong>Destino:</strong> ${destination || 'Cualquier destino'}</p>
                <p><strong>Fechas:</strong> ${dates || 'Cualquier fecha'}</p>
                <p><strong>Tipo de trabajo:</strong> ${workType || 'Cualquier tipo'}</p>
                <div class="search-results">
                    <p>Se encontraron 15 oportunidades que coinciden con tu búsqueda.</p>
                    <button class="btn-primary">Ver oportunidades</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 3000);
}

// Show country opportunities
function showCountryOpportunities(countryName) {
    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Oportunidades en ${countryName}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="country-opportunities">
                    <div class="opportunity-item">
                        <h4>Proyecto de Conservación</h4>
                        <p>Ayuda en la conservación de la biodiversidad local</p>
                        <span class="opportunity-type">Eco-turismo</span>
                    </div>
                    <div class="opportunity-item">
                        <h4>Enseñanza de Idiomas</h4>
                        <p>Enseña inglés a niños y adultos en comunidades rurales</p>
                        <span class="opportunity-type">Educación</span>
                    </div>
                    <div class="opportunity-item">
                        <h4>Desarrollo Comunitario</h4>
                        <p>Participa en proyectos de desarrollo sostenible</p>
                        <span class="opportunity-type">Comunidad</span>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary">Ver todas las oportunidades</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.step, .opportunity-card, .testimonial-card, .feature-card, .country-card, .pricing-card');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Counter animation for stats
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start) + '+';
        }
    }, 16);
}

// Animate stats when they come into view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const target = parseInt(stat.textContent);
                animateCounter(stat, target);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// Form validation
function validateForm() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const inputs = form.querySelectorAll('input[required], select[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.style.borderColor = '#ef4444';
                    isValid = false;
                } else {
                    input.style.borderColor = '#d1d5db';
                }
            });
            
            if (isValid) {
                showNotification('¡Formulario enviado correctamente!', 'success');
            } else {
                showNotification('Por favor, completa todos los campos requeridos', 'warning');
            }
        });
    });
}

// Initialize form validation
document.addEventListener('DOMContentLoaded', validateForm);

// Add CSS for modals and notifications
const style = document.createElement('style');
style.textContent = `
    .search-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    }
    
    .modal-content {
        background: white;
        border-radius: 16px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .close-modal {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #6b7280;
    }
    
    .search-results {
        margin-top: 1.5rem;
        text-align: center;
    }
    
    .country-opportunities {
        margin-bottom: 1.5rem;
    }
    
    .opportunity-item {
        padding: 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        margin-bottom: 1rem;
        transition: all 0.3s ease;
    }
    
    .opportunity-item:hover {
        background: #f8fafc;
        border-color: #2563eb;
    }
    
    .opportunity-item h4 {
        color: #1f2937;
        margin-bottom: 0.5rem;
    }
    
    .opportunity-item p {
        color: #6b7280;
        margin-bottom: 0.5rem;
    }
    
    .opportunity-type {
        background: #2563eb;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .modal-footer {
        text-align: center;
        margin-top: 1.5rem;
    }
    
    .pricing-card.selected {
        border-color: #10b981;
        background: #f0fdf4;
    }
    
    .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        background: white;
        border-radius: 8px;
        padding: 1rem 1.5rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        z-index: 1500;
        animation: slideIn 0.3s ease;
    }
    
    .notification-success {
        border-left: 4px solid #10b981;
    }
    
    .notification-warning {
        border-left: 4px solid #f59e0b;
    }
    
    .notification-info {
        border-left: 4px solid #3b82f6;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .notification-content i {
        font-size: 1.2rem;
    }
    
    .notification-success i {
        color: #10b981;
    }
    
    .notification-warning i {
        color: #f59e0b;
    }
    
    .notification-info i {
        color: #3b82f6;
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
    
    .nav-menu.active {
        display: flex;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        flex-direction: column;
        padding: 2rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        border-top: 1px solid #e5e7eb;
    }
    
    .hamburger.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }
    
    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }
    
    .hamburger.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
`;

document.head.appendChild(style);

// Add some interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.opportunity-card, .testimonial-card, .feature-card, .country-card, .pricing-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Country card click functionality
    const countryCards = document.querySelectorAll('.country-card');
    countryCards.forEach(card => {
        card.addEventListener('click', () => {
            const countryName = card.querySelector('h3').textContent;
            showCountryOpportunities(countryName);
        });
    });

    // Pricing card selection
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active class from all cards
            pricingCards.forEach(c => c.classList.remove('selected'));
            // Add active class to clicked card
            card.classList.add('selected');
        });
    });
    
    // Add click effects to buttons
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-outline');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Add ripple effect CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    .btn-primary, .btn-secondary, .btn-outline {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;

document.head.appendChild(rippleStyle);

// Carousel functionality
class VolunteeringCarousel {
    constructor() {
        this.track = document.getElementById('carouselTrack');
        this.slides = document.querySelectorAll('.carousel-slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.autoPlayInterval = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startAutoPlay();
        this.updateCarousel();
    }
    
    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Pause auto-play on hover
        const carouselContainer = document.querySelector('.carousel-container');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', () => this.stopAutoPlay());
            carouselContainer.addEventListener('mouseleave', () => this.startAutoPlay());
        }
        
        // Touch/swipe support
        this.addTouchSupport();
    }
    
    addTouchSupport() {
        let startX = 0;
        let endX = 0;
        
        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        this.track.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            this.handleSwipe(startX, endX);
        });
    }
    
    handleSwipe(startX, endX) {
        const threshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }
    
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateCarousel();
    }
    
    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateCarousel();
    }
    
    goToSlide(index) {
        this.currentSlide = index;
        this.updateCarousel();
    }
    
    updateCarousel() {
        const translateX = -this.currentSlide * 100;
        this.track.style.transform = `translateX(${translateX}%)`;
        
        // Update indicators
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
        
        // Update slides
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
        });
    }
    
    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize carousel
    new VolunteeringCarousel();
});
