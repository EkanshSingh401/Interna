import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Define routes that require authentication
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

// 2. Define routes that MUST remain public (Stripe Webhook)
const isWebhookRoute = createRouteMatcher(['/api/webhook/stripe']);

export default clerkMiddleware(async (auth, req) => {
  // 3. Protect the route ONLY if it is "protected" AND "not a webhook"
  if (isProtectedRoute(req) && !isWebhookRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};