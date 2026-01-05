"use client" // Indispensable pour que les boutons fonctionnent

import { useState, useEffect } from 'react'
import { UserButton, useUser } from "@clerk/nextjs";
import { supabase } from '@/lib/supabaseClient'; // On importe notre connexion
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useUser(); // On récupère l'info de l'utilisateur connecté
  const [projects, setProjects] = useState<any[]>([]); // Liste des projets
  const [newProjectName, setNewProjectName] = useState(""); // Texte du champ "Nouveau projet"
  const [loading, setLoading] = useState(false);

  // 1. Au chargement de la page, on va chercher les projets existants
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  async function fetchProjects() {
    // On demande à Supabase : "Donne-moi tous les projets de cet utilisateur"
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) setProjects(data);
  }

  // 2. Fonction pour créer un projet quand on clique sur le bouton
  async function createProject() {
    if (!newProjectName) return; // Si vide, on ne fait rien
    setLoading(true);

    const { data, error } = await supabase
      .from('projects')
      .insert([
        { 
          name: newProjectName, 
          user_id: user?.id,
          client_name: 'Client Inconnu' // Valeur par défaut pour l'instant
        }
      ])
      .select();

    if (!error) {
      setNewProjectName(""); // On vide le champ
      fetchProjects(); // On rafraîchit la liste
    } else {
      console.error(error);
      alert("Erreur lors de la création");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre du haut */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">ShoppingList Pro 🛍️</h1>
        <div className='flex items-center gap-4'>
           <span className='text-sm text-gray-500'>Bonjour {user?.firstName}</span>
           <UserButton />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto mt-10 p-6">
        
        {/* Formulaire de création */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau Projet</label>
            <input 
              type="text" 
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Ex: Salon Mme Durand"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
            />
          </div>
          <button 
            onClick={createProject}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 h-[42px]"
          >
            {loading ? "Création..." : "+ Créer"}
          </button>
        </div>

        {/* Liste des projets */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Mes Projets en cours</h2>
        
        <div className="grid gap-4">
          {projects.length === 0 ? (
            <p className="text-gray-500 italic">Aucun projet pour le moment.</p>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="bg-white p-6 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm hover:shadow-md transition">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                  <p className="text-sm text-gray-500">Créé le {new Date(project.created_at).toLocaleDateString()}</p>
                </div>
                <Link href={`/dashboard/${project.id}`} className="text-blue-600 font-medium hover:underline">
  Voir la liste →
</Link>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
}