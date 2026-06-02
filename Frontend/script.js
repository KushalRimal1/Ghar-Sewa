/* ---- Provider Data ---- */
const DATA = [
  {
    id: 1, name: "Ram Bahadur", cat: "plumber", bc: "b-plumber", bl: "Plumber", stars: 4, rev: 3, dist: 3.97, icon: "👷", ci: "c1",
    desc: "Experienced plumber with 5+ years fixing leaks, pipe installation, and bathroom plumbing. Trusted by 100+ families."
  },
  {
    id: 2, name: "Sam Bahadur", cat: "electrician", bc: "b-electrician", bl: "Electrician", stars: 4, rev: 1, dist: 8.02, icon: "⚡", ci: "c2",
    desc: "Certified electrician skilled in home wiring, circuit breakers, and electrical safety. Available 7 days a week."
  },
  {
    id: 3, name: "Kusal Rimal", cat: "health", bc: "b-health", bl: "Health Check Up", stars: 3.5, rev: 2, dist: null, icon: "🩺", ci: "c3",
    desc: "Home visit health professional offering basic diagnostics, blood pressure checks, and wellness consultations."
  },
  {
    id: 4, name: "Subu Acharya", cat: "painter", bc: "b-painter", bl: "Painter", stars: 1, rev: 0, dist: 0.00, icon: "🎨", ci: "c4",
    desc: "New but skilled painter, offering interior and exterior painting at competitive prices. Quick and neat worker."
  },
  
  {
    id: 6, name: "Anita Sharma", cat: "cleaner", bc: "b-cleaner", bl: "Cleaner", stars: 5, rev: 8, dist: 1.20, icon: "🧹", ci: "c6",
    desc: "Top-rated house cleaner with a systematic approach to deep cleaning, regular maintenance, and move-in/out cleaning."
  },
  {
    id: 7, name: "Rajesh KC", cat: "plumber", bc: "b-plumber", bl: "Plumber", stars: 4.5, rev: 5, dist: 2.50, icon: "🔩", ci: "c1",
    desc: "Specializes in bathroom renovations and large-scale plumbing projects. Brings all tools and materials."
  },
  {
    id: 8, name: "Priya Tamang", cat: "cook", bc: "b-cook", bl: "Cook / Chef", stars: 5, rev: 12, dist: 0.80, icon: "🍳", ci: "c2",
    desc: "Professional home chef skilled in Nepali, Indian, Chinese, and continental cooking. Can cook for families or events."
  },
  {
    id: 9, name: "Dipak Rai", cat: "electrician", bc: "b-electrician", bl: "Electrician", stars: 4.5, rev: 7, dist: 3.10, icon: "💡", ci: "c3",
    desc: "Expert in solar panel installation, inverter wiring, and complete home electrical systems. Licensed and insured."
  },
  {
    id: 10, name: "Mina Gurung", cat: "cook", bc: "b-cook", bl: "Cook / Chef", stars: 4, rev: 4, dist: 1.60, icon: "🥘", ci: "c4",
    desc: "Home cook specializing in traditional Nepali cuisine and catering for small gatherings and festivals."
  },
];

let currentCat = 'all';
let currentSort = 'nearest';
let searchQuery = '';
let logoutButton = null;
let loginButton = null;
let serviceProviders = [];
let serviceProvidersLoadedFromServer = false;
let customerLocation = getSavedCustomerLocation();

const STATIC_PROVIDER_DETAILS = {
  1: { phone: '+977 9801111111', location: 'Balaju, Kathmandu', lat: 27.735, lng: 85.304 },
  2: { phone: '+977 9802222222', location: 'Patan, Lalitpur', lat: 27.676, lng: 85.318 },
  3: { phone: '+977 9803333333', location: 'Maharajgunj, Kathmandu', lat: 27.738, lng: 85.337 },
  4: { phone: '+977 9804444444', location: 'Koteshwor, Kathmandu', lat: 27.678, lng: 85.349 },
  
  6: { phone: '+977 9806666666', location: 'Boudha, Kathmandu', lat: 27.721, lng: 85.362 },
  7: { phone: '+977 9807777777', location: 'Kalanki, Kathmandu', lat: 27.693, lng: 85.281 },
  8: { phone: '+977 9808888888', location: 'Jhamsikhel, Lalitpur', lat: 27.677, lng: 85.309 },
  9: { phone: '+977 9809999999', location: 'Bhaktapur', lat: 27.672, lng: 85.429 },
  10: { phone: '+977 9810000000', location: 'Kirtipur, Kathmandu', lat: 27.678, lng: 85.278 }
};

const SERVICE_CATEGORY_META = {
  plumber: { label: 'Plumber', badge: 'b-plumber', icon: '👷', card: 'c1' },
  electrician: { label: 'Electrician', badge: 'b-electrician', icon: '⚡', card: 'c2' },
  cleaner: { label: 'Cleaner', badge: 'b-cleaner', icon: '🧹', card: 'c6' },
  technician: { label: 'Technician', badge: 'b-technician', icon: '🔧', card: 'c5' },
  health: { label: 'Health Check Up', badge: 'b-health', icon: '🩺', card: 'c3' },
  painter: { label: 'Painter', badge: 'b-painter', icon: '🎨', card: 'c4' },
  cook: { label: 'Cook / Chef', badge: 'b-cook', icon: '🍳', card: 'c2' },
  provider: { label: 'Service Provider', badge: 'b-technician', icon: '🧰', card: 'c5' }
};

const SERVICE_BASE_PRICES = {
  plumber: 900,
  electrician: 1000,
  cleaner: 700,
  technician: 1200,
  health: 1500,
  painter: 1800,
  cook: 1000,
  provider: 1000
};

const CURRENT_PATH = window.location.pathname.toLowerCase();
const CURRENT_PAGE = CURRENT_PATH.split('/').filter(Boolean).pop() || 'index.html';
const IS_AUTH_PAGE = CURRENT_PAGE === 'auth.html';
const SAVED_USER = localStorage.getItem('user');

const ROLE_HOME_PAGES = {
  customer: 'search.html',
  provider: 'features.html',
  admin: 'features.html'
};

const ROLE_NAV_PAGES = {
  customer: ['index.html', 'search.html', 'features.html', 'notifications.html', 'messages.html', 'reviews.html', 'profile.html'],
  provider: ['index.html', 'search.html', 'features.html', 'notifications.html', 'messages.html', 'reviews.html', 'profile.html'],
  admin: ['index.html', 'search.html', 'features.html', 'notifications.html', 'messages.html', 'reviews.html', 'profile.html']
};

function normalizeRole(role) {
  return ['customer', 'provider', 'admin'].includes(role) ? role : 'customer';
}

function getSavedUser() {
  if (!SAVED_USER) {
    return null;
  }

  try {
    return JSON.parse(SAVED_USER);
  } catch (error) {
    localStorage.removeItem('user');
    return null;
  }
}

function getRoleHomePage(role) {
  return ROLE_HOME_PAGES[normalizeRole(role)] || 'search.html';
}

function isAllowedPage(role, page) {
  return (ROLE_NAV_PAGES[normalizeRole(role)] || []).includes(page);
}

function applyRoleBasedVisibility() {
  if (!currentUser) {
    return;
  }

  const role = normalizeRole(currentUser.role);

  document.querySelectorAll('[data-role-allow]').forEach(element => {
    const allowedRoles = element.dataset.roleAllow
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
    element.style.display = allowedRoles.includes(role) ? '' : 'none';
  });

  document.querySelectorAll('[data-role-hide]').forEach(element => {
    const hiddenRoles = element.dataset.roleHide
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
    element.style.display = hiddenRoles.includes(role) ? 'none' : '';
  });

  document.querySelectorAll('.nav-links li').forEach(item => {
    const link = item.querySelector('a');
    if (!link) {
      return;
    }

    const page = (link.getAttribute('href') || '').split('/').pop().toLowerCase();
    item.style.display = isAllowedPage(role, page) ? '' : 'none';
  });

  const roleChip = document.getElementById('profileRoleChip');
  if (roleChip) {
    roleChip.textContent = `${formatRoleName(role)} dashboard`;
  }

  const workspaceTitle = document.getElementById('workspaceTitle');
  if (workspaceTitle) {
    const titles = {
      customer: 'Customer service request workspace',
      provider: 'Service provider job profile workspace',
      admin: 'Admin management and approval workspace'
    };
    workspaceTitle.textContent = titles[role] || 'Your Ghar Sewa tools';
  }
}

function formatRoleName(role) {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === 'provider') return 'Service Provider';
  return normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1);
}

function enforceRoleRoute() {
  if (!currentUser || IS_AUTH_PAGE) {
    return;
  }

  const role = normalizeRole(currentUser.role);
  const allowedPages = ROLE_NAV_PAGES[role] || [];

  if (!allowedPages.includes(CURRENT_PAGE)) {
    location.replace(getRoleHomePage(role));
    return;
  }
}

const STORED_USER = getSavedUser();

if (!IS_AUTH_PAGE && !STORED_USER) {
  location.replace('auth.html');
}

