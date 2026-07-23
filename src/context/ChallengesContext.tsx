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

export type ChallengeCategoryType = 
  | 'Sports'
  | 'Gaming & Esports'
  | 'Fitness'
  | 'Cards & Board Games'
  | 'Entertainment'
  | 'Education'
  | 'Tennis'
  | 'Golf'
  | 'Predictions'
  | 'Prediction'
  | 'Weather'
  | 'Reality TV & Shows'
  | 'Trivia & Fun'
  | 'Friendly Wagers'
  | 'Workplace'
  | 'Community Events'
  | 'Physical'
  | 'Performance'
  | 'Custom'
  | (string & {})

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

export interface TournamentMatch {
  id: string
  roundName: string // e.g. 'Round 1', 'Quarter-Final', 'Semi-Final', 'Final'
  matchNumber: number
  team1Name: string
  team2Name: string
  winningTeam?: string
  status: 'Scheduled' | 'Live' | 'Completed' | 'Cancelled'
  score?: string // e.g. '2 - 1'
  scheduledTime?: string
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
  matches?: TournamentMatch[]
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
  updateTournamentMatch: (challengeId: string, matchId: string, updates: Partial<TournamentMatch>) => void
  addTournamentMatch: (challengeId: string, match: Omit<TournamentMatch, 'id'>) => void
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
    description: 'Any game. Any league. Any bet. Athletics, football, basketball, and tournaments.',
    color: '#3B82F6', // Blue
    icon: 'Trophy',
    isEnabled: true,
    displayOrder: 1,
    challengeCount: 0
  },
  {
    id: 'cat-2',
    name: 'Gaming & Esports',
    description: 'Competitive games, rankings, speedruns, and live gaming challenges.',
    color: '#8B5CF6', // Purple
    icon: 'Gamepad2',
    isEnabled: true,
    displayOrder: 2,
    challengeCount: 0
  },
  {
    id: 'cat-3',
    name: 'Fitness',
    description: 'Workouts, daily step goals, body transformations & IoT activity trackers.',
    color: '#10B981', // Emerald
    icon: 'Dumbbell',
    isEnabled: true,
    displayOrder: 3,
    challengeCount: 0
  },
  {
    id: 'cat-4',
    name: 'Cards & Board Games',
    description: 'Poker nights, chess tournaments, tabletop games, and everything in between.',
    color: '#EC4899', // Pink
    icon: 'Dices',
    isEnabled: true,
    displayOrder: 4,
    challengeCount: 0
  },
  {
    id: 'cat-5',
    name: 'Entertainment',
    description: 'Movie awards, show premieres, music concerts, and celebrity predictions.',
    color: '#F59E0B', // Amber
    icon: 'Mic',
    isEnabled: true,
    displayOrder: 5,
    challengeCount: 0
  },
  {
    id: 'cat-6',
    name: 'Education',
    description: 'Study goals, academic benchmarks, reading challenges, and skill exams.',
    color: '#06B6D4', // Cyan
    icon: 'GraduationCap',
    isEnabled: true,
    displayOrder: 6,
    challengeCount: 0
  },
  {
    id: 'cat-7',
    name: 'Tennis',
    description: 'ATP/WTA matches, Grand Slam tournaments, set outcomes & player props.',
    color: '#84CC16', // Lime
    icon: 'Trophy',
    isEnabled: true,
    displayOrder: 7,
    challengeCount: 0
  },
  {
    id: 'cat-8',
    name: 'Golf',
    description: 'PGA Tournaments, head-to-head props, long drives & hole-in-one wagers.',
    color: '#22C55E', // Green
    icon: 'Target',
    isEnabled: true,
    displayOrder: 8,
    challengeCount: 0
  },
  {
    id: 'cat-9',
    name: 'Predictions',
    description: 'Financial markets, crypto price targets, political events & world outcomes.',
    color: '#6366F1', // Indigo
    icon: 'TrendingUp',
    isEnabled: true,
    displayOrder: 9,
    challengeCount: 0
  },
  {
    id: 'cat-10',
    name: 'Weather',
    description: 'Rain or shine, temperature spikes, snowfall bets, and natural events.',
    color: '#38BDF8', // Sky Blue
    icon: 'CloudRain',
    isEnabled: true,
    displayOrder: 10,
    challengeCount: 0
  },
  {
    id: 'cat-11',
    name: 'Reality TV & Shows',
    description: 'Who will win, who gets eliminated, episode ratings & show predictions.',
    color: '#E11D48', // Rose
    icon: 'Tv',
    isEnabled: true,
    displayOrder: 11,
    challengeCount: 0
  },
  {
    id: 'cat-12',
    name: 'Trivia & Fun',
    description: 'Quizzes, debates, pub trivia nights, and friendly smart bets.',
    color: '#A855F7', // Purple
    icon: 'Brain',
    isEnabled: true,
    displayOrder: 12,
    challengeCount: 0
  },
  {
    id: 'cat-13',
    name: 'Friendly Wagers',
    description: 'Real money feel. Real friends. Real trust. Custom P2P friendly bets.',
    color: '#F97316', // Orange
    icon: 'Handshake',
    isEnabled: true,
    displayOrder: 13,
    challengeCount: 0
  },
  {
    id: 'cat-14',
    name: 'Workplace',
    description: 'Company team challenges, sales contests, hackathons, and office pools.',
    color: '#64748B', // Slate
    icon: 'Briefcase',
    isEnabled: true,
    displayOrder: 14,
    challengeCount: 0
  },
  {
    id: 'cat-15',
    name: 'Community Events',
    description: 'Pools, brackets, local fundraisers, charity challenges & group bets.',
    color: '#14B8A6', // Teal
    icon: 'Users',
    isEnabled: true,
    displayOrder: 15,
    challengeCount: 0
  },
  {
    id: 'cat-16',
    name: 'Custom',
    description: 'Create ANYTHING. Bet ANYTHING. Settle EVERYTHING. Limitless custom bets.',
    color: '#8026FF', // AnyBet Violet
    icon: 'Sparkles',
    isEnabled: true,
    displayOrder: 16,
    challengeCount: 0
  }
]

