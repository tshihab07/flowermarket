/* ==========================================
   Anisa Flower - Dynamic Functionality
========================================== */

// Flower Data Array
const flowers = [
  {
    id: 1,
    name: 'Red Rose',
    category: 'rose',
    price: 24.99,
    image: 'images/red-rose.jpeg',
    desc: 'A classic symbol of love and passion, the red rose is beloved for its velvety petals and timeless elegance.',
    meaning: 'Love, passion, respect',
    care: 'Keep in cool water, trim stems at 45° angle, change water daily.',
    color: 'Deep Red'
  },
  {
    id: 2,
    name: 'Pink Rose',
    category: 'rose',
    price: 22.50,
    image: 'images/pink-rose.jpeg',
    desc: 'Soft and romantic, pink roses express gratitude, admiration, and gentle emotions.',
    meaning: 'Gratitude, admiration, grace',
    care: 'Remove leaves below waterline, use flower food, avoid direct sunlight.',
    color: 'Soft Pink'
  },
  {
    id: 3,
    name: 'Yellow Tulip',
    category: 'tulip',
    price: 18.75,
    image: 'images/yellow-tulip.jpeg',
    desc: 'Bright and cheerful, yellow tulips bring sunshine and happiness to any space.',
    meaning: 'Cheerfulness, hope, sunshine',
    care: 'Place in shallow cool water, keep away from heat sources.',
    color: 'Sunny Yellow'
  },
  {
    id: 4,
    name: 'Red Tulip',
    category: 'tulip',
    price: 19.99,
    image: 'images/red-tulip.jpeg',
    desc: 'Vibrant red tulips are a striking declaration of true love and passion.',
    meaning: 'True love, passion',
    care: 'Trim stems straight, keep in cool water, rotate vase for even growth.',
    color: 'Bright Red'
  },
  {
    id: 5,
    name: 'White Orchid',
    category: 'orchid',
    price: 34.99,
    image: 'images/white-orchid.png',
    desc: 'Elegant and sophisticated, white orchids symbolize purity, luxury, and strength.',
    meaning: 'Purity, elegance, strength',
    care: 'Water weekly with room temperature water, provide bright indirect light.',
    color: 'Pure White'
  },
  {
    id: 6,
    name: 'Purple Orchid',
    category: 'orchid',
    price: 36.50,
    image: 'images/purple-orchid.jpeg',
    desc: 'Exotic purple orchids are admired for their rare beauty and symbolic royal charm.',
    meaning: 'Royalty, admiration, respect',
    care: 'Allow soil to dry slightly between waterings, maintain humidity.',
    color: 'Royal Purple'
  },
  {
    id: 7,
    name: 'White Lily',
    category: 'lily',
    price: 21.25,
    image: 'images/white-lily.jpeg',
    desc: 'Graceful white lilies are a classic choice for weddings and solemn occasions.',
    meaning: 'Purity, virtue, renewal',
    care: 'Remove pollen stamens, keep in cool water, avoid direct sun.',
    color: 'Creamy White'
  },
  {
    id: 8,
    name: 'Stargazer Lily',
    category: 'lily',
    price: 23.99,
    image: 'images/stargazer-lily.jpeg',
    desc: 'Stargazer lilies boast a striking pink and white bloom with a captivating fragrance.',
    meaning: 'Ambition, prosperity',
    care: 'Change water every 2 days, keep away from ripe fruits to prevent wilting.',
    color: 'Pink & White'
  },
  {
    id: 9,
    name: 'Sunflower',
    category: 'sunflower',
    price: 15.99,
    image: 'images/sunflower.jpeg',
    desc: 'Radiant sunflowers are a cheerful reminder of summer, warmth, and positivity.',
    meaning: 'Happiness, loyalty, longevity',
    care: 'Keep in deep water, remove lower leaves, provide plenty of sunlight.',
    color: 'Golden Yellow'
  },
  {
    id: 10,
    name: 'Autumn Sunflower',
    category: 'sunflower',
    price: 16.50,
    image: 'images/autumn-sunflower.jpeg',
    desc: 'A warm-hued sunflower variety that captures the essence of autumn and harvest.',
    meaning: 'Warmth, abundance, gratitude',
    care: 'Re-cut stems often, use warm water for initial hydration.',
    color: 'Amber Gold'
  }
];

