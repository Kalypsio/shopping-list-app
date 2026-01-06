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
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (user) {
      // On lance le check Pro et le chargement des projets UNIQUEMENT quand l'user est chargé
      const localPro = localStorage.getItem('shoppinglist_is_pro');
      if (localPro === 'true') setIsPro(true);
      
      checkPaymentSuccess();
      fetchProjects(user.id); // On passe l'ID pour être sûr
    }
  }, [user]);

  function checkPaymentSuccess() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      localStorage.setItem('shoppinglist_is_pro', 'true');
      setIsPro(true);
      alert("Merci ! Vous êtes maintenant Membre Pro 🎉.");
      window.history.replaceState({}, document.title, "/dashboard");
    }
  }

  // --- CORRECTION DE SÉCURITÉ ICI ---
  async function fetchProjects(userId: string) {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId) // <--- C'EST CETTE LIGNE QUI SÉCURISE TOUT
      .order('created_at', { ascending: false });
      
    if(data) setProjects(data);
  }
  // ----------------------------------

  async function createProject() {
    // Vérification stricte
    if (projects.length >= 1 && !isPro) {
        // Double check avec un confirm pour éviter les erreurs de clic
        if(confirm("🔒 Limite atteinte (1 projet gratuit).\n\nPassez Pro pour en créer plus ! Aller au paiement ?")) {
            handleSubscribe();
        }
        return;
    }

    const newName = prompt("Nom du projet ?");
    if (!newName) return;
    
    // On s'assure d'envoyer l'ID de l'user
    const { data, error } = await supabase
        .from('projects')
        .insert([{ name: newName, user_id: user?.id }])
        .select();
        
    if (data) router.push(`/dashboard/${data[0].id}`);
  }

  async function deleteProject(projectId: string, e: React.MouseEvent) {
    e.preventDefault();
    if(!confirm("Supprimer ce projet ?")) return;
    await supabase.from('items').delete().eq('project_id', projectId);
    await supabase.from('projects').delete().eq('id', projectId);
    // On rappelle fetchProjects avec l'ID utilisateur
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
    <div className="min-h-screen bg-stone-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-serif font-bold text-stone-900">Mes Projets</h1>
            <p className="text-stone-500 mt-2">
              {isPro ? "✨ Membre Pro (Illimité)" : `Plan Gratuit (${projects.length}/1 projet)`}
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-sm border border-stone-100">
            {!isPro && (
              <button 
                onClick={handleSubscribe}
                disabled={loadingPay}
                className="bg-amber-400 text-stone-900 px-5 py-2 rounded-full font-bold text-sm hover:bg-amber-500 transition animate-pulse"
              >
                {loadingPay ? "..." : "👑 Passer Pro"}
              </button>
            )}
            <div className="pr-2"><UserButton afterSignOutUrl="/"/></div>
          </div>
        </div>

        <div className="flex justify-end mb-8">
            {/* Logique visuelle du bouton */}
            <button 
            onClick={createProject}
            className={`text-white px-6 py-3 rounded-lg font-medium shadow-lg transition ${
              (projects.length >= 1 && !isPro)
              ? "bg-stone-400 cursor-not-allowed" 
              : "bg-stone-900 hover:bg-stone-800"
            }`}
            >
            {(projects.length >= 1 && !isPro) ? "🔒 Limite atteinte" : "+ Nouveau Projet"}
            </button>
        </div>

        {projects.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-300">
                <p className="text-stone-400 mb-4">Aucun projet.</p>
                <button onClick={createProject} className="text-amber-600 font-bold hover:underline">Créez le premier !</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
                <Link key={project.id} href={`/dashboard/${project.id}`}>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 hover:shadow-md transition cursor-pointer h-48 flex flex-col justify-between group relative">
                    <button 
                        onClick={(e) => deleteProject(project.id, e)}
                        className="absolute top-4 right-4 text-stone-300 hover:text-red-500 transition z-10"
                    >
                        🗑️
                    </button>
                    <h3 className="font-serif text-2xl text-stone-800 truncate pr-8">{project.name}</h3>
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-stone-300 bg-stone-50 px-2 py-1 rounded">En cours</span>
                        <p className="text-stone-900 text-sm font-bold">Ouvrir →</p>
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