const INITIAL_CHALLENGES: ChallengeItem[] = [
  {
    id: 'AB-9821',
    title: 'Marathon Completion Under 3h:00',
    description: 'Complete full 42.2km marathon in under 3 hours validated via GPS telemetry & smartwatch chip.',
    category: 'Fitness',
    type: 'Solo Time Trial',
    frequency: 'Single Event',
    source: 'Mobile App',
    creatorId: 'USR_01',
    creatorName: 'Alex_R',
    participantsCount: 4,
    maxParticipants: 10,
    stakeAmount: 200,
    prizePool: 800,
    startDate: '2026-07-20',
    endDate: '2026-07-27',
    status: 'Disputed',
    rules: ['GPS telemetry required', 'Garmin/Strava integration enabled'],
    participants: [
      { id: 'USR_01', username: 'Alex_R', joinedAt: '2026-07-20', stakeAmount: 200, progressPercent: 100 },
      { id: 'USR_02', username: 'Marcus_S', joinedAt: '2026-07-20', stakeAmount: 200, progressPercent: 95 }
    ],
    financials: { totalCollected: 800, lockedCoins: 800, platformFee: 40, winnerPayout: 760, refundAmount: 0 },
    settlement: { settlementMethod: 'AI Oracle', status: 'Under Review' },
    timeline: [
      { id: 't-1', stage: 'Challenge Created', description: 'Created by Alex_R', timestamp: '2026-07-20 09:00', completed: true },
      { id: 't-2', stage: 'Live', description: 'Wager activated with 4 participants', timestamp: '2026-07-20 10:00', completed: true }
    ]
  },
  {
    id: 'AB-8720',
    title: 'League of Legends World Finals Speedrun',
    description: 'First team to achieve Baron Nashor kill under 20 minutes in official tournament stream.',
    category: 'Gaming & Esports',
    type: 'Weekly Tournament',
    frequency: 'Weekly',
    source: 'Admin Portal',
    creatorId: 'USR_03',
    creatorName: 'GamerPro_99',
    participantsCount: 16,
    maxParticipants: 32,
    stakeAmount: 500,
    prizePool: 8000,
    startDate: '2026-07-18',
    endDate: '2026-07-25',
    status: 'Live',
    rules: ['Official Riot Games API match hash verification', 'Referees review streaming feed'],
    participants: [
      { id: 'USR_03', username: 'GamerPro_99', joinedAt: '2026-07-18', stakeAmount: 500, progressPercent: 80 }
    ],
    financials: { totalCollected: 8000, lockedCoins: 8000, platformFee: 400, winnerPayout: 7600, refundAmount: 0 },
    settlement: { settlementMethod: 'AI Oracle', status: 'Waiting' },
    timeline: [
      { id: 't-3', stage: 'Challenge Created', description: 'Created by GamerPro_99', timestamp: '2026-07-18 12:00', completed: true }
    ]
  },
  {
    id: 'AB-7410',
    title: 'Real Madrid vs Barcelona - El Clasico Match Winner',
    description: 'Predict the winner of the upcoming El Clasico derby. Extra time included.',
    category: 'Sports',
    type: 'Binary Option',
    frequency: 'Single Event',
    source: 'Admin Portal',
    creatorId: 'USR_01',
    creatorName: 'Operator Admin',
    participantsCount: 48,
    maxParticipants: 100,
    stakeAmount: 150,
    prizePool: 7200,
    startDate: '2026-07-22',
    endDate: '2026-07-29',
    status: 'Live',
    rules: ['Official La Liga match box score is final', 'Settled automatically within 30 min of whistle'],
    participants: [
      { id: 'USR_04', username: 'CryptoKing', joinedAt: '2026-07-22', stakeAmount: 150, progressPercent: 50 }
    ],
    financials: { totalCollected: 7200, lockedCoins: 7200, platformFee: 360, winnerPayout: 6840, refundAmount: 0 },
    settlement: { settlementMethod: 'AI Oracle', status: 'Waiting' },
    timeline: [
      { id: 't-4', stage: 'Live', description: 'Derby pool published', timestamp: '2026-07-22 14:00', completed: true }
    ]
  },
  {
    id: 'AB-6350',
    title: 'Bitcoin (BTC) Price Target $100,000 before Year End',
    description: 'Will BTC/USD cross $100,000 spot price on Binance 24h UTC candle before deadline?',
    category: 'Predictions',
    type: 'Binary Option',
    frequency: 'Monthly',
    source: 'Admin Portal',
    creatorId: 'USR_01',
    creatorName: 'Operator Admin',
    participantsCount: 54,
    maxParticipants: 200,
    stakeAmount: 100,
    prizePool: 5400,
    startDate: '2026-07-01',
    endDate: '2026-12-31',
    status: 'Live',
    rules: ['Binance 24h UTC daily close candle price is reference benchmark', 'AI Oracle threshold auto-trigger'],
    participants: [
      { id: 'USR_05', username: 'SatoshiFan', joinedAt: '2026-07-01', stakeAmount: 100, progressPercent: 65 }
    ],
    financials: { totalCollected: 5400, lockedCoins: 5400, platformFee: 270, winnerPayout: 5130, refundAmount: 0 },
    settlement: { settlementMethod: 'AI Oracle', status: 'Waiting' },
    timeline: [
      { id: 't-5', stage: 'Live', description: 'Macro prediction pool active', timestamp: '2026-07-01 00:00', completed: true }
    ]
  },
  {
    id: 'AB-5120',
    title: 'Wimbledon Men\'s Finals: Alcaraz vs Sinner 5-Setter',
    description: 'Will the match go to all 5 sets in the Wimbledon final?',
    category: 'Tennis',
    type: 'Peer Wager',
    frequency: 'Single Event',
    source: 'Mobile App',
    creatorId: 'USR_06',
    creatorName: 'TennisAce',
    participantsCount: 16,
    maxParticipants: 20,
    stakeAmount: 300,
    prizePool: 4800,
    startDate: '2026-07-21',
    endDate: '2026-07-26',
    status: 'Live',
    rules: ['Official ATP match statistics apply', 'Full set score required'],
    participants: [],
    financials: { totalCollected: 4800, lockedCoins: 4800, platformFee: 240, winnerPayout: 4560, refundAmount: 0 },
    settlement: { settlementMethod: 'AI Oracle', status: 'Waiting' },
    timeline: []
  },
  {
    id: 'AB-4210',
    title: 'Sunday High-Stakes Texas Hold\'em Tournament',
    description: 'Private 8-max poker table challenge with escrow payout pool.',
    category: 'Cards & Board Games',
    type: 'Weekly Tournament',
    frequency: 'Weekly',
    source: 'Mobile App',
    creatorId: 'USR_07',
    creatorName: 'PokerPro',
    participantsCount: 8,
    maxParticipants: 8,
    stakeAmount: 500,
    prizePool: 4000,
    startDate: '2026-07-23',
    endDate: '2026-07-24',
    status: 'Live',
    rules: ['Both participants must confirm match log', 'Host screenshot verification'],
    participants: [],
    financials: { totalCollected: 4000, lockedCoins: 4000, platformFee: 200, winnerPayout: 3800, refundAmount: 0 },
    settlement: { settlementMethod: 'Manual Review', status: 'Waiting' },
    timeline: []
  },
  {
    id: 'AB-3190',
    title: 'Daily 10,000 Steps 30-Day Fitness Challenge',
    description: 'Walk 10,000 steps daily for 30 consecutive days verified by Apple HealthKit / Health Connect.',
    category: 'Fitness',
    type: 'Day-wise Streak',
    frequency: 'Monthly',
    source: 'Mobile App',
    creatorId: 'USR_08',
    creatorName: 'FitGirl99',
    participantsCount: 29,
    maxParticipants: 50,
    stakeAmount: 100,
    prizePool: 2900,
    startDate: '2026-07-15',
    endDate: '2026-08-14',
    status: 'Live',
    rules: ['IoT step count sync daily before midnight UTC', 'Zero anomaly flag criteria'],
    participants: [],
    financials: { totalCollected: 2900, lockedCoins: 2900, platformFee: 145, winnerPayout: 2755, refundAmount: 0 },
    settlement: { settlementMethod: 'AI Oracle', status: 'Waiting' },
    timeline: []
  },
  {
    id: 'AB-2980',
    title: 'Oscars Best Picture Winner Prediction Pool',
    description: 'Predict the winner for Best Picture at the upcoming Academy Awards.',
    category: 'Entertainment',
    type: 'Binary Option',
    frequency: 'Single Event',
    source: 'Admin Portal',
    creatorId: 'USR_01',
    creatorName: 'Operator Admin',
    participantsCount: 19,
    maxParticipants: 100,
    stakeAmount: 50,
    prizePool: 950,
    startDate: '2026-07-10',
    endDate: '2026-08-10',
    status: 'Live',
    rules: ['Official Academy Awards broadcast announcement is final'],
    participants: [],
    financials: { totalCollected: 950, lockedCoins: 950, platformFee: 47, winnerPayout: 903, refundAmount: 0 },
    settlement: { settlementMethod: 'AI Oracle', status: 'Waiting' },
    timeline: []
  },
  {
    id: 'AB-1840',
    title: 'AWS Solutions Architect Exam 900+ Score Wager',
    description: 'Score above 900/1000 on official AWS certification exam.',
    category: 'Education',
    type: 'Solo Time Trial',
    frequency: 'Single Event',
    source: 'Mobile App',
    creatorId: 'USR_09',
    creatorName: 'CloudDev',
    participantsCount: 14,
    maxParticipants: 20,
    stakeAmount: 200,
    prizePool: 2800,
    startDate: '2026-07-20',
    endDate: '2026-08-20',
    status: 'Live',
    rules: ['Official digital badge / PDF score report submission required'],
    participants: [],
    financials: { totalCollected: 2800, lockedCoins: 2800, platformFee: 140, winnerPayout: 2660, refundAmount: 0 },
    settlement: { settlementMethod: 'AI Oracle', status: 'Waiting' },
    timeline: []
  },
  {
    id: 'AB-1250',
    title: 'Alex vs Marcus 1v1 Arm Wrestling Showdown',
    description: 'Head-to-head friendly physical wager between Alex and Marcus.',
    category: 'Friendly Wagers',
    type: 'Peer Wager',
    frequency: 'Single Event',
    source: 'Mobile App',
    creatorId: 'USR_01',
    creatorName: 'Alex_R',
    participantsCount: 2,
    maxParticipants: 2,
    stakeAmount: 100,
    prizePool: 200,
    startDate: '2026-07-23',
    endDate: '2026-07-24',
    status: 'Live',
    rules: ['Both participants must confirm match outcome or submit video proof'],
    participants: [
      { id: 'USR_01', username: 'Alex_R', joinedAt: '2026-07-23', stakeAmount: 100, progressPercent: 100 },
      { id: 'USR_02', username: 'Marcus_S', joinedAt: '2026-07-23', stakeAmount: 100, progressPercent: 100 }
    ],
    financials: { totalCollected: 200, lockedCoins: 200, platformFee: 10, winnerPayout: 190, refundAmount: 0 },
    settlement: { settlementMethod: 'Manual Review', status: 'Waiting' },
    timeline: []
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
      // Ensure all 16 AnyBet pitch deck categories exist
      const existingIds = new Set(items.map(i => i.id))
      const existingNames = new Set(items.map(i => i.name.toLowerCase()))
      
      const missingDefaultCategories = INITIAL_CATEGORIES.filter(
        c => !existingIds.has(c.id) && !existingNames.has(c.name.toLowerCase())
      )

      if (missingDefaultCategories.length > 0) {
        missingDefaultCategories.forEach(c => {
          createCategoryInFirestore(c).catch(err => console.warn('Failed to seed category:', c.name, err))
        })
      }

      const merged = items.length > 0 ? [...items, ...missingDefaultCategories] : INITIAL_CATEGORIES
      merged.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      setCategories(merged)
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
        { id: `t-${Date.now()}`, stage: 'Challenge Created', description: `Created with ${stake} Coins stake`, timestamp: new Date().toLocaleString(), completed: true },
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

  const updateTournamentMatch = (challengeId: string, matchId: string, updates: Partial<TournamentMatch>) => {
    setChallenges(prev => prev.map(c => {
      if (c.id === challengeId) {
        const existingMatches = c.matches || []
        const updatedMatches = existingMatches.map(m => m.id === matchId ? { ...m, ...updates } : m)
        const updated = { ...c, matches: updatedMatches }
        updateChallengeInFirestore(challengeId, { matches: updatedMatches })
        return updated
      }
      return c
    }))
    if (selectedChallenge?.id === challengeId) {
      setSelectedChallenge(prev => prev ? {
        ...prev,
        matches: (prev.matches || []).map(m => m.id === matchId ? { ...m, ...updates } : m)
      } : null)
    }
    showToastNotice('Tournament sub-match updated', 'info')
  }

  const addTournamentMatch = (challengeId: string, match: Omit<TournamentMatch, 'id'>) => {
    const newMatch: TournamentMatch = {
      ...match,
      id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    }
    setChallenges(prev => prev.map(c => {
      if (c.id === challengeId) {
        const updatedMatches = [...(c.matches || []), newMatch]
        const updated = { ...c, matches: updatedMatches }
        updateChallengeInFirestore(challengeId, { matches: updatedMatches })
        return updated
      }
      return c
    }))
    if (selectedChallenge?.id === challengeId) {
      setSelectedChallenge(prev => prev ? {
        ...prev,
        matches: [...(prev.matches || []), newMatch]
      } : null)
    }
    showToastNotice('New tournament sub-match added', 'success')
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
            { id: `t-${Date.now()+1}`, stage: 'Rewards Distributed', description: `${payoutAmount} Coins credited to winner wallet`, timestamp: new Date().toLocaleString(), completed: true },
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

    showToastNotice(`Challenge ${challengeId} settled! ${payoutAmount} Coins paid to ${winnerName}`, 'success')
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
      doc.text(`${totalVolume.toLocaleString()} Coins`, card3X + 4, cardY + 15)

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
      doc.text(`${totalFees.toLocaleString()} Coins`, card4X + 4, cardY + 15)

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
        doc.text(`${c.stakeAmount} Coins`, 148, y)

        doc.setTextColor(16, 185, 129)
        doc.text(`${c.prizePool.toLocaleString()} Coins`, 172, y)

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
    updateTournamentMatch,
    addTournamentMatch,
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
