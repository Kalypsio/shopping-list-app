import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server'; // Attention à l'import server
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  try {
    // 1. Récupérer l'utilisateur connecté via Clerk
    const user = await currentUser();
    
    if (!user || !user.emailAddresses[0]) {
      return NextResponse.json({ isPro: false });
    }

    const email = user.emailAddresses[0].emailAddress;

    // 2. Chercher le client Stripe avec cet email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json({ isPro: false }); // Pas de client Stripe = Pas pro
    }

    // 3. Vérifier ses abonnements actifs
    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: 'active', // On ne veut que les actifs
    });

    const isPro = subscriptions.data.length > 0;

    return NextResponse.json({ isPro });

  } catch (error) {
    console.error("Erreur vérification Stripe:", error);
    return NextResponse.json({ isPro: false }, { status: 500 });
  }
}