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
  UserWallet, 
  CoinTransaction, 
  CoinPackage, 
  WithdrawalRequest, 
  TreasuryStats 
} from '../context/WalletContext'

// Firestore Collection Names
const WALLETS_COL = 'wallets'
const TRANSACTIONS_COL = 'transactions'
const TREASURY_COL = 'treasury'
const WITHDRAWALS_COL = 'withdrawals'
const PACKAGES_COL = 'coin_packages'

// ─── Real-Time Subscriptions ──────────────────────────────────────────────────

export const subscribeToWallets = (onUpdate: (items: UserWallet[]) => void) => {
  const q = query(collection(db, WALLETS_COL))
  return onSnapshot(q, (snapshot) => {
    const items: UserWallet[] = []
    snapshot.forEach(docSnap => {
      items.push({ id: docSnap.id, ...docSnap.data() } as UserWallet)
    })
    onUpdate(items)
  }, (err) => {
    console.warn('Firestore wallets snapshot error:', err)
  })
}

export const subscribeToTransactions = (onUpdate: (items: CoinTransaction[]) => void) => {
  const q = query(collection(db, TRANSACTIONS_COL))
  return onSnapshot(q, (snapshot) => {
    const items: CoinTransaction[] = []
    snapshot.forEach(docSnap => {
      items.push({ id: docSnap.id, ...docSnap.data() } as CoinTransaction)
    })
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    onUpdate(items)
  }, (err) => {
    console.warn('Firestore transactions snapshot error:', err)
  })
}

export const subscribeToTreasury = (onUpdate: (item: TreasuryStats) => void) => {
  const docRef = doc(db, TREASURY_COL, 'main_vault')
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as TreasuryStats)
    }
  }, (err) => {
    console.warn('Firestore treasury snapshot error:', err)
  })
}

export const subscribeToWithdrawals = (onUpdate: (items: WithdrawalRequest[]) => void) => {
  const q = query(collection(db, WITHDRAWALS_COL))
  return onSnapshot(q, (snapshot) => {
    const items: WithdrawalRequest[] = []
    snapshot.forEach(docSnap => {
      items.push({ id: docSnap.id, ...docSnap.data() } as WithdrawalRequest)
    })
    onUpdate(items)
  }, (err) => {
    console.warn('Firestore withdrawals snapshot error:', err)
  })
}

export const subscribeToCoinPackages = (onUpdate: (items: CoinPackage[]) => void) => {
  const q = query(collection(db, PACKAGES_COL))
  return onSnapshot(q, (snapshot) => {
    const items: CoinPackage[] = []
    snapshot.forEach(docSnap => {
      items.push({ id: docSnap.id, ...docSnap.data() } as CoinPackage)
    })
    onUpdate(items)
  }, (err) => {
    console.warn('Firestore packages snapshot error:', err)
  })
}

// ─── CRUD Actions ─────────────────────────────────────────────────────────────

export const updateWalletInFirestore = async (walletId: string, updates: Partial<UserWallet>) => {
  try {
    const docRef = doc(db, WALLETS_COL, walletId)
    await updateDoc(docRef, updates)
  } catch (err) {
    console.error('Error updating wallet in Firestore:', err)
  }
}

export const createWalletInFirestore = async (wallet: UserWallet) => {
  try {
    const docRef = doc(db, WALLETS_COL, wallet.id)
    await setDoc(docRef, wallet)
  } catch (err) {
    console.error('Error creating wallet in Firestore:', err)
  }
}

export const addTransactionToFirestore = async (tx: CoinTransaction) => {
  try {
    const docRef = doc(db, TRANSACTIONS_COL, tx.id)
    await setDoc(docRef, tx)
  } catch (err) {
    console.error('Error adding transaction to Firestore:', err)
  }
}

export const updateTreasuryInFirestore = async (updates: Partial<TreasuryStats>) => {
  try {
    const docRef = doc(db, TREASURY_COL, 'main_vault')
    await setDoc(docRef, updates, { merge: true })
  } catch (err) {
    console.error('Error updating treasury in Firestore:', err)
  }
}

export const updateWithdrawalInFirestore = async (id: string, updates: Partial<WithdrawalRequest>) => {
  try {
    const docRef = doc(db, WITHDRAWALS_COL, id)
    await updateDoc(docRef, updates)
  } catch (err) {
    console.error('Error updating withdrawal request in Firestore:', err)
  }
}

export const saveCoinPackageInFirestore = async (pkg: CoinPackage) => {
  try {
    const docRef = doc(db, PACKAGES_COL, pkg.id)
    await setDoc(docRef, pkg)
  } catch (err) {
    console.error('Error saving coin package in Firestore:', err)
  }
}

export const deleteCoinPackageFromFirestore = async (id: string) => {
  try {
    const docRef = doc(db, PACKAGES_COL, id)
    await deleteDoc(docRef)
  } catch (err) {
    console.error('Error deleting coin package from Firestore:', err)
  }
}

// ─── Firestore Initial Seeder ─────────────────────────────────────────────────

export const seedInitialFinancialsData = async (
  wallets: UserWallet[],
  txs: CoinTransaction[],
  treasury: TreasuryStats,
  withdrawals: WithdrawalRequest[],
  packages: CoinPackage[]
) => {
  try {
    const walletsSnap = await getDocs(query(collection(db, WALLETS_COL)))
    if (walletsSnap.empty) {
      const batch = writeBatch(db)
      wallets.forEach(item => {
        batch.set(doc(db, WALLETS_COL, item.id), item)
      })
      txs.forEach(item => {
        batch.set(doc(db, TRANSACTIONS_COL, item.id), item)
      })
      withdrawals.forEach(item => {
        batch.set(doc(db, WITHDRAWALS_COL, item.id), item)
      })
      packages.forEach(item => {
        batch.set(doc(db, PACKAGES_COL, item.id), item)
      })
      batch.set(doc(db, TREASURY_COL, 'main_vault'), treasury)
      await batch.commit()
    }
  } catch (err) {
    console.warn('Initial financials seeding error:', err)
  }
}
