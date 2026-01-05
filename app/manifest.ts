import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ShoppingList Pro',
    short_name: 'ShoppingList',
    description: 'Application de gestion de shopping pour décorateurs',
    start_url: '/dashboard', // Quand on clique sur l'icône, on arrive direct au dashboard
    display: 'standalone', // C'est CA qui enlève la barre d'url du navigateur
    background_color: '#ffffff',
    theme_color: '#2563eb', // La couleur bleue de ton thème
    icons: [
      {
        src: '/icon', // Next.js fera le lien avec ton image
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}