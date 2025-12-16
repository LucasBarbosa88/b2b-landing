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
