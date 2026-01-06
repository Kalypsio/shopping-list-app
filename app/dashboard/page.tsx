"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useUser, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingPay, setLoadingPay] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProjects();
      checkPaymentSuccess();
    }
  }, [user]);

  function checkPaymentSuccess() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      alert("Merci ! Vous êtes maintenant Membre Pro 🎉");
      // Future étape : Enregistrer le statut 'pro' dans Supabase
    }
  }

  async function fetchProjects() {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false }); // Trie par le plus récent
    if(data) setProjects(data);
  }

  async function createProject() {
    // Ici, on pourrait vérifier si l'user est Pro avant de laisser créer un 2ème projet
    const newName = prompt("Nom du projet ?");
    if (!newName) return;
    const { data, error } = await supabase.from('projects').insert([{ name: newName, user_id: user?.id }]).select();
    if (data) router.push(`/dashboard/${data[0].id}`);
  }

  // --- NOUVELLE FONCTION : SUPPRIMER UN PROJET ---
  async function deleteProject(projectId: string, e: React.MouseEvent) {
    e.preventDefault(); // Empêche le clic d'ouvrir le projet
    if(!confirm("Êtes-vous sûr de vouloir supprimer ce projet et tout son contenu ? ⚠️")) return;

    // 1. Supprimer les items du projet d'abord (Nettoyage en cascade)
    await supabase.from('items').delete().eq('project_id', projectId);
    
    // 2. Supprimer le projet lui-même
    await supabase.from('projects').delete().eq('id', projectId);
    
    fetchProjects(); // Rafraîchir la liste
  }
  // -----------------------------------------------

  async function handleSubscribe() {
    setLoadingPay(true);
    try {
      const response = await fetch('/api/checkout', { method: 'POST' });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error("Erreur paiement", error);
      alert("Impossible de lancer le paiement");
    }
    setLoadingPay(false);
  }

  if (!isLoaded) return <div className="p-10 text-center font-serif">Chargement de votre atelier...</div>;

  return (
    <div className="min-h-screen bg-stone-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-serif font-bold text-stone-900">Mes Projets</h1>
            <p className="text-stone-500 mt-2">Gérez vos listes de shopping & moodboards</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-sm border border-stone-100">
            <button 
              onClick={handleSubscribe}
              disabled={loadingPay}
              className="bg-amber-400 text-stone-900 px-5 py-2 rounded-full font-bold text-sm hover:bg-amber-500 transition flex items-center gap-2"
            >
              {loadingPay ? "..." : "👑 Passer Pro"}
            </button>
            <div className="pr-2">
              <UserButton afterSignOutUrl="/"/>
            </div>
          </div>
        </div>

        {/* Bouton Créer */}
        <div className="flex justify-end mb-8">
            <button 
            onClick={createProject}
            className="bg-stone-900 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:bg-stone-800 transition transform hover:-translate-y-1"
            >
            + Nouveau Projet
            </button>
        </div>

        {/* Grille des projets */}
        {projects.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-300">
                <p className="text-stone-400 mb-4">Vous n'avez aucun projet pour le moment.</p>
                <button onClick={createProject} className="text-amber-600 font-bold hover:underline">Créez votre premier moodboard</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
                <Link key={project.id} href={`/dashboard/${project.id}`}>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 hover:shadow-md transition cursor-pointer h-48 flex flex-col justify-between group relative">
                    
                    {/* Bouton Supprimer (Poubelle) */}
                    <button 
                        onClick={(e) => deleteProject(project.id, e)}
                        className="absolute top-4 right-4 text-stone-300 hover:text-red-500 transition p-2 z-10"
                        title="Supprimer le projet"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </button>

                    <div>
                        <h3 className="font-serif text-2xl text-stone-800 group-hover:text-amber-600 transition truncate pr-8">{project.name}</h3>
                        <p className="text-stone-400 text-xs mt-2">Créé le {new Date(project.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-stone-300 uppercase tracking-widest bg-stone-50 px-2 py-1 rounded">En cours</span>
                        <p className="text-stone-900 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                            Ouvrir <span className="text-amber-500">→</span>
                        </p>
                    </div>
                </div>
                </Link>
            ))}
            </div>
        )}

      </div>
    </div>
  )
}