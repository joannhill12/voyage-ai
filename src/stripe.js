export async function redirectToCheckout(priceId) {
  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId })
    });
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('Error: ' + (data.error || 'Something went wrong'));
    }
  } catch (err) {
    alert('Error: ' + err.message);
  }
}
