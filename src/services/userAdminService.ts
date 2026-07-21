import { httpsCallable } from 'firebase/functions'
import { functions } from '@/firebase/firebase'

type DeleteUserAccountResult = {
  authDeleted: boolean
  firestoreDeleted: boolean
  authUserMissing?: boolean
}

export async function deleteUserAccount(uid: string): Promise<DeleteUserAccountResult> {
  const callable = httpsCallable<{ uid: string }, DeleteUserAccountResult>(functions, 'deleteUserAccount')
  const result = await callable({ uid })
  return result.data
}
