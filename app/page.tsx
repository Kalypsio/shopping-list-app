import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server"; // On importe l'outil d'auth serveur
import { redirect } from "next/navigation"; // On importe la redirection
import Image from "next/image";

// Ton image locale
const BG_IMAGE_URL = "/bg-luxe.png";

export default function Home() {
  // 1. LE GARDIEN : On vérifie si l'utilisateur est déjà là
  const { userId } = auth();

  // 2. LA REDIRECTION : Si oui, on l'envoie direct au boulot
  if (userId) {
    redirect("/dashboard");
  }

  // 3. SINON : On affiche la vitrine (le code d'avant)
  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden font-sans">
      
      {/* L'IMAGE DE FOND */}
      <div className="absolute inset-0 z-0">
        <Image 
          src={BG_IMAGE_URL}
          alt="Intérieur design luxe"
          fill
          className="object-cover"
          priority 
        />
        <div className="absolute inset-0 bg-stone-900/70"></div>
      </div>

      {/* LE CONTENU PRINCIPAL */}
      <div className="relative z-10 w-full max-w-6xl px-8 flex flex-col md:flex-row items-center justify-between gap-12 my-12">
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-lg">
            Vos projets déco,<br/>
            <span className="text-amber-400">enfin organisés.</span>
          </h1>
          <p className="text-xl text-stone-200 mb-8 max-w-lg drop-shadow">
            L'outil dédié aux architectes d'intérieur pour créer des shopping lists sublimes et les faire valider en un clic. Fini Excel.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl text-center max-w-md w-full">
          <div className="mb-6">
            <span className="font-serif text-3xl font-bold text-white">
              SL<span className="text-amber-400">.</span>
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Espace Professionnel</h2>
          <p className="text-stone-300 mb-8 text-sm">
            Connectez-vous pour accéder à votre atelier et gérer vos projets clients.
          </p>
          
          {/* On force la redirection vers le dashboard après la connexion */}
          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
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