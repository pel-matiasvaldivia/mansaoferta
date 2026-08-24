import { createClient } from '@/utils/supabase/server'
import RealtimeListener from './RealtimeListener'

export default async function RealtimeInitializer() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // We need the role.
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile) return null

    return <RealtimeListener userId={user.id} role={profile.role} />
}
