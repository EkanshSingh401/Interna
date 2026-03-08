"use server"

import { stripe } from "@/lib/stripe" // Import from the new file above
import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export async function createCheckoutSession(priceId: string) {
  // 1. Verify the user is logged in
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId || !user) {
    throw new Error("You must be logged in to subscribe.")
  }

  // 2. Safety Check: Ensure the app URL is set
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) {
    throw new Error("Missing NEXT_PUBLIC_APP_URL environment variable.")
  }

  // 3. Get the user's email to pre-fill the checkout form
  const email = user.emailAddresses[0]?.emailAddress

  try {
    // 4. Create the Stripe Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Redirect URLs
      success_url: `${appUrl}/dashboard?success=true`,
      cancel_url: `${appUrl}/#pricing`,
      
      // Pre-fill user data
      customer_email: email,
      
      // CRITICAL: Send the userId as metadata so the Webhook knows who paid
      metadata: {
        userId: userId, 
      },
    })

    // 5. Return the URL
    if (!session.url) {
        throw new Error("Failed to create checkout session.")
    }
    
    return { url: session.url }

  } catch (error) {
    console.error("Stripe Checkout Error:", error)
    throw new Error("Failed to initialize checkout. Please try again.")
  }
}