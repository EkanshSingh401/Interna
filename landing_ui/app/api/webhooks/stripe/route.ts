import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// [KEPT AS REQUESTED]
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover" as any, // Cast to any to bypass TS check if version is custom/beta
  typescript: true,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      // 1. New Subscription
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (!userId) {
          console.error("❌ Missing userId in session metadata");
          break;
        }

        console.log(`✅ Checkout completed for user: ${userId}`);

        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            is_pro: true,
            subscription_tier: "pro", // Explicitly set tier
            stripe_customer_id: session.customer as string,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (error) console.error("Error updating profile (checkout):", error);
        break;
      }

      // 2. Updated Subscription (Cancellation / Non-payment)
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = subscription.customer as string;

        // Status "active" or "trialing" means they still have access.
        const isPro =
          subscription.status === "active" || subscription.status === "trialing";

        console.log(`🔄 Subscription update for ${stripeCustomerId}: ${subscription.status} (Pro: ${isPro})`);

        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            is_pro: isPro,
            subscription_tier: isPro ? "pro" : "free", // Downgrade if needed
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", stripeCustomerId);

        if (error) console.error("Error updating profile (subscription):", error);
        break;
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }

  return new NextResponse("Success", { status: 200 });
}