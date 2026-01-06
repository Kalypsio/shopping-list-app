"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams } from 'next/navigation'

export default function ClientView() {
  const params = useParams();
  const projectId = params?.id as string;

  const [items, setItems] = useState<any[]>([]);
  const [projectName, setProjectName] = useState("Chargement...");
  
  // NOUVEAU : Pour gérer quel item est en train d'être commenté
  const [rejectingItemId, setRejectingItemId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

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

  // Fonction mise à jour pour accepter un commentaire
  async function updateStatus(itemId: string, newStatus: 'approved' | 'rejected', feedback: string | null = null) {
    // Mise à jour locale (optimiste)
    setItems(items.map(i => i.id === itemId ? { ...i, status: newStatus, feedback: feedback } : i));
    
    // Reset du formulaire de feedback
    setRejectingItemId(null);
    setFeedbackText("");

    // Envoi à Supabase
    await supabase.from('items').update({ status: newStatus, feedback: feedback }).eq('id', itemId);
  }

  const validTotal = items
    .filter(i => i.status === 'approved')
    .reduce((acc, item) => acc + (item.price || 0), 0);

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-stone-800 font-sans">
      
      {/* En-tête */}
      <header className="bg-white border-b border-stone-100 py-8 px-6 text-center sticky top-0 z-10 opacity-95 shadow-sm">
        <p className="text-xs font-bold tracking-[0.2em] text-stone-400 uppercase mb-2">Proposition Design</p>
        <h1 className="text-3xl md:text-4xl font-serif text-stone-900 mb-2">{projectName}</h1>
        <div className="inline-block border-b-2 border-amber-400 pb-1">
          <span className="font-bold text-stone-900">Total Validé : {validTotal} €</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-8">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-none shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-stone-50 overflow-hidden transition hover:shadow-xl">
            
            {/* Image */}
            {item.image_url && (
              <div className="w-full h-64 bg-stone-100 relative group">
                <img 
                  src={item.image_url} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-105" 
                />
              </div>
            )}

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
                
                {/* Badge Statut */}
                <div className={`px-3 py-1 text-xs tracking-widest uppercase font-bold ${
                  item.status === 'approved' ? 'bg-stone-900 text-white' : 
                  item.status === 'rejected' ? 'bg-stone-100 text-stone-400 line-through' : 
                  'bg-amber-50 text-amber-800'
                }`}>
                  {item.status === 'approved' ? 'Validé' : item.status === 'rejected' ? 'Refusé' : 'À décider'}
                </div>
              </div>

              {/* LOGIQUE D'AFFICHAGE DES BOUTONS */}
              <div className="mt-6 pt-6 border-t border-stone-100">
                
                {/* Cas 1 : Si l'utilisateur a cliqué sur Refuser, on affiche le champ Commentaire */}
                {rejectingItemId === item.id ? (
                  <div className="animate-fade-in bg-red-50 p-4 rounded-lg">
                    <label className="text-xs font-bold text-red-800 uppercase mb-2 block">Pourquoi ce refus ? (Optionnel)</label>
                    <textarea 
                      className="w-full p-2 border border-red-200 rounded mb-3 text-sm focus:outline-none focus:border-red-500"
                      placeholder="Ex: Trop cher, je n'aime pas la couleur..."
                      rows={2}
                      autoFocus
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => updateStatus(item.id, 'rejected', feedbackText)}
                        className="bg-red-600 text-white px-4 py-2 text-sm font-bold uppercase rounded hover:bg-red-700 flex-1"
                      >
                        Confirmer le refus
                      </button>
                      <button 
                        onClick={() => { setRejectingItemId(null); setFeedbackText(""); }}
                        className="bg-white text-stone-500 border border-stone-200 px-4 py-2 text-sm font-bold uppercase rounded hover:bg-stone-50"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  // Cas 2 : Affichage normal des boutons Valider / Refuser
                  <div className="flex gap-4">
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
                      onClick={() => {
                        // Au lieu de rejeter direct, on ouvre le mode "Feedback"
                        setRejectingItemId(item.id);
                        setFeedbackText("");
                      }}
                      className={`flex-1 py-4 text-sm tracking-widest uppercase transition duration-300 ${
                        item.status === 'rejected' 
                        ? 'bg-red-50 text-red-800 border-red-100' 
                        : 'bg-white border border-stone-200 text-stone-400 hover:border-red-200 hover:text-red-400'
                      }`}
                    >
                      Refuser
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        ))}
      </main>
    </div>
  )
}