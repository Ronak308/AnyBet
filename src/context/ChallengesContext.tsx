import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useWallet } from './WalletContext'
import {
  subscribeToChallenges,
  subscribeToCategories,
  subscribeToDisputes,
  createChallengeInFirestore,
  updateChallengeInFirestore,
  deleteChallengeFromFirestore,
  clearAllChallengesFromFirestore,
  createCategoryInFirestore,
  updateCategoryInFirestore,
  deleteCategoryFromFirestore,
  updateDisputeInFirestore,
  seedInitialFirestoreData
} from '../services/challengesService'
import { evaluateDisputeWithGeminiAI } from '../services/apiServices'

// ─── Interfaces & Types ───────────────────────────────────────────────────────

export type ChallengeCategoryType = 'Sports' | 'Physical' | 'Prediction' | 'Performance' | 'Custom'

export type ChallengeStatus = 
  | 'Draft'
  | 'Pending Review'
  | 'Approved'
  | 'Live'
  | 'Completed'
  | 'Cancelled'
  | 'Disputed'

export type SettlementStatus = 
  | 'Waiting'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Completed'

export type DisputeStatus = 
  | 'Pending'
  | 'Reviewing'
  | 'Resolved'
  | 'Closed'

export interface ChallengeParticipant {
  id: string
  username: string
  avatar?: string
  joinedAt: string
  stakeAmount: number
  progressPercent: number
  result?: 'Winner' | 'Runner Up' | 'Disqualified' | 'Pending'
}

export interface FinancialBreakdown {
  totalCollected: number
  lockedCoins: number
  platformFee: number
  winnerPayout: number
  refundAmount: number
}

export interface SettlementDetail {
  winnerId?: string
  winnerName?: string
  settlementMethod: 'AI Oracle' | 'Manual Review' | 'Consensus'
  oracleResult?: string
  oracleConfidence?: number
  manualReviewNotes?: string
  settlementTimestamp?: string
  status: SettlementStatus
}

export interface TimelineEvent {
  id: string
  stage: string
  description: string
  timestamp: string
  completed: boolean
}

export type ChallengeFrequency = 'Single Event' | 'Day-wise' | 'Weekly' | 'Monthly'

export interface ChallengeItem {
  id: string
  title: string
  description: string
  category: ChallengeCategoryType
  type: string
  frequency?: ChallengeFrequency
  source?: 'Mobile App' | 'Admin Portal'
  creatorId: string
  creatorName: string
  participantsCount: number
  maxParticipants?: number
  stakeAmount: number
  prizePool: number
  startDate: string
  endDate: string
  status: ChallengeStatus
  rules: string[]
  participants: ChallengeParticipant[]
  financials: FinancialBreakdown
  settlement: SettlementDetail
  timeline: TimelineEvent[]
  evidenceUrls?: string[]
}

export interface ChallengeCategory {
  id: string
  name: ChallengeCategoryType | string
  description: string
  color: string
  icon: string // Lucide icon name or emoji
  isEnabled: boolean
  displayOrder: number
  challengeCount: number
}

export interface EvidenceItem {
  id: string
  type: 'image' | 'gps' | 'iot_feed' | 'link' | 'text'
  url?: string
  data?: string
  submittedBy: string
  submittedAt: string
}

export interface DisputeItem {
  id: string
  challengeId: string
  challengeTitle: string
  usersInvolved: string[]
  disputeReason: string
  submittedEvidence: EvidenceItem[]
  aiReviewResult: {
    recommendation: string
    confidenceScore: number
    suggestedWinner?: string
  }
  status: DisputeStatus
  createdAt: string
  resolvedAt?: string
  resolutionNotes?: string
}

interface ChallengesContextValue {
  challenges: ChallengeItem[]
  categories: ChallengeCategory[]
  disputes: DisputeItem[]
  selectedChallenge: ChallengeItem | null
  setSelectedChallenge: (challenge: ChallengeItem | null) => void
  
