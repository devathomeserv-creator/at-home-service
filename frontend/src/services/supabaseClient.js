import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://valvvqsrmpgizranqfzq.supabase.co'
const supabaseKey = 'sb_publishable_-pfvyhmxMHQ2FExZtjbArw_hGs3o8TL'

export const supabase = createClient(supabaseUrl, supabaseKey)

export const uploadRealisation = async (file, prestataireId) => {
  const extension = file.name.split('.').pop()
  const nomFichier = `${prestataireId}-${Date.now()}.${extension}`
  const { data, error } = await supabase.storage
    .from('realisations')
    .upload(nomFichier, file)
  if (error) throw error
  const { data: urlData } = supabase.storage
    .from('realisations')
    .getPublicUrl(nomFichier)
  return urlData.publicUrl
}

export const uploadMessageMedia = async (file, userId) => {
  const extension = file.name.split('.').pop()
  const nomFichier = `${userId}-${Date.now()}.${extension}`
  const { data, error } = await supabase.storage
    .from('messages')
    .upload(nomFichier, file)
  if (error) throw error
  const { data: urlData } = supabase.storage
    .from('messages')
    .getPublicUrl(nomFichier)
  return urlData.publicUrl
}