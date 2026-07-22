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

  const exportPDF = () => {
    showToastNotice('Generating PDF executive report...', 'info')

    const liveCount = challenges.filter(c => c.status === 'Live').length
    const totalVolume = challenges.reduce((sum, c) => sum + c.prizePool, 0)
    const totalFees = challenges.reduce((sum, c) => sum + (c.financials?.platformFee || 0), 0)

    const printWin = window.open('', '_blank', 'width=900,height=750')
    if (printWin) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>AnyBet Executive Report - ${Date.now()}</title>
            <style>
              @page { size: A4; margin: 15mm; }
              body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #090d16; color: #e2e8f0; padding: 30px; margin: 0; }
              .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #8026FF; padding-bottom: 15px; margin-bottom: 25px; }
              .title { font-size: 22px; font-weight: bold; color: #ffffff; letter-spacing: 0.5px; }
              .subtitle { font-size: 11px; color: #94a3b8; margin-top: 4px; font-family: monospace; }
              .badge { background: #8026FF22; color: #00E0FF; border: 1px solid #00E0FF44; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; font-family: monospace; }
              .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
              .card { background: #131826; border: 1px solid #1e293b; padding: 15px; border-radius: 8px; }
              .card-label { font-size: 10px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; }
              .card-val { font-size: 18px; font-weight: bold; color: #00E0FF; margin-top: 5px; font-family: monospace; }
              .section-header { font-size: 13px; font-weight: bold; color: #ffffff; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px; }
              th { background: #1e293b; color: #94a3b8; text-align: left; padding: 8px 12px; font-size: 10px; text-transform: uppercase; font-family: monospace; }
              td { padding: 10px 12px; border-bottom: 1px solid #131826; }
              tr:nth-child(even) { background: #0f1422; }
              .footer { margin-top: 30px; font-size: 10px; color: #64748b; text-align: center; border-top: 1px solid #1e293b; padding-top: 15px; font-family: monospace; }
              @media print {
                body { background: #ffffff !important; color: #000000 !important; }
                .card { background: #f8fafc !important; border: 1px solid #cbd5e1 !important; }
                .card-val { color: #0f172a !important; }
                th { background: #e2e8f0 !important; color: #334155 !important; }
                td { border-bottom: 1px solid #e2e8f0 !important; }
                .badge { background: #f1f5f9 !important; color: #0284c7 !important; border: 1px solid #0284c7 !important; }
                tr:nth-child(even) { background: #f8fafc !important; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="title">ANYBET OPERATOR PLATFORM</div>
                <div class="subtitle">EXECUTIVE ANALYTICS & AUDIT REPORT</div>
              </div>
              <div class="badge">SECURITY AUDIT REPORT</div>
            </div>

            <div class="grid">
              <div class="card">
                <div class="card-label">Total Wagers</div>
                <div class="card-val">${challenges.length}</div>
              </div>
              <div class="card">
                <div class="card-label">Live Events</div>
                <div class="card-val">${liveCount}</div>
              </div>
              <div class="card">
                <div class="card-label">Total Volume</div>
                <div class="card-val">${totalVolume.toLocaleString()} BET</div>
              </div>
              <div class="card">
                <div class="card-label">Platform Fees</div>
                <div class="card-val">${totalFees.toLocaleString()} BET</div>
              </div>
            </div>

            <div class="section-header">Master Challenges Inventory</div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Stake</th>
                  <th>Prize Pool</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${challenges.map(c => `
                  <tr>
                    <td style="font-family: monospace; font-weight: bold;">${c.id}</td>
                    <td>${c.title}</td>
                    <td>${c.category}</td>
                    <td style="font-family: monospace;">${c.stakeAmount} BET</td>
                    <td style="font-family: monospace; color: #10B981;">${c.prizePool.toLocaleString()} BET</td>
                    <td>${c.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="footer">
              Generated on ${new Date().toLocaleString()} • AnyBet Compliance Intelligence System
            </div>

            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 300);
              };
            </script>
          </body>
        </html>
      `)
      printWin.document.close()
    }

    showToastNotice('Executive PDF Report generated! Select "Save as PDF" in print dialog.', 'success')
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
