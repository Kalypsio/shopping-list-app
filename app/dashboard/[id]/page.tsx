"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import Image from "next/image"
import Link from 'next/link'

const BG_IMAGE_URL = "/bg-luxe.png";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
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
    if (projectId) fetchProjectAndItems()
  }, [projectId])

  async function fetchProjectAndItems() {
    const { data: projectData } = await supabase.from('projects').select('*').eq('id', projectId).single()
    if (projectData) setProject(projectData)

    const { data: itemsData } = await supabase.from('items').select('*').eq('project_id', projectId).order('created_at', { ascending: true })
    if (itemsData) setItems(itemsData)
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault()
    if (!newItemName || !newItemPrice) return;
    setLoading(true);
    let publicUrl = null;

    if (imageFile) {
        setUploading(true);
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${projectId}/${fileName}`; 
        const { error: uploadError } = await supabase.storage.from('item-images').upload(filePath, imageFile);

        if (!uploadError) {
            const { data: publicData } = supabase.storage.from('item-images').getPublicUrl(filePath);
            publicUrl = publicData.publicUrl;
        }
    }

    await supabase.from('items').insert([{
      project_id: projectId,
      name: newItemName,
      price: parseFloat(newItemPrice),
      url: newItemUrl,
      image_url: publicUrl
    }])

    setNewItemName(''); setNewItemPrice(''); setNewItemUrl(''); setImageFile(null);
    fetchProjectAndItems();
    setLoading(false); setUploading(false);
  }

  async function deleteItem(itemId: string) {
    if(!confirm("Supprimer cet article ?")) return;
    await supabase.from('items').delete().eq('id', itemId)
    fetchProjectAndItems()
  }

  const total = items.reduce((acc, item) => acc + item.price, 0)

  if (!project) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <div className="min-h-screen relative font-sans text-stone-900 pb-20">
      <div className="fixed inset-0 z-0">
        <Image src={BG_IMAGE_URL} alt="Fond" fill className="object-cover" />
        <div className="absolute inset-0 bg-stone-50/80 backdrop-blur-md"></div>
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto p-6 md:p-12">
        <Link href="/dashboard" className="inline-flex items-center text-stone-500 hover:text-stone-900 transition mb-8 font-medium">← Retour à l'atelier</Link>

        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-stone-900 mb-2">{project.name}</h1>
            <p className="text-xl text-stone-500 font-serif italic">Budget total : <span className="font-bold text-amber-600">{total} €</span></p>
          </div>
          <div className="bg-white/60 backdrop-blur border border-stone-200 p-4 rounded-xl shadow-sm flex flex-col gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Lien client à partager</span>
            <div className="flex gap-2">
              <input readOnly value={`https://shopping-list-app-seven-rho.vercel.app/share/${project.id}`} className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-600 w-full md:w-64 select-all"/>
              <a href={`/share/${project.id}`} target="_blank" className="bg-stone-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-stone-800 transition flex items-center">Voir ↗</a>
            </div>
          </div>
        </div>

        {/* Formulaire d'ajout (simplifié pour la lisibilité du code ici) */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-white/50 p-8 mb-12">
          <h2 className="font-serif text-2xl text-stone-800 mb-6 flex items-center gap-2"><span className="bg-amber-100 text-amber-600 w-8 h-8 flex items-center justify-center rounded-full text-sm">＋</span>Ajouter un article</h2>
          <form onSubmit={addItem} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Nom" className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4" value={newItemName} onChange={e => setNewItemName(e.target.value)} />
              <input type="number" placeholder="Prix" className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Lien marchand (optionnel)" className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4" value={newItemUrl} onChange={e => setNewItemUrl(e.target.value)} />
                <div className="relative group"><input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 flex items-center justify-between"><span className="truncate text-stone-400">{imageFile ? `📸 ${imageFile.name}` : "Choisir une photo"}</span><span className="bg-stone-100 px-3 py-1 rounded text-xs font-bold">PARCOURIR</span></div>
                </div>
            </div>
            <button type="submit" disabled={loading} className="mt-2 w-full bg-stone-900 text-white font-bold text-lg py-4 rounded-xl hover:bg-stone-800 transition">{loading ? "Ajout..." : "Ajouter au projet +"}</button>
          </form>
        </div>

        {/* LISTE DES ITEMS AVEC FEEDBACK CLIENT */}
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className={`group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border transition flex flex-col md:flex-row items-center gap-6 relative
                ${item.status === 'approved' ? 'border-amber-300 bg-amber-50/50' : 'border-white/50'}
                ${item.status === 'rejected' ? 'border-red-200 bg-red-50/50' : ''}
            `}>
              
              {/* Badge de statut */}
              {item.status === 'approved' && <div className="absolute top-0 right-0 bg-amber-400 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">VALIDÉ PAR LE CLIENT</div>}
              {item.status === 'rejected' && <div className="absolute top-0 right-0 bg-red-400 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">REFUSÉ PAR LE CLIENT</div>}

              <div className="w-24 h-24 shrink-0 bg-white rounded-xl overflow-hidden border border-stone-100 flex items-center justify-center relative">
                 {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <span className="text-2xl opacity-20">🛋️</span>}
              </div>

              <div className="flex-1 text-center md:text-left w-full">
                <h3 className="text-xl font-serif font-bold text-stone-800">{item.name}</h3>
                {item.url && <a href={item.url} target="_blank" className="text-xs text-amber-600 hover:underline">Voir le produit ↗</a>}
                
                {/* --- LE COMMENTAIRE DU CLIENT --- */}
                {item.status === 'rejected' && item.client_comment && (
                    <div className="mt-3 bg-red-100 text-red-800 p-3 rounded-lg text-sm border border-red-200 flex gap-2 items-start">
                        <span>💬</span>
                        <p className="italic">"{item.client_comment}"</p>
                    </div>
                )}
                {/* -------------------------------- */}
              </div>

              <div className="flex items-center gap-6">
                <span className="text-xl font-bold text-stone-900">{item.price} €</span>
                <button onClick={() => deleteItem(item.id)} className="w-8 h-8 flex items-center justify-center rounded-full text-stone-300 hover:bg-red-50 hover:text-red-500 transition">✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}