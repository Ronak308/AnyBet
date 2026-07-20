import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useWallet } from './WalletContext'
import {
  subscribeToChallenges,
  subscribeToCategories,
  subscribeToDisputes,
  createChallengeInFirestore,
  updateChallengeInFirestore,
  deleteChallengeFromFirestore,
  createCategoryInFirestore,
  updateCategoryInFirestore,
  deleteCategoryFromFirestore,
  updateDisputeInFirestore,
  seedInitialFirestoreData
} from '../services/challengesService'

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

  // Category Actions
  createCategory: (category: Omit<ChallengeCategory, 'id' | 'challengeCount'>) => void
  updateCategory: (id: string, category: Partial<ChallengeCategory>) => void
  toggleCategoryStatus: (id: string) => void
  deleteCategory: (id: string) => void
  reorderCategory: (id: string, direction: 'up' | 'down') => void

  // Settlement & Dispute Actions
  settleChallenge: (challengeId: string, winnerId: string, winnerName: string, notes?: string) => void
  resolveDispute: (disputeId: string, action: 'approve_claim' | 'reject_claim' | 'refund' | 'reopen', winnerId?: string, notes?: string) => void

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

const INITIAL_CHALLENGES: ChallengeItem[] = [
  {
    id: 'AB-7701',
    title: 'P2P Wager: Alex vs Marcus – Pushup Sprint (YES/NO)',
    description: 'Custom peer-to-peer wager created via app between Alex_R (YES) and Marcus_S (NO) for 100 pushups under 5 minutes.',
    category: 'Custom',
    type: 'Peer Wager',
    frequency: 'Single Event',
    creatorId: 'USR_01',
    creatorName: 'Alex River (Alex_R)',
    participantsCount: 2,
    maxParticipants: 2,
    stakeAmount: 500,
    prizePool: 1000,
    startDate: '2026-07-20',
    endDate: '2026-07-21',
    status: 'Live',
    rules: [
      'Player A (Alex_R) bets YES (500 BET locked)',
      'Player B (Marcus_S) bets NO (500 BET locked)',
      'Both players submit video proof or consensus result'
    ],
    participants: [
      { id: 'p1', username: 'Alex_R (YES)', joinedAt: '2026-07-20 11:00', stakeAmount: 500, progressPercent: 100 },
      { id: 'p2', username: 'Marcus_S (NO)', joinedAt: '2026-07-20 11:05', stakeAmount: 500, progressPercent: 100 }
    ],
    financials: { totalCollected: 1000, lockedCoins: 1000, platformFee: 50, winnerPayout: 950, refundAmount: 0 },
    settlement: { settlementMethod: 'Consensus', status: 'Waiting' },
    timeline: [
      { id: 't1', stage: 'Challenge Created', description: 'Created in app by Alex_R (Staked 500 BET)', timestamp: '2026-07-20 11:00', completed: true },
      { id: 't2', stage: 'Participant Joined', description: 'Marcus_S accepted & staked 500 BET (Escrow locked 1,000 BET)', timestamp: '2026-07-20 11:05', completed: true },
      { id: 't3', stage: 'Challenge Started', description: 'Wager active – awaiting outcome submission', timestamp: '2026-07-20 11:06', completed: true }
    ]
  },
  {
    id: 'AB-8801',
    title: '7-Day Fitness & Step Count Streak',
    description: 'Day-wise challenge to complete 10,000 steps every day for 7 consecutive days verified by IoT scale/watch API.',
    category: 'Physical',
    type: 'Day-wise Streak',
    frequency: 'Day-wise',
    creatorId: 'USR_09',
    creatorName: 'FitnessPro_Daily',
    participantsCount: 88,
    maxParticipants: 100,
    stakeAmount: 150,
    prizePool: 13200,
    startDate: '2026-07-20',
    endDate: '2026-07-27',
    status: 'Live',
    rules: [
      'Daily 10k step sync before midnight',
      'Missing 1 day forfeits pool eligibility'
    ],
    participants: [],
    financials: { totalCollected: 13200, lockedCoins: 13200, platformFee: 660, winnerPayout: 12540, refundAmount: 0 },
    settlement: { settlementMethod: 'AI Oracle', status: 'Waiting' },
    timeline: [
      { id: 't1', stage: 'Challenge Created', description: 'Created as Day-wise Streak', timestamp: '2026-07-20 08:00', completed: true },
      { id: 't2', stage: 'Approved', description: 'Approved & Live', timestamp: '2026-07-20 08:15', completed: true }
    ]
  },
  {
    id: 'AB-8802',
    title: 'Weekly Crypto Market Tournament',
    description: 'Weekly 7-day prediction leaderboard for top 3 crypto closing targets across SOL, BTC, and ETH.',
    category: 'Prediction',
    type: 'Weekly Tournament',
    frequency: 'Weekly',
    creatorId: 'USR_10',
    creatorName: 'WeeklyCrypto_Host',
    participantsCount: 412,
    maxParticipants: 500,
    stakeAmount: 200,
    prizePool: 82400,
    startDate: '2026-07-20',
    endDate: '2026-07-27',
    status: 'Live',
    rules: [
      'Weekly predictions lock every Sunday 23:59 UTC',
      'AI Oracle settles results weekly on Sunday close'
    ],
    participants: [],
    financials: { totalCollected: 82400, lockedCoins: 82400, platformFee: 4120, winnerPayout: 78280, refundAmount: 0 },
    settlement: { settlementMethod: 'AI Oracle', status: 'Waiting' },
    timeline: [
      { id: 't1', stage: 'Challenge Created', description: 'Created as Weekly Tournament', timestamp: '2026-07-20 00:00', completed: true },
      { id: 't2', stage: 'Approved', description: 'Approved & Live', timestamp: '2026-07-20 00:05', completed: true }
    ]
  },
  {
    id: 'AB-9821',
    title: 'Marathon Completion Under 3h:00',
    description: 'Complete a certified 42.2km marathon course in under 3 hours, verified by GPS & Garmin Connect telemetry.',
    category: 'Physical',
    type: 'Solo Time Trial',
    frequency: 'Single Event',
    creatorId: 'USR_01',
    creatorName: 'Alex River (Alex_R)',
    participantsCount: 44,
    maxParticipants: 50,
    stakeAmount: 250,
    prizePool: 11000,
    startDate: '2026-07-01',
    endDate: '2026-07-25',
    status: 'Disputed',
    rules: [
      'Must submit GPS FIT file or Strava link',
      'Average heart rate log required',
      'Official race chip timing proof accepted'
    ],
    participants: [
      { id: 'p1', username: 'Alex_R', joinedAt: '2026-07-01', stakeAmount: 250, progressPercent: 100, result: 'Winner' },
      { id: 'p2', username: 'Marcus_S', joinedAt: '2026-07-02', stakeAmount: 250, progressPercent: 98, result: 'Pending' },
      { id: 'p3', username: 'Elena_V', joinedAt: '2026-07-03', stakeAmount: 250, progressPercent: 85, result: 'Pending' }
    ],
    financials: {
      totalCollected: 11000,
      lockedCoins: 11000,
      platformFee: 550,
      winnerPayout: 10450,
      refundAmount: 0
    },
    settlement: {
      settlementMethod: 'AI Oracle',
      oracleResult: 'Telemetry gap detected: Strava vs Garmin timing mismatch (+12.4 seconds).',
      oracleConfidence: 89,
      status: 'Under Review'
    },
    timeline: [
      { id: 't1', stage: 'Challenge Created', description: 'Created by Alex_R with 250 BET stake', timestamp: '2026-07-01 09:00', completed: true },
      { id: 't2', stage: 'Approved', description: 'Approved by Operator Admin', timestamp: '2026-07-01 09:15', completed: true },
      { id: 't3', stage: 'Published', description: 'Challenge went live on public portal', timestamp: '2026-07-01 09:20', completed: true },
      { id: 't4', stage: 'Participants Joined', description: '44 participants joined & locked stakes', timestamp: '2026-07-05 18:00', completed: true },
      { id: 't5', stage: 'Challenge Started', description: 'Event timeline commenced', timestamp: '2026-07-10 06:00', completed: true },
      { id: 't6', stage: 'Dispute Raised', description: 'Conflicting GPS data reported by participant Marcus_S', timestamp: '2026-07-20 11:30', completed: true },
      { id: 't7', stage: 'Settlement Processed', description: 'Pending operator final review', timestamp: '2026-07-20 12:00', completed: false },
      { id: 't8', stage: 'Rewards Distributed', description: 'Payout to winner wallet', timestamp: '-', completed: false },
      { id: 't9', stage: 'Archived', description: 'Record archived in immutable history', timestamp: '-', completed: false }
    ]
  },
  {
    id: 'AB-9942',
    title: 'BTC Price Closes Above $100k (Dec 31)',
    description: 'Predict whether Bitcoin (BTC/USD) daily closing candle on Binance is above $100,000.',
    category: 'Prediction',
    type: 'Binary Option',
    creatorId: 'USR_02',
    creatorName: 'CryptoKing',
    participantsCount: 1204,
    stakeAmount: 450,
    prizePool: 541800,
    startDate: '2026-06-15',
    endDate: '2026-12-31',
    status: 'Live',
    rules: [
      'Binance 24h close price is reference benchmark',
      'AI Oracle checks 3 exchange feeds (Binance, Coinbase, Kraken)',
      'Payout distributed within 2 hours of candle close'
    ],
    participants: [
      { id: 'p1', username: 'CryptoKing', joinedAt: '2026-06-15', stakeAmount: 450, progressPercent: 50 },
      { id: 'p2', username: 'SatoshiFan', joinedAt: '2026-06-16', stakeAmount: 450, progressPercent: 50 }
    ],
    financials: {
      totalCollected: 541800,
      lockedCoins: 541800,
      platformFee: 27090,
      winnerPayout: 514710,
      refundAmount: 0
    },
    settlement: {
      settlementMethod: 'AI Oracle',
      oracleResult: 'Feeds active. Current BTC spot price: $98,420 (98.4% target).',
      oracleConfidence: 99,
      status: 'Waiting'
    },
    timeline: [
      { id: 't1', stage: 'Challenge Created', description: 'Created by CryptoKing', timestamp: '2026-06-15 10:00', completed: true },
      { id: 't2', stage: 'Approved', description: 'Approved by Operator', timestamp: '2026-06-15 10:05', completed: true },
      { id: 't3', stage: 'Published', description: 'Live on market board', timestamp: '2026-06-15 10:10', completed: true },
      { id: 't4', stage: 'Participants Joined', description: '1,204 users entered pool', timestamp: '2026-06-20 12:00', completed: true },
      { id: 't5', stage: 'Challenge Started', description: 'Tracking active spot feeds', timestamp: '2026-06-21 00:00', completed: true }
    ]
  },
  {
    id: 'AB-1005',
    title: 'Weight Loss Challenge: Group Delta 5%',
    description: 'Group challenge to achieve 5% weight loss over 30 days verified by smart scale API.',
    category: 'Physical',
    type: 'Group Goal',
    creatorId: 'USR_03',
    creatorName: 'FitCoach_Dan',
    participantsCount: 8,
    maxParticipants: 10,
    stakeAmount: 200,
    prizePool: 1600,
    startDate: '2026-07-15',
    endDate: '2026-08-15',
    status: 'Pending Review',
    rules: [
      'Withings / Fitbit scale integration',
      'Daily morning weigh-in check',
      'Photo proof with code timestamp'
    ],
    participants: [
      { id: 'p1', username: 'FitCoach_Dan', joinedAt: '2026-07-15', stakeAmount: 200, progressPercent: 20 }
    ],
    financials: {
      totalCollected: 1600,
      lockedCoins: 1600,
      platformFee: 80,
      winnerPayout: 1520,
      refundAmount: 0
    },
    settlement: {
      settlementMethod: 'Manual Review',
      status: 'Waiting'
    },
    timeline: [
      { id: 't1', stage: 'Challenge Created', description: 'Created by FitCoach_Dan', timestamp: '2026-07-15 14:00', completed: true },
      { id: 't2', stage: 'Pending Review', description: 'Awaiting operator approval before publishing', timestamp: '2026-07-15 14:00', completed: true }
    ]
  },
  {
    id: 'AB-7761',
    title: 'NBA Finals: Game 7 Winner & Spread',
    description: 'Predict the outright winner and point spread for the NBA Championship Final.',
    category: 'Sports',
    type: 'Match Winner',
    creatorId: 'USR_04',
    creatorName: 'HoopsMaster',
    participantsCount: 8230,
    stakeAmount: 100,
    prizePool: 823000,
    startDate: '2026-06-01',
    endDate: '2026-06-20',
    status: 'Completed',
    rules: [
      'Official NBA box score is final',
      'Overtime counts towards final score'
    ],
    participants: [
      { id: 'p1', username: 'HoopsMaster', joinedAt: '2026-06-01', stakeAmount: 100, progressPercent: 100, result: 'Winner' }
    ],
    financials: {
      totalCollected: 823000,
      lockedCoins: 0,
      platformFee: 41150,
      winnerPayout: 781850,
      refundAmount: 0
    },
    settlement: {
      winnerId: 'HoopsMaster',
      winnerName: 'HoopsMaster (+4,115 winners)',
      settlementMethod: 'AI Oracle',
      oracleResult: 'Game ended: Celtics 106 - Mavericks 98. Feed verified via SportRadar API.',
      oracleConfidence: 100,
      settlementTimestamp: '2026-06-20 23:45',
      status: 'Completed'
    },
    timeline: [
      { id: 't1', stage: 'Challenge Created', description: 'Created', timestamp: '2026-06-01', completed: true },
      { id: 't2', stage: 'Approved', description: 'Approved', timestamp: '2026-06-01', completed: true },
      { id: 't3', stage: 'Published', description: 'Live', timestamp: '2026-06-01', completed: true },
      { id: 't4', stage: 'Participants Joined', description: '8,230 joined', timestamp: '2026-06-15', completed: true },
      { id: 't5', stage: 'Challenge Started', description: 'Game start', timestamp: '2026-06-20', completed: true },
      { id: 't6', stage: 'Challenge Completed', description: 'Final whistle', timestamp: '2026-06-20', completed: true },
      { id: 't7', stage: 'Settlement Processed', description: 'Oracle verified result', timestamp: '2026-06-20', completed: true },
      { id: 't8', stage: 'Rewards Distributed', description: '781,850 BET credited', timestamp: '2026-06-20', completed: true },
      { id: 't9', stage: 'Archived', description: 'Archived in history', timestamp: '2026-06-21', completed: true }
    ]
  },
  {
    id: 'AB-8720',
    title: 'League of Legends World Finals Speedrun',
    description: 'Esports challenge for fastest game win under 25 minutes in tournament finals.',
    category: 'Performance',
    type: 'Esports Speedrun',
    creatorId: 'USR_05',
    creatorName: 'GamerPro_99',
    participantsCount: 156,
    stakeAmount: 300,
    prizePool: 46800,
    startDate: '2026-07-10',
    endDate: '2026-07-28',
    status: 'Live',
    rules: [
      'Riot Games official API match timeline',
      'Screen capture recording required for secondary validation'
    ],
    participants: [
      { id: 'p1', username: 'GamerPro_99', joinedAt: '2026-07-10', stakeAmount: 300, progressPercent: 60 }
    ],
    financials: {
      totalCollected: 46800,
      lockedCoins: 46800,
      platformFee: 2340,
      winnerPayout: 44460,
      refundAmount: 0
    },
    settlement: {
      settlementMethod: 'AI Oracle',
      oracleResult: 'Match API connected. Monitoring match ID #LOL-2026-881.',
      oracleConfidence: 95,
      status: 'Waiting'
    },
    timeline: [
      { id: 't1', stage: 'Challenge Created', description: 'Created', timestamp: '2026-07-10', completed: true },
      { id: 't2', stage: 'Approved', description: 'Approved', timestamp: '2026-07-10', completed: true },
      { id: 't3', stage: 'Published', description: 'Published', timestamp: '2026-07-10', completed: true },
      { id: 't4', stage: 'Participants Joined', description: '156 joined', timestamp: '2026-07-12', completed: true },
      { id: 't5', stage: 'Challenge Started', description: 'Live tracking', timestamp: '2026-07-15', completed: true }
    ]
  },
  {
    id: 'AB-3310',
    title: 'ETH/USD Closes Above $5,000 (Q3 2026)',
    description: 'Ethereum price prediction target for Q3 quarter-end candle close.',
    category: 'Prediction',
    type: 'Crypto Market',
    creatorId: 'USR_06',
    creatorName: 'EtherWhale',
    participantsCount: 2100,
    stakeAmount: 150,
    prizePool: 315000,
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    status: 'Approved',
    rules: ['Coinbase / Binance aggregate oracle feed'],
    participants: [],
    financials: { totalCollected: 315000, lockedCoins: 315000, platformFee: 15750, winnerPayout: 299250, refundAmount: 0 },
    settlement: { settlementMethod: 'AI Oracle', status: 'Waiting' },
    timeline: [
      { id: 't1', stage: 'Challenge Created', description: 'Created', timestamp: '2026-07-01', completed: true },
      { id: 't2', stage: 'Approved', description: 'Approved by Operator', timestamp: '2026-07-01', completed: true }
    ]
  },
  {
    id: 'AB-4412',
    title: '100km Cycling Race – Group Bravo',
    description: 'Group endurance cycling challenge measured via Strava segment timers.',
    category: 'Physical',
    type: 'Group Distance',
    creatorId: 'USR_07',
    creatorName: 'CyclistBeta',
    participantsCount: 22,
    stakeAmount: 400,
    prizePool: 8800,
    startDate: '2026-07-18',
    endDate: '2026-07-30',
    status: 'Live',
    rules: ['Strava API GPX verification'],
    participants: [],
    financials: { totalCollected: 8800, lockedCoins: 8800, platformFee: 440, winnerPayout: 8360, refundAmount: 0 },
    settlement: { settlementMethod: 'Manual Review', status: 'Waiting' },
    timeline: [
      { id: 't1', stage: 'Challenge Created', description: 'Created', timestamp: '2026-07-18', completed: true },
      { id: 't2', stage: 'Approved', description: 'Approved', timestamp: '2026-07-18', completed: true },
      { id: 't3', stage: 'Published', description: 'Published', timestamp: '2026-07-18', completed: true },
      { id: 't4', stage: 'Participants Joined', description: '22 joined', timestamp: '2026-07-19', completed: true },
      { id: 't5', stage: 'Challenge Started', description: 'Started', timestamp: '2026-07-20', completed: true }
    ]
  },
  {
    id: 'AB-5501',
    title: 'Custom Poker Tournament Side Wager',
    description: 'Private custom wager between club players for highest tournament chip stack.',
    category: 'Custom',
    type: 'Peer Wager',
    creatorId: 'USR_08',
    creatorName: 'PokerAce_7',
    participantsCount: 6,
    stakeAmount: 1000,
    prizePool: 6000,
    startDate: '2026-07-05',
    endDate: '2026-07-06',
    status: 'Completed',
    rules: ['Multi-signature consensus approval'],
    participants: [],
    financials: { totalCollected: 6000, lockedCoins: 0, platformFee: 300, winnerPayout: 5700, refundAmount: 0 },
    settlement: { winnerId: 'PokerAce_7', winnerName: 'PokerAce_7', settlementMethod: 'Consensus', status: 'Completed' },
    timeline: [
      { id: 't1', stage: 'Challenge Created', description: 'Created', timestamp: '2026-07-05', completed: true },
      { id: 't2', stage: 'Completed', description: 'Settled', timestamp: '2026-07-06', completed: true }
    ]
  }
]

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
  const { creditCoins } = useWallet()

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

    return () => {
      unsubChallenges?.()
      unsubCategories?.()
      unsubDisputes?.()
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
        platformFee: Math.round(pot * 0.05),
        winnerPayout: Math.round(pot * 0.95),
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

    const payoutAmount = target.financials.winnerPayout || target.prizePool

    // Unlock locked coins and credit winner payout in Wallet Context
    creditCoins('USR_01', payoutAmount, 'Bet Win', `Winner payout for Challenge ${challengeId}`)

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
    const completedCount = challenges.filter(c => c.status === 'Completed').length
    const disputedCount = challenges.filter(c => c.status === 'Disputed').length
    const totalVolume = challenges.reduce((sum, c) => sum + c.prizePool, 0)
    const totalFees = challenges.reduce((sum, c) => sum + c.financials.platformFee, 0)

    const reportContent = `================================================================================
                       ANYBET OPERATOR PLATFORM
                     EXECUTIVE ANALYTICS & AUDIT REPORT
================================================================================
Generated At : ${new Date().toLocaleString()}
Report Scope : Master Challenges & Financial Audit Summary

--------------------------------------------------------------------------------
1. EXECUTIVE PLATFORM METRICS
--------------------------------------------------------------------------------
Total Wagers Created    : ${challenges.length}
Active Live Events      : ${liveCount}
Completed Events        : ${completedCount}
Disputed Events         : ${disputedCount}
Total Prize Volume      : ${totalVolume.toLocaleString()} BET Coins
Platform Revenue (5%)   : ${totalFees.toLocaleString()} BET Coins

--------------------------------------------------------------------------------
2. MASTER CHALLENGES INVENTORY
--------------------------------------------------------------------------------
${challenges.map(c => `[${c.id}] ${c.title}
  • Category   : ${c.category} (${c.type})
  • Creator    : ${c.creatorName} | Stake: ${c.stakeAmount} BET | Prize Pool: ${c.prizePool.toLocaleString()} BET
  • Status     : ${c.status} | Participants: ${c.participantsCount} Users
`).join('\n')}

--------------------------------------------------------------------------------
3. DISPUTE ARBITRATION AUDIT
--------------------------------------------------------------------------------
${disputes.map(d => `[${d.id}] ${d.challengeTitle}
  • Involved   : ${d.usersInvolved.join(' vs ')}
  • Status     : ${d.status} | AI Rating: ${d.aiReviewResult.confidenceScore}% Confidence
  • Reason     : ${d.disputeReason}
`).join('\n')}

================================================================================
               END OF ANYBET EXECUTIVE SECURITY REPORT
================================================================================`

    const blob = new Blob([reportContent], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `AnyBet_Executive_Report_${Date.now()}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showToastNotice('PDF Report downloaded successfully!', 'success')
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
    createCategory,
    updateCategory,
    toggleCategoryStatus,
    deleteCategory,
    reorderCategory,
    settleChallenge,
    resolveDispute,
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
