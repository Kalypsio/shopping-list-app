"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams } from 'next/navigation'

export default function ClientView() {
  const params = useParams();
  const projectId = params.id;

  const [items, setItems] = useState<any[]>([]);
  const [projectName, setProjectName] = useState("Chargement...");

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
      fetchItems();
    }
  }, [projectId]);

  async function fetchProjectDetails() {
    const { data } = await supabase.from('projects').select('name').eq('id', projectId).single();
    if (data) setProjectName(data.name);
  }

  async function fetchItems() {
    const { data } = await supabase.from('items').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
    if (data) setItems(data);
  }

  async function updateStatus(itemId: string, newStatus: 'approved' | 'rejected') {
    setItems(items.map(i => i.id === itemId ? { ...i, status: newStatus } : i));
    await supabase.from('items').update({ status: newStatus }).eq('id', itemId);
  }

  const validTotal = items
    .filter(i => i.status === 'approved')
    .reduce((acc, item) => acc + (item.price || 0), 0);

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-stone-800">
      {/* En-tête chic et minimaliste */}
      <header className="bg-white border-b border-stone-100 py-8 px-6 text-center sticky top-0 z-10 opacity-95">
        <p className="text-xs font-bold tracking-[0.2em] text-stone-400 uppercase mb-2">Proposition Design</p>
        <h1 className="text-4xl font-serif text-stone-900 mb-2">{projectName}</h1>
        <div className="inline-block border-b-2 border-amber-400 pb-1">
          <span className="font-bold text-stone-900">Total Validé : {validTotal} €</span>
        </div>
      </header>

      {/* Liste des articles style "Carte élégante" */}
      <main className="max-w-2xl mx-auto p-6 space-y-8">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-none shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-stone-50 overflow-hidden transition hover:shadow-lg">
            
            {/* --- ZONE IMAGE (Nouveau) --- */}
            {item.image_url && (
              <div className="w-full h-64 bg-stone-100 relative group">
                {/* L'image prend toute la largeur et zoom légèrement au survol */}
                <img 
                  src={item.image_url} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-105" 
                />
              </div>
            )}
            {/* --------------------------- */}

            {/* Conteneur du texte avec padding */}
            <div className="p-8">
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-serif text-stone-900 mb-1">{item.name}</h3>
                  <p className="text-xl font-light text-stone-500">{item.price} €</p>
                  {item.url && (
                    <a href={item.url} target="_blank" className="text-xs uppercase tracking-widest text-amber-600 hover:text-amber-800 mt-3 inline-block border-b border-amber-200 pb-0.5">
                      Voir le produit
                    </a>
                  )}
                </div>
                
                {/* Badge Statut Minimaliste */}
                <div className={`px-3 py-1 text-xs tracking-widest uppercase font-bold ${
                  item.status === 'approved' ? 'bg-stone-900 text-white' : 
                  item.status === 'rejected' ? 'bg-stone-100 text-stone-400 line-through' : 
                  'bg-amber-50 text-amber-800'
                }`}>
                  {item.status === 'approved' ? 'Validé' : item.status === 'rejected' ? 'Refusé' : 'À décider'}
                </div>
              </div>

              {/* Boutons d'action "Luxe" */}
              <div className="flex gap-4 mt-6 pt-6 border-t border-stone-100">
                <button 
                  onClick={() => updateStatus(item.id, 'approved')}
                  className={`flex-1 py-4 text-sm tracking-widest uppercase transition duration-300 ${
                    item.status === 'approved' 
                    ? 'bg-stone-900 text-white' 
                    : 'bg-white border border-stone-200 text-stone-400 hover:border-stone-900 hover:text-stone-900'
                  }`}
                >
                  Valider
                </button>
                
                <button 
                  onClick={() => updateStatus(item.id, 'rejected')}
                  className={`flex-1 py-4 text-sm tracking-widest uppercase transition duration-300 ${
                    item.status === 'rejected' 
                    ? 'bg-red-50 text-red-800 border-red-100' 
                    : 'bg-white border border-stone-200 text-stone-400 hover:border-red-200 hover:text-red-400'
                  }`}
                >
                  Refuser
                </button>
              </div>

            </div> {/* Fin du padding wrapper */}
          </div>
        ))}
      </main>
    </div>
  )
}