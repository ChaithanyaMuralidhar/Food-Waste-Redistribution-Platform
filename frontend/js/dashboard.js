let currentUser = null;

async function initDashboard() {
  if (!requireAuth()) return;

  currentUser = getUser();
  document.getElementById('userName').textContent = currentUser.name;
  document.getElementById('userRole').textContent = currentUser.role;

  document.getElementById('logoutBtn').addEventListener('click', () => {
    clearAuth();
    window.location.href = 'index.html';
  });

  setupTabs();
  await loadStats();
  await loadNotifications();

  if (currentUser.role === 'restaurant') {
    document.getElementById('restaurantPanel').classList.remove('hidden');
    await loadMyListings();
    setupCreateForm();
  } else {
    document.getElementById('receiverPanel').classList.remove('hidden');
    await loadAvailableFood();
    await loadMyClaims();
    await loadRecommendations();
  }
}

function setupTabs() {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });
}

async function loadStats() {
  try {
    const { stats } = await api.ai.getStats();
    document.getElementById('statTotal').textContent = stats.totalListings;
    document.getElementById('statPickedUp').textContent = stats.pickedUp;
    document.getElementById('statAvailable').textContent = stats.available;
    document.getElementById('statImpact').textContent = stats.impactScore;
  } catch {
  }
}

async function loadNotifications() {
  try {
    const { notifications, unreadCount } = await api.notifications.getAll();
    const badge = document.getElementById('notifBadge');
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.classList.remove('hidden');
    }

    const list = document.getElementById('notificationList');
    if (!notifications.length) {
      list.innerHTML = '<div class="empty-state"><div class="icon">🔔</div><p>No notifications yet</p></div>';
      return;
    }

    list.innerHTML = notifications
      .map(
        (n) => `
      <div class="notification-item ${n.isRead ? '' : 'unread'}" data-id="${n._id}">
        <strong>${n.title}</strong>
        <p>${n.message}</p>
        <span class="time">${timeAgo(n.createdAt)}</span>
      </div>`
      )
      .join('');

    list.querySelectorAll('.notification-item').forEach((item) => {
      item.addEventListener('click', async () => {
        await api.notifications.markAsRead(item.dataset.id);
        item.classList.remove('unread');
        loadNotifications();
      });
    });

    document.getElementById('markAllReadBtn').addEventListener('click', async () => {
      await api.notifications.markAllAsRead();
      loadNotifications();
    });
  } catch {
  }
}

function renderFoodCard(listing, actions = '') {
  const priority =
    listing.aiPriorityScore > 70
      ? `<span class="badge badge-priority">High Priority</span>`
      : '';
  const tags = (listing.aiTags || []).map((t) => `<span class="badge">${t}</span>`).join(' ');

  return `
    <div class="card" data-id="${listing._id}">
      <h3>${listing.title} ${priority}</h3>
      <div class="meta">
        ${listing.restaurant ? `By ${listing.restaurant.name || listing.restaurant.organization || 'Restaurant'}` : ''}
        &middot; ${listing.quantity} ${listing.unit}
        &middot; Expires: ${formatDate(listing.expiryTime)}
      </div>
      <p>${listing.description || 'No description'}</p>
      <p>${statusBadge(listing.status)} ${tags}</p>
      <p class="meta">📍 ${listing.pickupAddress}</p>
      ${actions}
    </div>`;
}

