'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updatePymeProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const companyName = formData.get('company_name') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const phone = formData.get('phone') as string
    const mercadopagoToken = formData.get('mercadopago_token') as string
    const logoFile = formData.get('logo') as File

    // Upload logo if present
    let logoUrl = null
    if (logoFile && logoFile.size > 0) {
        const fileExt = logoFile.name.split('.').pop()
        const fileName = `${user.id}/logo.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('logos')
            .upload(fileName, logoFile, { upsert: true })

        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
                .from('logos')
                .getPublicUrl(fileName)
            logoUrl = publicUrl
        }
    }

    // Update profile
    const updates: any = {
        company_name: companyName,
        address,
        city,
        phone,
        mercadopago_access_token: mercadopagoToken,
        profile_completed: true,
    }

    if (logoUrl) {
        updates.company_logo_url = logoUrl
    }

    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

    if (error) {
        console.error('Profile Update Error:', error)
        throw new Error('Error al actualizar perfil')
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
}
