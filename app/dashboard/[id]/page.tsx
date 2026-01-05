"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function ProjectDetails() {
  const params = useParams(); 
  // Petite sécurité : on s'assure que params est chargé
  const projectId = params?.id as string;

  const [items, setItems] = useState<any[]>([]);
  const [projectName, setProjectName] = useState("Chargement...");
  
  // Formulaire d'ajout
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemUrl, setNewItemUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Pour gérer l'affichage du lien (évite les erreurs serveur)
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    // On récupère l'URL du site (ex: localhost:3000) une fois la page chargée
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }

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

  async function addItem() {
    if (!newItemName) return;
    setLoading(true);

    const { error } = await supabase
      .from('items')
      .insert([
        { 
          project_id: projectId,
          name: newItemName,
          price: newItemPrice ? parseFloat(newItemPrice) : 0,
          url: newItemUrl,
          status: 'pending'
        }
      ]);

    if (!error) {
      setNewItemName("");
      setNewItemPrice("");
      setNewItemUrl("");
      fetchItems();
    } else {
      alert("Erreur lors de l'ajout");
    }
    setLoading(false);
  }

  async function deleteItem(itemId: string) {
    if(!confirm("Supprimer cet article ?")) return;
    await supabase.from('items').delete().eq('id', itemId);
    fetchItems();
  }

  const total = items.reduce((acc, item) => acc + (item.price || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* En-tête avec bouton retour */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-gray-500 hover:text-black mb-4 inline-block">← Retour aux projets</Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{projectName}</h1>
              <p className="text-gray-500 mt-1">Budget total : <span className="font-bold text-green-600">{total} €</span></p>
            </div>

            {/* --- LE fameux bloc pour le lien Client --- */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex flex-col gap-2">
               <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Lien client à partager :</p>
               <div className="flex items-center gap-2">
                 <code className="bg-white px-2 py-1 rounded text-xs text-gray-600 border border-blue-100 select-all">
                    {origin}/share/{projectId}
                 </code>
                 <a 
                   href={`/share/${projectId}`} 
                   target="_blank"
                   className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-blue-700 transition"
                 >
                   Ouvrir ↗
                 </a>
               </div>
            </div>
            {/* ----------------------------------------- */}
          </div>
        </div>

        {/* Zone d'ajout d'article */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4">Ajouter un article</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              className="border p-2 rounded col-span-2 text-black" 
              placeholder="Nom (ex: Canapé Velours)" 
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
            />
            <input 
              className="border p-2 rounded text-black" 
              type="number" 
              placeholder="Prix (ex: 590)" 
              value={newItemPrice}
              onChange={e => setNewItemPrice(e.target.value)}
            />
            <button 
              onClick={addItem} 
              disabled={loading}
              className="bg-black text-white rounded hover:bg-gray-800 transition font-medium"
            >
              {loading ? "Ajout..." : "Ajouter +"}
            </button>
          </div>
          <input 
              className="border p-2 rounded w-full mt-3 text-black" 
              placeholder="Lien vers le site (optionnel)" 
              value={newItemUrl}
              onChange={e => setNewItemUrl(e.target.value)}
            />
        </div>

        {/* Liste des articles */}
        <div className="grid gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
              <div className="flex-1">
                <h4 className="font-bold text-lg text-gray-800">{item.name}</h4>
                {item.url && <a href={item.url} target="_blank" className="text-blue-500 text-sm hover:underline">Voir le produit ↗</a>}
              </div>
              <div className="text-right flex items-center gap-6">
                <span className="font-bold text-lg">{item.price} €</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  item.status === 'approved' ? 'bg-green-100 text-green-700' : 
                  item.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {item.status === 'pending' ? 'En attente' : item.status}
                </span>
                <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-600 font-bold px-2">×</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-center text-gray-400 py-10">Aucun article dans cette liste.</p>}
        </div>

      </div>
    </div>
  )
}