  // Challenge Actions
  createChallenge: (newChallenge: Partial<ChallengeItem>) => void
  updateChallenge: (id: string, updates: Partial<ChallengeItem>) => void
  updateChallengeStatus: (id: string, status: ChallengeStatus) => void
  approveChallenge: (id: string) => void
  rejectChallenge: (id: string) => void
  suspendChallenge: (id: string) => void
  duplicateChallenge: (id: string) => void
  deleteChallenge: (id: string) => void
  bulkApprove: (ids: string[]) => void
  bulkReject: (ids: string[]) => void
  bulkSuspend: (ids: string[]) => void
  bulkDelete: (ids: string[]) => void
  clearAllChallenges: () => void

  // Category Actions
  createCategory: (category: Omit<ChallengeCategory, 'id' | 'challengeCount'>) => void
  updateCategory: (id: string, category: Partial<ChallengeCategory>) => void
  toggleCategoryStatus: (id: string) => void
  deleteCategory: (id: string) => void
  reorderCategory: (id: string, direction: 'up' | 'down') => void

  // Settlement & Dispute Actions
  settleChallenge: (challengeId: string, winnerId: string, winnerName: string, notes?: string) => void
  resolveDispute: (disputeId: string, action: 'approve_claim' | 'reject_claim' | 'refund' | 'reopen', winnerId?: string, notes?: string) => void
  triggerAIDisputeReview: (disputeId: string) => Promise<void>

  // Utilities
  exportCSV: () => void
  exportPDF: () => void
  showToastNotice: (msg: string, type?: 'info' | 'success' | 'warning') => void
}

const ChallengesContext = createContext<ChallengesContextValue | undefined>(undefined)

// ─── Initial Mock Data ────────────────────────────────────────────────────────

const INITIAL_CATEGORIES: ChallengeCategory[] = [
  {
    id: 'cat-1',
    name: 'Sports',
    description: 'Competitive athletics, leagues, tournaments, and live sporting events.',
    color: '#3B82F6', // Blue
    icon: 'Trophy',
    isEnabled: true,
    displayOrder: 1,
    challengeCount: 18
  },
  {
    id: 'cat-2',
    name: 'Physical',
    description: 'Fitness streaks, marathons, sleep trackers, IoT wear gadgets & workouts.',
    color: '#10B981', // Emerald
    icon: 'Activity',
    isEnabled: true,
    displayOrder: 2,
    challengeCount: 24
  },
  {
    id: 'cat-3',
    name: 'Prediction',
    description: 'Financial markets, crypto price targets, political events & pop culture.',
    color: '#8B5CF6', // Purple
    icon: 'TrendingUp',
    isEnabled: true,
    displayOrder: 3,
    challengeCount: 42
  },
  {
    id: 'cat-4',
    name: 'Performance',
    description: 'Esports, gaming speedruns, coding marathons & skill competitions.',
    color: '#F59E0B', // Amber
    icon: 'Gamepad2',
    isEnabled: true,
    displayOrder: 4,
    challengeCount: 15
  },
  {
    id: 'cat-5',
    name: 'Custom',
    description: 'User-generated peer-to-peer custom wagers and private challenges.',
    color: '#EC4899', // Pink
    icon: 'Sparkles',
    isEnabled: true,
    displayOrder: 5,
    challengeCount: 12
  }
]

const INITIAL_CHALLENGES: ChallengeItem[] = []

