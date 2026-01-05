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
        src: '/icon.png',  // <-- On pointe vers le fichier dans public
        sizes: '512x512',  // Si ton image est carrée
        type: 'image/png',
      },
    ],
  }
}