// DOM Elements
const preloader = document.getElementById('preloader');
const header = document.getElementById('header');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const flowerGrid = document.getElementById('flowerGrid');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('flowerSearch');
const searchBtn = document.getElementById('searchBtn');
const searchToggle = document.getElementById('searchToggle');
const modal = document.getElementById('flowerModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');
const backToTop = document.getElementById('backToTop');
const contactForm = document.getElementById('contactForm');
const newsletterForm = document.getElementById('newsletterForm');
const toast = document.getElementById('toast');
const testimonialSlider = document.getElementById('testimonialSlider');
const testimonialDots = document.getElementById('testimonialDots');

// State
let currentFilter = 'all';
let favorites = JSON.parse(localStorage.getItem('flowerFavorites') || '[]');

// ========== Preloader ==========
window.addEventListener('load', () => {
  preloader.classList.add('hidden');
  setTimeout(() => preloader.remove(), 500);
});

// ========== Sticky Header ==========
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 80);
  backToTop.classList.toggle('visible', window.scrollY > 500);
});

// ========== Mobile Navigation ==========
navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('open');
  navToggle.innerHTML = navMenu.classList.contains('open')
    ? '<i class="fas fa-times"></i>'
    : '<i class="fas fa-bars"></i>';
});

// Close mobile menu on link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.innerHTML = '<i class="fas fa-bars"></i>';
  });
});

// ========== Flower Rendering ==========
function renderFlowers(filter = 'all', searchTerm = '') {
  const filtered = flowers.filter(flower => {
    const matchesFilter = filter === 'all' || flower.category === filter;
    const matchesSearch = flower.name.toLowerCase().includes(searchTerm) ||
      flower.category.toLowerCase().includes(searchTerm) ||
      flower.meaning.toLowerCase().includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    flowerGrid.innerHTML = `
      <div class="no-results">
        <i class="fas fa-seedling"></i>
        <p>No flowers found. Try a different search or filter.</p>
      </div>
    `;
    return;
  }

  flowerGrid.innerHTML = filtered.map(flower => `
    <article class="flower-card" data-id="${flower.id}">
      <div class="card-img">
        <img src="${flower.image}" alt="${flower.name}" loading="lazy" />
        <span class="badge">${flower.category}</span>
        <button class="fav-btn ${favorites.includes(flower.id) ? 'active' : ''}" data-fav="${flower.id}" aria-label="Toggle favorite">
          <i class="${favorites.includes(flower.id) ? 'fas' : 'far'} fa-heart"></i>
        </button>
      </div>
      <div class="card-body">
        <div class="card-top">
          <h3>${flower.name}</h3>
          <span class="card-price">$${flower.price.toFixed(2)}</span>
        </div>
        <p class="card-desc">${flower.desc}</p>
        <button class="btn btn-details" data-id="${flower.id}">
          View Details <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </article>
  `).join('');

  // Attach card click listeners
  document.querySelectorAll('.flower-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.fav-btn')) return;
      const id = Number(card.dataset.id);
      openModal(id);
    });
  });

  // Attach favorite button listeners
  document.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.fav);
      toggleFavorite(id, btn);
    });
  });
}

// ========== Favorites ==========
function toggleFavorite(id, btn) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(fav => fav !== id);
    btn.classList.remove('active');
    btn.innerHTML = '<i class="far fa-heart"></i>';
  } else {
    favorites.push(id);
    btn.classList.add('active');
    btn.innerHTML = '<i class="fas fa-heart"></i>';
  }
  localStorage.setItem('flowerFavorites', JSON.stringify(favorites));
}

