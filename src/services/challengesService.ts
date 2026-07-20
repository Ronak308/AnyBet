import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  getDocs,
  writeBatch
} from 'firebase/firestore'
import { db } from '../firebase/firebase'
import type { 
  ChallengeItem, 
  ChallengeCategory, 
  DisputeItem 
} from '../context/ChallengesContext'

// Firestore Collection References
const CHALLENGES_COL = 'challenges'
const CATEGORIES_COL = 'categories'
const DISPUTES_COL = 'disputes'

// ─── Real-time Subscriptions ───────────────────────────────────────────────────

export const subscribeToChallenges = (onUpdate: (items: ChallengeItem[]) => void) => {
  const q = query(collection(db, CHALLENGES_COL))
  return onSnapshot(q, (snapshot) => {
    const items: ChallengeItem[] = []
    snapshot.forEach(docSnap => {
      items.push({ id: docSnap.id, ...docSnap.data() } as ChallengeItem)
    })
    onUpdate(items)
  }, (err) => {
    console.warn('Firestore challenges snapshot error:', err)
  })
}

export const subscribeToCategories = (onUpdate: (items: ChallengeCategory[]) => void) => {
  const q = query(collection(db, CATEGORIES_COL))
  return onSnapshot(q, (snapshot) => {
    const items: ChallengeCategory[] = []
    snapshot.forEach(docSnap => {
      items.push({ id: docSnap.id, ...docSnap.data() } as ChallengeCategory)
    })
    // Sort by display order
    items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    onUpdate(items)
  }, (err) => {
    console.warn('Firestore categories snapshot error:', err)
  })
}

export const subscribeToDisputes = (onUpdate: (items: DisputeItem[]) => void) => {
  const q = query(collection(db, DISPUTES_COL))
  return onSnapshot(q, (snapshot) => {
    const items: DisputeItem[] = []
    snapshot.forEach(docSnap => {
      items.push({ id: docSnap.id, ...docSnap.data() } as DisputeItem)
    })
    onUpdate(items)
  }, (err) => {
    console.warn('Firestore disputes snapshot error:', err)
  })
}

// ─── Challenge Actions ─────────────────────────────────────────────────────────

export const createChallengeInFirestore = async (challenge: ChallengeItem) => {
  const docRef = doc(db, CHALLENGES_COL, challenge.id)
  await setDoc(docRef, challenge)
}

export const updateChallengeInFirestore = async (id: string, updates: Partial<ChallengeItem>) => {
  const docRef = doc(db, CHALLENGES_COL, id)
  await updateDoc(docRef, updates)
}

export const deleteChallengeFromFirestore = async (id: string) => {
  const docRef = doc(db, CHALLENGES_COL, id)
  await deleteDoc(docRef)
}

// ─── Category Actions ──────────────────────────────────────────────────────────

export const createCategoryInFirestore = async (category: ChallengeCategory) => {
  const docRef = doc(db, CATEGORIES_COL, category.id)
  await setDoc(docRef, category)
}

export const updateCategoryInFirestore = async (id: string, updates: Partial<ChallengeCategory>) => {
  const docRef = doc(db, CATEGORIES_COL, id)
  await updateDoc(docRef, updates)
}

export const deleteCategoryFromFirestore = async (id: string) => {
  const docRef = doc(db, CATEGORIES_COL, id)
  await deleteDoc(docRef)
}

// ─── Dispute Actions ───────────────────────────────────────────────────────────

export const updateDisputeInFirestore = async (id: string, updates: Partial<DisputeItem>) => {
  const docRef = doc(db, DISPUTES_COL, id)
  await updateDoc(docRef, updates)
}

// ─── Database Initial Seeder ───────────────────────────────────────────────────

export const seedInitialFirestoreData = async (
  initialChallenges: ChallengeItem[],
  initialCategories: ChallengeCategory[],
  initialDisputes: DisputeItem[]
) => {
  try {
    const challengesSnap = await getDocs(collection(db, CHALLENGES_COL))
    if (challengesSnap.empty) {
      const batch = writeBatch(db)
      initialChallenges.forEach(item => {
        batch.set(doc(db, CHALLENGES_COL, item.id), item)
      })
      initialCategories.forEach(cat => {
        batch.set(doc(db, CATEGORIES_COL, cat.id), cat)
      })
      initialDisputes.forEach(disp => {
        batch.set(doc(db, DISPUTES_COL, disp.id), disp)
      })
      await batch.commit()
      console.log('Firebase Firestore initialized with default AnyBet challenge datasets.')
    }
  } catch (err) {
    console.warn('Firestore initial seeding error:', err)
  }
}
