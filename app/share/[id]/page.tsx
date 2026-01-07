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
  
  // Petit état local pour simuler la validation côté client (effet visuel immédiat)
  const [decisions, setDecisions] = useState<Record<string, 'approved' | 'rejected'>>({});

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

  // Fonction pour gérer le clic (purement visuel pour l'instant)
  const handleDecision = (itemId: string, decision: 'approved' | 'rejected') => {
    setDecisions(prev => ({ ...prev, [itemId]: decision }));
  }

  // Calcul du total validé
  const totalValidated = items.reduce((acc, item) => {
    return decisions[item.id] === 'approved' ? acc + item.price : acc;
  }, 0);

  if (!project) return (
    <div className="min-h-screen relative flex items-center justify-center">
        <div className="fixed inset-0 z-0">
            <Image src={BG_IMAGE_URL} alt="Fond" fill className="object-cover" />
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"></div>
        </div>
        <div className="relative z-10 text-white font-serif text-2xl animate-pulse">
            Chargement de la proposition...
        </div>
    </div>
  );

  return (
    <div className="min-h-screen relative font-sans text-stone-900 pb-20">
      
      {/* --- FOND IDENTIQUE --- */}
      <div className="fixed inset-0 z-0">
        <Image 
          src={BG_IMAGE_URL}
          alt="Fond"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-stone-50/80 backdrop-blur-md"></div>
      </div>
      
      <div className="relative z-10 max-w-3xl mx-auto p-6 md:p-12">
        
        {/* En-tête Centré */}
        <div className="text-center mb-12">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Proposition Design</p>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-stone-900 mb-4 drop-shadow-sm">{project.name}</h1>
            <div className="inline-block bg-white/50 backdrop-blur border border-stone-200 px-6 py-2 rounded-full">
                <span className="text-stone-500 font-serif italic mr-2">Total sélectionné :</span>
                <span className="font-bold text-amber-600 text-xl">{totalValidated} €</span>
            </div>
        </div>

        {/* LISTE DES ITEMS (Cartes Clients) */}
        <div className="space-y-6">
          {items.map(item => {
            const status = decisions[item.id]; // 'approved', 'rejected' ou undefined

            return (
                <div key={item.id} className={`
                    group relative overflow-hidden rounded-3xl p-6 transition-all duration-300
                    ${status === 'approved' ? 'bg-amber-50/90 border-amber-200 shadow-md scale-[1.02]' : ''}
                    ${status === 'rejected' ? 'bg-stone-100/50 border-stone-200 opacity-60 grayscale' : ''}
                    ${!status ? 'bg-white/80 backdrop-blur-md border-white/50 shadow-sm hover:shadow-lg' : ''}
                    border
                `}>
                
                {/* Badge de statut */}
                {status === 'approved' && (
                    <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        ✅ VALIDÉ
                    </div>
                )}
                {status === 'rejected' && (
                    <div className="absolute top-4 right-4 bg-stone-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        ✕ REFUSÉ
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-6 items-center">
                    
                    {/* Image */}
                    <div className="w-full md:w-40 h-40 shrink-0 bg-white rounded-2xl overflow-hidden border border-stone-100 relative shadow-inner">
                        {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🛋️</div>
                        )}
                    </div>

                    {/* Infos */}
                    <div className="flex-1 text-center md:text-left w-full">
                        <h3 className="text-2xl font-serif font-bold text-stone-800 mb-1">{item.name}</h3>
                        <p className="text-xl font-bold text-amber-600 mb-4">{item.price} €</p>
                        
                        {item.url && (
                            <a href={item.url} target="_blank" className="inline-block text-xs font-bold text-stone-400 uppercase tracking-wider hover:text-stone-900 border-b border-transparent hover:border-stone-900 transition mb-6">
                                Voir le détail produit ↗
                            </a>
                        )}

                        {/* Boutons d'action */}
                        <div className="flex gap-3 justify-center md:justify-start">
                            <button 
                                onClick={() => handleDecision(item.id, 'approved')}
                                className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm transition transform hover:-translate-y-1 shadow-sm
                                    ${status === 'approved' ? 'bg-stone-900 text-white ring-2 ring-offset-2 ring-stone-900' : 'bg-white text-stone-900 border border-stone-200 hover:bg-stone-50'}
                                `}
                            >
                                {status === 'approved' ? 'Sélectionné' : 'Valider'}
                            </button>
                            
                            <button 
                                onClick={() => handleDecision(item.id, 'rejected')}
                                className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm transition hover:bg-stone-100 text-stone-400 hover:text-stone-600`}
                            >
                                Refuser
                            </button>
                        </div>
                    </div>
                </div>
                </div>
            );
          })}

          {items.length === 0 && (
            <div className="text-center py-20 opacity-50 font-serif italic text-stone-500">
              Le décorateur n'a pas encore ajouté d'articles.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}