import { SignInButton } from "@clerk/nextjs";
import Image from "next/image";

// On utilise une belle image d'Unsplash pour le fond (libre de droits)
const BG_IMAGE_URL = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop";

export default function Home() {
  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden font-sans">
      
      {/* 1. L'IMAGE DE FOND */}
      <div className="absolute inset-0 z-0">
        <Image 
          src={BG_IMAGE_URL}
          alt="Intérieur design luxe"
          fill
          className="object-cover"
          priority // Charge l'image en priorité
        />
        {/* Le filtre sombre par-dessus l'image pour que le texte soit lisible */}
        <div className="absolute inset-0 bg-stone-900/70"></div>
      </div>

      {/* 2. LE CONTENU PRINCIPAL */}
      <div className="relative z-10 w-full max-w-6xl px-8 flex flex-col md:flex-row items-center justify-between gap-12 my-12">
        
        {/* À gauche : Le texte accrocheur */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-lg">
            Vos projets déco,<br/>
            <span className="text-amber-400">enfin organisés.</span>
          </h1>
          <p className="text-xl text-stone-200 mb-8 max-w-lg drop-shadow">
            L'outil dédié aux architectes d'intérieur pour créer des shopping lists sublimes et les faire valider en un clic. Fini Excel.
          </p>
        </div>

        {/* À droite : La carte de connexion (effet verre dépoli) */}
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl text-center max-w-md w-full">
          <div className="mb-6">
            {/* Un petit logo textuel simple à la place de l'emoji maison */}
            <span className="font-serif text-3xl font-bold text-white">
              SL<span className="text-amber-400">.</span>
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Espace Professionnel</h2>
          <p className="text-stone-300 mb-8 text-sm">
            Connectez-vous pour accéder à votre atelier et gérer vos projets clients.
          </p>
          
          {/* Le bouton Clerk, stylisé pour ressembler aux tiens */}
          <SignInButton mode="modal">
            <button className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold py-4 px-8 rounded-xl transition transform hover:scale-105 shadow-lg animate-pulse">
              ✨ Commencer / Se connecter
            </button>
          </SignInButton>
          
          <p className="text-stone-400 text-xs mt-6">
            Version Bêta - Réservé aux décorateurs d'intérieur.
          </p>
        </div>

      </div>
    </main>
  );
}