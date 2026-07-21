import * as admin from 'firebase-admin'
import { onCall, HttpsError } from 'firebase-functions/v2/https'

admin.initializeApp()

type DeleteUserAccountRequest = {
  uid?: string
}

export const deleteUserAccount = onCall(async (request) => {
  const callerUid = request.auth?.uid
  if (!callerUid) {
    throw new HttpsError('unauthenticated', 'You must be signed in to delete users.')
  }

  const callerDoc = await admin.firestore().doc(`users/${callerUid}`).get()
  const callerRole = (callerDoc.data()?.role || '').toString().trim().toLowerCase()
  if (callerRole !== 'admin') {
    throw new HttpsError('permission-denied', 'Only admin users can delete accounts.')
  }

  const { uid } = request.data as DeleteUserAccountRequest
  if (!uid || typeof uid !== 'string' || !uid.trim()) {
    throw new HttpsError('invalid-argument', 'A user uid is required.')
  }

  const targetUid = uid.trim()
  let authDeleted = false
  let authUserMissing = false

  try {
    await admin.auth().deleteUser(targetUid)
    authDeleted = true
  } catch (error: any) {
    if (error?.code === 'auth/user-not-found') {
      authUserMissing = true
    } else {
      throw new HttpsError('internal', error?.message || 'Failed to delete the auth user.')
    }
  }

  await admin.firestore().doc(`users/${targetUid}`).delete()

  return {
    authDeleted,
    authUserMissing,
    firestoreDeleted: true
  }
})
