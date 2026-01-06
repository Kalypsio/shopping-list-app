"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useUser, UserButton } from '@clerk/nextjs' // On importe UserButton pour la déconnexion
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingPay, setLoadingPay] = useState(false); // État pour le chargement du paiement

  useEffect(() => {
    if (user) {
      fetchProjects();
      checkPaymentSuccess();
    }
  }, [user]);

  // Vérifie si l'utilisateur revient de Stripe avec un succès
  function checkPaymentSuccess() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      alert("Merci ! Vous êtes maintenant Membre Pro 🎉");
      // Ici, plus tard, on mettra à jour la base de données
    }
  }

  async function fetchProjects() {
    // ... (Ton code existant pour fetchProjects reste identique, ne change rien ici si tu l'as déjà)
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if(data) setProjects(data);
  }

  async function createProject() {
    // ... (Ton code existant pour createProject)
    const newName = prompt("Nom du projet ?");
    if (!newName) return;
    const { data, error } = await supabase.from('projects').insert([{ name: newName, user_id: user?.id }]).select();
    if (data) router.push(`/dashboard/${data[0].id}`);
  }

  // --- FONCTION POUR DÉCLENCHER LE PAIEMENT ---
  async function handleSubscribe() {
    setLoadingPay(true);
    try {
      const response = await fetch('/api/checkout', { method: 'POST' });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // On redirige vers Stripe
      }
    } catch (error) {
      console.error("Erreur paiement", error);
      alert("Impossible de lancer le paiement");
    }
    setLoadingPay(false);
  }

  if (!isLoaded) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-stone-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* En-tête avec UserButton et Bouton Pro */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900">Mes Projets</h1>
            <p className="text-stone-500">Gérez vos listes de shopping</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Bouton Abonnement */}
            <button 
              onClick={handleSubscribe}
              disabled={loadingPay}
              className="bg-amber-400 text-stone-900 px-4 py-2 rounded-full font-bold text-sm hover:bg-amber-500 transition shadow-sm"
            >
              {loadingPay ? "Chargement..." : "👑 Passer Pro"}
            </button>
            
            {/* Avatar Clerk */}
            <UserButton afterSignOutUrl="/"/>
          </div>
        </div>

        {/* Bouton Créer */}
        <button 
          onClick={createProject}
          className="bg-stone-900 text-white px-6 py-3 rounded-lg font-medium mb-8 hover:bg-stone-700 transition w-full md:w-auto"
        >
          + Nouveau Projet
        </button>

        {/* Grille des projets (Ton code existant pour l'affichage) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Link key={project.id} href={`/dashboard/${project.id}`}>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 hover:shadow-md transition cursor-pointer h-40 flex flex-col justify-between group">
                <h3 className="font-serif text-xl text-stone-800 group-hover:text-amber-600 transition">{project.name}</h3>
                <p className="text-stone-400 text-xs uppercase tracking-wider">Ouvrir →</p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}