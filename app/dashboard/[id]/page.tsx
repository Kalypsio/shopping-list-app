"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function ProjectDetails() {
  const params = useParams(); 
  const projectId = params?.id as string;

  const [items, setItems] = useState<any[]>([]);
  const [projectName, setProjectName] = useState("Chargement...");
  
  // Formulaire d'ajout
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemUrl, setNewItemUrl] = useState("");
  const [newItemImage, setNewItemImage] = useState<File | null>(null); // Le fichier image
  const [loading, setLoading] = useState(false);

  // Pour le lien de partage
  const [origin, setOrigin] = useState("");

  useEffect(() => {
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

    let imageUrl = null;

    // 1. Upload de l'image (si présente)
    if (newItemImage) {
      const fileExt = newItemImage.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('images') // Assure-toi que ton bucket s'appelle bien 'images'
        .upload(fileName, newItemImage);

      if (uploadError) {
        console.error("Erreur upload:", uploadError);
        alert("Erreur lors de l'upload de l'image. Vérifie que ton bucket 'images' est bien Public.");
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);
        
      imageUrl = urlData.publicUrl;
    }

    // 2. Ajout dans la base de données
    const { error } = await supabase
      .from('items')
      .insert([
        { 
          project_id: projectId,
          name: newItemName,
          price: newItemPrice ? parseFloat(newItemPrice) : 0,
          url: newItemUrl,
          image_url: imageUrl,
          status: 'pending'
        }
      ]);

    if (!error) {
      setNewItemName("");
      setNewItemPrice("");
      setNewItemUrl("");
      setNewItemImage(null);
      // Reset visuel du champ fichier
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if(fileInput) fileInput.value = "";
      
      fetchItems();
    } else {
      console.error(error);
      alert("Erreur lors de l'ajout en base de données");
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
    <div className="min-h-screen bg-stone-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* En-tête */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-stone-500 hover:text-black mb-4 inline-block">← Retour aux projets</Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-serif font-bold text-stone-900">{projectName}</h1>
              <p className="text-stone-500 mt-2">Budget total : <span className="font-bold text-green-600">{total} €</span></p>
            </div>

            {/* Bloc Lien Client */}
            <div className="bg-white border border-stone-200 p-4 rounded-xl flex flex-col gap-2 shadow-sm">
               <p className="text-xs font-bold text-stone-400 uppercase tracking-wide">Lien client à partager :</p>
               <div className="flex items-center gap-2">
                 <code className="bg-stone-50 px-2 py-1 rounded text-xs text-stone-600 border border-stone-200 select-all">
                    {origin}/share/{projectId}
                 </code>
                 <a 
                   href={`/share/${projectId}`} 
                   target="_blank"
                   className="bg-stone-900 text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-stone-700 transition"
                 >
                   Ouvrir ↗
                 </a>
               </div>
            </div>
          </div>
        </div>

        {/* --- FORMULAIRE D'AJOUT (C'est ici que ça change) --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-stone-200">
          <h3 className="font-serif font-bold text-stone-700 mb-4 text-xl">Ajouter un article</h3>
          
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                className="border border-stone-300 p-3 rounded text-stone-900 bg-stone-50 focus:ring-2 focus:ring-stone-400 outline-none" 
                placeholder="Nom (ex: Canapé Velours)" 
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
              />
              <input 
                className="border border-stone-300 p-3 rounded text-stone-900 bg-stone-50 focus:ring-2 focus:ring-stone-400 outline-none" 
                type="number" 
                placeholder="Prix (ex: 590)" 
                value={newItemPrice}
                onChange={e => setNewItemPrice(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <input 
                  className="border border-stone-300 p-3 rounded text-stone-900 bg-stone-50 focus:ring-2 focus:ring-stone-400 outline-none" 
                  placeholder="Lien vers le site marchand (optionnel)" 
                  value={newItemUrl}
                  onChange={e => setNewItemUrl(e.target.value)}
                />
                
                {/* LE CHAMP IMAGE QUI MANQUAIT */}
                <input 
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  className="border border-stone-300 p-2 rounded text-stone-500 bg-stone-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-stone-200 file:text-stone-700 hover:file:bg-stone-300 cursor-pointer"
                  onChange={e => e.target.files && setNewItemImage(e.target.files[0])}
                />
            </div>

            <button 
              onClick={addItem} 
              disabled={loading}
              className="bg-stone-900 text-white py-3 rounded hover:bg-stone-800 transition font-medium mt-2 w-full md:w-auto md:px-8"
            >
              {loading ? "Envoi en cours..." : "Ajouter au projet +"}
            </button>
          </div>
        </div>

        {/* Liste des articles */}
        <div className="grid gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-stone-100 flex justify-between items-center group hover:border-stone-300 transition">
              <div className="flex items-center gap-4 flex-1">
                
                {/* Petite vignette image dans la liste Admin */}
                {item.image_url ? (
                  <img src={item.image_url} alt="vignette" className="w-16 h-16 object-cover rounded-md bg-stone-100" />
                ) : (
                  <div className="w-16 h-16 bg-stone-100 rounded-md flex items-center justify-center text-stone-300 text-xs">No IMG</div>
                )}

                <div>
                  <h4 className="font-bold text-lg text-stone-800 font-serif">{item.name}</h4>
                  {item.url && <a href={item.url} target="_blank" className="text-amber-600 text-xs hover:underline uppercase tracking-wide">Voir le produit ↗</a>}
                </div>
              </div>

              <div className="text-right flex items-center gap-6">
                <span className="font-bold text-lg">{item.price} €</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  item.status === 'approved' ? 'bg-green-100 text-green-700' : 
                  item.status === 'rejected' ? 'bg-stone-100 text-stone-400 line-through' : 
                  'bg-amber-50 text-amber-800'
                }`}>
                  {item.status === 'pending' ? 'En attente' : item.status}
                </span>
                <button onClick={() => deleteItem(item.id)} className="text-stone-300 hover:text-red-500 font-bold px-2 text-xl transition">×</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-center text-stone-400 py-10 italic">Aucun article dans cette liste.</p>}
        </div>

      </div>
    </div>
  )
}