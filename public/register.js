const form = document.getElementById('registerForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = form.name.value;
  const email = form.email.value;
  const password = form.password.value;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (res.ok) {
      alert(`Hoşgeldin ${data.user.name}!`);
      // window.location.href = '/login.html';
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
    alert('Sunucu hatası!');
  }
});
