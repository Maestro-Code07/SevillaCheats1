const form = document.getElementById('loginForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault(); // Sayfanın reload olmasını engeller

  const email = form.email.value;
  const password = form.password.value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // session cookie için önemli
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
      alert(`Hoşgeldin ${data.user.name}!`);
      // İstersen yönlendirme yapabilirsin:
      // window.location.href = '/dashboard.html';
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
    alert('Sunucu hatası!');
  }
});
