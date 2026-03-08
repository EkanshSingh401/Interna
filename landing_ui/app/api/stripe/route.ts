import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover" as any,
  typescript: true,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    // [NEW] Read the plan selection from the client
    const body = await req.json().catch(() => ({})); 
    const { plan } = body; // expect 'monthly' or 'annual'

    if (!userId) {
      console.error("❌ Stripe Checkout: Unauthorized");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // [NEW] Select the correct Price ID based on the user's choice
    let priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_ID; // Default
    
    if (plan === 'annual') {
      priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_ID;
    }

    if (!priceId) {
      console.error(`❌ Stripe Checkout: Missing Price ID for plan: ${plan}`);
      return new NextResponse("Server Config Error: Missing Price ID", { status: 500 });
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      return new NextResponse("Server Config Error: Missing App URL", { status: 500 });
    }

    console.log(`🚀 Creating ${plan || 'monthly'} session for ${userId}`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=canceled`,
      metadata: {
        userId: userId, 
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("❌ Stripe Checkout Error:", error.message);
    return new NextResponse(error.message, { status: 500 });
  }
}