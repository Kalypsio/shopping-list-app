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
    const { data } = await supabase.from('projects').select('name, client_name').eq('id', projectId).single();
    if (data) setProjectName(data.name);
  }

  async function fetchItems() {
    const { data } = await supabase.from('items').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
    if (data) setItems(data);
  }

  // Fonction pour valider ou refuser un article
  async function updateStatus(itemId: string, newStatus: 'approved' | 'rejected') {
    // Optimisme : on met à jour l'écran tout de suite pour que ce soit réactif
    setItems(items.map(i => i.id === itemId ? { ...i, status: newStatus } : i));

    // Puis on envoie à la base de données
    await supabase.from('items').update({ status: newStatus }).eq('id', itemId);
  }

  // Calcul du budget validé uniquement
  const validTotal = items
    .filter(i => i.status === 'approved')
    .reduce((acc, item) => acc + (item.price || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* En-tête Client */}
        <div className="bg-blue-600 p-8 text-white text-center">
          <p className="text-blue-100 text-sm uppercase tracking-wider mb-2">Proposition Shopping</p>
          <h1 className="text-3xl font-bold mb-2">{projectName}</h1>
          <div className="bg-blue-800 inline-block px-4 py-1 rounded-full text-sm">
            Total Validé : {validTotal} €
          </div>
        </div>

        {/* Liste des articles */}
        <div className="p-6">
          {items.map(item => (
            <div key={item.id} className="border-b border-gray-100 py-6 last:border-0">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                  <p className="text-lg text-gray-600">{item.price} €</p>
                  {item.url && <a href={item.url} target="_blank" className="text-blue-500 text-xs hover:underline mt-1 block">Voir le produit sur le site web</a>}
                </div>
                
                {/* Badge de statut */}
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  item.status === 'approved' ? 'bg-green-100 text-green-700' : 
                  item.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                  'bg-gray-100 text-gray-500'
                }`}>
                  {item.status === 'approved' ? 'Validé' : item.status === 'rejected' ? 'Refusé' : 'À décider'}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-2">
                <button 
                  onClick={() => updateStatus(item.id, 'approved')}
                  className={`flex-1 py-3 rounded-lg font-bold transition ${
                    item.status === 'approved' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white border-2 border-gray-100 text-gray-600 hover:border-green-500 hover:text-green-600'
                  }`}
                >
                  ✅ Je Valide
                </button>
                
                <button 
                  onClick={() => updateStatus(item.id, 'rejected')}
                  className={`flex-1 py-3 rounded-lg font-bold transition ${
                    item.status === 'rejected' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-white border-2 border-gray-100 text-gray-600 hover:border-red-500 hover:text-red-600'
                  }`}
                >
                  ❌ Je Refuse
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}