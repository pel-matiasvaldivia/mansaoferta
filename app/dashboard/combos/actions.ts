'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createCombo(formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const stock = parseInt(formData.get('stock') as string)
    const imageFile = formData.get('image') as File

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Unauthorized')
    }

    // Upload image if present
    let imageUrl = null
    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('combos')
            .upload(fileName, imageFile)

        if (uploadError) {
            console.error('Upload Error:', uploadError)
            // handling error gracefully or throwing?
        } else {
            const { data: { publicUrl } } = supabase.storage
                .from('combos')
                .getPublicUrl(fileName)
            imageUrl = publicUrl
        }
    }

    const { error } = await supabase
        .from('combos')
        .insert({
            pyme_id: user.id,
            title,
            description,
            price,
            stock,
            image_url: imageUrl,
        })

    if (error) {
        console.error('Database Error:', error)
        throw new Error(error.message)
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
}

export async function deleteCombo(formData: FormData) {
    const supabase = await createClient()
    const id = formData.get('id') as string

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('combos')
        .delete()
        .eq('id', id)
        .eq('pyme_id', user.id)

    if (error) {
        console.error('Delete Error:', error)
        throw new Error('Error al eliminar combo')
    }

    revalidatePath('/dashboard')
}

export async function updateCombo(formData: FormData) {
    const supabase = await createClient()
    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const stock = parseInt(formData.get('stock') as string)
    const imageFile = formData.get('image') as File

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Prepare update object
    const updates: any = {
        title,
        description,
        price,
        stock,
    }

    // Upload new image if present
    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('combos')
            .upload(fileName, imageFile)

        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
                .from('combos')
                .getPublicUrl(fileName)
            updates.image_url = publicUrl
        }
    }

    const { error } = await supabase
        .from('combos')
        .update(updates)
        .eq('id', id)
        .eq('pyme_id', user.id)

    if (error) {
        console.error('Update Error:', error)
        throw new Error('Error al actualizar combo')
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
}

export async function toggleComboActive(formData: FormData) {
    const supabase = await createClient()
    const id = formData.get('id') as string
    const currentActive = formData.get('active') === 'true'

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('combos')
        .update({ active: !currentActive })
        .eq('id', id)
        .eq('pyme_id', user.id)

    if (error) {
        console.error('Toggle Active Error:', error)
        throw new Error('Error al cambiar estado del combo')
    }

    revalidatePath('/dashboard')
}
