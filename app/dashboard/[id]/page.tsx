"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation' // <--- Changement ici (useParams)
import Image from "next/image"
import Link from 'next/link'

const BG_IMAGE_URL = "/bg-luxe.png";

export default function ProjectPage() {
  // 1. On récupère l'ID proprement via le Hook
  const params = useParams();
  const projectId = params.id as string; // On force le type en string

  const router = useRouter();
  const [project, setProject] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  
  // États formulaire
  const [newItemName, setNewItemName] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [newItemUrl, setNewItemUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // On lance le chargement seulement si on a un ID
    if (projectId) {
        fetchProjectAndItems()
    }
  }, [projectId]) // On recharge si l'ID change

  async function fetchProjectAndItems() {
    // A. Récupération du projet
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId) // On utilise projectId ici
      .single()
    
    if (projectError) {
        console.error("Erreur projet:", projectError);
        return;
    }
    if (projectData) setProject(projectData)

    // B. Récupération des items
    const { data: itemsData } = await supabase
      .from('items')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
    
    if (itemsData) setItems(itemsData)
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault()
    if (!newItemName || !newItemPrice) return;

    setLoading(true);
    let publicUrl = null;

    // 1. UPLOAD IMAGE
    if (imageFile) {
        setUploading(true);
        // Nom unique pour éviter les conflits
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${projectId}/${fileName}`; // On range par dossier projet

        const { error: uploadError } = await supabase.storage
            .from('item-images')
            .upload(filePath, imageFile);

        if (uploadError) {
            alert("Erreur upload image: " + uploadError.message);
            setUploading(false);
            setLoading(false);
            return;
        }

        const { data: publicData } = supabase.storage
            .from('item-images')
            .getPublicUrl(filePath);
            
        publicUrl = publicData.publicUrl;
    }

    // 2. INSERTION BDD
    const { error } = await supabase.from('items').insert([{
      project_id: projectId,
      name: newItemName,
      price: parseFloat(newItemPrice),
      url: newItemUrl,
      image_url: publicUrl
    }])

    if (!error) {
      setNewItemName('')
      setNewItemPrice('')
      setNewItemUrl('')
      setImageFile(null)
      fetchProjectAndItems()
    } else {
        alert("Erreur ajout item")
    }
    setLoading(false);
    setUploading(false);
  }

  async function deleteItem(itemId: string) {
    if(!confirm("Supprimer cet article ?")) return;
    await supabase.from('items').delete().eq('id', itemId)
    fetchProjectAndItems()
  }

  const total = items.reduce((acc, item) => acc + item.price, 0)

  // --- ECRAN DE CHARGEMENT AVEC FOND LUXE ---
  if (!project) return (
    <div className="min-h-screen relative flex items-center justify-center">
        {/* Le fond s'affiche aussi pendant le chargement */}
        <div className="fixed inset-0 z-0">
            <Image src={BG_IMAGE_URL} alt="Fond" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"></div>
        </div>
        <div className="relative z-10 text-white font-serif text-2xl animate-pulse">
            Chargement de l'atelier...
        </div>
    </div>
  );
  // ------------------------------------------

  return (
    <div className="min-h-screen relative font-sans text-stone-900 pb-20">
      
      {/* --- FOND --- */}
      <div className="fixed inset-0 z-0">
        <Image 
          src={BG_IMAGE_URL}
          alt="Fond"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-stone-50/80 backdrop-blur-md"></div>
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto p-6 md:p-12">
        
        {/* Navigation retour */}
        <Link href="/dashboard" className="inline-flex items-center text-stone-500 hover:text-stone-900 transition mb-8 font-medium group">
          <span className="group-hover:-translate-x-1 transition-transform mr-2">←</span> Retour à l'atelier
        </Link>

        {/* En-tête Projet */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-stone-900 mb-2 drop-shadow-sm">{project.name}</h1>
            <p className="text-xl text-stone-500 font-serif italic">Budget total : <span className="font-bold text-amber-600">{total} €</span></p>
          </div>

          <div className="bg-white/60 backdrop-blur border border-stone-200 p-4 rounded-xl shadow-sm flex flex-col gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Lien client à partager</span>
            <div className="flex gap-2">
              <input 
                readOnly 
                value={`https://shopping-list-app-seven-rho.vercel.app/share/${project.id}`} 
                className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-600 w-full md:w-64 select-all"
              />
              <a 
                href={`/share/${project.id}`} 
                target="_blank"
                className="bg-stone-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-stone-800 transition flex items-center"
              >
                Voir ↗
              </a>
            </div>
          </div>
        </div>

        {/* FORMULAIRE D'AJOUT */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-white/50 p-8 mb-12">
          <h2 className="font-serif text-2xl text-stone-800 mb-6 flex items-center gap-2">
            <span className="bg-amber-100 text-amber-600 w-8 h-8 flex items-center justify-center rounded-full text-sm">＋</span>
            Ajouter un article
          </h2>
          
          <form onSubmit={addItem} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nom (ex: Canapé Velours)"
                className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-amber-400 focus:outline-none transition shadow-sm"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Prix (ex: 590)"
                className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-amber-400 focus:outline-none transition shadow-sm"
                value={newItemPrice}
                onChange={e => setNewItemPrice(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text"
                    placeholder="Lien vers le site marchand (optionnel)"
                    className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-amber-400 focus:outline-none transition shadow-sm"
                    value={newItemUrl}
                    onChange={e => setNewItemUrl(e.target.value)}
                />
                
                <div className="relative group">
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 flex items-center justify-between shadow-sm group-hover:bg-stone-50 transition">
                        <span className={`truncate ${imageFile ? 'text-stone-900 font-medium' : 'text-stone-400'}`}>
                            {imageFile ? `📸 ${imageFile.name}` : "Choisir une photo (optionnel)"}
                        </span>
                        <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-lg text-xs font-bold uppercase">Parcourir</span>
                    </div>
                </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="mt-2 w-full bg-stone-900 text-white font-bold text-lg py-4 rounded-xl hover:bg-stone-800 hover:scale-[1.01] transition transform shadow-lg flex justify-center items-center"
            >
              {loading ? (uploading ? "Envoi de la photo..." : "Ajout en cours...") : "Ajouter au projet +"}
            </button>
          </form>
        </div>

        {/* LISTE DES ITEMS */}
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-md hover:bg-white/90 transition flex flex-col md:flex-row items-center gap-6">
              
              <div className="w-24 h-24 shrink-0 bg-white rounded-xl overflow-hidden border border-stone-100 flex items-center justify-center relative shadow-inner">
                 {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                 ) : (
                    <span className="text-2xl opacity-20">🛋️</span>
                 )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-serif font-bold text-stone-800">{item.name}</h3>
                {item.url && (
                    <a href={item.url} target="_blank" className="text-xs text-amber-600 hover:underline flex items-center justify-center md:justify-start gap-1 mt-1">
                        Voir le produit ↗
                    </a>
                )}
              </div>

              <div className="flex items-center gap-6">
                <span className="text-xl font-bold text-stone-900 bg-stone-100 px-4 py-2 rounded-lg">{item.price} €</span>
                <button 
                  onClick={() => deleteItem(item.id)}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-stone-300 hover:bg-red-50 hover:text-red-500 transition"
                  title="Supprimer"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-12 opacity-50 font-serif italic text-stone-500 bg-white/30 rounded-2xl border border-dashed border-stone-300">
              Aucun article pour le moment. Commencez votre liste !
            </div>
          )}
        </div>

      </div>
    </div>
  )
}