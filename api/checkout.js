const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'Checkout API ready' });
  }

  try {
    const { priceId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: 'https://planwithvoyage.com?upgraded=true',
      cancel_url: 'https://planwithvoyage.com?cancelled=true',
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(200).json({ error: err.message });
  }
};
