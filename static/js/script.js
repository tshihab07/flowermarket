/* ==========================================
   Anisa Flower - Full Dynamic Functionality
   Includes Cart & Checkout System
========================================== */

$(document).ready(function () {

  /* ---------- Preloader Fix ---------- */
  function hidePreloader() {
    if (!$('#preloader').hasClass('hidden')) {
      $('#preloader').addClass('opacity-0 pointer-events-none');
      setTimeout(() => $('#preloader').remove(), 500);
    }
  }
  hidePreloader();
  setTimeout(hidePreloader, 3000);

  /* ---------- Sticky Header ---------- */
  $(window).on('scroll', function () {
    if ($(window).scrollTop() > 80) {
      $('#header').addClass('scrolled');
      $('#backToTop').addClass('visible');
    } else {
      $('#header').removeClass('scrolled');
      $('#backToTop').removeClass('visible');
    }
  });

  /* ---------- Mobile Navigation ---------- */
  $('#navToggle').on('click', function () {
    $('#navMenu').toggleClass('open');
    const icon = $('#navMenu').hasClass('open') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    $(this).html(icon);
  });

  $('.nav-link').on('click', function () {
    $('#navMenu').removeClass('open');
    $('#navToggle').html('<i class="fas fa-bars"></i>');
  });

  /* ---------- Flower Data (loaded from API) ---------- */
  let flowers = [];

  /* ---------- State ---------- */
  let currentFilter = 'all';
  let favorites = JSON.parse(localStorage.getItem('flowerFavorites') || '[]');
  let cart = JSON.parse(localStorage.getItem('flowerCart') || '[]');

  /* ---------- Load Products from API ---------- */
  function loadProducts() {
    $.ajax({
      url: '/api/products/',
      method: 'GET',
      success: function (data) {
        flowers = data.products || [];
        renderFlowers(currentFilter, '');
      },
      error: function () {
        $('#flowerGrid').html(`
          <div class="col-span-full text-center py-12 text-gray-500">
            <i class="fas fa-exclamation-triangle text-4xl text-[#15ac84] mb-3"></i>
            <p>Failed to load products. Please try again later.</p>
          </div>
        `);
      }
    });
  }

  /* ---------- Render Flowers ---------- */
  function renderFlowers(filter = 'all', searchTerm = '') {
    const filtered = flowers.filter(flower => {
      const matchesFilter = filter === 'all' || flower.category === filter;
      const matchesSearch = flower.name.toLowerCase().includes(searchTerm) ||
        flower.category.toLowerCase().includes(searchTerm) ||
        (flower.meaning && flower.meaning.toLowerCase().includes(searchTerm));
      return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
      $('#flowerGrid').html(`
        <div class="col-span-full text-center py-12 text-gray-500">
          <i class="fas fa-seedling text-4xl text-[#15ac84] mb-3"></i>
          <p>No flowers found. Try a different search or filter.</p>
        </div>
      `);
      return;
    }

    const cardsHtml = filtered.map(flower => `
      <article class="flower-card bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100" data-id="${flower.id}">
        <div class="card-img h-56 overflow-hidden relative">
          <img src="${flower.image}" alt="${flower.name}" class="w-full h-full object-cover" loading="lazy" />
          <span class="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-[#003527] capitalize">${flower.category}</span>
          <button class="fav-btn absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-[#003527] hover:bg-[#15ac84] hover:text-white transition ${favorites.includes(flower.id) ? 'active' : ''}" data-fav="${flower.id}">
            <i class="${favorites.includes(flower.id) ? 'fas' : 'far'} fa-heart"></i>
          </button>
        </div>
        <div class="p-5">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-lg font-bold text-[#003527]">${flower.name}</h3>
            <span class="font-bold text-[#15ac84]">$${flower.price.toFixed(2)}</span>
          </div>
          <p class="text-gray-500 text-sm mb-4 line-clamp-2">${flower.desc}</p>
          <div class="flex gap-2">
            <button class="btn-details flex-1 bg-gray-50 hover:bg-[#15ac84] hover:text-white text-[#003527] font-semibold py-2 px-4 rounded-full transition text-sm" data-id="${flower.id}">
              Details
            </button>
            <button class="btn-add-to-cart bg-[#15ac84] hover:bg-[#24b157] text-white font-semibold py-2 px-4 rounded-full transition text-sm flex items-center gap-1" data-id="${flower.id}">
              <i class="fas fa-cart-plus"></i> Add
            </button>
          </div>
        </div>
      </article>
    `).join('');

    $('#flowerGrid').html(cardsHtml);
  }

  /* ---------- Toggle Favorite ---------- */
  $(document).on('click', '.fav-btn', function (e) {
    e.stopPropagation();
    const id = Number($(this).data('fav'));
    const btn = $(this);

    if (favorites.includes(id)) {
      favorites = favorites.filter(fav => fav !== id);
      btn.removeClass('active').html('<i class="far fa-heart"></i>');
    } else {
      favorites.push(id);
      btn.addClass('active').html('<i class="fas fa-heart"></i>');
    }
    localStorage.setItem('flowerFavorites', JSON.stringify(favorites));
  });

  /* ---------- Add to Cart ---------- */
  $(document).on('click', '.btn-add-to-cart', function (e) {
    e.stopPropagation();
    const id = Number($(this).data('id'));
    addToCart(id);
  });

  function addToCart(id, quantity = 1) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ id, quantity });
    }
    localStorage.setItem('flowerCart', JSON.stringify(cart));
    updateCartUI();
    showToast('Added to cart!');
  }

  /* ---------- Remove from Cart ---------- */
  $(document).on('click', '.cart-remove', function () {
    const id = Number($(this).data('id'));
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('flowerCart', JSON.stringify(cart));
    updateCartUI();
    renderCartItems();
  });

  /* ---------- Update Cart Quantity ---------- */
  $(document).on('click', '.cart-qty-btn', function () {
    const id = Number($(this).data('id'));
    const action = $(this).data('action');
    const item = cart.find(item => item.id === id);
    if (item) {
      if (action === 'increase') {
        item.quantity += 1;
      } else if (action === 'decrease') {
        item.quantity -= 1;
        if (item.quantity <= 0) {
          cart = cart.filter(cartItem => cartItem.id !== id);
        }
      }
      localStorage.setItem('flowerCart', JSON.stringify(cart));
      updateCartUI();
      renderCartItems();
    }
  });

  /* ---------- Update Cart UI ---------- */
  function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    $('#cartCount').text(totalItems);

    const subtotal = cart.reduce((sum, item) => {
      const flower = flowers.find(f => f.id === item.id);
      return sum + (flower ? flower.price * item.quantity : 0);
    }, 0);
    $('#cartSubtotal').text('$' + subtotal.toFixed(2));
  }

  /* ---------- Render Cart Items ---------- */
  function renderCartItems() {
    if (cart.length === 0) {
      $('#cartItems').html(`
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-shopping-cart text-3xl text-gray-300 mb-3"></i>
          <p>Your cart is empty</p>
        </div>
      `);
      return;
    }

    let html = '';
    cart.forEach(item => {
      const flower = flowers.find(f => f.id === item.id);
      if (!flower) return;
      html += `
        <div class="flex items-center gap-4 py-3 border-b border-gray-100">
          <img src="${flower.image}" alt="${flower.name}" class="w-16 h-16 object-cover rounded-lg" />
          <div class="flex-1">
            <h4 class="font-semibold text-[#003527]">${flower.name}</h4>
            <p class="text-sm text-gray-500">$${flower.price.toFixed(2)}</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="cart-qty-btn w-7 h-7 rounded-full bg-gray-100 text-[#003527] hover:bg-[#15ac84] hover:text-white transition" data-id="${item.id}" data-action="decrease"><i class="fas fa-minus text-xs"></i></button>
            <span class="text-sm font-semibold">${item.quantity}</span>
            <button class="cart-qty-btn w-7 h-7 rounded-full bg-gray-100 text-[#003527] hover:bg-[#15ac84] hover:text-white transition" data-id="${item.id}" data-action="increase"><i class="fas fa-plus text-xs"></i></button>
          </div>
          <button class="cart-remove text-red-400 hover:text-red-600 transition" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
        </div>
      `;
    });
    $('#cartItems').html(html);
  }

  /* ---------- Cart Sidebar Toggle ---------- */
  $('#cartToggle').on('click', function () {
    $('#cartSidebar').addClass('open');
    $('#cartOverlay').addClass('open');
    renderCartItems();
  });
  $('#cartClose, #cartOverlay').on('click', function () {
    $('#cartSidebar').removeClass('open');
    $('#cartOverlay').removeClass('open');
  });

  /* ---------- Open Checkout Modal ---------- */
  $('#checkoutBtn').on('click', function () {
    if (cart.length === 0) {
      showToast('Your cart is empty!');
      return;
    }
    $('#cartSidebar').removeClass('open');
    $('#cartOverlay').removeClass('open');
    populateCheckoutSummary();
    $('#checkoutModal').addClass('active');
    $('body').css('overflow', 'hidden');
  });

  function populateCheckoutSummary() {
    let html = '';
    let total = 0;
    cart.forEach(item => {
      const flower = flowers.find(f => f.id === item.id);
      if (!flower) return;
      const itemTotal = flower.price * item.quantity;
      total += itemTotal;
      html += `
        <div class="flex justify-between items-center py-1">
          <span>${flower.name} x ${item.quantity}</span>
          <span>$${itemTotal.toFixed(2)}</span>
        </div>
      `;
    });
    $('#checkoutSummary').html(html);
    $('#checkoutTotal').text('$' + total.toFixed(2));
  }

  /* ---------- Checkout Modal Close ---------- */
  $('#checkoutClose, #checkoutOverlay').on('click', function () {
    $('#checkoutModal').removeClass('active');
    $('body').css('overflow', '');
  });

  /* ---------- Payment Method Toggle ---------- */
  $('input[name="payment"]').on('change', function () {
    if ($(this).val() === 'card') {
      $('#cardFields').show();
    } else {
      $('#cardFields').hide();
    }
  });

  /* ---------- Place Order ---------- */
  $('#checkoutForm').on('submit', function (e) {
    e.preventDefault();
    showToast('Order placed successfully! Thank you for your purchase.');
    cart = [];
    localStorage.setItem('flowerCart', JSON.stringify(cart));
    updateCartUI();
    $('#checkoutModal').removeClass('active');
    $('body').css('overflow', '');
    $('#checkoutForm')[0].reset();
    $('#cartSidebar').removeClass('open');
    $('#cartOverlay').removeClass('open');
  });

  /* ---------- Open Modal on Card Click ---------- */
  $(document).on('click', '.flower-card', function (e) {
    if ($(e.target).closest('.fav-btn, .btn-add-to-cart').length) return;
    const id = Number($(this).data('id'));
    openModal(id);
  });

  $(document).on('click', '.btn-details', function (e) {
    e.stopPropagation();
    const id = Number($(this).data('id'));
    openModal(id);
  });

  /* ---------- Modal Function ---------- */
  function openModal(id) {
    const flower = flowers.find(f => f.id === id);
    if (!flower) return;

    $('#modalBody').html(`
      <div class="modal-img">
        <img src="${flower.image}" alt="${flower.name}" />
      </div>
      <div class="modal-info">
        <span class="inline-block bg-[#15ac84]/10 text-[#15ac84] px-3 py-1 rounded-full text-xs font-semibold capitalize mb-3">${flower.category}</span>
        <h2 class="text-2xl font-bold text-[#003527] mb-1">${flower.name}</h2>
        <p class="text-xl font-bold text-[#15ac84] mb-4">$${flower.price.toFixed(2)}</p>
        <p class="text-gray-600 mb-5">${flower.desc}</p>
        <div class="space-y-3 mb-5">
          <div class="flex gap-2 text-sm text-gray-600">
            <i class="fas fa-heart text-[#15ac84] mt-1"></i>
            <span><strong class="text-[#003527]">Symbolic Meaning:</strong> ${flower.meaning}</span>
          </div>
          <div class="flex gap-2 text-sm text-gray-600">
            <i class="fas fa-tint text-[#15ac84] mt-1"></i>
            <span><strong class="text-[#003527]">Care Instructions:</strong> ${flower.care}</span>
          </div>
          <div class="flex gap-2 text-sm text-gray-600">
            <i class="fas fa-palette text-[#15ac84] mt-1"></i>
            <span><strong class="text-[#003527]">Color:</strong> ${flower.color}</span>
          </div>
        </div>
        <button class="btn-add-to-cart w-full bg-[#15ac84] hover:bg-[#24b157] text-white font-semibold py-3 rounded-full transition" data-id="${flower.id}">
          <i class="fas fa-cart-plus mr-2"></i> Add to Cart
        </button>
      </div>
    `);

    $('#flowerModal').addClass('active');
    $('body').css('overflow', 'hidden');
  }

  function closeModal() {
    $('#flowerModal').removeClass('active');
    $('body').css('overflow', '');
  }

  $('#modalOverlay, #modalClose').on('click', closeModal);
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModal();
      $('#checkoutModal').removeClass('active');
      $('#cartSidebar').removeClass('open');
      $('#cartOverlay').removeClass('open');
      $('body').css('overflow', '');
    }
  });

  /* ---------- Filter Buttons ---------- */
  $('.filter-btn').on('click', function () {
    $('.filter-btn').removeClass('active bg-[#003527] text-white');
    $(this).addClass('active bg-[#003527] text-white');
    currentFilter = $(this).data('filter');
    renderFlowers(currentFilter, $('#flowerSearch').val().toLowerCase().trim());
  });

  $('[data-filter-link]').on('click', function (e) {
    e.preventDefault();
    const filter = $(this).data('filterLink');
    $('.filter-btn').each(function () {
      $(this).toggleClass('active bg-[#003527] text-white', $(this).data('filter') === filter);
    });
    currentFilter = filter;
    renderFlowers(filter, $('#flowerSearch').val().toLowerCase().trim());
    $('#collection')[0].scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------- Search ---------- */
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  const handleSearch = debounce(() => {
    const term = $('#flowerSearch').val().toLowerCase().trim();
    renderFlowers(currentFilter, term);
  }, 300);

  $('#flowerSearch').on('input', handleSearch);

  $('#searchBtn').on('click', function () {
    const term = $('#flowerSearch').val().toLowerCase().trim();
    renderFlowers(currentFilter, term);
    $('#collection')[0].scrollIntoView({ behavior: 'smooth' });
  });

  $('#searchToggle').on('click', function () {
    $('#home')[0].scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => $('#flowerSearch').focus(), 600);
  });

  /* ---------- Back to Top ---------- */
  $('#backToTop').on('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Toast Notification ---------- */
  function showToast(message) {
    $('#toast').text(message).addClass('show');
    setTimeout(() => $('#toast').removeClass('show'), 3000);
  }

  /* ---------- Contact & Newsletter Forms ---------- */
  $('#contactForm').on('submit', function (e) {
    e.preventDefault();
    showToast('Thank you! Your message has been sent.');
    this.reset();
  });

  $('#newsletterForm').on('submit', function (e) {
    e.preventDefault();
    showToast('Subscribed! Welcome to our flower community.');
    this.reset();
  });

  /* ---------- Testimonial Slider ---------- */
  const $items = $('.testimonial-item');
  let currentTestimonial = 0;

  $items.each(function (index) {
    const dot = $('<button class="dot"></button>');
    if (index === 0) dot.addClass('active');
    dot.on('click', function () {
      showTestimonial(index);
    });
    $('#testimonialDots').append(dot);
  });

  function showTestimonial(index) {
    $items.removeClass('active').eq(index).addClass('active');
    $('#testimonialDots .dot').removeClass('active').eq(index).addClass('active');
    currentTestimonial = index;
  }

  setInterval(() => {
    const next = (currentTestimonial + 1) % $items.length;
    showTestimonial(next);
  }, 5000);

  /* ---------- Scroll Reveal ---------- */
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

  /* ---------- Animated Counters ---------- */
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
    const target = Number($(el).data('target'));
    const suffix = $(el).text().includes('%') ? '%' : '+';
    let current = 0;
    const increment = target / 50;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      $(el).text(Math.floor(current).toLocaleString() + suffix);
    }, 30);
  }

  /* ---------- Initialize ---------- */
  loadProducts();
  updateCartUI();
  renderCartItems();
});
