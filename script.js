// Language Handling (Must be at the top or very early)
let currentLang = localStorage.getItem('site_lang') || 'en';

function updateContent() {
    const langData = translations[currentLang];
    
    // Update simple text elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const keys = key.split('.');
        let value = langData;
        
        // Navigate through the object
        for (const k of keys) {
            value = value?.[k];
        }
        
        if (value) {
            // For inputs/textareas, update placeholder
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = value;
            } else if (el.tagName === 'IMG') {
                el.alt = value;
            } else {
                // If the element has children (like svg icons in buttons), we need to be careful not to wipe them
                // But for this refined implementation, we wrapped text in spans where necessary for complex buttons.
                // For simple elements, textContent is fine.
                // If the value contains HTML entities (like &copy;), we used innerHTML in the initial load, so let's stick to innerHTML for safety or textContent if strict.
                // Given the copyright usage, innerHTML is safer for entities.
                el.innerHTML = value; 
            }
        }
    });

    // Update document title and meta description
    if (langData.meta) {
        document.title = langData.meta.title;
        document.querySelector('meta[name="description"]')?.setAttribute('content', langData.meta.description);
    }

    // Update Language Toggle Button State
    const toggleBtn = document.getElementById('langToggle');
    if (toggleBtn && langData.nav.langConfig) {
        // We set the text to the *current* language's "switch to" text (e.g. show "PT" when in EN)
        // actually looking at translations.js, nav.langConfig.text for 'en' is "🇧🇷 PT" which is correct (switch TO pt)
        toggleBtn.textContent = langData.nav.langConfig.text; 
    }
}

// Global function to toggle language
window.toggleLanguage = () => {
    currentLang = currentLang === 'en' ? 'pt' : 'en';
    localStorage.setItem('site_lang', currentLang);
    updateContent();
};

// Initialize language on load
document.addEventListener('DOMContentLoaded', () => {
    updateContent();
});


// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Animated counters
const animateCounters = () => {
    document.querySelectorAll('.stat-number').forEach(counter => {
        const target = +counter.dataset.target;
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        const update = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(update);
            } else {
                counter.textContent = target;
            }
        };
        update();
    });
};

// Intersection Observer for animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            if (entry.target.classList.contains('hero-stats')) animateCounters();
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .testimonial-card, .pricing-card, .hero-stats').forEach(el => observer.observe(el));

// Solution tabs
document.querySelectorAll('.solution-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.solution-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.solution-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

// Pricing toggle
const toggle = document.getElementById('pricingToggle');
const labels = document.querySelectorAll('.toggle-label');
toggle?.addEventListener('change', () => {
    labels.forEach(l => l.classList.toggle('active'));
    document.querySelectorAll('.price').forEach(price => {
        price.textContent = toggle.checked ? price.dataset.annual : price.dataset.monthly;
    });
});

// Form submission
document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerHTML = '<span>Thank you! We\'ll be in touch.</span>';
    btn.disabled = true;
    setTimeout(() => {
        btn.innerHTML = 'Start Your Free Trial <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
        btn.disabled = false;
        e.target.reset();
    }, 3000);
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// Google Reviews Integration
window.initGoogleReviews = () => {
    if (!window.google || !window.google.maps || !window.google.maps.places) return;
    
    // Elemento invisível necessário para o PlacesService
    const serviceContainer = document.createElement('div');
    document.body.appendChild(serviceContainer);
    
    const service = new google.maps.places.PlacesService(serviceContainer);
    const request = {
        placeId: typeof GOOGLE_PLACE_ID !== 'undefined' ? GOOGLE_PLACE_ID : '',
        fields: ['reviews'] // Solicitando apenas os reviews para economizar custos
    };

    service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place.reviews) {
            renderGoogleReviews(place.reviews);
        } else {
            console.warn('Google Places API: Falha ao carregar reviews ou Place ID inválido.', status);
        }
    });
};

const renderGoogleReviews = (reviews) => {
    const testimonialsGrid = document.querySelector('.testimonials-grid');
    if (!testimonialsGrid) return;
    
    // Filtrar apenas reviews positivos (4 ou 5 estrelas) e limitar a 3
    const topReviews = reviews
        .filter(review => review.rating >= 4)
        .slice(0, 3);
        
    if (topReviews.length === 0) return; // Manter estáticos se não houver bons reviews

    testimonialsGrid.innerHTML = ''; // Limpar estáticos

    topReviews.forEach(review => {
        const card = document.createElement('div');
        card.className = 'testimonial-card';
        // Adicionar classe 'featured' para o review de maior destaque (opcional, aqui aleatório ou o primeiro)
        if (review === topReviews[1]) card.classList.add('featured');

        const stars = '★'.repeat(review.rating);
        const text = review.text.length > 150 ? review.text.substring(0, 150) + '...' : review.text;

        card.innerHTML = `
            <div class="testimonial-content">
                <div class="stars" style="color: #fbbf24; letter-spacing: 2px;">${stars}</div>
                <p>"${text}"</p>
            </div>
            <div class="testimonial-author">
                <img src="${review.profile_photo_url}" alt="${review.author_name}" class="author-avatar" style="object-fit:cover;">
                <div class="author-info">
                    <strong>${review.author_name}</strong>
                    <span>Google Review</span>
                </div>
            </div>
        `;
        testimonialsGrid.appendChild(card);
    });
    
    // Reiniciar observer para animar os novos cards
    document.querySelectorAll('.testimonial-card').forEach(el => observer.observe(el));
};

setTimeout(animateCounters, 500);
