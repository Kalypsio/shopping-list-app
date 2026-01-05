import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ShoppingList Pro',
    short_name: 'ShoppingList',
    description: 'Application de gestion de shopping',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/logo-app.png', // <-- Nouveau nom pour forcer la mise à jour
        sizes: '512x512',     // Mets 'any' si tu n'es pas sûr de la taille
        type: 'image/png',
      },
    ],
  }
}