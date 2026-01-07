"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useUser, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from "next/image"; // <--- Nouvel import

// On réutilise la même image pour la cohérence
const BG_IMAGE_URL = "/bg-luxe.png";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingPay, setLoadingPay] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [checkingPro, setCheckingPro] = useState(true);

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
      fetchProjects(user.id);
    }
  }, [user]);

  async function checkSubscriptionStatus() {
    try {
      const res = await fetch('/api/check-subscription');
      const data = await res.json();
      setIsPro(data.isPro);
      if (!data.isPro) localStorage.removeItem('shoppinglist_is_pro');
    } catch (error) {
      console.error("Erreur check pro", error);
    } finally {
      setCheckingPro(false);
    }
  }

  async function fetchProjects(userId: string) {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if(data) setProjects(data);
  }

  async function createProject() {
    if (checkingPro) return;
    if (projects.length >= 1 && !isPro) {
      if(confirm("🔒 Limite atteinte (1 projet gratuit).\n\nPassez Pro pour en créer plus ! Aller au paiement ?")) {
          handleSubscribe();
      }
      return;
    }
    const newName = prompt("Nom du projet ?");
    if (!newName) return;
    const { data } = await supabase.from('projects').insert([{ name: newName, user_id: user?.id }]).select();
    if (data) router.push(`/dashboard/${data[0].id}`);
  }

  async function deleteProject(projectId: string, e: React.MouseEvent) {
    e.preventDefault();
    if(!confirm("Supprimer ce projet ?")) return;
    await supabase.from('items').delete().eq('project_id', projectId);
    await supabase.from('projects').delete().eq('id', projectId);
    if(user?.id) fetchProjects(user.id);
  }

  async function handleSubscribe() {
    setLoadingPay(true);
    try {
      const response = await fetch('/api/checkout', { method: 'POST' });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      alert("Erreur paiement");
    }
    setLoadingPay(false);
  }

  if (!isLoaded) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <div className="min-h-screen relative font-sans text-stone-900">
      
      {/* --- FOND AVEC EFFET DE PROFONDEUR --- */}
      <div className="fixed inset-0 z-0">
        <Image 
          src={BG_IMAGE_URL}
          alt="Fond"
          fill
          className="object-cover"
        />
        {/* Le filtre blanc à 92% d'opacité : on voit à peine l'image, c'est subtil */}
        <div className="absolute inset-0 bg-stone-100/95 backdrop-blur-sm"></div>
      </div>
      {/* ------------------------------------- */}

      <div className="relative z-10 max-w-6xl mx-auto p-8">
        
        {/* En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-stone-200 pb-8">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-serif font-bold text-stone-900 drop-shadow-sm">Mon Atelier</h1>
            <div className="mt-3 text-stone-600 font-medium">
               {checkingPro ? (
                 <span className="text-xs italic">Chargement...</span>
               ) : isPro ? (
                 <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm border border-amber-200">✨ Membre Pro (Illimité)</span>
               ) : (
                 <span className="bg-stone-200 px-3 py-1 rounded-full text-sm">Plan Gratuit ({projects.length}/1 projet)</span>
               )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {!checkingPro && !isPro && (
              <button 
                onClick={handleSubscribe}
                disabled={loadingPay}
                className="bg-amber-500 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-amber-600 transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {loadingPay ? "..." : "👑 Passer Pro"}
              </button>
            )}
            <div className="bg-white p-1 rounded-full shadow-sm">
                <UserButton afterSignOutUrl="/"/>
            </div>
          </div>
        </div>

        {/* Action Créer */}
        <div className="flex justify-end mb-8">
            <button 
            onClick={createProject}
            disabled={checkingPro}
            className={`text-white px-8 py-3 rounded-xl font-bold shadow-lg transition transform hover:-translate-y-1 ${
              (!checkingPro && projects.length >= 1 && !isPro)
              ? "bg-stone-400 cursor-not-allowed" 
              : "bg-stone-900 hover:bg-stone-800"
            }`}
            >
            {checkingPro ? "..." : (!isPro && projects.length >= 1) ? "🔒 Limite atteinte" : "+ Nouveau Projet"}
            </button>
        </div>

        {/* Grille des projets */}
        {projects.length === 0 ? (
            <div className="text-center py-24 bg-white/60 backdrop-blur rounded-3xl border border-stone-200 shadow-sm">
                <p className="text-stone-400 mb-4 text-lg">Votre atelier est vide.</p>
                <button onClick={createProject} className="text-amber-600 font-bold hover:underline text-xl">Créez votre premier moodboard +</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map(project => (
                <Link key={project.id} href={`/dashboard/${project.id}`}>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 hover:shadow-xl hover:border-amber-200 transition cursor-pointer h-56 flex flex-col justify-between group relative overflow-hidden">
                    
                    {/* Petite barre décorative colorée sur le côté */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-stone-100 group-hover:bg-amber-400 transition-colors"></div>

                    <button 
                        onClick={(e) => deleteProject(project.id, e)}
                        className="absolute top-4 right-4 text-stone-300 hover:text-red-500 transition z-10 p-2 hover:bg-red-50 rounded-full"
                    >
                        🗑️
                    </button>

                    <div>
                        <h3 className="font-serif text-3xl text-stone-800 group-hover:text-amber-700 transition truncate pr-8">{project.name}</h3>
                        <p className="text-stone-400 text-xs mt-2 uppercase tracking-wider font-bold">Projet {new Date(project.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="flex justify-between items-end border-t border-stone-50 pt-4">
                        <span className="text-xs font-bold text-stone-400 bg-stone-50 px-2 py-1 rounded">EN COURS</span>
                        <p className="text-stone-900 text-sm font-bold flex items-center gap-2 group-hover:translate-x-1 transition">
                            Ouvrir <span className="text-amber-500 text-lg">→</span>
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