async function loadMyListings() {
  const container = document.getElementById('myListings');
  try {
    const { listings } = await api.food.getMyListings();
    if (!listings.length) {
      container.innerHTML = '<div class="empty-state"><div class="icon">🍽️</div><p>No listings yet. Post your first surplus food!</p></div>';
      return;
    }

    container.innerHTML = listings
      .map((l) => {
        let actions = '';
        if (l.status === 'available') {
          actions = `<button class="btn btn-danger btn-sm" onclick="cancelListing('${l._id}')">Cancel</button>`;
        } else if (l.status === 'claimed') {
          actions = `<button class="btn btn-primary btn-sm" onclick="markPickedUp('${l._id}')">Mark Picked Up</button>`;
        }
        return renderFoodCard(l, actions);
      })
      .join('');
  } catch (err) {
    container.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

async function loadAvailableFood() {
  const container = document.getElementById('availableFood');
  try {
    const { listings } = await api.food.getAvailable();
    if (!listings.length) {
      container.innerHTML = '<div class="empty-state"><div class="icon">🥗</div><p>No available food right now. Check back soon!</p></div>';
      return;
    }

    container.innerHTML = listings
      .map((l) => {
        const actions = `<button class="btn btn-primary btn-sm" onclick="claimFood('${l._id}')">Claim Food</button>`;
        return renderFoodCard(l, actions);
      })
      .join('');
  } catch (err) {
    container.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

async function loadMyClaims() {
  const container = document.getElementById('myClaims');
  try {
    const { listings } = await api.food.getMyClaims();
    if (!listings.length) {
      container.innerHTML = '<div class="empty-state"><div class="icon">📦</div><p>You haven\'t claimed any food yet.</p></div>';
      return;
    }

    container.innerHTML = listings
      .map((l) => {
        let actions = '';
        if (l.status === 'claimed') {
          actions = `<button class="btn btn-primary btn-sm" onclick="markPickedUp('${l._id}')">Mark Picked Up</button>`;
        }
        return renderFoodCard(l, actions);
      })
      .join('');
  } catch (err) {
    container.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

async function loadRecommendations() {
  const container = document.getElementById('recommendations');
  if (!container) return;

  try {
    const { recommendations } = await api.ai.getRecommendations();
    if (!recommendations.length) {
      container.innerHTML = '<p class="meta">No recommendations available.</p>';
      return;
    }

    container.innerHTML = recommendations
      .map(
        (r) => `
      <div class="card">
        <strong>${r.listing.title}</strong>
        <p class="meta">${r.reason} (Score: ${r.score})</p>
        <button class="btn btn-primary btn-sm" onclick="claimFood('${r.listing._id}')">Claim</button>
      </div>`
      )
      .join('');
  } catch {
  }
}

function setupCreateForm() {
  const form = document.getElementById('createListingForm');
  const titleInput = form.title;
  const descInput = form.description;
  const aiPreview = document.getElementById('aiPreview');

  async function updateAiPreview() {
    if (!titleInput.value || !form.expiryTime.value) {
      aiPreview.classList.add('hidden');
      return;
    }
    try {
      const { enriched } = await api.ai.enrich({
        title: titleInput.value,
        description: descInput.value,
        expiryTime: form.expiryTime.value,
      });
      aiPreview.classList.remove('hidden');
      aiPreview.innerHTML = `
        <div class="alert alert-info">
          <strong>AI Preview:</strong> Category: ${enriched.category} |
          Priority: ${enriched.aiPriorityScore}/100 |
          Tags: ${(enriched.aiTags || []).join(', ') || 'none'}
        </div>`;
    } catch {
      aiPreview.classList.add('hidden');
    }
  }

  titleInput.addEventListener('blur', updateAiPreview);
  descInput.addEventListener('blur', updateAiPreview);
  form.expiryTime.addEventListener('change', updateAiPreview);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;

    try {
      await api.food.create({
        title: form.title.value,
        description: form.description.value,
        quantity: form.quantity.value,
        unit: form.unit.value,
        expiryTime: form.expiryTime.value,
        pickupAddress: form.pickupAddress.value,
      });
      form.reset();
      aiPreview.classList.add('hidden');
      showAlert('createAlert', 'Food listing posted! NGOs and volunteers have been notified.', 'success');
      await loadMyListings();
      await loadStats();
    } catch (err) {
      showAlert('createAlert', err.message, 'error');
    } finally {
      btn.disabled = false;
    }
  });
}

async function claimFood(id) {
  if (!confirm('Claim this food listing?')) return;
  try {
    await api.food.claim(id);
    await loadAvailableFood();
    await loadMyClaims();
    await loadRecommendations();
    await loadNotifications();
    alert('Food claimed! Coordinate pickup with the restaurant.');
  } catch (err) {
    alert(err.message);
  }
}

async function markPickedUp(id) {
  try {
    await api.food.markPickedUp(id);
    if (currentUser.role === 'restaurant') await loadMyListings();
    else await loadMyClaims();
    await loadStats();
  } catch (err) {
    alert(err.message);
  }
}

async function cancelListing(id) {
  if (!confirm('Cancel this listing?')) return;
  try {
    await api.food.cancel(id);
    await loadMyListings();
  } catch (err) {
    alert(err.message);
  }
}

document.addEventListener('DOMContentLoaded', initDashboard);
