const API_BASE = 'http://localhost:5000/api/listings';

const listingsGrid = document.getElementById('listings-grid');
const listingForm = document.getElementById('listing-form');
const formMessage = document.getElementById('form-message');
const categoryFilter = document.getElementById('category-filter');

const CONDITION_LABELS = {
  new: 'New',
  like_new: 'Like New',
  used: 'Used',
  fair: 'Fair'
};

// ---------- Fetch and render listings ----------
async function loadListings(category = '') {
  listingsGrid.innerHTML = '<p class="loading">Loading listings...</p>';

  try {
    const url = category ? `${API_BASE}?category=${category}` : API_BASE;
    const res = await fetch(url);
    const result = await res.json();

    if (!result.success) throw new Error(result.message || 'Failed to load listings');

    renderListings(result.data);
  } catch (err) {
    listingsGrid.innerHTML = `<p class="empty-state">Could not load listings. Is the API running on port 5000? (${err.message})</p>`;
  }
}

function renderListings(listings) {
  if (listings.length === 0) {
    listingsGrid.innerHTML = '<p class="empty-state">No listings yet. Be the first to post one!</p>';
    return;
  }

  listingsGrid.innerHTML = listings.map((item) => `
    <div class="listing-card" data-id="${item.id}">
      <span class="tag-category">${item.category}</span>
      <h3 class="listing-title">${escapeHtml(item.title)}</h3>
      <p class="listing-desc">${escapeHtml(item.description || 'No description provided')}</p>
      <div class="listing-price">GHS ${Number(item.price).toFixed(2)}</div>
      <div class="listing-meta">
        <span>${item.seller_name} &middot; ${CONDITION_LABELS[item.item_condition] || item.item_condition}</span>
        <span class="listing-status ${item.status}">${item.status}</span>
      </div>
      <button class="delete-btn" data-id="${item.id}">Remove listing</button>
    </div>
  `).join('');

  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => deleteListing(btn.dataset.id));
  });
}

// Basic HTML escaping so user-submitted text can't break the layout
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Create listing ----------
listingForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formMessage.textContent = '';
  formMessage.className = 'form-message';

  const payload = {
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim(),
    price: parseFloat(document.getElementById('price').value),
    category: document.getElementById('category').value,
    item_condition: document.getElementById('item_condition').value,
    seller_name: document.getElementById('seller_name').value.trim(),
    seller_contact: document.getElementById('seller_contact').value.trim()
  };

  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (!result.success) {
      throw new Error((result.errors && result.errors.join(', ')) || result.message || 'Could not post listing');
    }

    formMessage.textContent = 'Listing posted successfully!';
    formMessage.classList.add('success');
    listingForm.reset();
    loadListings(categoryFilter.value);
  } catch (err) {
    formMessage.textContent = err.message;
    formMessage.classList.add('error');
  }
});

// ---------- Delete listing ----------
async function deleteListing(id) {
  if (!confirm('Remove this listing?')) return;

  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    loadListings(categoryFilter.value);
  } catch (err) {
    alert(`Could not delete listing: ${err.message}`);
  }
}

// ---------- Filter ----------
categoryFilter.addEventListener('change', () => {
  loadListings(categoryFilter.value);
});

// Initial load
loadListings();
