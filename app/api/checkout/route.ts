import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialisation de Stripe (sans la ligne apiVersion qui bloquait)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          // Vérifie que tu as bien gardé ton ID qui commence par price_
          price: 'price_XXXXXXXXXXXXXXXXXXXX', 
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/dashboard?success=true`,
      cancel_url: `${request.headers.get('origin')}/dashboard?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
    
  } catch (error) {
    console.error("Erreur Stripe:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}