const INITIAL_DISPUTES: DisputeItem[] = [
  {
    id: 'DISP-101',
    challengeId: 'AB-9821',
    challengeTitle: 'Marathon Completion Under 3h:00',
    usersInvolved: ['Alex_R (Claimant)', 'Marcus_S (Challenger)'],
    disputeReason: 'GPS Telemetry discrepancy between Strava elevation log and Garmin watch chip timestamp (+12.4s difference).',
    submittedEvidence: [
      { id: 'ev-1', type: 'gps', data: 'Garmin FIT File #88921 - Finish Time: 2h:59m:52s', submittedBy: 'Alex_R', submittedAt: '2026-07-20 10:15' },
      { id: 'ev-2', type: 'gps', data: 'Strava Export #10291 - Finish Time: 3h:00m:04s', submittedBy: 'Marcus_S', submittedAt: '2026-07-20 11:00' },
      { id: 'ev-3', type: 'image', url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=600&q=80', data: 'Official Finish Line Clock Photo', submittedBy: 'Alex_R', submittedAt: '2026-07-20 11:20' }
    ],
    aiReviewResult: {
      recommendation: 'Validate against official race chip satellite log. 89% confidence score that Garmin watch raw GPS sensor data reflects true course finish time.',
      confidenceScore: 89,
      suggestedWinner: 'Alex_R'
    },
    status: 'Pending',
    createdAt: '2026-07-20 11:30'
  },
  {
    id: 'DISP-102',
    challengeId: 'AB-8720',
    challengeTitle: 'League of Legends World Finals Speedrun',
    usersInvolved: ['GamerPro_99', 'TeamRival'],
    disputeReason: 'Participant reported pause menu delay artifact in match API timestamp.',
    submittedEvidence: [
      { id: 'ev-4', type: 'iot_feed', data: 'Riot API Event Frame Match Hash #99102', submittedBy: 'GamerPro_99', submittedAt: '2026-07-19 14:00' }
    ],
    aiReviewResult: {
      recommendation: 'Pause duration confirmed system-enforced break by referees. Net game time remains 24m:18s.',
      confidenceScore: 96,
      suggestedWinner: 'GamerPro_99'
    },
    status: 'Reviewing',
    createdAt: '2026-07-19 15:00'
  }
]

// ─── Provider Implementation ──────────────────────────────────────────────────

export const ChallengesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { creditCoins, platformFeePercent } = useWallet()

  const [categories, setCategories] = useState<ChallengeCategory[]>(INITIAL_CATEGORIES)
  const [challenges, setChallenges] = useState<ChallengeItem[]>(INITIAL_CHALLENGES)
  const [disputes, setDisputes] = useState<DisputeItem[]>(INITIAL_DISPUTES)
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeItem | null>(null)

  // Custom Toast helper
  const showToastNotice = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }))
    }
  }

  // Real-time Firestore Subscriptions & Initial Seeding
  useEffect(() => {
    // Seed initial mock data into Firestore if empty
    seedInitialFirestoreData(INITIAL_CHALLENGES, INITIAL_CATEGORIES, INITIAL_DISPUTES)

    // Subscribe to live Firestore snapshots
    const unsubChallenges = subscribeToChallenges((items) => {
      if (items.length > 0) setChallenges(items)
    })

    const unsubCategories = subscribeToCategories((items) => {
      if (items.length > 0) setCategories(items)
    })

    const unsubDisputes = subscribeToDisputes((items) => {
      if (items.length > 0) setDisputes(items)
    })

    // Automatic Status Auto-Transition Worker (Approved -> Live & Live -> Settlement)
    const autoStatusInterval = setInterval(() => {
      const now = new Date().getTime()
      setChallenges(prev => {
        let changed = false
        const updated = prev.map(c => {
          const startTime = c.startDate ? new Date(c.startDate).getTime() : NaN
          const endTime = c.endDate ? new Date(c.endDate).getTime() : NaN

          // 1. Auto Approved -> Live if Start Date/Time reached
          if (c.status === 'Approved' && !isNaN(startTime) && startTime <= now) {
            changed = true
            const item = { ...c, status: 'Live' as ChallengeStatus }
            updateChallengeInFirestore(c.id, { status: 'Live' })
            return item
          }

          // 2. Auto Live -> Under Review when End Date/Time reached
          if (c.status === 'Live' && !isNaN(endTime) && endTime <= now) {
            changed = true
            // EDGE CASE 1: Zero Participants - Auto cancel & refund instead of going to Oracle
            if ((c.participantsCount || 0) === 0) {
              const item = {
                ...c,
                status: 'Cancelled' as ChallengeStatus,
                timeline: [
                  ...c.timeline,
                  { id: `t-${Date.now()}`, stage: 'Cancelled', description: 'Challenge cancelled automatically: Zero participants joined before end time.', timestamp: new Date().toLocaleString(), completed: true }
                ]
              }
              updateChallengeInFirestore(c.id, { status: 'Cancelled', timeline: item.timeline })
              return item
            }

            const item = { 
              ...c, 
              settlement: { ...c.settlement, status: 'Under Review' as const } 
            }
            updateChallengeInFirestore(c.id, { settlement: { ...c.settlement, status: 'Under Review' } })
            return item
          }

          return c
        })
        return changed ? updated : prev
      })
    }, 10000)

    return () => {
      unsubChallenges?.()
      unsubCategories?.()
      unsubDisputes?.()
      clearInterval(autoStatusInterval)
    }
  }, [])

  // ─── Challenge Actions ──────────────────────────────────────────────────────

  const createChallenge = (newChallenge: Partial<ChallengeItem>) => {
    const id = `AB-${Math.floor(1000 + Math.random() * 9000)}`
    const stake = newChallenge.stakeAmount || 100
    const count = newChallenge.participantsCount || 1
    const pot = newChallenge.prizePool || stake * count

    const item: ChallengeItem = {
      id,
      title: newChallenge.title || 'Untitled Challenge',
      description: newChallenge.description || 'No description provided.',
      category: newChallenge.category || 'Custom',
      type: newChallenge.type || 'Custom Wager',
      frequency: newChallenge.frequency || 'Single Event',
      source: newChallenge.source || 'Admin Portal',
      creatorId: newChallenge.creatorId || 'USR_01',
      creatorName: newChallenge.creatorName || 'Operator Admin',
      participantsCount: count,
      maxParticipants: newChallenge.maxParticipants || 100,
      stakeAmount: stake,
      prizePool: pot,
      startDate: newChallenge.startDate || new Date().toISOString().split('T')[0],
      endDate: newChallenge.endDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: newChallenge.status || 'Pending Review',
      rules: newChallenge.rules || ['Standard AnyBet challenge rules apply'],
      participants: newChallenge.participants || [],
      financials: {
        totalCollected: pot,
        lockedCoins: pot,
        platformFee: Math.round(pot * (platformFeePercent / 100)),
        winnerPayout: pot - Math.round(pot * (platformFeePercent / 100)),
        refundAmount: 0
      },
      settlement: {
        settlementMethod: 'AI Oracle',
        status: 'Waiting'
      },
      timeline: [
        { id: `t-${Date.now()}`, stage: 'Challenge Created', description: `Created with ${stake} BET stake`, timestamp: new Date().toLocaleString(), completed: true },
        { id: `t-${Date.now()+1}`, stage: 'Pending Review', description: 'Submitted for operator review', timestamp: new Date().toLocaleString(), completed: true }
      ]
    }

    setChallenges(prev => [item, ...prev])
    createChallengeInFirestore(item)
    showToastNotice(`Challenge ${id} created successfully!`, 'success')
  }

  const updateChallenge = (id: string, updates: Partial<ChallengeItem>) => {
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
    if (selectedChallenge?.id === id) {
      setSelectedChallenge(prev => prev ? { ...prev, ...updates } : null)
    }
    updateChallengeInFirestore(id, updates)
    showToastNotice(`Challenge ${id} updated`, 'info')
  }

  const updateChallengeStatus = (id: string, status: ChallengeStatus) => {
    let updatedItem: ChallengeItem | undefined
    setChallenges(prev => prev.map(c => {
      if (c.id === id) {
        const updatedTimeline = [...c.timeline]
        updatedTimeline.push({
          id: `t-${Date.now()}`,
          stage: `Status: ${status}`,
          description: `Operator changed status to ${status}`,
          timestamp: new Date().toLocaleString(),
          completed: true
        })
        updatedItem = { ...c, status, timeline: updatedTimeline }
        return updatedItem
      }
      return c
    }))
    if (updatedItem) {
      updateChallengeInFirestore(id, { status: updatedItem.status, timeline: updatedItem.timeline })
    }
    showToastNotice(`Challenge ${id} status set to ${status}`, 'success')
  }

  const approveChallenge = (id: string) => updateChallengeStatus(id, 'Approved')
  const rejectChallenge = (id: string) => updateChallengeStatus(id, 'Cancelled')
  const suspendChallenge = (id: string) => updateChallengeStatus(id, 'Draft')

  const duplicateChallenge = (id: string) => {
    const target = challenges.find(c => c.id === id)
    if (!target) return
    const duplicated: ChallengeItem = {
      ...target,
      id: `AB-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `${target.title} (Copy)`,
      status: 'Draft',
      participantsCount: 0,
      participants: [],
      timeline: [
        { id: `t-${Date.now()}`, stage: 'Challenge Created', description: `Duplicated from ${id}`, timestamp: new Date().toLocaleString(), completed: true }
      ]
    }
    setChallenges(prev => [duplicated, ...prev])
    createChallengeInFirestore(duplicated)
    showToastNotice(`Duplicated challenge to ${duplicated.id}`, 'success')
  }

  const deleteChallenge = (id: string) => {
    setChallenges(prev => prev.filter(c => c.id !== id))
    if (selectedChallenge?.id === id) setSelectedChallenge(null)
    deleteChallengeFromFirestore(id)
    showToastNotice(`Deleted challenge ${id}`, 'warning')
  }

  const bulkApprove = (ids: string[]) => {
    ids.forEach(id => updateChallengeStatus(id, 'Approved'))
  }

  const bulkReject = (ids: string[]) => {
    ids.forEach(id => updateChallengeStatus(id, 'Cancelled'))
  }

  const bulkSuspend = (ids: string[]) => {
    ids.forEach(id => updateChallengeStatus(id, 'Draft'))
  }

  const bulkDelete = (ids: string[]) => {
    ids.forEach(id => deleteChallenge(id))
  }

  const clearAllChallenges = () => {
    setChallenges([])
    setSelectedChallenge(null)
    clearAllChallengesFromFirestore()
    showToastNotice('All challenges cleared from database & memory!', 'warning')
  }

  // ─── Category Actions ────────────────────────────────────────────────────────

  const createCategory = (cat: Omit<ChallengeCategory, 'id' | 'challengeCount'>) => {
    const id = `cat-${Date.now()}`
    const newCategory: ChallengeCategory = {
      ...cat,
      id,
      challengeCount: 0
    }
    setCategories(prev => [...prev, newCategory])
    createCategoryInFirestore(newCategory)
    showToastNotice(`Category "${cat.name}" created`, 'success')
  }

  const updateCategory = (id: string, updates: Partial<ChallengeCategory>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
    updateCategoryInFirestore(id, updates)
    showToastNotice(`Category updated`, 'info')
  }

  const toggleCategoryStatus = (id: string) => {
    setCategories(prev => prev.map(c => {
      if (c.id === id) {
        const next = !c.isEnabled
        updateCategoryInFirestore(id, { isEnabled: next })
        return { ...c, isEnabled: next }
      }
      return c
    }))
    showToastNotice(`Category visibility toggled`, 'info')
  }

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id))
    deleteCategoryFromFirestore(id)
    showToastNotice(`Category deleted`, 'warning')
  }

  const reorderCategory = (id: string, direction: 'up' | 'down') => {
    setCategories(prev => {
      const idx = prev.findIndex(c => c.id === id)
      if (idx === -1) return prev
      const newIndex = direction === 'up' ? idx - 1 : idx + 1
      if (newIndex < 0 || newIndex >= prev.length) return prev
      const updated = [...prev]
      const [moved] = updated.splice(idx, 1)
      updated.splice(newIndex, 0, moved)
      const finalItems = updated.map((item, index) => ({ ...item, displayOrder: index + 1 }))
      finalItems.forEach(item => updateCategoryInFirestore(item.id, { displayOrder: item.displayOrder }))
      return finalItems
    })
  }

  // ─── Settlement & Dispute Actions ──────────────────────────────────────────

  const settleChallenge = (challengeId: string, winnerId: string, winnerName: string, notes?: string) => {
    const target = challenges.find(c => c.id === challengeId)
    if (!target) return

    // Fix Bug B: Double Payout Protection (Check if already complete/cancelled)
    if (target.status === 'Completed' || target.status === 'Cancelled') {
      showToastNotice('Challenge has already been settled or cancelled.', 'warning')
      return
    }

    const payoutAmount = target.financials.winnerPayout || target.prizePool

    // Fix Bug C: Dynamic Winner Wallet Payout (Resolve winnerId or default to USR_01)
    const targetWinnerId = winnerId && winnerId.startsWith('USR_') ? winnerId : 'USR_01'
    creditCoins(targetWinnerId, payoutAmount, 'Bet Win', `Winner payout for Challenge ${challengeId}`)

    let updatedChallenge: ChallengeItem | undefined

    setChallenges(prev => prev.map(c => {
      if (c.id === challengeId) {
        updatedChallenge = {
          ...c,
          status: 'Completed',
          financials: {
            ...c.financials,
            lockedCoins: 0
          },
          settlement: {
            winnerId,
            winnerName,
            settlementMethod: c.settlement.settlementMethod || 'Manual Review',
            manualReviewNotes: notes || 'Winner declared by operator.',
            settlementTimestamp: new Date().toLocaleString(),
            status: 'Completed'
          },
          timeline: [
            ...c.timeline,
            { id: `t-${Date.now()}`, stage: 'Settlement Processed', description: `Winner declared: ${winnerName}`, timestamp: new Date().toLocaleString(), completed: true },
            { id: `t-${Date.now()+1}`, stage: 'Rewards Distributed', description: `${payoutAmount} BET Coins credited to winner wallet`, timestamp: new Date().toLocaleString(), completed: true },
            { id: `t-${Date.now()+2}`, stage: 'Archived', description: 'Challenge closed & archived', timestamp: new Date().toLocaleString(), completed: true }
          ]
        }
        return updatedChallenge
      }
      return c
    }))

    if (updatedChallenge) {
      updateChallengeInFirestore(challengeId, updatedChallenge)
    }

    showToastNotice(`Challenge ${challengeId} settled! ${payoutAmount} BET Coins paid to ${winnerName}`, 'success')
  }

  const resolveDispute = (disputeId: string, action: 'approve_claim' | 'reject_claim' | 'refund' | 'reopen', winnerId?: string, notes?: string) => {
    const dispute = disputes.find(d => d.id === disputeId)
    if (!dispute) return

    const targetChallenge = challenges.find(c => c.id === dispute.challengeId)

    if (action === 'approve_claim') {
      const winnerName = winnerId || dispute.aiReviewResult.suggestedWinner || 'Claimant'
      if (targetChallenge) {
        settleChallenge(targetChallenge.id, winnerName, winnerName, `Dispute claim approved: ${notes || 'Operator ruling'}`)
      }
      setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status: 'Resolved', resolvedAt: new Date().toLocaleString(), resolutionNotes: notes || 'Claim Approved' } : d))
      updateDisputeInFirestore(disputeId, { status: 'Resolved', resolutionNotes: notes || 'Claim Approved' })
      showToastNotice(`Dispute ${disputeId} resolved: Claim approved for ${winnerName}`, 'success')

    } else if (action === 'refund') {
      if (targetChallenge) {
        creditCoins('USR_01', targetChallenge.prizePool, 'Refund', `Full refund issued for disputed challenge ${targetChallenge.id}`)
        
        setChallenges(prev => prev.map(c => c.id === targetChallenge.id ? {
          ...c,
          status: 'Cancelled',
          financials: { ...c.financials, lockedCoins: 0, refundAmount: c.prizePool },
          settlement: { ...c.settlement, status: 'Rejected', manualReviewNotes: 'Full refund processed due to unresolved dispute.' }
        } : c))
      }
      setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status: 'Closed', resolvedAt: new Date().toLocaleString(), resolutionNotes: notes || 'Full Refund Processed' } : d))
      updateDisputeInFirestore(disputeId, { status: 'Closed', resolutionNotes: notes || 'Full Refund Processed' })
      showToastNotice(`Dispute ${disputeId} closed: Full refund credited to all participants`, 'warning')

    } else if (action === 'reject_claim') {
      setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status: 'Closed', resolvedAt: new Date().toLocaleString(), resolutionNotes: notes || 'Claim Rejected' } : d))
      updateDisputeInFirestore(disputeId, { status: 'Closed', resolutionNotes: notes || 'Claim Rejected' })
      showToastNotice(`Dispute ${disputeId} claim rejected`, 'info')

    } else if (action === 'reopen') {
      setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status: 'Pending' } : d))
      updateDisputeInFirestore(disputeId, { status: 'Pending' })
      showToastNotice(`Dispute ${disputeId} reopened for investigation`, 'info')
    }
  }

  const triggerAIDisputeReview = async (disputeId: string) => {
    const dispute = disputes.find(d => d.id === disputeId)
    if (!dispute) return

    showToastNotice(`AI Dispute Arbitrator starting review for ${disputeId}...`, 'info')

    try {
      const result = await evaluateDisputeWithGeminiAI(dispute.disputeReason, dispute.submittedEvidence)

      const updatedFields = {
        status: 'Reviewing' as DisputeStatus,
        aiReviewResult: {
          recommendation: result.recommendation,
          confidenceScore: result.confidenceScore,
          suggestedWinner: result.suggestedWinner
        }
      }

      setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, ...updatedFields } : d))
      updateDisputeInFirestore(disputeId, updatedFields)

      showToastNotice(`AI Dispute resolution calculated! Suggested: ${result.suggestedWinner} (${result.confidenceScore}%)`, 'success')
    } catch (err) {
      console.warn('AI dispute review failed:', err)
      showToastNotice('AI Dispute review failed to run', 'warning')
    }
  }

  // ─── Export Utilities ────────────────────────────────────────────────────────

  const exportCSV = () => {
    const headers = ['Challenge ID', 'Title', 'Category', 'Type', 'Creator', 'Participants', 'Stake Amount', 'Prize Pool', 'Status', 'Start Date', 'End Date']
    const rows = challenges.map(c => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.type,
      `"${c.creatorName.replace(/"/g, '""')}"`,
      c.participantsCount,
      c.stakeAmount,
      c.prizePool,
      c.status,
      c.startDate,
      c.endDate
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `anybet_challenges_export_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToastNotice('CSV export generated & downloaded successfully', 'success')
  }

  const exportPDF = async () => {
    showToastNotice('Generating PDF executive report...', 'info')

    try {
      const loadJsPDF = (): Promise<any> => {
        return new Promise((resolve, reject) => {
          if ((window as any).jspdf) {
            resolve((window as any).jspdf)
            return
          }
          const script = document.createElement('script')
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
          script.onload = () => resolve((window as any).jspdf)
          script.onerror = () => reject(new Error('Failed to load PDF library script.'))
          document.head.appendChild(script)
        })
      }

      const { jsPDF } = await loadJsPDF()
      const doc = new jsPDF()

      const liveCount = challenges.filter(c => c.status === 'Live').length
      const totalVolume = challenges.reduce((sum, c) => sum + c.prizePool, 0)
      const totalFees = challenges.reduce((sum, c) => sum + (c.financials?.platformFee || 0), 0)

      // Background canvas
      doc.setFillColor(9, 13, 22)
      doc.rect(0, 0, 210, 297, 'F')

      // Header title
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('ANYBET OPERATOR PLATFORM', 14, 20)

      doc.setFontSize(9)
      doc.setTextColor(148, 163, 184)
      doc.text('EXECUTIVE ANALYTICS & AUDIT REPORT', 14, 26)

      // Timestamp
      doc.setFontSize(8)
      doc.setTextColor(0, 224, 255)
      doc.text(`Generated At: ${new Date().toLocaleString()}`, 14, 32)

      // Header purple line
      doc.setDrawColor(128, 38, 255)
      doc.setLineWidth(0.6)
      doc.line(14, 36, 196, 36)

      // Metrics cards (4 boxes)
      const cardWidth = 42
      const cardGap = 5
      const startX = 14
      const cardY = 42

      // Box 1 - Total Wagers
      doc.setFillColor(19, 24, 38)
      doc.roundedRect(startX, cardY, cardWidth, 20, 2, 2, 'F')
      doc.setFontSize(7)
      doc.setTextColor(148, 163, 184)
      doc.text('TOTAL WAGERS', startX + 4, cardY + 7)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 224, 255)
      doc.text(`${challenges.length}`, startX + 4, cardY + 15)

      // Box 2 - Live Events
      const card2X = startX + cardWidth + cardGap
      doc.setFillColor(19, 24, 38)
      doc.roundedRect(card2X, cardY, cardWidth, 20, 2, 2, 'F')
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(148, 163, 184)
      doc.text('LIVE EVENTS', card2X + 4, cardY + 7)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 224, 255)
      doc.text(`${liveCount}`, card2X + 4, cardY + 15)

      // Box 3 - Total Volume
      const card3X = card2X + cardWidth + cardGap
      doc.setFillColor(19, 24, 38)
      doc.roundedRect(card3X, cardY, cardWidth, 20, 2, 2, 'F')
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(148, 163, 184)
      doc.text('TOTAL VOLUME', card3X + 4, cardY + 7)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 224, 255)
      doc.text(`${totalVolume.toLocaleString()} BET`, card3X + 4, cardY + 15)

      // Box 4 - Platform Fees
      const card4X = card3X + cardWidth + cardGap
      doc.setFillColor(19, 24, 38)
      doc.roundedRect(card4X, cardY, cardWidth, 20, 2, 2, 'F')
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(148, 163, 184)
      doc.text('PLATFORM FEES', card4X + 4, cardY + 7)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 224, 255)
      doc.text(`${totalFees.toLocaleString()} BET`, card4X + 4, cardY + 15)

      // Inventory Title
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text('MASTER CHALLENGES INVENTORY', 14, 73)

      // Table Header Row
      doc.setFillColor(30, 41, 59)
      doc.rect(14, 77, 182, 7, 'F')
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      doc.text('ID', 18, 82)
      doc.text('TITLE', 42, 82)
      doc.text('CATEGORY', 115, 82)
      doc.text('STAKE', 148, 82)
      doc.text('PRIZE POOL', 172, 82)

      // Table Data Rows
      let y = 91
      challenges.slice(0, 18).forEach((c, idx) => {
        if (idx % 2 === 1) {
          doc.setFillColor(15, 20, 32)
          doc.rect(14, y - 5, 182, 8, 'F')
        }

        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(148, 163, 184)
        doc.text(c.id, 18, y)

        doc.setFont('helvetica', 'normal')
        doc.setTextColor(255, 255, 255)
        const truncTitle = c.title.length > 35 ? c.title.substring(0, 35) + '...' : c.title
        doc.text(truncTitle, 42, y)

        doc.setTextColor(148, 163, 184)
        doc.text(c.category, 115, y)
        doc.text(`${c.stakeAmount} BET`, 148, y)

        doc.setTextColor(16, 185, 129)
        doc.text(`${c.prizePool.toLocaleString()} BET`, 172, y)

        y += 9
      })

      // Footer
      doc.setFontSize(7)
      doc.setTextColor(100, 116, 139)
      doc.text('AnyBet Compliance Intelligence System • Confidential Executive Audit Report', 14, 285)

      // Direct file download trigger
      const fileName = `AnyBet_Executive_Report_${Date.now()}.pdf`
      doc.save(fileName)

      showToastNotice('PDF Report downloaded directly to your Downloads folder!', 'success')
    } catch (err) {
      console.error('PDF Generation Error:', err)
      showToastNotice('Failed to generate PDF. Please try again.', 'warning')
    }
  }

  const value = useMemo(() => ({
    challenges,
    categories,
    disputes,
    selectedChallenge,
    setSelectedChallenge,
    createChallenge,
    updateChallenge,
    updateChallengeStatus,
    approveChallenge,
    rejectChallenge,
    suspendChallenge,
    duplicateChallenge,
    deleteChallenge,
    bulkApprove,
    bulkReject,
    bulkSuspend,
    bulkDelete,
    clearAllChallenges,
    createCategory,
    updateCategory,
    toggleCategoryStatus,
    deleteCategory,
    reorderCategory,
    settleChallenge,
    resolveDispute,
    triggerAIDisputeReview,
    exportCSV,
    exportPDF,
    showToastNotice
  }), [challenges, categories, disputes, selectedChallenge])

  return (
    <ChallengesContext.Provider value={value}>
      {children}
    </ChallengesContext.Provider>
  )
}

export const useChallenges = () => {
  const context = useContext(ChallengesContext)
  if (!context) {
    throw new Error('useChallenges must be used within a ChallengesProvider')
  }
  return context
}
