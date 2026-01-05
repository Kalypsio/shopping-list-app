import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// MODIFICATION ICI : J'ai ajouté un slash '/' avant le (.*)
// Cela dit : "La racine est publique" ET "Tout ce qui est DANS /share/ est public"
const isPublicRoute = createRouteMatcher([
  '/', 
  '/share/(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Si la route n'est pas publique, on la protège
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Cette partie dit à Clerk "Surveille tout le site sauf les images et fichiers statiques"
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};