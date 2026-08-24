import { auth } from '@/auth'
import RealtimeListener from './RealtimeListener'

// Only mounts the realtime listener for authenticated users.
export default async function RealtimeInitializer() {
  const session = await auth()
  if (!session?.user) return null
  return <RealtimeListener />
}
