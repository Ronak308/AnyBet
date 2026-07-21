import { collection, doc, setDoc, onSnapshot, query } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import type { SettlementQueueItem, OracleNode, AILogEntry } from '../context/OracleContext'

const ORACLE_QUEUE_COL = 'oracle_queue'
const ORACLE_NODES_COL = 'oracle_nodes'

export const subscribeToOracleQueue = (onUpdate: (items: SettlementQueueItem[]) => void) => {
  const q = query(collection(db, ORACLE_QUEUE_COL))
  return onSnapshot(q, (snapshot) => {
    const items: SettlementQueueItem[] = []
    snapshot.forEach(docSnap => {
      items.push({ id: docSnap.id, ...docSnap.data() } as SettlementQueueItem)
    })
    onUpdate(items)
  }, (err) => {
    console.warn('Firestore oracle queue snapshot error:', err)
  })
}

export const subscribeToOracleNodes = (onUpdate: (items: OracleNode[]) => void) => {
  const q = query(collection(db, ORACLE_NODES_COL))
  return onSnapshot(q, (snapshot) => {
    const items: OracleNode[] = []
    snapshot.forEach(docSnap => {
      items.push({ id: docSnap.id, ...docSnap.data() } as OracleNode)
    })
    onUpdate(items)
  }, (err) => {
    console.warn('Firestore oracle nodes snapshot error:', err)
  })
}

export const updateOracleItemInFirestore = async (id: string, updates: Partial<SettlementQueueItem>) => {
  try {
    const docRef = doc(db, ORACLE_QUEUE_COL, id)
    await setDoc(docRef, updates, { merge: true })
  } catch (err) {
    console.warn('Firestore oracle update error:', err)
  }
}
