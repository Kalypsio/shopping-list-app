import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// On initialise Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia', // Ou la version la plus récente suggérée par VS Code
});

export async function POST(request: Request) {
  try {
    // On crée une session de paiement
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          // C'est ici que tu colles ton ID de prix (celui qui commence par price_...)
          price: 'price_1SmbbxEkHB5yngLmzYirCvXy', 
          quantity: 1,
        },
      ],
      mode: 'subscription', // C'est un abonnement, pas un paiement unique
      success_url: `${request.headers.get('origin')}/dashboard?success=true`,
      cancel_url: `${request.headers.get('origin')}/dashboard?canceled=true`,
    });

    // On renvoie l'URL de paiement au site
    return NextResponse.json({ url: session.url });
    
  } catch (error) {
    console.error("Erreur Stripe:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}