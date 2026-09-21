// Maintenance mode: set NEXT_PUBLIC_MAINTENANCE_MODE=true in Vercel and
// redeploy when the Supabase database behind this site is unavailable.
// middleware.ts sends every DB-backed page to /maintenance and every
// /api/* call gets a 503. The purely static marketing pages (legal/*,
// about/story, about/booking-process, about/pricing-faq) stay up
// untouched, since they never call Supabase.
export const MAINTENANCE_MODE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

export const MAINTENANCE_MESSAGE = "System maintenance, we will be back up later today.";