// ========== Filter Buttons ==========
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderFlowers(currentFilter, searchInput.value.toLowerCase().trim());
  });
});

// Footer filter links
document.querySelectorAll('[data-filter-link]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const filter = link.dataset.filterLink;
    filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    currentFilter = filter;
    renderFlowers(filter, searchInput.value.toLowerCase().trim());
    document.getElementById('collection').scrollIntoView({ behavior: 'smooth' });
  });
});

// ========== Search ==========
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const handleSearch = debounce(() => {
  const term = searchInput.value.toLowerCase().trim();
  renderFlowers(currentFilter, term);
}, 300);

searchInput.addEventListener('input', handleSearch);

searchBtn.addEventListener('click', () => {
  const term = searchInput.value.toLowerCase().trim();
  renderFlowers(currentFilter, term);
  document.getElementById('collection').scrollIntoView({ behavior: 'smooth' });
});

searchToggle.addEventListener('click', () => {
  document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => searchInput.focus(), 600);
});

// ========== Modal ==========
function openModal(id) {
  const flower = flowers.find(f => f.id === id);
  if (!flower) return;

  modalBody.innerHTML = `
    <div class="modal-img">
      <img src="${flower.image}" alt="${flower.name}" />
    </div>
    <div class="modal-info">
      <span class="modal-badge">${flower.category}</span>
      <h2>${flower.name}</h2>
      <p class="modal-price">$${flower.price.toFixed(2)}</p>
      <p class="modal-desc">${flower.desc}</p>
      <div class="modal-details">
        <div>
          <i class="fas fa-heart"></i>
          <span><strong>Symbolic Meaning:</strong> ${flower.meaning}</span>
        </div>
        <div>
          <i class="fas fa-tint"></i>
          <span><strong>Care Instructions:</strong> ${flower.care}</span>
        </div>
        <div>
          <i class="fas fa-palette"></i>
          <span><strong>Color:</strong> ${flower.color}</span>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

modalOverlay.addEventListener('click', closeModal);
modalClose.addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ========== Back to Top ==========
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ========== Toast Notification ==========
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ========== Contact Form ==========
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  showToast('✅ Thank you! Your message has been sent.');
  contactForm.reset();
});

// ========== Newsletter Form ==========
newsletterForm.addEventListener('submit', (e) => {
  e.preventDefault();
  showToast('🌼 Subscribed! Welcome to our flower community.');
  newsletterForm.reset();
});

// ========== Testimonial Slider ==========
const testimonialItems = testimonialSlider.querySelectorAll('.testimonial-item');
let currentTestimonial = 0;

// Create dots
testimonialItems.forEach((_, index) => {
  const dot = document.createElement('button');
  dot.classList.add('dot');
  if (index === 0) dot.classList.add('active');
  dot.setAttribute('aria-label', `Testimonial ${index + 1}`);
  dot.addEventListener('click', () => showTestimonial(index));
  testimonialDots.appendChild(dot);
});

function showTestimonial(index) {
  testimonialItems.forEach((item, i) => {
    item.classList.toggle('active', i === index);
  });
  const dots = testimonialDots.querySelectorAll('.dot');
  dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  currentTestimonial = index;
}

setInterval(() => {
  const next = (currentTestimonial + 1) % testimonialItems.length;
  showTestimonial(next);
}, 5000);

// ========== Scroll Reveal ==========
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealElements.forEach(el => revealObserver.observe(el));

// ========== Animated Counters ==========
const counterElements = document.querySelectorAll('.stat-number');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

counterElements.forEach(el => counterObserver.observe(el));

function animateCounter(el) {
  const target = Number(el.dataset.target);
  const suffix = el.textContent.includes('%') ? '%' : '+';
  let current = 0;
  const increment = target / 50;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current).toLocaleString() + suffix;
  }, 30);
}

// ========== Initial Render ==========
renderFlowers(currentFilter, '');