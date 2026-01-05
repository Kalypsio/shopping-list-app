import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-6">
        
        <h1 className="text-4xl font-bold text-blue-600 mb-8">
          ShoppingList Pro 🏠
        </h1>

        <div className="bg-white p-8 rounded-xl shadow-lg text-center w-full max-w-md">
          {/* Ce bloc s'affiche si l'utilisateur est DÉCONNECTÉ */}
          <SignedOut>
            <p className="mb-6 text-gray-600">
              L'outil ultime pour les décorateurs d'intérieur.
              <br/>Connectez-vous pour commencer.
            </p>
            <div className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition cursor-pointer inline-block">
              <SignInButton mode="modal" />
            </div>
          </SignedOut>

          {/* Ce bloc s'affiche si l'utilisateur est CONNECTÉ */}
          <SignedIn>
            <p className="mb-4 text-xl font-semibold">Heureux de vous revoir !</p>
            <div className="flex flex-col gap-4 items-center">
              <Link 
                href="/dashboard"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition w-full"
              >
                Accéder à mon Dashboard
              </Link>
              
              <div className="mt-4 pt-4 border-t border-gray-100 w-full flex justify-center">
                <UserButton showName />
              </div>
            </div>
          </SignedIn>
        </div>

      </div>
    </main>
  )
}