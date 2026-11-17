import { loadStripe, type Stripe } from "@stripe/stripe-js";

/**
 * Stripe.js is loaded once per page and reused by every checkout render.
 * Only the publishable key is ever present in the frontend; PaymentIntents are
 * created server-side by the API (`POST /orders`) and their client secret is
 * handed to the Payment Element for confirmation.
 */
let stripePromise: Promise<Stripe | null> | null = null;

export function getStripePromise(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
    );
  }
  return stripePromise;
}