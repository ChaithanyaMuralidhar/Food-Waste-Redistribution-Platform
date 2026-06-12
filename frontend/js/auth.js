function showAlert(containerId, message, type = 'error') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}

function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  if (getToken()) {
    redirectByRole();
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;

    try {
      const data = await api.auth.login({
        email: form.email.value,
        password: form.password.value,
      });
      setAuth(data.token, data.user);
      window.location.href = 'dashboard.html';
    } catch (err) {
      showAlert('alertBox', err.message);
    } finally {
      btn.disabled = false;
    }
  });
}

function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  if (getToken()) {
    redirectByRole();
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;

    try {
      const data = await api.auth.register({
        name: form.name.value,
        email: form.email.value,
        password: form.password.value,
        role: form.role.value,
        organization: form.organization.value,
        phone: form.phone.value,
        address: form.address.value,
      });
      setAuth(data.token, data.user);
      window.location.href = 'dashboard.html';
    } catch (err) {
      showAlert('alertBox', err.message);
    } finally {
      btn.disabled = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLoginForm();
  initRegisterForm();
});
