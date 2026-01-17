"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams } from 'next/navigation'
import Image from "next/image"

const BG_IMAGE_URL = "/bg-luxe.png";

export default function SharePage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  
  // États pour gérer le refus avec commentaire
  const [rejectingItemId, setRejectingItemId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if(projectId) fetchProjectAndItems()
  }, [projectId])

  async function fetchProjectAndItems() {
    const { data: projectData } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()
    if (projectData) setProject(projectData)

    const { data: itemsData } = await supabase
      .from('items')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
    if (itemsData) setItems(itemsData)
  }

  // Action : Valider
  const handleApprove = async (itemId: string) => {
    // Mise à jour optimiste (visuel immédiat)
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'approved' } : i));
    
    // Sauvegarde BDD
    await supabase.from('items').update({ status: 'approved', client_comment: null }).eq('id', itemId);
  }

  // Action : Ouvrir le formulaire de refus
  const startReject = (itemId: string) => {
    setRejectingItemId(itemId);
    setCommentText("");
  }

  // Action : Confirmer le refus
  const confirmReject = async (itemId: string) => {
    if(!commentText.trim()) {
        alert("Merci d'indiquer une raison pour aider votre décorateur.");
        return;
    }

    setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'rejected', client_comment: commentText } : i));
    setRejectingItemId(null); // On ferme le formulaire

    await supabase.from('items').update({ status: 'rejected', client_comment: commentText }).eq('id', itemId);
  }

  // Action : Annuler le refus (retour)
  const cancelReject = () => {
    setRejectingItemId(null);
    setCommentText("");
  }

  const totalValidated = items.reduce((acc, item) => {
    return item.status === 'approved' ? acc + item.price : acc;
  }, 0);

  if (!project) return <div className="p-10 text-center text-white">Chargement...</div>;

  return (
    <div className="min-h-screen relative font-sans text-stone-900 pb-20">
      <div className="fixed inset-0 z-0">
        <Image src={BG_IMAGE_URL} alt="Fond" fill className="object-cover" />
        <div className="absolute inset-0 bg-stone-50/90 backdrop-blur-md"></div>
      </div>
      
      <div className="relative z-10 max-w-3xl mx-auto p-6 md:p-12">
        <div className="text-center mb-12">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Proposition Design</p>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-stone-900 mb-4">{project.name}</h1>
            <div className="inline-block bg-white/50 backdrop-blur border border-stone-200 px-6 py-2 rounded-full">
                <span className="text-stone-500 font-serif italic mr-2">Total validé :</span>
                <span className="font-bold text-amber-600 text-xl">{totalValidated} €</span>
            </div>
        </div>

        <div className="space-y-6">
          {items.map(item => {
            const isRejectingThis = rejectingItemId === item.id;
            
            return (
                <div key={item.id} className={`
                    group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 border
                    ${item.status === 'approved' ? 'bg-amber-50 border-amber-200 shadow-md' : ''}
                    ${item.status === 'rejected' ? 'bg-stone-100 border-stone-200 opacity-75' : ''}
                    ${!item.status ? 'bg-white border-stone-100 shadow-sm' : ''}
                `}>
                
                {/* Badges de statut */}
                {item.status === 'approved' && <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">✅ VALIDÉ</div>}
                {item.status === 'rejected' && <div className="absolute top-4 right-4 bg-stone-500 text-white text-xs font-bold px-3 py-1 rounded-full">❌ REFUSÉ</div>}

                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-full md:w-32 h-32 shrink-0 bg-white rounded-2xl overflow-hidden border border-stone-100 relative">
                        {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">🛋️</div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left w-full">
                        <h3 className="text-2xl font-serif font-bold text-stone-800">{item.name}</h3>
                        <p className="text-xl font-bold text-amber-600 mb-2">{item.price} €</p>
                        
                        {item.url && (
                            <a href={item.url} target="_blank" className="text-xs font-bold text-stone-400 uppercase hover:text-stone-900 border-b border-transparent hover:border-stone-900 mb-4 inline-block">
                                Voir le produit ↗
                            </a>
                        )}

                        {/* --- ZONE D'ACTION --- */}
                        <div className="mt-4">
                            
                            {/* Cas 1 : En train de refuser (Formulaire) */}
                            {isRejectingThis ? (
                                <div className="bg-red-50 p-4 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2">
                                    <p className="text-xs font-bold text-red-800 mb-2">Pourquoi cet article ne convient pas ?</p>
                                    <textarea 
                                        className="w-full p-2 text-sm border border-red-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-red-200"
                                        placeholder="Ex: Trop cher, pas la bonne couleur..."
                                        rows={2}
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={cancelReject} className="text-xs font-bold text-stone-500 hover:text-stone-800 px-3 py-2">Annuler</button>
                                        <button onClick={() => confirmReject(item.id)} className="text-xs font-bold bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Confirmer le refus</button>
                                    </div>
                                </div>
                            ) : (
                                /* Cas 2 : Affichage normal des boutons */
                                <div className="flex gap-3 justify-center md:justify-start">
                                    {item.status !== 'approved' && (
                                        <button 
                                            onClick={() => handleApprove(item.id)}
                                            className="px-6 py-3 rounded-xl font-bold text-sm bg-stone-900 text-white hover:bg-stone-800 transition shadow-sm"
                                        >
                                            Valider
                                        </button>
                                    )}
                                    
                                    {item.status !== 'rejected' && (
                                        <button 
                                            onClick={() => startReject(item.id)}
                                            className="px-6 py-3 rounded-xl font-bold text-sm bg-white text-stone-900 border border-stone-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                                        >
                                            Refuser
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Affichage du commentaire si refusé */}
                            {item.status === 'rejected' && item.client_comment && (
                                <div className="mt-3 text-sm text-red-600 italic bg-white/50 p-2 rounded-lg inline-block border border-red-100">
                                    " {item.client_comment} "
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}