function starsHtml(n) {
  const full = Math.floor(n);
  const half = (n % 1) >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function distLabel(d) {
  return d === null ? 'unknown' : d.toFixed(2) + ' km';
}

function formatMoney(amount) {
  const value = Number(amount) || 0;
  return `Rs. ${value.toLocaleString('en-NP', { maximumFractionDigits: 0 })}`;
}

function getServicePrice(provider) {
  const category = normalizeServiceCategory(provider?.cat || provider?.category);
  return Number(provider?.servicePrice || provider?.price || SERVICE_BASE_PRICES[category] || SERVICE_BASE_PRICES.provider);
}

function getSavedCustomerLocation() {
  try {
    const saved = localStorage.getItem('customerServiceLocation');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    localStorage.removeItem('customerServiceLocation');
    return null;
  }
}

function saveCustomerLocation(location) {
  customerLocation = location;
  if (location) {
    localStorage.setItem('customerServiceLocation', JSON.stringify(location));
  } else {
    localStorage.removeItem('customerServiceLocation');
  }
  updateLocationButton();
  renderGrid();
}

function calculateDistanceKm(from, to) {
  if (!from || !to || typeof from.lat !== 'number' || typeof from.lng !== 'number' || typeof to.lat !== 'number' || typeof to.lng !== 'number') {
    return null;
  }

  const earthRadiusKm = 6371;
  const toRad = value => value * Math.PI / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function enrichProviderDistance(provider) {
  const providerLocation = typeof provider.lat === 'number' && typeof provider.lng === 'number'
    ? { lat: provider.lat, lng: provider.lng }
    : null;
  const calculatedDistance = calculateDistanceKm(customerLocation, providerLocation);
  return calculatedDistance === null ? provider : { ...provider, dist: calculatedDistance };
}

function formatLocationForRequest() {
  if (!customerLocation) {
    return 'Customer location: not shared yet';
  }

  const parts = [`Customer location: ${customerLocation.label || 'Shared GPS location'}`];
  if (typeof customerLocation.lat === 'number' && typeof customerLocation.lng === 'number') {
    parts.push(`Map: https://www.google.com/maps?q=${customerLocation.lat},${customerLocation.lng}`);
  }
  return parts.join('\n');
}

function updateLocationButton() {
  const btn = document.getElementById('useLocationBtn');
  if (!btn) return;
  btn.textContent = customerLocation
    ? `Location: ${customerLocation.label || 'GPS shared'}`
    : 'Use my location for nearest providers';
}

function requestCustomerLocation() {
  const fallbackToManualLocation = () => {
    const typedLocation = prompt('Enter your service address or nearby landmark so the provider can reach you:');
    if (typedLocation && typedLocation.trim()) {
      saveCustomerLocation({ label: typedLocation.trim(), source: 'manual' });
      setRequestStatus('Location saved. It will be included with service requests.', 'success');
    }
  };

  if (!navigator.geolocation) {
    fallbackToManualLocation();
    return;
  }

  setRequestStatus('Requesting your browser location...', 'loading');
  navigator.geolocation.getCurrentPosition(
    position => {
      const lat = Number(position.coords.latitude.toFixed(6));
      const lng = Number(position.coords.longitude.toFixed(6));
      saveCustomerLocation({ label: `GPS ${lat}, ${lng}`, lat, lng, source: 'gps' });
      setRequestStatus('Location saved. Nearest providers are sorted from your place.', 'success');
    },
    () => fallbackToManualLocation(),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
  );
}

function getServiceMeta(category) {
  return SERVICE_CATEGORY_META[category] || SERVICE_CATEGORY_META.provider;
}

function normalizeServiceCategory(category) {
  const normalized = (category || '').toLowerCase().trim();
  return SERVICE_CATEGORY_META[normalized] ? normalized : 'provider';
}

function getSearchText(provider) {
  return [
    provider.name,
    provider.bl,
    provider.cat,
    provider.desc,
    provider.skills,
    provider.qualifications,
    provider.phone,
    provider.location
  ].filter(Boolean).join(' ').toLowerCase();
}

function getServiceSortValue(provider) {
  if (typeof provider.sortId === 'number') return provider.sortId;
  return typeof provider.id === 'number' ? provider.id : 0;
}

function buildServiceProviderCard(provider, index) {
  const category = normalizeServiceCategory(provider.category);
  const meta = getServiceMeta(category);
  const label = provider.label || provider.skills || meta.label;
  const skills = provider.skills ? `Skills: ${provider.skills}` : '';
  const qualifications = provider.qualifications ? `Qualifications: ${provider.qualifications}` : '';
  const preferences = provider.jobPreferences ? `Preferences: ${provider.jobPreferences}` : '';
  const desc = [skills, qualifications, preferences].filter(Boolean).join(' | ') || 'Service provider profile';

  return {
    id: `user-${provider.id}`,
    sortId: 10000 + index,
    userId: provider.id,
    name: provider.name || 'Service Provider',
    cat: category,
    bc: meta.badge,
    bl: label,
    stars: Number(provider.rating) || 0,
    rev: Number(provider.reviews) || 0,
    dist: null,
    icon: meta.icon,
    ci: meta.card,
    desc,
    servicePrice: SERVICE_BASE_PRICES[category] || SERVICE_BASE_PRICES.provider,
    phone: provider.phone || '',
    location: provider.location || '',
    lat: typeof provider.lat === 'number' ? provider.lat : null,
    lng: typeof provider.lng === 'number' ? provider.lng : null,
    skills: provider.skills || '',
    qualifications: provider.qualifications || '',
    isSavedProfile: true
  };
}

function getProviderData() {
  const dynamicProviders = serviceProviders.map(buildServiceProviderCard).map(enrichProviderDistance);
  if (serviceProvidersLoadedFromServer) {
    return dynamicProviders;
  }

  const dynamicUserIds = new Set(dynamicProviders.map(provider => String(provider.userId)));
  const sampleProviders = DATA
    .map(provider => ({ ...provider, ...(STATIC_PROVIDER_DETAILS[provider.id] || {}) }))
    .map(enrichProviderDistance)
    .filter(provider => !dynamicUserIds.has(String(provider.userId)));
  return [...dynamicProviders, ...sampleProviders];
}

function renderDynamicServiceFilters() {
  const catList = document.getElementById('catList');
  if (!catList) return;

  const existing = new Set([...catList.querySelectorAll('[data-cat]')].map(item => item.dataset.cat));
  const categories = new Set(serviceProviders.map(provider => normalizeServiceCategory(provider.category)));

  categories.forEach(category => {
    if (existing.has(category)) return;
    const meta = getServiceMeta(category);
    const item = document.createElement('li');
    item.dataset.cat = category;
    item.innerHTML = `<div class="filter-dot"></div>${escapeHtml(meta.label)}`;
    item.addEventListener('click', function () {
      setFilter('cat', this);
    });
    catList.appendChild(item);
  });
}

async function loadServiceProviders() {
  if (!document.getElementById('grid')) return;

  try {
    const data = await getJsonWithFallback('profile.php?action=providers');
    if (data.success && Array.isArray(data.providers)) {
      serviceProvidersLoadedFromServer = true;
      serviceProviders = data.providers;
      renderDynamicServiceFilters();
      renderGrid();
    }
  } catch (error) {
    console.error('loadServiceProviders:', error);
  }
}

async function loadAdminProfileProviderSelect() {
  const select = document.getElementById('adminProfileProviderSelect');
  if (!select || !currentUser || normalizeRole(currentUser.role) !== 'admin') return;

  try {
    const data = await getJsonWithFallback(`profile.php?action=providers&includeUnapproved=1&adminId=${encodeURIComponent(currentUser.id)}`);
    if (!data.success || !Array.isArray(data.providers)) {
      throw new Error(data.message || 'Could not load providers');
    }

    select.innerHTML = '<option value="">Select service provider to manage</option>' +
      data.providers.map(provider => {
        const label = provider.label || provider.category || 'Service Provider';
        return `<option value="${provider.id}">${escapeHtml(provider.name)} - ${escapeHtml(label)}</option>`;
      }).join('');

    select.addEventListener('change', function () {
      if (this.value) {
        handleLoadProfile();
      } else {
        fillProfileForm({});
        setProfileStatus('Select a service provider to manage their profile.', 'loading');
      }
    });

    if (data.providers.length) {
      setProfileStatus('Select a service provider to manage their profile.', 'loading');
    }
  } catch (error) {
    setProfileStatus(`Could not load service providers: ${error.message}`, 'error');
  }
}

function getList() {
  let arr = getProviderData().filter(p => {
    const catOk = currentCat === 'all' || p.cat === currentCat;
    const searchOk = !searchQuery || getSearchText(p).includes(searchQuery);
    return catOk && searchOk;
  });

  if (currentSort === 'nearest') {
    arr.sort((a, b) => (a.dist === null ? 9999 : a.dist) - (b.dist === null ? 9999 : b.dist));
  } else if (currentSort === 'relevant') {
    arr.sort((a, b) => (b.rev - a.rev) || (b.stars - a.stars));
  } else if (currentSort === 'best') {
    arr.sort((a, b) => b.stars - a.stars);
  } else if (currentSort === 'new') {
    arr.sort((a, b) => getServiceSortValue(b) - getServiceSortValue(a));
  }
  return arr;
}

function renderGrid() {
  const grid = document.getElementById('grid');
  if (!grid) {
    return;
  }
  const list = getList();

  if (!list.length) {
    grid.innerHTML = '<p style="color:#aaa;padding:20px;grid-column:1/-1;font-size:15px">No providers found. Try a different filter.</p>';
    return;
  }

  grid.innerHTML = list.map(p => `
    <div class="provider-card" onclick="showProvider('${p.id}')">
      <div class="pcard-img ${p.ci}">${p.icon}</div>
      <div class="pcard-body">
        <div class="pcard-name">${escapeHtml(p.name)}</div>
        <span class="badge ${p.bc}">${escapeHtml(p.bl)}</span>
        <div class="pcard-rating">
          <span class="stars-row">${starsHtml(p.stars)}</span>
          <span class="rev-count">(${p.rev})</span>
        </div>
        <div class="pcard-dist">
          <div class="green-dot"></div>
          ${distLabel(p.dist)} · From ${formatMoney(getServicePrice(p))}
        </div>
      </div>
    </div>
  `).join('');
}

/* Filter */
function setFilter(type, el) {
  if (type === 'cat') {
    currentCat = el.dataset.cat;
    const catList = document.getElementById('catList');
    if (catList) {
      catList.querySelectorAll('li').forEach(l => l.classList.remove('active'));
    }
    el.classList.add('active');
    const labels = { all: 'All providers near you', plumber: 'Plumber near you', electrician: 'Electrician near you', cleaner: 'Cleaner near you', technician: 'Technician near you', health: 'Health Check Up near you', painter: 'Painter near you', cook: 'Cook / Chef near you', provider: 'Service providers near you' };
    const resHeading = document.getElementById('resHeading');
    if (resHeading) {
      resHeading.textContent = labels[currentCat] || `${getServiceMeta(currentCat).label} near you`;
    }
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = '';
    }
    searchQuery = '';
  } else {
    currentSort = el.dataset.sort;
    const sortList = document.getElementById('sortList');
    if (sortList) {
      sortList.querySelectorAll('li').forEach(l => l.classList.remove('active'));
    }
    el.classList.add('active');
  }
  renderGrid();
}

function runSearch() {
  const searchInput = document.getElementById('searchInput');
  const resHeading = document.getElementById('resHeading');
  if (!searchInput) {
    return;
  }

  searchQuery = searchInput.value.toLowerCase().trim();
  if (resHeading) {
    resHeading.textContent = searchQuery ? `Results for "${searchQuery}"` : 'All providers near you';
  }
  renderGrid();
}

function liveSearch() {
  const searchInput = document.getElementById('searchInput');
  const resHeading = document.getElementById('resHeading');
  if (!searchInput) {
    return;
  }

  searchQuery = searchInput.value.toLowerCase().trim();
  renderGrid();
  if (resHeading && searchQuery) resHeading.textContent = `Results for "${searchQuery}"`;
}

document.addEventListener('keypress', e => { if (e.key === 'Enter') runSearch(); });

/* Provider Detail Modal */
function showProvider(id) {
  const p = getProviderData().find(x => String(x.id) === String(id));
  const overlay = document.getElementById('pdOverlay');
  if (!p || !overlay) {
    return;
  }
  lastViewedProviderId = id;
  document.getElementById('pdImg').textContent = p.icon;
  document.getElementById('pdName').textContent = p.name;
  document.getElementById('pdStars').textContent = starsHtml(p.stars);
  document.getElementById('pdScore').textContent = p.stars;
  document.getElementById('pdRev').textContent = `(${p.rev} reviews)`;
  document.getElementById('pdBadge').className = 'badge ' + p.bc;
  document.getElementById('pdBadge').textContent = p.bl;
  document.getElementById('pdDesc').textContent = p.desc;
  document.getElementById('pdChips').innerHTML = `
    <span class="chip">📍 ${distLabel(p.dist)}</span>
    <span class="chip">✅ Verified</span>
    <span class="chip">⭐ ${p.stars}/5</span>
  `;
  document.getElementById('pdChips').innerHTML = `
    <span class="chip">Distance: ${distLabel(p.dist)}</span>
    <span class="chip">Phone: ${escapeHtml(p.phone || 'Not provided')}</span>
    <span class="chip">Base price: ${formatMoney(getServicePrice(p))}</span>
    <span class="chip">Provider area: ${escapeHtml(p.location || 'Ask in chat')}</span>
    <span class="chip">Verified</span>
    <span class="chip">${p.stars}/5</span>
    <span class="chip">Your place: ${escapeHtml(customerLocation?.label || 'Use location button')}</span>
  `;
  setRequestStatus('', '');
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closePD(e) {
  const overlay = document.getElementById('pdOverlay');
  if (!overlay) {
    return;
  }

  if (!e || e.target === overlay) {
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }
}

/* Auth Modal */
function resolveApiCandidates() {
  const origin = window.location.origin;
  const protocol = window.location.protocol;
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const hasProjectFolder = pathParts[0] && pathParts[0].toLowerCase() === 'project-v';

  const candidates = [];
  const localPorts = ['8000', '8080', '5500', '3000'];

  // Prefer the known working local dev server first.
  localPorts.forEach(port => {
    candidates.push(`http://localhost:${port}/Backend`);
    candidates.push(`http://127.0.0.1:${port}/Backend`);
  });

  if (protocol !== 'file:' && origin && origin !== 'null') {
    // Common case: frontend and backend are sibling folders under the same doc root.
    candidates.push(`${origin}/../Backend`);
    // Project root served directly, backend available at /Backend.
    candidates.push(hasProjectFolder ? `${origin}/Project-V/Backend` : `${origin}/Backend`);
    // Backend-only server mode (e.g. php -S localhost:8000 -t Backend).
    candidates.push(`${origin}`);
    candidates.push(`${origin}/Backend`);
    candidates.push(`${origin}/Project-V/Backend`);
  }

  // XAMPP/Apache common locations.
  candidates.push('http://localhost:80/Backend');
  candidates.push('http://127.0.0.1:80/Backend');
  candidates.push('http://localhost/Backend');
  candidates.push('http://127.0.0.1/Backend');
  candidates.push('http://localhost/Project-V/Backend');

  // PHP built-in server root fallbacks.
  localPorts.forEach(port => {
    candidates.push(`http://localhost:${port}`);
    candidates.push(`http://127.0.0.1:${port}`);
  });

  return [...new Set(candidates)];
}

const API_CANDIDATES = resolveApiCandidates();

async function postJsonWithFallback(endpoint, payload) {
  let lastError = null;

  for (const base of API_CANDIDATES) {
    try {
      const response = await fetch(`${base}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();
      let data = null;

      if (contentType.includes('application/json')) {
        data = JSON.parse(text);
      } else {
        // Try to recover JSON embedded in HTML/PHP warning output by extracting the
        // first JSON object-looking substring. This makes the frontend tolerant to
        // servers that accidentally emit warnings before the JSON body.
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          try {
            data = JSON.parse(text.slice(firstBrace, lastBrace + 1));
          } catch (e) {
            // fallthrough to throwing below
          }
        }
      }

      if (!data) {
        throw new Error(`Unexpected server response from ${base}: ${text.slice(0, 200)}`);
      }
      if (!response.ok && !data) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      // Attach the base URL that responded so callers can access related dev files if needed.
      try { data.__baseUrl = base; } catch (e) {}
      return data;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Unable to reach backend');
}

async function getJsonWithFallback(endpointWithQuery) {
  let lastError = null;

  for (const base of API_CANDIDATES) {
    try {
      const response = await fetch(`${base}/${endpointWithQuery}`, { method: 'GET' });
      const text = await response.text();
      const contentType = response.headers.get('content-type') || '';
      let data = null;

      if (contentType.includes('application/json')) {
        data = JSON.parse(text);
      } else {
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          try {
            data = JSON.parse(text.slice(firstBrace, lastBrace + 1));
          } catch (e) {
            // ignore, will throw below
          }
        }
      }

      if (!data) {
        throw new Error(`Unexpected server response from ${base}: ${text.slice(0,200)}`);
      }
      if (!response.ok && !data) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return data;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Unable to reach backend');
}

let selectedRole = 'customer';
let currentUser = null;

const ROLE_SIGNUP_RULES = {
  customer: {
    label: 'Customer',
    requiresPhone: true,
    requiresCategory: false,
    passwordPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/,
    passwordMessage: 'Customer password must be 8+ characters with uppercase, lowercase, and number',
    emailMessage: 'Customer email must be valid',
    phoneMessage: 'Customer phone is required and must be a valid Nepal number',
    extraMessage: 'Customer signup requires your phone number'
  },
  provider: {
    label: 'Service Provider',
    requiresPhone: true,
    requiresCategory: true,
    passwordPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/,
    passwordMessage: 'Provider password must be 8+ characters with uppercase, lowercase, and number',
    emailMessage: 'Provider email must be valid',
    phoneMessage: 'Provider phone is required and must be a valid Nepal number',
    extraMessage: 'Provider signup requires a primary skill'
  },
  admin: {
    label: 'Admin',
    requiresPhone: false,
    requiresCategory: false,
    passwordPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,64}$/,
    passwordMessage: 'Admin password must be 10+ characters with uppercase, lowercase, number, and symbol',
    emailMessage: 'Admin email must be a Ghar Sewa admin address',
    phoneMessage: '',
    extraMessage: 'Admin signup requires an official @gharsewa.com email'
  }
};

function setAuthGate(locked) {
  document.body.classList.toggle('auth-locked', locked);

  const authCloseBtn = document.querySelector('#authOverlay .m-close');
  if (authCloseBtn) {
    authCloseBtn.style.display = locked ? 'none' : 'flex';
  }

  if (!locked) {
    document.body.style.overflow = '';
  }
}

const VALIDATION_REGEX = {
  fullName: /^[A-Za-z][A-Za-z\s.'-]{1,49}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  phone: /^(?:\+977[-\s]?)?9\d{9}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/
};

function validateLoginInput(email, password) {
  if (!email || !password) {
    return 'Please fill in all fields';
  }

  const role = normalizeRole(selectedRole);
  const rules = ROLE_SIGNUP_RULES[role] || ROLE_SIGNUP_RULES.customer;

  if (!VALIDATION_REGEX.email.test(email)) {
    return rules.emailMessage;
  }

  if (role === 'admin' && !/@gharsewa\.com$/i.test(email)) {
    return rules.extraMessage;
  }

  return null;
}

function validateSignupInput({ fullName, email, phone, password, role, category }) {
  const normalizedRole = normalizeRole(role);
  const rules = ROLE_SIGNUP_RULES[normalizedRole] || ROLE_SIGNUP_RULES.customer;

  if (!fullName || !email || !password) {
    return 'Please fill in all required fields';
  }

  if (!VALIDATION_REGEX.fullName.test(fullName)) {
    return 'Full name must be 2-50 characters and use letters only';
  }

  if (!VALIDATION_REGEX.email.test(email)) {
    return rules.emailMessage;
  }

  if (normalizedRole !== 'admin' && /@gharsewa\.com$/i.test(email)) {
    return 'Official @gharsewa.com emails are reserved for Admin accounts only';
  }

  if (rules.requiresPhone && !phone) {
    return rules.phoneMessage || 'Phone number is required';
  }

  if (phone && !VALIDATION_REGEX.phone.test(phone)) {
    return rules.phoneMessage || 'Phone must be a valid Nepal number (e.g. +977 98XXXXXXXX)';
  }

  if (!rules.passwordPattern.test(password)) {
    return rules.passwordMessage;
  }

  if (normalizedRole === 'provider' && !category) {
    return rules.extraMessage;
  }

  if (normalizedRole === 'admin' && !/@gharsewa\.com$/i.test(email)) {
    return rules.extraMessage;
  }

  return null;
}

function ensureAuthOverlay() {
  if (document.getElementById('authOverlay') || IS_AUTH_PAGE) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'overlay auth-inline-overlay';
  overlay.id = 'authOverlay';
  overlay.addEventListener('click', closeAuth);
  overlay.innerHTML = `
    <div class="modal auth-card inline-auth-card" onclick="event.stopPropagation()">
      <button class="m-close" type="button" onclick="closeAuth()">x</button>
      <div class="m-head">
        <h2 id="mTitle">Welcome Back!</h2>
        <p id="mSub">Sign in to your Ghar Sewa account</p>
      </div>

      <div class="m-tabs" id="roleTabs">
        <button class="mtab active" type="button" onclick="setRole('customer',this)">Customer</button>
        <button class="mtab" type="button" onclick="setRole('provider',this)">Service Provider</button>
        <button class="mtab" type="button" onclick="setRole('admin',this)">Admin</button>
      </div>
      <p id="roleHint" class="page-note auth-role-hint">Customer signup: phone required, standard password rules.</p>

      <div class="m-body">
        <form id="loginForm">
          <div id="loginError" class="error-msg" style="display:none;"></div>
          <div class="fg">
            <label>Email Address</label>
            <input class="fc" type="email" id="loginEmail" placeholder="you@example.com"/>
          </div>
          <div class="fg">
            <label>Password</label>
            <input class="fc" type="password" id="loginPassword" placeholder="Password" required/>
          </div>
          <button class="sbtn" type="submit">Sign In</button>
          <p class="alt">No account? <a onclick="switchForm('reg')">Register here</a></p>
        </form>

        <form id="regForm" style="display:none">
          <div id="regError" class="error-msg" style="display:none;"></div>
          <input type="hidden" id="regRole" value="customer" />
          <div class="fg">
            <label>Full Name</label>
            <input class="fc" type="text" id="regName" placeholder="Ram Bahadur" required/>
          </div>
          <div class="fg">
            <label>Email</label>
            <input class="fc" type="email" id="regEmail" placeholder="you@example.com" required/>
          </div>
          <div class="fg">
            <label>Phone</label>
            <input class="fc" type="tel" id="regPhone" placeholder="+977 98XXXXXXXX"/>
          </div>
          <div class="fg" id="skillRow" style="display:none">
            <label>Your Primary Skill</label>
            <select class="fc" id="regSkill">
              <option value="">-- Select a skill --</option>
              <option>Plumber</option><option>Electrician</option>
              <option>Cook / Chef</option><option>Babysitter</option>
              <option>Cleaner</option><option>Carpenter</option>
              <option>Painter</option><option>Technician</option>
            </select>
          </div>
          <div class="fg">
            <label>Password</label>
            <input class="fc" type="password" id="regPassword" placeholder="Min. 8 characters" required/>
          </div>
          <button class="sbtn" type="submit">Create Account</button>
          <p class="alt">Have an account? <a onclick="switchForm('login')">Sign in</a></p>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.onsubmit = handleLogin;
  const regForm = document.getElementById('regForm');
  if (regForm) regForm.onsubmit = handleSignup;
  setRole(selectedRole || 'customer', document.querySelector('#roleTabs .mtab.active'));
}

function openAuth(mode) {
  ensureAuthOverlay();
  const overlay = document.getElementById('authOverlay');
  const loginForm = document.getElementById('loginForm');
  const regForm = document.getElementById('regForm');
  const forgotForm = document.getElementById('forgotForm');
  const otpForm = document.getElementById('otpForm');

  if (overlay) {
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  if (mode === 'login') {
    const title = document.getElementById('mTitle');
    const subtitle = document.getElementById('mSub');
    if (title) title.textContent = 'Welcome Back!';
    if (subtitle) subtitle.textContent = 'Sign in to your Ghar Sewa account';
    if (loginForm) loginForm.style.display = 'block';
    if (regForm) regForm.style.display = 'none';
    if (forgotForm) forgotForm.style.display = 'none';
    if (otpForm) otpForm.style.display = 'none';
  } else if (mode === 'register') {
    const title = document.getElementById('mTitle');
    const subtitle = document.getElementById('mSub');
    if (title) title.textContent = 'Create Account';
    if (subtitle) subtitle.textContent = 'Join Ghar Sewa today';
    if (loginForm) loginForm.style.display = 'none';
    if (regForm) regForm.style.display = 'block';
    if (forgotForm) forgotForm.style.display = 'none';
    if (otpForm) otpForm.style.display = 'none';
  } else if (mode === 'forgot') {
    const title = document.getElementById('mTitle');
    const subtitle = document.getElementById('mSub');
    if (title) title.textContent = 'Forgot Password';
    if (subtitle) subtitle.textContent = 'We will send an OTP to your email';
    if (loginForm) loginForm.style.display = 'none';
    if (regForm) regForm.style.display = 'none';
    if (forgotForm) forgotForm.style.display = 'block';
    if (otpForm) otpForm.style.display = 'none';
  } else if (mode === 'otp') {
    const title = document.getElementById('mTitle');
    const subtitle = document.getElementById('mSub');
    if (title) title.textContent = 'Reset Password';
    if (subtitle) subtitle.textContent = 'Enter OTP and your new password';
    if (loginForm) loginForm.style.display = 'none';
    if (regForm) regForm.style.display = 'none';
    if (forgotForm) forgotForm.style.display = 'none';
    if (otpForm) otpForm.style.display = 'block';
  }
  clearErrors();
  sessionStorage.setItem('authMode', mode);
}

function closeAuth(e) {
  const overlay = document.getElementById('authOverlay');
  if (!overlay) {
    return;
  }

  if (!currentUser && document.body.classList.contains('auth-locked')) {
    showError('Please login or create an account to continue');
    return;
  }

  if (!e || e.target === overlay) {
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    clearErrors();
  }
}

function switchForm(to) {
  if (to === 'reg') {
    openAuth('register');
  } else if (to === 'forgot') {
    openAuth('forgot');
  } else {
    openAuth('login');
  }
}

function updateRoleHint(role) {
  const roleHint = document.getElementById('roleHint');
  const normalizedRole = normalizeRole(role);
  const rules = ROLE_SIGNUP_RULES[normalizedRole] || ROLE_SIGNUP_RULES.customer;

  if (!roleHint) {
    return;
  }

  if (normalizedRole === 'admin') {
    roleHint.textContent = `${rules.label} signup: ${rules.extraMessage}.`;
  } else if (normalizedRole === 'provider') {
    roleHint.textContent = `${rules.label} signup: phone required, skill required, standard password rules.`;
  } else {
    roleHint.textContent = `${rules.label} signup: phone required, standard password rules.`;
  }
}

function setRole(role, btn) {
  selectedRole = role;
  document.querySelectorAll('.mtab').forEach(t => t.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  }
  const skillRow = document.getElementById('skillRow');
  if (skillRow) {
    skillRow.style.display = selectedRole === 'provider' ? 'block' : 'none';
  }

  const regPhone = document.getElementById('regPhone');
  if (regPhone) {
    regPhone.required = selectedRole !== 'admin';
    regPhone.placeholder = selectedRole === 'admin' ? '+977 98XXXXXXXX (optional)' : '+977 98XXXXXXXX';
  }

  const regRole = document.getElementById('regRole');
  if (regRole) {
    regRole.value = selectedRole;
  }

  const regPassword = document.getElementById('regPassword');
  if (regPassword) {
    regPassword.placeholder = selectedRole === 'admin' ? 'Admin password (10+ chars)' : 'Min. 8 characters';
  }

  updateRoleHint(selectedRole);
}

function showError(message) {
  let errorDiv = document.getElementById('authError');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = 'authError';
    errorDiv.className = 'auth-error';
    document.querySelector('.m-body').insertBefore(errorDiv, document.querySelector('.m-body').firstChild);
  }
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

function showBackendOfflineError(error) {
  const openedFromFile = window.location.protocol === 'file:';
  const openedFromWrongServer = window.location.protocol !== 'file:' && !API_CANDIDATES.some(base => base.startsWith(window.location.origin));
  const launchHint = 'Close this tab, then double-click "Launch Ghar Sewa.vbs" from the Project-V folder. It starts PHP and MariaDB automatically and opens the correct localhost page.';

  if (openedFromFile || openedFromWrongServer) {
    showError(`Backend is not connected because the app was opened without the project launcher. ${launchHint}`);
  } else {
    showError(`Backend is not responding. ${launchHint}`);
  }

  console.error('Backend connection error:', error);
}

function clearErrors() {
  const errorDiv = document.getElementById('authError');
  if (errorDiv) errorDiv.style.display = 'none';
}

async function handleLogin(e) {
  e.preventDefault();
  clearErrors();

  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  const validationError = validateLoginInput(email, password);
  if (validationError) {
    showError(validationError);
    return;
  }

  try {
    const data = await postJsonWithFallback('login.php', { email, password, role: selectedRole });

    if (data.success) {
      if (normalizeRole(data.user.role) !== normalizeRole(selectedRole)) {
        showError(`Please sign in as a ${ROLE_SIGNUP_RULES[normalizeRole(selectedRole)].label.toLowerCase()}`);
        return;
      }

      currentUser = data.user;
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuthGate(false);
      alert('Login successful! Welcome back, ' + data.user.fullName);
      if (IS_AUTH_PAGE) {
        location.href = getRoleHomePage(data.user.role);
      } else {
        closeAuth();
        updateUIForLoggedInUser();
        syncAuthControls();
        applyRoleBasedVisibility();
      }
    } else {
      showError(data.message);
    }
  } catch (error) {
    showBackendOfflineError(error);
  }
}

async function handleSignup(e) {
  e.preventDefault();
  clearErrors();

  const fullName = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const phone = document.getElementById('regPhone').value.trim();
  const category = document.getElementById('regSkill').value.trim();
  const password = document.getElementById('regPassword').value;
  const roleField = document.getElementById('regRole');
  const role = normalizeRole((roleField && roleField.value) || selectedRole);

  const validationError = validateSignupInput({
    fullName,
    email,
    phone,
    password,
    role,
    category
  });
  if (validationError) {
    showError(validationError);
    return;
  }


  try {
    const data = await postJsonWithFallback('signup.php', { fullName, email, phone, password, role, category });

    if (data.success) {
      currentUser = data.user;
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuthGate(false);
      alert('Registration successful! Welcome to Ghar Sewa, ' + data.user.fullName);
      if (IS_AUTH_PAGE) {
        location.href = getRoleHomePage(data.user.role);
      } else {
        closeAuth();
        updateUIForLoggedInUser();
        syncAuthControls();
        applyRoleBasedVisibility();
      }
    } else {
      showError(data.message);
    }
  } catch (error) {
    showBackendOfflineError(error);
  }
}


async function handleForgotPassword(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  clearErrors();
  showError('Forgot password has been disabled. Please contact support or create a new account.');
  return false;
}

async function handleVerifyOTP(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  clearErrors();
  showError('Forgot password has been disabled. Password reset is not available in this build.');
  return false;
}

function updateUIForLoggedInUser() {
  if (logoutButton) {
    logoutButton.style.display = 'inline-flex';
  }

  if (currentUser) {
    const avatar = document.querySelector('.avatar');
    if (!avatar) {
      return;
    }
    setAvatarImage(avatar, getStoredProfilePicture(), currentUser.fullName);
    avatar.title = currentUser.fullName + ' (' + currentUser.role + ')';
  }
}

function syncAuthControls() {
  const navRight = document.querySelector('.nav-right');
  if (!navRight) {
    return;
  }

  if (!loginButton) {
    loginButton = document.getElementById('loginBtn');
  }

  if (!loginButton) {
    loginButton = document.createElement('a');
    loginButton.id = 'loginBtn';
    loginButton.className = 'login-btn';
    loginButton.textContent = 'Login / Sign Up';
    navRight.insertBefore(loginButton, navRight.querySelector('.avatar'));
  }
  loginButton.href = '#';
  loginButton.onclick = function (event) {
    event.preventDefault();
    openAuth('login');
  };

  if (!logoutButton) {
    logoutButton = document.getElementById('logoutBtn');
  }

  if (!logoutButton) {
    logoutButton = document.createElement('button');
    logoutButton.id = 'logoutBtn';
    logoutButton.className = 'logout-btn';
    logoutButton.type = 'button';
    logoutButton.textContent = 'Logout';
    logoutButton.addEventListener('click', logout);
    navRight.insertBefore(logoutButton, navRight.querySelector('.avatar'));
  }

  logoutButton.style.display = currentUser ? 'inline-flex' : 'none';
  loginButton.style.display = 'inline-flex';
  loginButton.textContent = currentUser ? 'Switch Account' : 'Login / Sign Up';
  loginButton.title = currentUser
    ? `Currently signed in as ${formatRoleName(currentUser.role)}. Switch to another account.`
    : 'Login or create an account';
}

function setFeatureOutput(id, payload) {
  const target = document.getElementById(id);
  if (!target) return;
  if (typeof payload === 'string') {
    target.textContent = payload;
    return;
  }
  target.textContent = JSON.stringify(payload, null, 2);
}

function setProfileStatus(message, type = '') {
  const status = document.getElementById('profileStatus');
  if (!status) {
    setFeatureOutput('profileOutput', message);
    return;
  }

  status.textContent = message;
  status.className = `profile-status ${type}`.trim();
}

function getProfileCacheKey() {
  const targetUserId = getProfileTargetUserId();
  return targetUserId ? `profile_${targetUserId}` : '';
}

function getProfileTargetUserId() {
  if (!currentUser || !currentUser.id) return 0;

  const adminProviderSelect = document.getElementById('adminProfileProviderSelect');
  if (normalizeRole(currentUser.role) === 'admin' && adminProviderSelect) {
    return parseInt(adminProviderSelect.value || '0', 10);
  }

  return parseInt(currentUser.id, 10);
}

function getProfileTargetLabel() {
  const adminProviderSelect = document.getElementById('adminProfileProviderSelect');
  if (normalizeRole(currentUser?.role) === 'admin' && adminProviderSelect) {
    const selected = adminProviderSelect.options[adminProviderSelect.selectedIndex];
    return selected && selected.value ? selected.textContent : 'selected provider';
  }

  return 'profile';
}

function readProfileForm() {
  return {
    skills: document.getElementById('profileSkills')?.value.trim() || '',
    qualifications: document.getElementById('profileQualifications')?.value.trim() || '',
    jobPreferences: document.getElementById('profilePreferences')?.value.trim() || '',
    hiringRequirements: document.getElementById('profileHiringReq')?.value.trim() || '',
    profilePicture: getStoredProfilePicture()
  };
}

function fillProfileForm(profile) {
  const fields = {
    profileSkills: profile.skills,
    profileQualifications: profile.qualifications,
    profilePreferences: profile.job_preferences ?? profile.jobPreferences,
    profileHiringReq: profile.hiring_requirements ?? profile.hiringRequirements
  };

  Object.entries(fields).forEach(([id, value]) => {
    const field = document.getElementById(id);
    if (field) field.value = value || '';
  });

  const profilePicture = profile.profile_picture ?? profile.profilePicture;
  if (profilePicture !== undefined) {
    storeProfilePicture(profilePicture);
  }
}

function getProfilePictureCacheKey() {
  const targetUserId = getProfileTargetUserId();
  return targetUserId ? `profile_picture_${targetUserId}` : '';
}

function getStoredProfilePicture() {
  const cacheKey = getProfilePictureCacheKey();
  if (cacheKey) {
    return localStorage.getItem(cacheKey) || currentUser?.profilePicture || currentUser?.profile_picture || '';
  }
  return currentUser?.profilePicture || currentUser?.profile_picture || '';
}

function setAvatarImage(element, imageData, fallbackName) {
  if (!element) return;
  const initial = (fallbackName || '?').charAt(0).toUpperCase();
  if (imageData) {
    element.textContent = '';
    element.style.backgroundImage = `url("${imageData}")`;
    element.classList.add('has-photo');
  } else {
    element.textContent = initial;
    element.style.backgroundImage = '';
    element.classList.remove('has-photo');
  }
}

function renderProfilePicture() {
  if (!currentUser) return;
  const imageData = getStoredProfilePicture();
  setAvatarImage(document.getElementById('profileAvatarBig'), imageData, currentUser.fullName);
  setAvatarImage(document.querySelector('.avatar'), imageData, currentUser.fullName);
  const removeBtn = document.getElementById('removeProfilePictureBtn');
  if (removeBtn) removeBtn.style.display = imageData ? 'inline-flex' : 'none';
}

function storeProfilePicture(imageData) {
  const cacheKey = getProfilePictureCacheKey();
  if (cacheKey) {
    if (imageData) {
      localStorage.setItem(cacheKey, imageData);
    } else {
      localStorage.removeItem(cacheKey);
    }
  }

  if (currentUser && String(getProfileTargetUserId()) === String(currentUser.id)) {
    currentUser.profilePicture = imageData || '';
    currentUser.profile_picture = imageData || '';
    localStorage.setItem('user', JSON.stringify(currentUser));
  }

  renderProfilePicture();
}

function handleProfilePictureChange(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    setProfileStatus('Please choose an image file.', 'error');
    event.target.value = '';
    return;
  }

  if (file.size > 1.5 * 1024 * 1024) {
    setProfileStatus('Profile picture must be smaller than 1.5 MB.', 'error');
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    storeProfilePicture(reader.result);
    setProfileStatus('Photo added. Press Save Profile to keep it on the server.', 'success');
  };
  reader.onerror = () => setProfileStatus('Could not read the selected image.', 'error');
  reader.readAsDataURL(file);
}

function removeProfilePicture() {
  storeProfilePicture('');
  const input = document.getElementById('profilePictureInput');
  if (input) input.value = '';
  setProfileStatus('Profile photo removed. Press Save Profile to update the server.', 'success');
}

async function handleSaveProfile() {
  if (!currentUser) {
    setProfileStatus('Please login first', 'error');
    return false;
  }

  const targetUserId = getProfileTargetUserId();
  if (!targetUserId) {
    setProfileStatus(normalizeRole(currentUser.role) === 'admin'
      ? 'Please select a service provider before saving.'
      : 'Please login again before saving your profile.', 'error');
    return;
  }

  const payload = {
    userId: targetUserId,
    ...readProfileForm()
  };

  setProfileStatus('Saving profile...', 'loading');

  try {
    const data = await postJsonWithFallback('profile.php?action=save', payload);
    if (!data.success) {
      throw new Error(data.message || 'Could not save profile');
    }

    const cacheKey = getProfileCacheKey();
    if (cacheKey) {
      localStorage.setItem(cacheKey, JSON.stringify(payload));
    }

    setProfileStatus(`${getProfileTargetLabel()} saved successfully`, 'success');
    setTimeout(() => {
      const status = document.getElementById('profileStatus');
      if (status && status.textContent.endsWith('saved successfully')) status.textContent = '';
    }, 3000);
    return true;
  } catch (error) {
    const cacheKey = getProfileCacheKey();
    if (cacheKey) {
      localStorage.setItem(cacheKey, JSON.stringify(payload));
      setProfileStatus(`Saved in this browser. Server save failed: ${error.message}`, 'error');
      return false;
    }

    setProfileStatus(`Error: ${error.message}`, 'error');
    return false;
  }
}

async function handleLoadProfile() {
  if (!currentUser) {
    setProfileStatus('Please login first', 'error');
    return false;
  }

  const targetUserId = getProfileTargetUserId();
  if (!targetUserId) {
    setProfileStatus(normalizeRole(currentUser.role) === 'admin'
      ? 'Please select a service provider before loading.'
      : 'Please login again before loading your profile.', 'error');
    return false;
  }

  setProfileStatus('Loading profile...', 'loading');

  try {
    const data = await getJsonWithFallback(`profile.php?action=get&userId=${encodeURIComponent(targetUserId)}`);
    if (data.success && data.profile) {
      fillProfileForm(data.profile);
      const cacheKey = getProfileCacheKey();
      if (cacheKey) {
        localStorage.setItem(cacheKey, JSON.stringify({
          userId: targetUserId,
          skills: data.profile.skills || '',
          qualifications: data.profile.qualifications || '',
          jobPreferences: data.profile.job_preferences || '',
          hiringRequirements: data.profile.hiring_requirements || '',
          profilePicture: data.profile.profile_picture || ''
        }));
      }
      setProfileStatus(`${getProfileTargetLabel()} loaded`, 'success');
      setTimeout(() => {
        const status = document.getElementById('profileStatus');
        if (status && status.textContent.endsWith('loaded')) status.textContent = '';
      }, 3000);
      return true;
    }

    throw new Error(data.message || 'Profile not found');
  } catch (error) {
    const cacheKey = getProfileCacheKey();
    const cached = cacheKey ? localStorage.getItem(cacheKey) : null;

    if (cached) {
      try {
        fillProfileForm(JSON.parse(cached));
        setProfileStatus(`Loaded saved browser copy. Server load failed: ${error.message}`, 'error');
        return false;
      } catch (parseError) {
        localStorage.removeItem(cacheKey);
      }
    }

    setProfileStatus(`Error: ${error.message}`, 'error');
    return false;
  }
}

async function handleCreateJob() {
  if (!currentUser) {
    setFeatureOutput('jobsOutput', 'Please login first');
    return;
  }

  if (!['provider', 'admin'].includes(currentUser.role)) {
    setFeatureOutput('jobsOutput', 'Only provider/admin can post jobs');
    return;
  }

  const payload = {
    providerId: currentUser.id,
    title: document.getElementById('jobTitle').value.trim(),
    description: document.getElementById('jobDescription').value.trim(),
    requirements: document.getElementById('jobRequirements').value.trim(),
    applicationInstructions: document.getElementById('jobInstructions').value.trim(),
    location: document.getElementById('jobLocation').value.trim(),
    industry: document.getElementById('jobIndustry').value.trim(),
    experienceLevel: document.getElementById('jobExperience').value
  };

  if (!payload.title || !payload.description) {
    setFeatureOutput('jobsOutput', 'Title and description are required');
    return;
  }

  try {
    const data = await postJsonWithFallback('jobs.php?action=create', payload);
    setFeatureOutput('jobsOutput', data);
  } catch (error) {
    setFeatureOutput('jobsOutput', `Error: ${error.message}`);
  }
}

async function handleSearchJobs() {
  const qSource = document.getElementById('jobSearchQ') || document.getElementById('jobTitle');
  const locationSource = document.getElementById('jobSearchLocation') || document.getElementById('jobLocation');
  const industrySource = document.getElementById('jobSearchIndustry') || document.getElementById('jobIndustry');
  const experienceSource = document.getElementById('jobSearchExperience') || document.getElementById('jobExperience');
  const q = encodeURIComponent((qSource?.value || '').trim());
  const location = encodeURIComponent((locationSource?.value || '').trim());
  const industry = encodeURIComponent((industrySource?.value || '').trim());
  const experienceLevel = encodeURIComponent(experienceSource?.value || '');

  const query = `jobs.php?action=list&q=${q}&location=${location}&industry=${industry}&experienceLevel=${experienceLevel}`;

  try {
    const data = await getJsonWithFallback(query);
    setFeatureOutput('jobsOutput', data);
  } catch (error) {
    setFeatureOutput('jobsOutput', `Error: ${error.message}`);
  }
}

function adminUserRow(user) {
  const role = normalizeRole(user.role);
  const category = user.category ? ` - ${escapeHtml(user.category)}` : '';
  const providerDetails = role === 'provider'
    ? `<p>${escapeHtml(user.skills || 'No skills added')} | ${escapeHtml(user.qualifications || 'No qualifications added')}</p>`
    : '';
  const status = role === 'provider'
    ? `<span class="admin-status ${Number(user.is_verified) ? 'approved' : 'pending'}">${Number(user.is_verified) ? 'Approved' : 'Pending'}</span>`
    : '';
  const approve = role === 'provider' && !Number(user.is_verified)
    ? `<button class="mini-action" onclick="approveProvider(${user.id})">Approve</button>`
    : '';

  return `<div class="admin-row">
    <div><strong>${escapeHtml(user.full_name || 'Unnamed')}</strong><p>${escapeHtml(user.email || '')}${category}</p>${providerDetails}</div>
    <div class="admin-row-actions">${status}${approve}</div>
  </div>`;
}

function adminJobRow(job) {
  const nextStatus = job.status === 'open' ? 'closed' : 'open';
  return `<div class="admin-row">
    <div><strong>${escapeHtml(job.title || 'Untitled job')}</strong><p>${escapeHtml(job.provider_name || 'Provider')} - ${escapeHtml(job.location || 'No location')} - ${escapeHtml(job.status || 'open')}</p></div>
    <button class="mini-action" onclick="setAdminJobStatus(${job.id}, '${nextStatus}')">${nextStatus === 'closed' ? 'Close' : 'Open'}</button>
  </div>`;
}

function adminReviewRow(review) {
  const rating = Number(review.rating) || 0;
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  return `<div class="admin-row">
    <div>
      <strong>${escapeHtml(review.provider_name || 'Provider')} - <span class="stars-row" style="color: #F1C40F;">${stars}</span></strong>
      <p>${escapeHtml(review.reviewer_name || 'Customer')}: ${escapeHtml(review.comment || 'No comment')}</p>
      <p>Provider average: ${Number(review.provider_avg_rating || 0).toFixed(1)} (${review.provider_total_reviews || 0} reviews)</p>
    </div>
  </div>`;
}

function adminPaymentRow(request) {
  const nextStatus = request.paymentStatus === 'paid' ? 'unpaid' : 'paid';
  const bill = request.servicePrice > 0 ? formatMoney(request.servicePrice) : 'Not billed yet';
  return `<div class="admin-row">
    <div>
      <strong>${escapeHtml(request.providerName || 'Provider')} payment</strong>
      <p>${escapeHtml(request.customerName || 'Customer')} - ${escapeHtml(request.service || 'Service')} - request ${escapeHtml(request.status)}</p>
      <p>Work: ${escapeHtml(request.workStatus)} | Bill: ${escapeHtml(bill)}</p>
      <p>Payment: ${escapeHtml(request.paymentStatus)}${request.paymentNote ? ' - ' + escapeHtml(request.paymentNote) : ''}</p>
    </div>
    <button class="mini-action" onclick="setAdminPaymentStatus(${request.id}, '${nextStatus}')">Mark ${nextStatus}</button>
  </div>`;
}

async function loadAdminDashboard() {
  const btn = document.getElementById('loadAdminBtn');
  if (btn) {
    btn.textContent = 'Loading Admin Data...';
    btn.style.opacity = '0.7';
    btn.disabled = true;
  }

  if (!currentUser || normalizeRole(currentUser.role) !== 'admin') {
    setFeatureOutput('adminOutput', 'Only admins can load management data');
    if (btn) { btn.textContent = 'Load Admin Data'; btn.style.opacity = '1'; btn.disabled = false; }
    return;
  }

  try {
    const data = await getJsonWithFallback(`admin.php?action=dashboard&adminId=${encodeURIComponent(currentUser.id)}`);
    if (!data.success) {
      setFeatureOutput('adminOutput', data);
      if (btn) { btn.textContent = 'Load Admin Data'; btn.style.opacity = '1'; btn.disabled = false; }
      return;
    }

    const [reviewData, requestData] = await Promise.all([
      getJsonWithFallback(`reviews.php?action=admin-all&adminId=${encodeURIComponent(currentUser.id)}`).catch(error => ({ success: false, error: error.message, reviews: [] })),
      getJsonWithFallback(`service-requests.php?action=list&userId=${encodeURIComponent(currentUser.id)}`).catch(error => ({ success: false, error: error.message, requests: [] }))
    ]);

    const providers = (data.users || []).filter(user => normalizeRole(user.role) === 'provider');
    const customers = (data.users || []).filter(user => normalizeRole(user.role) === 'customer');
    const jobs = data.jobs || [];
    const reviews = reviewData.success ? (reviewData.reviews || []) : [];
    const requests = requestData.success ? (requestData.requests || []).map(normalizeServiceRequest) : [];

    const providerTarget = document.getElementById('adminProviders');
    const customerTarget = document.getElementById('adminCustomers');
    const jobsTarget = document.getElementById('adminJobs');
    const reviewsTarget = document.getElementById('adminReviews');
    const paymentsTarget = document.getElementById('adminPayments');

    if (providerTarget) providerTarget.innerHTML = providers.length ? providers.map(adminUserRow).join('') : '<p class="empty-note">No providers found.</p>';
    if (customerTarget) customerTarget.innerHTML = customers.length ? customers.map(adminUserRow).join('') : '<p class="empty-note">No customers found.</p>';
    if (jobsTarget) jobsTarget.innerHTML = jobs.length ? jobs.map(adminJobRow).join('') : '<p class="empty-note">No job profiles found.</p>';
    if (reviewsTarget) reviewsTarget.innerHTML = reviews.length ? reviews.map(adminReviewRow).join('') : '<p class="empty-note">No reviews found.</p>';
    if (paymentsTarget) paymentsTarget.innerHTML = requests.length ? requests.map(adminPaymentRow).join('') : '<p class="empty-note">No service payments found.</p>';

    setFeatureOutput('adminOutput', {
      success: true,
      providers: providers.length,
      customers: customers.length,
      jobProfiles: jobs.length,
      reviews: reviews.length,
      paymentsTracked: requests.length
    });

    if (btn) { btn.textContent = 'Load Admin Data'; btn.style.opacity = '1'; btn.disabled = false; }
    
    // Smooth scroll to the admin tools section so the user sees the loaded data
    const adminTools = document.getElementById('adminTools');
    if (adminTools) {
      adminTools.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch (error) {
    setFeatureOutput('adminOutput', `Error: ${error.message}`);
    if (btn) { btn.textContent = 'Load Admin Data'; btn.style.opacity = '1'; btn.disabled = false; }
  }
}

async function approveProvider(providerUserId) {
  if (!currentUser || normalizeRole(currentUser.role) !== 'admin') return;
  try {
    const data = await postJsonWithFallback('admin.php?action=approveProvider', {
      adminId: currentUser.id,
      providerUserId
    });
    setFeatureOutput('adminOutput', data);
    loadAdminDashboard();
  } catch (error) {
    setFeatureOutput('adminOutput', `Error: ${error.message}`);
  }
}

async function setAdminJobStatus(jobId, status) {
  if (!currentUser || normalizeRole(currentUser.role) !== 'admin') return;
  try {
    const data = await postJsonWithFallback('admin.php?action=setJobStatus', {
      adminId: currentUser.id,
      jobId,
      status
    });
    setFeatureOutput('adminOutput', data);
    loadAdminDashboard();
  } catch (error) {
    setFeatureOutput('adminOutput', `Error: ${error.message}`);
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('user');
  alert('Logged out successfully');
  sessionStorage.removeItem('gharsewaAuthPrompt');
  location.href = 'auth.html';
}

/* ===== MESSAGING SYSTEM ===== */
let currentPartnerId = null;
let currentAdminThread = null;
let msgPollTimer = null;
let allProviders = [];
let currentLocalRequestId = null;

function getStoredServiceRequestsForCurrentUser() {
  if (!currentUser) return [];

  try {
    const allRequests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    const role = normalizeRole(currentUser.role);
    return allRequests.filter(request => {
      if (role === 'provider') return String(request.providerId) === String(currentUser.id);
      if (role === 'customer') return String(request.customerId) === String(currentUser.id);
      return true;
    });
  } catch (error) {
    localStorage.removeItem('serviceRequests');
    return [];
  }
}

async function setAdminPaymentStatus(requestId, paymentStatus) {
  if (!currentUser || normalizeRole(currentUser.role) !== 'admin') return;
  const paymentNote = paymentStatus === 'paid'
    ? 'Payment marked as sent to service provider by admin.'
    : 'Payment is pending or not yet sent to provider.';

  try {
    const data = await postJsonWithFallback('service-requests.php?action=update-payment', {
      adminId: currentUser.id,
      requestId,
      paymentStatus,
      paymentNote
    });
    setFeatureOutput('adminOutput', data);
    loadAdminDashboard();
  } catch (error) {
    setFeatureOutput('adminOutput', `Error: ${error.message}`);
  }
}

function normalizeServiceRequest(rawRequest) {
  const isServerRequest = Boolean(rawRequest.created_at || rawRequest.provider_id || rawRequest.customer_id);
  return {
    id: isServerRequest ? Number(rawRequest.id) : rawRequest.id,
    providerId: rawRequest.provider_id ?? rawRequest.providerId,
    customerId: rawRequest.customer_id ?? rawRequest.customerId,
    providerName: rawRequest.provider_name ?? rawRequest.providerName,
    customerName: rawRequest.customer_name ?? rawRequest.customerName,
    service: rawRequest.service_label ?? rawRequest.service,
    serviceLabel: rawRequest.service_label ?? rawRequest.serviceLabel ?? rawRequest.service,
    customerPhone: rawRequest.customer_phone ?? rawRequest.customerPhone ?? '',
    customerLocation: rawRequest.customer_location ?? rawRequest.customerLocation ?? '',
    message: rawRequest.message || '',
    status: rawRequest.status || 'pending',
    workStatus: rawRequest.work_status ?? rawRequest.workStatus ?? 'requested',
    servicePrice: Number(rawRequest.service_price ?? rawRequest.servicePrice ?? 0),
    billingNote: rawRequest.billing_note ?? rawRequest.billingNote ?? '',
    paymentStatus: rawRequest.payment_status ?? rawRequest.paymentStatus ?? 'unpaid',
    paymentNote: rawRequest.payment_note ?? rawRequest.paymentNote ?? '',
    createdAt: rawRequest.created_at ?? rawRequest.createdAt,
    isServerRequest
  };
}

async function loadServiceRequestsForCurrentUser() {
  const localRequests = getStoredServiceRequestsForCurrentUser().map(normalizeServiceRequest);
  if (!currentUser) return localRequests;

  try {
    const data = await getJsonWithFallback(`service-requests.php?action=list&userId=${encodeURIComponent(currentUser.id)}`);
    if (!data.success) return localRequests;
    return [...(data.requests || []).map(normalizeServiceRequest), ...localRequests];
  } catch (error) {
    console.error('loadServiceRequestsForCurrentUser:', error);
    return localRequests;
  }
}

function renderLocalRequestContact(request) {
  const active = currentLocalRequestId === request.id ? ' active' : '';
  const createdAt = request.createdAt ? new Date(request.createdAt) : null;
  const time = createdAt && !Number.isNaN(createdAt.getTime())
    ? createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';
  const title = normalizeRole(currentUser.role) === 'provider'
    ? `Request: ${request.service || 'Service'}`
    : request.providerName || 'Service request';
  const preview = request.message || 'Customer service request';

  return `<div class="msg-contact local-request-contact${active}" onclick="openLocalServiceRequest(${request.id}, ${request.isServerRequest ? 'true' : 'false'})">
    <div class="msg-contact-avatar">R</div>
    <div class="msg-contact-info"><div class="msg-contact-name">${escapeHtml(title)} <span class="msg-unread">${escapeHtml(request.status)}</span></div><div class="msg-contact-preview">${escapeHtml(preview.substring(0, 42))}${preview.length > 42 ? '...' : ''}</div></div>
    <div class="msg-contact-time">${time}</div>
  </div>`;
}

function renderServiceRequestPanel(request, options = {}) {
  const role = normalizeRole(currentUser?.role);
  const isProviderView = role === 'provider';
  const createdAt = request.createdAt ? new Date(request.createdAt).toLocaleString() : '';
  const amountText = request.servicePrice > 0 ? formatMoney(request.servicePrice) : 'Not set yet';
  const requestDetails = [
    request.serviceLabel || request.service ? `<span>Service: ${escapeHtml(request.serviceLabel || request.service)}</span>` : '',
    request.customerName ? `<span>Customer: ${escapeHtml(request.customerName)}</span>` : '',
    request.customerPhone ? `<span>Phone: ${escapeHtml(request.customerPhone)}</span>` : '',
    request.customerLocation ? `<span>Location: ${formatMultilineText(request.customerLocation)}</span>` : ''
  ].filter(Boolean).join('');
  const title = isProviderView
    ? `Request from ${request.customerName || 'Customer'}`
    : `Request to ${request.providerName || 'Provider'}`;
  const actionSource = options.returnToThread ? 'true' : 'false';
  const providerActions = isProviderView && request.status === 'pending'
    ? `<div class="request-action-row">
        <button class="mini-action" onclick="updateServiceRequestStatus(${JSON.stringify(request.id)}, 'accepted', ${request.isServerRequest ? 'true' : 'false'}, ${actionSource})">Accept Request</button>
        <button class="mini-action reject-action" onclick="updateServiceRequestStatus(${JSON.stringify(request.id)}, 'rejected', ${request.isServerRequest ? 'true' : 'false'}, ${actionSource})">Reject</button>
      </div>`
    : '';
  const billingActions = isProviderView && request.status === 'accepted' && request.workStatus !== 'completed'
    ? `<div class="billing-form">
        <input class="billing-input" id="billAmount-${request.id}" type="number" min="1" step="1" value="${Number(request.servicePrice) || ''}" placeholder="Final price" />
        <input class="billing-input" id="billNote-${request.id}" type="text" value="${escapeHtml(request.billingNote)}" placeholder="Billing note" />
        <button class="mini-action" onclick="completeServiceWork(${JSON.stringify(request.id)}, ${request.isServerRequest ? 'true' : 'false'}, ${actionSource})">Complete Work & Create Bill</button>
      </div>`
    : '';

  const customerPaymentActions = role === 'customer' && request.workStatus === 'completed' && request.paymentStatus === 'unpaid'
    ? `<div class="billing-form">
        <button class="mini-action" style="background-color: #2ECC71; color: white;" onclick="payServiceRequest(${JSON.stringify(request.id)}, ${request.servicePrice}, ${request.isServerRequest ? 'true' : 'false'}, ${actionSource})">Pay Bill (Rs. ${request.servicePrice || 0})</button>
      </div>`
    : '';

  return `
    <div class="request-detail-panel">
      <div class="request-detail-head">
        <strong>${escapeHtml(title)}</strong>
        <span class="request-detail-status">${escapeHtml(request.status)}</span>
      </div>
      <div class="bubble ${role === 'customer' ? 'sent' : 'received'}">
        <div class="bubble-text">${escapeHtml(request.message || 'Service request')}</div>
        <div class="bubble-time">${escapeHtml(createdAt)}</div>
      </div>
      ${requestDetails ? `<div class="request-status-card"><strong>Customer details</strong>${requestDetails}</div>` : ''}
      <div class="request-status-card">
        <strong>Status: ${escapeHtml(request.status)}</strong>
        <span>Work: ${escapeHtml(request.workStatus)}</span>
        <span>Bill: ${escapeHtml(amountText)}</span>
        ${request.workStatus === 'completed' ? `<span>Payment: ${request.paymentStatus === 'paid' ? '<strong style="color:#2ECC71;">Paid</strong>' : '<strong>Unpaid</strong>'}</span>` : ''}
        ${request.billingNote ? `<p>${escapeHtml(request.billingNote)}</p>` : ''}
      </div>
      ${providerActions}
      ${billingActions}
      ${customerPaymentActions}
    </div>
  `;
}

async function payServiceRequest(requestId, amount, isServer, actionSource) {
  if (!isServer) return alert('Only server requests can be paid.');
  
  if (!confirm(`Are you sure you want to pay Rs. ${amount}?`)) return;

  let response = null;
  try {
    const payload = {
      action: 'pay',
      requestId: requestId,
      amount: amount,
      customerEmail: currentUser?.email || '',
      notes: "Paid from message thread"
    };
    
    response = await postJsonWithFallback('payment.php?action=pay', payload);
  } catch (err) {
    alert("Error making payment.");
    console.error(err);
    return;
  }

  if (response && response.success) {
    alert("Payment successful!");
    try {
      const reqs = await loadServiceRequestsForCurrentUser();
      renderMessageList(reqs);
      if (actionSource || String(currentLocalRequestId) === String(requestId)) {
        await openLocalServiceRequest(requestId, isServer);
      }
    } catch (err) {
      console.error('Payment screen refresh failed:', err);
      await openLocalServiceRequest(requestId, isServer);
    }
  } else {
    alert("Payment failed: " + (response ? response.message : 'Unknown error'));
  }
}

async function getServiceRequestsForPartner(partnerId) {
  if (!currentUser || !partnerId) return [];
  const role = normalizeRole(currentUser.role);
  if (!['customer', 'provider'].includes(role)) return [];

  const requests = await loadServiceRequestsForCurrentUser();
  return requests.filter(request => {
    if (role === 'provider') {
      return String(request.providerId) === String(currentUser.id) && String(request.customerId) === String(partnerId);
    }
    return String(request.customerId) === String(currentUser.id) && String(request.providerId) === String(partnerId);
  });
}

function renderLocalRequestThread(request) {
  currentLocalRequestId = request.id;
  currentPartnerId = null;
  currentAdminThread = null;
  if (msgPollTimer) clearInterval(msgPollTimer);

  const nameEl = document.getElementById('msgPartnerName');
  const roleEl = document.getElementById('msgPartnerRole');
  const composer = document.getElementById('msgComposer');
  const thread = document.getElementById('msgThread');
  if (nameEl) nameEl.textContent = normalizeRole(currentUser.role) === 'provider'
    ? 'Customer Service Request'
    : request.providerName || 'Service Request';
  if (roleEl) roleEl.textContent = 'Request details';
  if (composer) composer.style.display = 'none';
  document.querySelectorAll('.msg-contact').forEach(el => {
    el.classList.remove('active');
    if (el.classList.contains('local-request-contact')) {
      const clickHandler = el.getAttribute('onclick') || '';
      if (clickHandler.includes(`openLocalServiceRequest(${request.id},`)) {
        el.classList.add('active');
      }
    }
  });

  if (thread) {
    thread.innerHTML = `
      ${renderServiceRequestPanel(request)}
      <div class="msg-empty-hint" style="padding:8px 2px;">Backend chat messages appear as normal conversations. Request status is tracked separately.</div>
    `;
    thread.scrollTop = thread.scrollHeight;
  }
}

async function openLocalServiceRequest(requestId, isServerRequest = false) {
  const requests = await loadServiceRequestsForCurrentUser();
  const request = requests.find(item => String(item.id) === String(requestId) && item.isServerRequest === isServerRequest);
  if (request) renderLocalRequestThread(request);
}

async function openLatestMessageFromNotification() {
  const requests = await loadServiceRequestsForCurrentUser();
  if (requests.length) {
    openLocalServiceRequest(requests[0].id, requests[0].isServerRequest);
    return;
  }

  const firstContact = document.querySelector('#msgContactsList .msg-contact');
  if (firstContact) {
    firstContact.click();
    return;
  }

  const thread = document.getElementById('msgThread');
  if (thread) {
    thread.innerHTML = '<div class="msg-welcome-state"><p class="msg-empty-hint">No customer request is available yet. New service requests will appear here after a customer sends one.</p></div>';
  }
}

async function updateServiceRequestStatus(requestId, status, isServerRequest = false, returnToThread = false) {
  if (!currentUser || normalizeRole(currentUser.role) !== 'provider') return;
  const partnerId = currentPartnerId;
  const partnerName = document.getElementById('msgPartnerName')?.textContent || 'Customer';
  const partnerRole = document.getElementById('msgPartnerRole')?.textContent || 'customer';

  try {
    if (isServerRequest) {
      const data = await postJsonWithFallback('service-requests.php?action=update-status', {
        requestId,
        providerId: currentUser.id,
        status
      });
      if (!data.success) throw new Error(data.message || 'Could not update request');
    } else {
      const requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
      const updated = requests.map(request => String(request.id) === String(requestId) ? { ...request, status } : request);
      localStorage.setItem('serviceRequests', JSON.stringify(updated));
    }

    await loadConversations();
    if (returnToThread && partnerId) {
      await openThread(partnerId, partnerName, partnerRole.toLowerCase());
    } else {
      await openLocalServiceRequest(requestId, isServerRequest);
    }
  } catch (error) {
    alert('Could not update request: ' + error.message);
  }
}

async function completeServiceWork(requestId, isServerRequest = false, returnToThread = false) {
  if (!currentUser || normalizeRole(currentUser.role) !== 'provider') return;

  const amountField = document.getElementById(`billAmount-${requestId}`);
  const noteField = document.getElementById(`billNote-${requestId}`);
  const servicePrice = Number(amountField?.value || 0);
  const billingNote = noteField?.value.trim() || 'Final service bill after completed work.';
  const partnerId = currentPartnerId;
  const partnerName = document.getElementById('msgPartnerName')?.textContent || 'Customer';
  const partnerRole = document.getElementById('msgPartnerRole')?.textContent || 'customer';

  if (servicePrice <= 0) {
    alert('Please enter the final service price.');
    return;
  }

  try {
    if (isServerRequest) {
      const data = await postJsonWithFallback('service-requests.php?action=complete-work', {
        requestId,
        providerId: currentUser.id,
        servicePrice,
        billingNote
      });
      if (!data.success) throw new Error(data.message || 'Could not create bill');
    } else {
      const requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
      const updated = requests.map(request => String(request.id) === String(requestId)
        ? { ...request, workStatus: 'completed', servicePrice, billingNote, paymentStatus: 'unpaid' }
        : request);
      localStorage.setItem('serviceRequests', JSON.stringify(updated));
    }

    await loadConversations();
    if (returnToThread && partnerId) {
      await openThread(partnerId, partnerName, partnerRole.toLowerCase());
    } else {
      await openLocalServiceRequest(requestId, isServerRequest);
    }
  } catch (error) {
    alert('Could not create bill: ' + error.message);
  }
}

async function loadConversations() {
  if (!currentUser) return;
  try {
    const isAdmin = normalizeRole(currentUser.role) === 'admin';
    const data = await getJsonWithFallback(isAdmin
      ? `messages.php?action=all-conversations&adminId=${currentUser.id}`
      : `messages.php?action=conversations&userId=${currentUser.id}`);
    const list = document.getElementById('msgContactsList');
    if (!list || !data.success) return;
    const conversations = data.conversations || [];
    const localRequests = await loadServiceRequestsForCurrentUser();
    const localRequestHtml = localRequests.map(renderLocalRequestContact).join('');
    if (conversations.length === 0 && !localRequests.length) {
      list.innerHTML = `<div class="msg-empty-state"><p>No conversations yet</p><p class="msg-empty-hint">${isAdmin ? 'Customer/provider chats will appear here' : 'Click + to start chatting'}</p></div>`;
      return;
    }
    if (isAdmin) {
      list.innerHTML = localRequestHtml + conversations.map(c => {
        const time = c.last_time ? new Date(c.last_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        const title = `${c.sender_name} / ${c.receiver_name}`;
        return `<div class="msg-contact" onclick="openAdminThread(${c.user_a}, ${c.user_b}, '${title.replace(/'/g, "\\'")}')">
          <div class="msg-contact-avatar">A</div>
          <div class="msg-contact-info"><div class="msg-contact-name">${escapeHtml(title)}</div><div class="msg-contact-preview">${escapeHtml((c.last_message || '').substring(0, 42))}${c.last_message && c.last_message.length > 42 ? '...' : ''}</div></div>
          <div class="msg-contact-time">${time}</div>
        </div>`;
      }).join('');
      return;
    }

    list.innerHTML = localRequestHtml + conversations.map(c => {
      const unread = c.unread_count > 0 ? `<span class="msg-unread">${c.unread_count}</span>` : '';
      const active = currentPartnerId == c.partner_id ? ' active' : '';
      const time = c.last_time ? new Date(c.last_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      return `<div class="msg-contact${active}" onclick="openThread(${c.partner_id}, '${(c.partner_name || '').replace(/'/g, "\\'")}', '${c.partner_role || ''}')">
        <div class="msg-contact-avatar">${(c.partner_name || '?')[0].toUpperCase()}</div>
        <div class="msg-contact-info"><div class="msg-contact-name">${c.partner_name}${unread}</div><div class="msg-contact-preview">${(c.last_message || '').substring(0, 30)}${c.last_message && c.last_message.length > 30 ? '...' : ''}</div></div>
        <div class="msg-contact-time">${time}</div>
      </div>`;
    }).join('');
  } catch (e) { console.error('loadConversations:', e); }
}

async function openThread(partnerId, partnerName, partnerRole) {
  currentPartnerId = partnerId;
  currentAdminThread = null;
  const nameEl = document.getElementById('msgPartnerName');
  const roleEl = document.getElementById('msgPartnerRole');
  const composer = document.getElementById('msgComposer');
  if (nameEl) nameEl.textContent = partnerName || 'Chat';
  if (roleEl) roleEl.textContent = partnerRole ? partnerRole.charAt(0).toUpperCase() + partnerRole.slice(1) : '';
  if (composer) composer.style.display = 'flex';
  document.querySelectorAll('.msg-contact').forEach(el => el.classList.remove('active'));
  event && event.currentTarget && event.currentTarget.classList.add('active');
  await loadThread();
  if (msgPollTimer) clearInterval(msgPollTimer);
  msgPollTimer = setInterval(loadThread, 5000);
}

async function openAdminThread(userA, userB, title) {
  currentPartnerId = null;
  currentAdminThread = { userA, userB };
  const nameEl = document.getElementById('msgPartnerName');
  const roleEl = document.getElementById('msgPartnerRole');
  const composer = document.getElementById('msgComposer');
  if (nameEl) nameEl.textContent = title || 'Customer / Provider chat';
  if (roleEl) roleEl.textContent = 'Admin view only';
  if (composer) composer.style.display = 'none';
  await loadThread();
  if (msgPollTimer) clearInterval(msgPollTimer);
  msgPollTimer = setInterval(loadThread, 5000);
}

async function loadThread() {
  if (!currentUser || (!currentPartnerId && !currentAdminThread)) return;
  try {
    const isAdminThread = normalizeRole(currentUser.role) === 'admin' && currentAdminThread;
    const data = await getJsonWithFallback(isAdminThread
      ? `messages.php?action=admin-thread&adminId=${currentUser.id}&userA=${currentAdminThread.userA}&userB=${currentAdminThread.userB}`
      : `messages.php?action=thread&userId=${currentUser.id}&partnerId=${currentPartnerId}`);
    const thread = document.getElementById('msgThread');
    if (!thread || !data.success) return;
    const relatedRequests = isAdminThread ? [] : await getServiceRequestsForPartner(currentPartnerId);
    const requestHtml = relatedRequests.map(request => renderServiceRequestPanel(request, { returnToThread: true })).join('');
    if (!data.messages || data.messages.length === 0) {
      thread.innerHTML = requestHtml || '<div class="msg-welcome-state"><p class="msg-empty-hint">No messages yet. Say hello!</p></div>';
      return;
    }
    thread.innerHTML = requestHtml + data.messages.map(m => {
      const isMine = !isAdminThread && m.sender_id == currentUser.id;
      const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const sender = isAdminThread ? `<strong>${escapeHtml(m.sender_name || 'User')}</strong><br>` : '';
      return `<div class="bubble ${isMine ? 'sent' : 'received'}"><div class="bubble-text">${sender}${escapeHtml(m.message)}</div><div class="bubble-time">${time}</div></div>`;
    }).join('');
    thread.scrollTop = thread.scrollHeight;
  } catch (e) { console.error('loadThread:', e); }
}

function escapeHtml(t) {
  const d = document.createElement('div'); d.textContent = t; return d.innerHTML;
}

function formatMultilineText(text) {
  return escapeHtml(text || '').replace(/\n/g, '<br>');
}

async function sendMessage() {
  if (!currentUser || !currentPartnerId) return;
  const input = document.getElementById('msgInput');
  if (!input) return;
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  try {
    await postJsonWithFallback('messages.php?action=send', { senderId: currentUser.id, receiverId: currentPartnerId, message: msg });
    await loadThread();
    await loadConversations();
  } catch (e) { alert('Failed to send message'); }
}

function openNewConvo() {
  if (currentUser && normalizeRole(currentUser.role) === 'admin') {
    alert('Admin can view all customer/provider chats, but cannot start chats.');
    return;
  }
  const overlay = document.getElementById('newConvoOverlay');
  if (overlay) { overlay.classList.add('show'); document.body.style.overflow = 'hidden'; }
  loadProviderList();
}
function closeNewConvo(e) {
  const overlay = document.getElementById('newConvoOverlay');
  if (!overlay) return;
  if (!e || e.target === overlay) { overlay.classList.remove('show'); document.body.style.overflow = ''; }
}

async function loadProviderList() {
  try {
    const data = await getJsonWithFallback(`messages.php?action=contacts&userId=${currentUser ? currentUser.id : 0}`);
    allProviders = data.success ? (data.providers || []) : [];
    renderProviderPicks(allProviders);
  } catch (e) { console.error(e); }
}

function renderProviderPicks(list) {
  const el = document.getElementById('providerPickList');
  if (!el) return;
  if (!list.length) { el.innerHTML = '<p style="color:#aaa;text-align:center;padding:20px;">No providers found</p>'; return; }
  el.innerHTML = list.map(p => `<div class="provider-pick" onclick="startConvoWith(${p.id}, '${(p.full_name || '').replace(/'/g, "\\'")}', '${p.role || 'provider'}')">
    <div class="msg-contact-avatar">${(p.full_name || '?')[0].toUpperCase()}</div>
    <div><strong>${p.full_name}</strong><br><small style="color:#888">${p.role === 'customer' ? 'Customer' : (p.category || 'Service Provider')}</small></div>
  </div>`).join('');
}

function filterProviderList() {
  const q = (document.getElementById('providerSearchInput')?.value || '').toLowerCase();
  renderProviderPicks(allProviders.filter(p => (p.full_name || '').toLowerCase().includes(q)));
}

function startConvoWith(id, name, role) {
  closeNewConvo();
  openThread(id, name, role);
}

/* ===== REVIEWS SYSTEM ===== */
let selectedRating = 0;

function initStarRating() {
  const container = document.getElementById('starRatingInput');
  if (!container) return;
  container.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      selectedRating = parseInt(this.dataset.star);
      document.getElementById('reviewRating').value = selectedRating;
      updateStarDisplay(selectedRating);
    });
    btn.addEventListener('mouseenter', function () { updateStarDisplay(parseInt(this.dataset.star), true); });
  });
  container.addEventListener('mouseleave', function () { updateStarDisplay(selectedRating); });
}

function updateStarDisplay(n, hover) {
  const label = document.getElementById('starRatingLabel');
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.textContent = parseInt(btn.dataset.star) <= n ? '★' : '☆';
    btn.classList.toggle('active', parseInt(btn.dataset.star) <= n);
  });
  if (label) label.textContent = n > 0 ? labels[n] : 'Click to rate';
}

async function loadReviewProviders() {
  const sel = document.getElementById('reviewProviderSelect');
  if (!sel) return;
  try {
    const data = await getJsonWithFallback('reviews.php?action=providers');
    if (!data.success) return;
    sel.innerHTML = '<option value="">-- Choose a provider --</option>' +
      (data.providers || []).map(p => `<option value="${p.id}">${p.full_name}${p.category ? ' (' + p.category + ')' : ''}</option>`).join('');
  } catch (e) { console.error(e); }
}

async function submitReview() {
  if (!currentUser) { alert('Please login first'); return; }
  const role = normalizeRole(currentUser.role);
  if (role !== 'customer') { const status = document.getElementById('reviewStatus'); if (status) status.textContent = '⚠️ Only customers can submit reviews'; return; }
  const providerId = document.getElementById('reviewProviderSelect')?.value;
  const rating = parseInt(document.getElementById('reviewRating')?.value || '0');
  const comment = document.getElementById('reviewComment')?.value.trim() || '';
  const status = document.getElementById('reviewStatus');
  if (!providerId) { if (status) status.textContent = '⚠️ Please select a provider'; return; }
  if (rating < 1) { if (status) status.textContent = '⚠️ Please select a rating'; return; }
  try {
    const data = await postJsonWithFallback('reviews.php?action=create', { reviewerId: currentUser.id, providerId: parseInt(providerId), rating, comment });
    if (status) status.textContent = data.success ? '✅ ' + data.message : '❌ ' + data.message;
    if (data.success) { selectedRating = 0; updateStarDisplay(0); document.getElementById('reviewComment').value = ''; loadMyReviews(); }
  } catch (e) { if (status) status.textContent = '❌ Failed to submit review'; }
}

async function loadMyReviews() {
  if (!currentUser) return;
  const el = document.getElementById('reviewsList');
  const title = document.getElementById('reviewsListTitle');
  if (!el) return;
  try {
    const isAdmin = normalizeRole(currentUser.role) === 'admin';
    const endpoint = isAdmin 
      ? `reviews.php?action=admin-all&adminId=${currentUser.id}`
      : `reviews.php?action=my-reviews&userId=${currentUser.id}`;

    const data = await getJsonWithFallback(endpoint);
    if (!data.success) { el.innerHTML = '<p style="text-align:center;color:#aaa;padding:20px;">Could not load reviews</p>'; return; }
    
    if (isAdmin) {
      if (title) title.textContent = '📋 All Submitted Reviews (Admin View)';
      if (!data.reviews || data.reviews.length === 0) {
        el.innerHTML = '<p style="text-align:center;color:#aaa;padding:30px;">No reviews found on the platform.</p>';
        return;
      }
      el.innerHTML = data.reviews.map(r => {
        const reviewer = r.reviewer_name || 'Customer';
        const provider = r.provider_name || 'Provider';
        const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
        const date = new Date(r.created_at).toLocaleDateString();
        return `<div class="review-card-item">
          <div class="review-card-top">
            <div class="review-card-avatar">${(reviewer || '?')[0].toUpperCase()}</div>
            <div>
              <strong>${escapeHtml(reviewer)}</strong> reviewed <strong>${escapeHtml(provider)}</strong>
              <div class="stars-row">${stars}</div>
            </div>
            <span class="review-card-date">${date}</span>
          </div>
          ${r.comment ? `<p class="review-card-text">${escapeHtml(r.comment)}</p>` : ''}
        </div>`;
      }).join('');
    } else {
      const isProvider = data.role === 'provider';
      if (title) title.textContent = isProvider ? '⭐ Reviews About Me' : '📋 Reviews I\'ve Written';
      if (!data.reviews || data.reviews.length === 0) {
        el.innerHTML = '<p style="text-align:center;color:#aaa;padding:30px;">No reviews yet</p>';
        return;
      }
      el.innerHTML = data.reviews.map(r => {
        const name = isProvider ? r.reviewer_name : r.provider_name;
        const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
        const date = new Date(r.created_at).toLocaleDateString();
        return `<div class="review-card-item"><div class="review-card-top"><div class="review-card-avatar">${(name || '?')[0].toUpperCase()}</div><div><strong>${name}</strong><div class="stars-row">${stars}</div></div><span class="review-card-date">${date}</span></div>${r.comment ? `<p class="review-card-text">${escapeHtml(r.comment)}</p>` : ''}</div>`;
      }).join('');
    }
  } catch (e) { el.innerHTML = '<p style="text-align:center;color:#aaa;padding:20px;">Error loading reviews</p>'; }
}

/* ===== PROFILE PAGE ===== */
function loadProfileDisplay() {
  if (!currentUser) return;
  const setEl = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val || '—'; };
  setEl('profileDisplayName', currentUser.fullName);
  setEl('profileDisplayEmail', currentUser.email);
  setEl('profileInfoEmail', currentUser.email);
  setEl('profileInfoPhone', currentUser.phone || 'Not set');
  setEl('profileInfoRole', currentUser.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : '—');
  setEl('profileInfoJoined', currentUser.created_at ? new Date(currentUser.created_at).toLocaleDateString() : 'Recently');
  const badge = document.getElementById('profileRoleBadge');
  if (badge) {
    const r = currentUser.role || 'customer';
    badge.textContent = r.charAt(0).toUpperCase() + r.slice(1);
    badge.className = 'profile-role-badge role-' + r;
  }
  const av = document.getElementById('profileAvatarBig');
  if (av) setAvatarImage(av, getStoredProfilePicture(), currentUser.fullName);
  renderProfilePicture();
  handleLoadProfile();
}

/* ===== SEARCH → MESSAGE/REVIEW BRIDGES ===== */
let lastViewedProviderId = null;
const origShowProvider = typeof showProvider === 'function' ? showProvider : null;

function setRequestStatus(message, type = '') {
  const status = document.getElementById('requestStatus');
  if (!status) return;
  status.textContent = message || '';
  status.className = `request-status ${type}`.trim();
}

function getViewedProvider() {
  if (!lastViewedProviderId) return null;
  return getProviderData().find(x => String(x.id) === String(lastViewedProviderId)) || null;
}

function saveLocalServiceRequest(provider, message, extras = {}) {
  const requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
  const servicePrice = getServicePrice(provider);
  requests.unshift({
    id: Date.now(),
    providerId: provider?.userId || provider?.id || null,
    providerName: provider?.name || 'Provider',
    service: provider?.bl || 'Service',
    customerId: currentUser?.id || null,
    customerName: currentUser?.fullName || currentUser?.full_name || 'Customer',
    customerPhone: extras.customerPhone || currentUser?.phone || '',
    customerLocation: extras.customerLocation || '',
    serviceLabel: extras.serviceLabel || provider?.bl || 'Service',
    message,
    status: 'pending',
    workStatus: 'requested',
    servicePrice,
    billingNote: '',
    paymentStatus: 'unpaid',
    createdAt: new Date().toISOString()
  });
  localStorage.setItem('serviceRequests', JSON.stringify(requests.slice(0, 50)));
}

function buildServiceRequestMessage(provider) {
  const customerName = currentUser?.fullName || currentUser?.full_name || 'Customer';
  const customerEmail = currentUser?.email || 'Email not set';
  const customerPhone = currentUser?.phone || 'Phone not set';
  const providerPhone = provider?.phone || 'Not provided';

  return [
    `Service request for ${provider?.bl || 'home service'}`,
    `Customer email: ${customerEmail}`,
    `Estimated service price: ${formatMoney(getServicePrice(provider))}`,
    `Customer: ${customerName}`,
    `Customer phone: ${customerPhone}`,
    `Provider phone shown in app: ${providerPhone}`,
    formatLocationForRequest(),
    'Please confirm your availability and visit time.'
  ].join('\n');
}

async function requestServiceFromSearch() {
  const provider = getViewedProvider();
  if (!provider) {
    setRequestStatus('Please select a service provider first.', 'error');
    return;
  }

  if (!currentUser) {
    setRequestStatus('Please login before requesting service.', 'error');
    return;
  }

  if (normalizeRole(currentUser.role) !== 'customer') {
    setRequestStatus('Only customer accounts can request a service.', 'error');
    return;
  }

  if (!customerLocation) {
    setRequestStatus('Add your location, then press Request This Service again.', 'loading');
    requestCustomerLocation();
    return;
  }

  const requestMessage = buildServiceRequestMessage(provider);
  setRequestStatus('Sending your service request...', 'loading');

  try {
    let sentToBackend = false;
    if (provider.userId) {
      await postJsonWithFallback('service-requests.php?action=create', {
        customerId: currentUser.id,
        providerId: provider.userId,
        serviceLabel: provider.bl || 'Home service',
        customerPhone: currentUser.phone || '',
        customerLocation: formatLocationForRequest(),
        message: requestMessage,
        servicePrice: getServicePrice(provider)
      });

      const data = await postJsonWithFallback('messages.php?action=send', {
        senderId: currentUser.id,
        receiverId: provider.userId,
        message: requestMessage
      });

      if (!data.success) {
        throw new Error(data.message || 'Request was not accepted by the server');
      }
      sentToBackend = true;
    }

    if (!sentToBackend) {
      saveLocalServiceRequest(provider, requestMessage, {
        customerPhone: currentUser?.phone || '',
        customerLocation: formatLocationForRequest(),
        serviceLabel: provider.bl || 'Home service'
      });
    }
    setRequestStatus(
      sentToBackend
        ? 'Request sent. The provider has your phone and location details in Messages.'
        : 'Demo request saved with your phone and location details.',
      'success'
    );
  } catch (error) {
    console.error('requestServiceFromSearch:', error);
    saveLocalServiceRequest(provider, requestMessage, {
      customerPhone: currentUser?.phone || '',
      customerLocation: formatLocationForRequest(),
      serviceLabel: provider.bl || 'Home service'
    });
    setRequestStatus('Request saved locally. Open Messages or try again when the backend is reachable.', 'success');
  }
}

function messageFromSearch() {
  const p = getViewedProvider();
  if (!p) return;
  if (!p.userId) {
    setRequestStatus('This demo provider has no chat account. Use Request This Service to save the request.', 'loading');
    return;
  }
  const partnerId = p.userId;
  closePD();
  location.href = 'messages.html?partnerId=' + partnerId + '&partnerName=' + encodeURIComponent(p ? p.name : 'Provider');
}

function reviewFromSearch() {
  if (!lastViewedProviderId) return;
  const p = getProviderData().find(x => String(x.id) === String(lastViewedProviderId));
  const providerId = p && p.userId ? p.userId : lastViewedProviderId;
  closePD();
  location.href = 'reviews.html?providerId=' + providerId;
}

/* ===== INIT DOM ===== */
document.addEventListener('DOMContentLoaded', function () {


  if (!IS_AUTH_PAGE && !STORED_USER) return;

  renderGrid();
  loadServiceProviders();

  if (STORED_USER) {
    currentUser = { ...STORED_USER, role: normalizeRole(STORED_USER.role) };
    updateUIForLoggedInUser();
  }

  enforceRoleRoute();
  syncAuthControls();
  applyRoleBasedVisibility();

  // Get Now button
  const getNowBtn = document.querySelector('.btn-get');
  if (getNowBtn) {
    getNowBtn.addEventListener('click', function (e) {
      e.preventDefault();
      location.href = 'search.html';
    });
  }

  const useLocationBtn = document.getElementById('useLocationBtn');
  if (useLocationBtn) {
    updateLocationButton();
    useLocationBtn.addEventListener('click', requestCustomerLocation);
  }

  // Auth forms
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.onsubmit = handleLogin;
  const regForm = document.getElementById('regForm');
  if (regForm) regForm.onsubmit = handleSignup;
  const forgotForm = document.getElementById('forgotForm');
  if (forgotForm) forgotForm.onsubmit = handleForgotPassword;
  const otpForm = document.getElementById('otpForm');
  if (otpForm) otpForm.onsubmit = handleVerifyOTP;

  // Profile page
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  if (saveProfileBtn) saveProfileBtn.addEventListener('click', handleSaveProfile);
  const loadProfileBtn = document.getElementById('loadProfileBtn');
  if (loadProfileBtn) loadProfileBtn.addEventListener('click', handleLoadProfile);
  const profilePictureInput = document.getElementById('profilePictureInput');
  if (profilePictureInput) profilePictureInput.addEventListener('change', handleProfilePictureChange);
  const removeProfilePictureBtn = document.getElementById('removeProfilePictureBtn');
  if (removeProfilePictureBtn) removeProfilePictureBtn.addEventListener('click', removeProfilePicture);
  loadAdminProfileProviderSelect();
  if (document.getElementById('profileDisplayName')) loadProfileDisplay();

  // Features page
  const createJobBtn = document.getElementById('createJobBtn');
  if (createJobBtn) createJobBtn.addEventListener('click', handleCreateJob);
  const searchJobsBtn = document.getElementById('searchJobsBtn');
  if (searchJobsBtn) searchJobsBtn.addEventListener('click', handleSearchJobs);
  const loadAdminBtn = document.getElementById('loadAdminBtn');
  if (loadAdminBtn) loadAdminBtn.addEventListener('click', loadAdminDashboard);
  if (document.getElementById('adminTools') && currentUser && normalizeRole(currentUser.role) === 'admin') {
    loadAdminDashboard();
  }

  // Messages page
  if (document.getElementById('msgContactsList') && currentUser) {
    const isAdmin = normalizeRole(currentUser.role) === 'admin';
    const newConvoBtn = document.getElementById('newConvoBtn');
    const msgSubtitle = document.getElementById('messagesSubtitle');
    const modalSubtitle = document.getElementById('newMessageSubtitle');
    const searchLabel = document.getElementById('contactSearchLabel');
    if (newConvoBtn && isAdmin) newConvoBtn.style.display = 'none';
    if (msgSubtitle) {
      msgSubtitle.textContent = isAdmin
        ? 'Admin can view all chats between customers and service providers.'
        : 'Chat is allowed only between customers and service providers.';
    }
    if (modalSubtitle && !isAdmin) {
      modalSubtitle.textContent = normalizeRole(currentUser.role) === 'provider'
        ? 'Choose a customer to message'
        : 'Choose a service provider to message';
    }
    if (searchLabel && !isAdmin) {
      searchLabel.textContent = normalizeRole(currentUser.role) === 'provider' ? 'Search customers' : 'Search providers';
    }
  }
  const newConvoBtn = document.getElementById('newConvoBtn');
  if (newConvoBtn) newConvoBtn.addEventListener('click', openNewConvo);
  const msgSendBtn = document.getElementById('msgSendBtn');
  if (msgSendBtn) msgSendBtn.addEventListener('click', sendMessage);
  const msgInput = document.getElementById('msgInput');
  if (msgInput) msgInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });
  if (document.getElementById('msgContactsList')) {
    // Check URL params for deep-linking from search
    const params = new URLSearchParams(window.location.search);
    loadConversations().then(() => {
      if (params.get('partnerId')) {
        openThread(parseInt(params.get('partnerId')), params.get('partnerName') || 'Provider', 'provider');
      } else if (params.get('showRequests') === '1') {
        openLatestMessageFromNotification();
      }
    });
  }

  // Reviews page
  initStarRating();
  const submitReviewBtn = document.getElementById('submitReviewBtn');
  if (submitReviewBtn) submitReviewBtn.addEventListener('click', submitReview);
  if (document.getElementById('reviewProviderSelect')) loadReviewProviders();
  if (document.getElementById('reviewsList')) {
    loadMyReviews();
    const params = new URLSearchParams(window.location.search);
    const preselect = params.get('providerId');
    if (preselect) {
      setTimeout(() => {
        const sel = document.getElementById('reviewProviderSelect');
        if (sel) sel.value = preselect;
      }, 500);
    }
  }

  // Track provider in detail modal for msg/review bridges
  const origShow = window.showProvider;
  if (origShow) {
    window.showProvider = function (id) {
      lastViewedProviderId = id;
      origShow(id);
    };
  }

  // Profile status helper
  const profileStatus = document.getElementById('profileStatus');
  const origSave = handleSaveProfile;
  window.handleSaveProfile = async function () {
    if (profileStatus) profileStatus.textContent = '⏳ Saving...';
    await origSave();
    if (profileStatus) profileStatus.textContent = '✅ Profile saved successfully';
    setTimeout(() => { if (profileStatus) profileStatus.textContent = ''; }, 3000);
  };
  const origLoad = handleLoadProfile;
  window.handleLoadProfile = async function () {
    if (profileStatus) profileStatus.textContent = '⏳ Loading...';
    await origLoad();
    if (profileStatus) profileStatus.textContent = '✅ Profile loaded';
    setTimeout(() => { if (profileStatus) profileStatus.textContent = ''; }, 3000);
  };
});
