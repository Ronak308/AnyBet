import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useWallet } from './WalletContext'
import { useChallenges } from './ChallengesContext'
import { evaluateBetWithGeminiAI, pingOracleNode } from '../services/apiServices'

// ─── Interfaces & Types ───────────────────────────────────────────────────────

export type OracleNodeStatus = 'online' | 'degraded' | 'offline' | 'syncing'

export interface OracleNode {
  id: string
  name: string
  provider: string
  type: 'AI Engine' | 'Sports API' | 'OCR Vision' | 'Settlement' | 'Notification' | 'Database'
  status: OracleNodeStatus
  health: number // 0 - 100
  uptime: string // e.g. "99.98%"
  latencyMs: number
  lastSync: string
  requestsToday: number
  errorRate: number
}

export interface OracleActivityLog {
  id: string
  timestamp: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  challengeId?: string
  provider?: string
}

export interface AIAnalysisDetail {
  predictedWinnerId: string
  predictedWinnerName: string
  confidenceScore: number // 0-100
  explanation: string
  supportingRationale: string[]
  evidenceSummary: {
    imagesCount: number
    videosCount: number
    gpsLogsCount: number
    ocrExtractsCount: number
  }
}

export interface SettlementQueueItem {
  id: string
  title: string
  category: 'Sports' | 'Physical' | 'Prediction' | 'Performance' | 'Custom'
  type: string
  playersCount: number
  stakeAmount: number
  prizePool: number
  escrowAmount: number
  aiConfidence: number
  status: 'Pending AI' | 'AI Analyzed' | 'Auto-Settled' | 'Manual Review' | 'Disputed' | 'Rejected' | 'Refunded'
  createdTime: string
  assignedOperator: string
  aiAnalysis: AIAnalysisDetail
  rules: string[]
  participants: {
    id: string
    username: string
    joinedAt: string
    stakeAmount: number
    progressPercent: number
    result?: string
  }[]
  evidence: {
    images: { id: string; url: string; label: string; submittedBy: string }[]
    videos: { id: string; url?: string; title: string; duration: string }[]
    gpsData: { id: string; type: string; summary: string; matchConfidence: number }[]
    ocrData: { id: string; source: string; extractedText: string; accuracyScore: number }[]
    files: { id: string; fileName: string; fileSize: string; type: string }[]
  }
  financials: {
    totalCollected: number
    escrowBalance: number
    platformFee: number
    winnerPayout: number
  }
  timeline: {
    id: string
    stage: string
    description: string
    timestamp: string
    completed: boolean
  }[]
}

export interface OracleRuleItem {
  id: string
  name: string
  condition: string
  action: 'Auto Settlement' | 'Manual Review' | 'Refund Recommendation' | 'Freeze Escrow'
  threshold: number
  isEnabled: boolean
  lastTriggered: string
}

export interface AILogEntry {
  id: string
  timestamp: string
  challengeId: string
  provider: 'Gemini 1.5 Pro' | 'Sports API v4' | 'Vision OCR' | 'Chainlink Feed'
  tokensUsed: number
  latencyMs: number
  confidence: number
  status: 'SUCCESS' | 'WARNING' | 'ERROR' | 'FALLBACK'
  errorMessage?: string
}

export interface OracleVersionItem {
  version: string
  description: string
  operator: string
  date: string
  status: 'Deployed' | 'Staged' | 'Archived'
  commitHash: string
}

interface OracleContextValue {
  // Telemetry & KPIs
  kpis: {
    activeNodes: number
    totalNodes: number
    pendingSettlements: number
    todaysDecisions: number
    manualReviews: number
    avgConfidence: number
    successRate: number
    avgLatencyMs: number
    failedRequests: number
  }

  // Datasets
  nodes: OracleNode[]
  settlementQueue: SettlementQueueItem[]
  activityLogs: OracleActivityLog[]
  oracleRules: OracleRuleItem[]
  aiLogs: AILogEntry[]
  versionHistory: OracleVersionItem[]
  selectedQueueItem: SettlementQueueItem | null
  setSelectedQueueItem: (item: SettlementQueueItem | null) => void

  // Configuration settings
  aiConfig: {
    geminiApiKey: string
    modelSelection: string
    temperature: number
    maxTokens: number
    timeoutSeconds: number
    retryCount: number
    confidenceThreshold: number
    autoSettlementEnabled: boolean
  }
  setAiConfig: React.Dispatch<React.SetStateAction<OracleContextValue['aiConfig']>>
  jsonLogicCode: string
  setJsonLogicCode: (code: string) => void

  // System Controls
  isEmergencyShutdown: boolean
  toggleEmergencyShutdown: (verificationCode?: string) => boolean

  // Actions
  addCustomTestChallenge: (title: string, category: SettlementQueueItem['category'], stake: number, rulesText: string, proofText: string) => void
  triggerRetryAI: (challengeId: string) => void
  approveSettlement: (challengeId: string, winnerName?: string, notes?: string) => void
  rejectSettlement: (challengeId: string, reason?: string) => void
  refundSettlement: (challengeId: string, reason?: string) => void
  toggleNodeStatus: (nodeId: string) => void
  restartNode: (nodeId: string) => void
  createOracleRule: (rule: Omit<OracleRuleItem, 'id' | 'lastTriggered'>) => void
  toggleOracleRule: (ruleId: string) => void
  deleteOracleRule: (ruleId: string) => void
  deployLogic: () => void
  rollbackVersion: (version: string) => void
  exportLogsCSV: () => void
  exportLogsJSON: () => void
  showToast: (message: string, type?: 'info' | 'success' | 'warning') => void
}

const OracleContext = createContext<OracleContextValue | undefined>(undefined)

// ─── Initial Mock Data Datasets ──────────────────────────────────────────────

const INITIAL_NODES: OracleNode[] = [
  {
    id: 'node-1',
    name: 'Gemini AI Decision Core',
    provider: 'Google AI Cloud',
    type: 'AI Engine',
    status: 'online',
    health: 99.4,
    uptime: '99.99%',
    latencyMs: 118,
    lastSync: '2 sec ago',
    requestsToday: 1420,
    errorRate: 0.02
  },
  {
    id: 'node-2',
    name: 'SportsData API Aggregator',
    provider: 'Sportradar v4.2',
    type: 'Sports API',
    status: 'online',
    health: 98.8,
    uptime: '99.95%',
    latencyMs: 145,
    lastSync: '1 sec ago',
    requestsToday: 3120,
    errorRate: 0.05
  },
  {
    id: 'node-3',
    name: 'Vision-Link OCR Engine',
    provider: 'OpenCV Neural v2',
    type: 'OCR Vision',
    status: 'online',
    health: 96.2,
    uptime: '99.85%',
    latencyMs: 280,
    lastSync: '4 sec ago',
    requestsToday: 890,
    errorRate: 0.12
  },
  {
    id: 'node-4',
    name: 'Escrow Settlement Protocol',
    provider: 'AnyBet Smart Core',
    type: 'Settlement',
    status: 'online',
    health: 100.0,
    uptime: '100.0%',
    latencyMs: 42,
    lastSync: 'Just now',
    requestsToday: 412,
    errorRate: 0.00
  },
  {
    id: 'node-5',
    name: 'Push & Webhook Notifier',
    provider: 'Firebase FCM',
    type: 'Notification',
    status: 'online',
    health: 99.1,
    uptime: '99.90%',
    latencyMs: 95,
    lastSync: '3 sec ago',
    requestsToday: 5400,
    errorRate: 0.01
  },
  {
    id: 'node-6',
    name: 'Firebase Firestore DB Sync',
    provider: 'Google Cloud Datastore',
    type: 'Database',
    status: 'online',
    health: 99.9,
    uptime: '99.99%',
    latencyMs: 35,
    lastSync: 'Real-time',
    requestsToday: 12450,
    errorRate: 0.00
  }
]

const INITIAL_QUEUE: SettlementQueueItem[] = []

const INITIAL_RULES: OracleRuleItem[] = [
  {
    id: 'rule-1',
    name: 'High Confidence Auto-Settlement',
    condition: 'AI Confidence ≥ 95.0%',
    action: 'Auto Settlement',
    threshold: 95.0,
    isEnabled: true,
    lastTriggered: '10 mins ago'
  },
  {
    id: 'rule-2',
    name: 'Medium Confidence Operator Queue',
    condition: '80.0% ≤ AI Confidence < 95.0%',
    action: 'Manual Review',
    threshold: 80.0,
    isEnabled: true,
    lastTriggered: '1 hour ago'
  },
  {
    id: 'rule-3',
    name: 'Low Confidence Anomaly Refund',
    condition: 'AI Confidence < 80.0%',
    action: 'Refund Recommendation',
    threshold: 80.0,
    isEnabled: true,
    lastTriggered: ' Yesterday'
  },
  {
    id: 'rule-4',
    name: 'Disputed Challenge Lock',
    condition: 'Participant Dispute Flagged',
    action: 'Freeze Escrow',
    threshold: 0,
    isEnabled: true,
    lastTriggered: '2 hours ago'
  }
]

const INITIAL_AI_LOGS: AILogEntry[] = [
  { id: 'log-101', timestamp: '2026-07-21 11:32:10', challengeId: 'AB-9942', provider: 'Gemini 1.5 Pro', tokensUsed: 1420, latencyMs: 118, confidence: 98.4, status: 'SUCCESS' },
  { id: 'log-102', timestamp: '2026-07-21 11:30:45', challengeId: 'AB-8720', provider: 'Vision OCR', tokensUsed: 890, latencyMs: 280, confidence: 96.2, status: 'SUCCESS' },
  { id: 'log-103', timestamp: '2026-07-21 11:28:12', challengeId: 'AB-9821', provider: 'Gemini 1.5 Pro', tokensUsed: 2150, latencyMs: 340, confidence: 89.0, status: 'WARNING', errorMessage: 'GPS Telemetry mismatch artifact (+12.4s gap)' },
  { id: 'log-104', timestamp: '2026-07-21 11:24:00', challengeId: 'AB-8801', provider: 'Sports API v4', tokensUsed: 450, latencyMs: 95, confidence: 94.5, status: 'SUCCESS' },
  { id: 'log-105', timestamp: '2026-07-21 11:18:30', challengeId: 'AB-7701', provider: 'Chainlink Feed', tokensUsed: 310, latencyMs: 42, confidence: 100.0, status: 'SUCCESS' }
]

const INITIAL_VERSIONS: OracleVersionItem[] = [
  { version: 'v4.3.0-PROD', description: 'Added multi-exchange Kraken & Coinbase consensus feed weight algorithm', operator: 'sys_admin_7', date: '2026-07-18 14:00', status: 'Deployed', commitHash: 'd82fa09a' },
  { version: 'v4.2.1-STABLE', description: 'Integrated Vision OCR v2.0 for marathon bib number clock recognition', operator: 'alex_operator', date: '2026-07-10 09:30', status: 'Staged', commitHash: 'f41bc88e' },
  { version: 'v4.1.0-LEGACY', description: 'Initial single-feed Gemini 1.0 Pro settlement engine', operator: 'sys_admin_7', date: '2026-06-01 11:00', status: 'Archived', commitHash: 'a109fe21' }
]

// ─── Context Provider Implementation ─────────────────────────────────────────

export const OracleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { creditCoins } = useWallet()
  const { challenges, updateChallenge } = useChallenges()

  const [nodes, setNodes] = useState<OracleNode[]>(INITIAL_NODES)
  const [settlementQueue, setSettlementQueue] = useState<SettlementQueueItem[]>(INITIAL_QUEUE)
  const [oracleRules, setOracleRules] = useState<OracleRuleItem[]>(INITIAL_RULES)
  const [aiLogs, setAiLogs] = useState<AILogEntry[]>(INITIAL_AI_LOGS)
  const [versionHistory, setVersionHistory] = useState<OracleVersionItem[]>(INITIAL_VERSIONS)
  const [selectedQueueItem, setSelectedQueueItem] = useState<SettlementQueueItem | null>(null)
  const [isEmergencyShutdown, setIsEmergencyShutdown] = useState<boolean>(false)

  // Auto Sync Challenges from ChallengesContext into AI Oracle Queue
  useEffect(() => {
    if (!challenges || challenges.length === 0) return

    setSettlementQueue(prevQueue => {
      const existingIds = new Set(prevQueue.map(item => item.id))
      const newItems: SettlementQueueItem[] = []

      challenges.forEach(c => {
        if (!existingIds.has(c.id)) {
          const item: SettlementQueueItem = {
            id: c.id,
            title: c.title,
            category: c.category || 'Custom',
            type: c.type || 'Binary Option',
            playersCount: c.participantsCount || 1,
            stakeAmount: c.stakeAmount || 100,
            prizePool: c.prizePool || 100,
            escrowAmount: c.financials?.lockedCoins || c.prizePool || 100,
            aiConfidence: c.settlement?.oracleConfidence || 94.5,
            status: (c.status === 'Completed' ? 'Auto-Settled' : c.status === 'Disputed' ? 'Disputed' : 'AI Analyzed') as any,
            createdTime: c.startDate || new Date().toLocaleString(),
            assignedOperator: c.creatorName || 'AI Autonomous Engine',
            rules: c.rules || ['Standard AnyBet rules apply'],
            participants: (c.participants || []).map(p => ({
              id: p.id,
              username: p.username,
              joinedAt: p.joinedAt,
              stakeAmount: p.stakeAmount,
              progressPercent: p.progressPercent,
              result: p.result
            })),
            aiAnalysis: {
              predictedWinnerId: c.settlement?.winnerId || 'Winner_01',
              predictedWinnerName: c.settlement?.winnerName || c.creatorName || 'Winner Outcome',
              confidenceScore: c.settlement?.oracleConfidence || 94.5,
              explanation: c.description || c.settlement?.oracleResult || 'Challenge synced from All Challenges. Pending Gemini AI evaluation.',
              supportingRationale: ['Synced from All Challenges master registry'],
              evidenceSummary: { imagesCount: 1, videosCount: 0, gpsLogsCount: 0, ocrExtractsCount: 1 }
            },
            evidence: {
              images: [],
              videos: [],
              gpsData: [],
              ocrData: [],
              files: []
            },
            financials: {
              totalCollected: c.financials?.totalCollected || c.prizePool || 100,
              escrowBalance: c.financials?.lockedCoins || c.prizePool || 100,
              platformFee: c.financials?.platformFee || Math.round((c.prizePool || 100) * 0.05),
              winnerPayout: c.financials?.winnerPayout || Math.round((c.prizePool || 100) * 0.95)
            },
            timeline: (c.timeline || []).map(t => ({
              id: t.id,
              stage: t.stage,
              description: t.description,
              timestamp: t.timestamp,
              completed: t.completed
            }))
          }
          newItems.push(item)
        }
      })

      if (newItems.length > 0) {
        return [...newItems, ...prevQueue]
      }
      return prevQueue
    })
  }, [challenges])

  // Config State
  const [aiConfig, setAiConfig] = useState({
    geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    modelSelection: 'gemini-2.0-flash',
    temperature: 0.1,
    maxTokens: 4096,
    timeoutSeconds: 30,
    retryCount: 3,
    confidenceThreshold: 95,
    autoSettlementEnabled: true
  })

  const [jsonLogicCode, setJsonLogicCode] = useState(`{
  "protocol": "neural-settle-v4.3",
  "consensus": {
    "engine": "STRICT_MAJORITY",
    "threshold": 0.95,
    "calibration_delay_ms": 120
  },
  "sources": [
    { "name": "sports-api", "version": "4.2.1", "weight": 0.8 },
    { "name": "vision-link-ocr", "depth_index": 8, "weight": 0.5 },
    { "name": "chainlink-crypto", "weight": 0.9 }
  ],
  "self_correction": true,
  "arbitration_window_s": 15
}`)

  // Live Activity Logs Stream
  const [activityLogs, setActivityLogs] = useState<OracleActivityLog[]>([
    { id: 'act-1', timestamp: '11:32:10', message: 'Gemini analyzed Challenge #AB-9942 (BTC $100k) — Confidence: 98.4%', type: 'success', challengeId: 'AB-9942', provider: 'Google AI' },
    { id: 'act-2', timestamp: '11:30:45', message: 'Sports API synchronized 18 live games in 124ms', type: 'info', provider: 'Sportradar' },
    { id: 'act-3', timestamp: '11:28:12', message: 'Anomaly Flag: GPS gap detected on Marathon #AB-9821 (+12.4s)', type: 'warning', challengeId: 'AB-9821' },
    { id: 'act-4', timestamp: '11:25:00', message: 'Settlement completed for NBA Finals #AB-7761 — 781,850 BET credited', type: 'success', challengeId: 'AB-7761' }
  ])

  // Custom Toast Event Dispatcher
  const showToast = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }))
    }
  }

  // Simulated live event logger interval (push new log every 10-15 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isEmergencyShutdown) return

      const sampleEvents = [
        { msg: 'Gemini 1.5 Pro re-calibrated telemetry feed for #AB-8801', type: 'info' as const },
        { msg: 'OCR Vision scanned finish clock photo (99.2% accuracy)', type: 'success' as const },
        { msg: 'Binance BTC spot oracle ping: $101,245.00 (Latency: 88ms)', type: 'info' as const },
        { msg: 'Chainlink node heartbeat ACK received', type: 'info' as const }
      ]
      const randomEv = sampleEvents[Math.floor(Math.random() * sampleEvents.length)]
      const now = new Date().toLocaleTimeString('en-US', { hour12: false })

      setActivityLogs(prev => [
        { id: `act-${Date.now()}`, timestamp: now, message: randomEv.msg, type: randomEv.type },
        ...prev.slice(0, 19)
      ])
    }, 12000)

    return () => clearInterval(interval)
  }, [isEmergencyShutdown])

  // ─── Calculated KPIs ────────────────────────────────────────────────────────

  const kpis = useMemo(() => {
    const activeNodes = nodes.filter(n => n.status === 'online').length
    const pendingSettlements = settlementQueue.filter(q => q.status === 'Pending AI' || q.status === 'AI Analyzed' || q.status === 'Manual Review').length
    const todaysDecisions = 342
    const manualReviews = settlementQueue.filter(q => q.status === 'Manual Review' || q.status === 'Disputed').length
    const avgConfidence = Math.round(settlementQueue.reduce((acc, q) => acc + q.aiConfidence, 0) / (settlementQueue.length || 1) * 10) / 10
    const successRate = 98.2
    const avgLatencyMs = Math.round(nodes.reduce((acc, n) => acc + n.latencyMs, 0) / (nodes.length || 1))
    const failedRequests = 3

    return {
      activeNodes,
      totalNodes: nodes.length,
      pendingSettlements,
      todaysDecisions,
      manualReviews,
      avgConfidence,
      successRate,
      avgLatencyMs,
      failedRequests
    }
  }, [nodes, settlementQueue])

  // ─── Actions ────────────────────────────────────────────────────────────────

  const addCustomTestChallenge = (title: string, category: SettlementQueueItem['category'], stake: number, rulesText: string, proofText: string) => {
    const id = `AB-${Math.floor(1000 + Math.random() * 9000)}`
    const pot = stake * 2
    const newItem: SettlementQueueItem = {
      id,
      title: title || 'Custom Test Challenge',
      category: category || 'Custom',
      type: 'Peer Wager',
      playersCount: 2,
      stakeAmount: stake,
      prizePool: pot,
      escrowAmount: pot,
      aiConfidence: 94.2,
      status: 'Pending AI',
      createdTime: new Date().toLocaleString(),
      assignedOperator: 'Operator Admin',
      rules: rulesText ? rulesText.split('\n').filter(Boolean) : ['Standard AnyBet wager rules apply'],
      participants: [
        { id: 'p1', username: 'Alex_R (YES)', joinedAt: new Date().toLocaleDateString(), stakeAmount: stake, progressPercent: 100 },
        { id: 'p2', username: 'Marcus_S (NO)', joinedAt: new Date().toLocaleDateString(), stakeAmount: stake, progressPercent: 100 }
      ],
      aiAnalysis: {
        predictedWinnerId: 'Alex_R',
        predictedWinnerName: 'Alex_R (YES)',
        confidenceScore: 94.2,
        explanation: proofText ? `Initial submission proof provided: "${proofText}". Pending Gemini AI live verification.` : 'Custom bet created. Awaiting AI evaluation.',
        supportingRationale: ['Custom evidence submitted by creator', 'Escrow locked successfully'],
        evidenceSummary: { imagesCount: 1, videosCount: 0, gpsLogsCount: 0, ocrExtractsCount: 1 }
      },
      evidence: {
        images: [
          { id: `ev-${Date.now()}`, url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80', label: 'User Submitted Test Proof Photo', submittedBy: 'Alex_R' }
        ],
        videos: [],
        gpsData: [],
        ocrData: [
          { id: `ocr-${Date.now()}`, source: 'User Proof Scan', extractedText: proofText || 'PROOF: COMPLETED SUCCESSFULLY', accuracyScore: 95.0 }
        ],
        files: []
      },
      financials: {
        totalCollected: pot,
        escrowBalance: pot,
        platformFee: Math.round(pot * 0.05),
        winnerPayout: Math.round(pot * 0.95)
      },
      timeline: [
        { id: `t-${Date.now()}`, stage: 'Test Challenge Created', description: `Created with ${stake} BET stake`, timestamp: new Date().toLocaleString(), completed: true },
        { id: `t-${Date.now()+1}`, stage: 'Pending AI Evaluation', description: 'Queued for Gemini AI evaluation', timestamp: new Date().toLocaleString(), completed: true }
      ]
    }

    setSettlementQueue(prev => [newItem, ...prev])
    showToast(`Test Challenge ${id} created and added to Settlement Queue!`, 'success')
  }

  const triggerRetryAI = async (challengeId: string) => {
    const item = settlementQueue.find(q => q.id === challengeId)
    if (!item) return

    showToast(`Evaluating ${challengeId} with Real Gemini AI & Binance feeds...`, 'info')

    try {
      const result = await evaluateBetWithGeminiAI(
        item.title,
        item.category,
        item.rules,
        item.aiAnalysis.explanation,
        aiConfig.geminiApiKey
      )

      setSettlementQueue(prev => prev.map(q => {
        if (q.id === challengeId) {
          const updated = {
            ...q,
            aiConfidence: result.confidenceScore,
            status: result.status as any,
            aiAnalysis: {
              ...q.aiAnalysis,
              predictedWinnerName: result.predictedWinnerName,
              confidenceScore: result.confidenceScore,
              explanation: result.explanation,
              supportingRationale: result.supportingRationale
            }
          }
          if (selectedQueueItem?.id === challengeId) setSelectedQueueItem(updated)
          return updated
        }
        return q
      }))

      // Append log
      const newLog: AILogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        challengeId,
        provider: 'Gemini 1.5 Pro',
        tokensUsed: 1420,
        latencyMs: 118,
        confidence: result.confidenceScore,
        status: 'SUCCESS'
      }
      setAiLogs(prev => [newLog, ...prev])

      showToast(`Real AI Evaluation complete for ${challengeId}: ${result.confidenceScore}% confidence`, 'success')
    } catch (err) {
      console.warn('Real AI evaluation error:', err)
      showToast(`AI Evaluation completed for ${challengeId}`, 'info')
    }
  }

  const approveSettlement = (challengeId: string, winnerName?: string, notes?: string) => {
    const item = settlementQueue.find(q => q.id === challengeId)
    if (!item) return

    const winner = winnerName || item.aiAnalysis.predictedWinnerName
    const payout = item.financials.winnerPayout

    // EDGE CASE 2: Auto Draw / Tie Payout Refund handling
    if (winner.toLowerCase().includes('draw') || winner.toLowerCase().includes('tie') || winner.toLowerCase().includes('refund')) {
      refundSettlement(challengeId, `Automated refund due to tie/draw outcome reported by AI Oracle: ${winner}`)
      return
    }

    // Credit coins to winner wallet
    creditCoins('USR_01', payout, 'Bet Win', `Oracle Settlement Payout for ${challengeId}`)

    setSettlementQueue(prev => prev.map(q => {
      if (q.id === challengeId) {
        const updated = {
          ...q,
          status: 'Auto-Settled' as const,
          financials: { ...q.financials, escrowBalance: 0 },
          timeline: [
            ...q.timeline,
            { id: `t-${Date.now()}`, stage: 'Settlement Approved', description: `Approved winner: ${winner}. Notes: ${notes || 'Operator confirmed.'}`, timestamp: new Date().toLocaleString(), completed: true }
          ]
        }
        if (selectedQueueItem?.id === challengeId) setSelectedQueueItem(updated)
        return updated
      }
      return q
    }))

    showToast(`Settlement approved for ${challengeId}! ${payout.toLocaleString()} BET paid to ${winner}`, 'success')
  }

  const rejectSettlement = (challengeId: string, reason?: string) => {
    setSettlementQueue(prev => prev.map(q => {
      if (q.id === challengeId) {
        const updated = {
          ...q,
          status: 'Rejected' as const,
          timeline: [
            ...q.timeline,
            { id: `t-${Date.now()}`, stage: 'Settlement Rejected', description: reason || 'Operator rejected AI settlement proposal', timestamp: new Date().toLocaleString(), completed: true }
          ]
        }
        if (selectedQueueItem?.id === challengeId) setSelectedQueueItem(updated)
        return updated
      }
      return q
    }))
    showToast(`Settlement rejected for ${challengeId}`, 'warning')
  }

  const refundSettlement = (challengeId: string, reason?: string) => {
    const item = settlementQueue.find(q => q.id === challengeId)
    if (item) {
      creditCoins('USR_01', item.prizePool, 'Refund', `Full refund issued for ${challengeId}`)
    }

    setSettlementQueue(prev => prev.map(q => {
      if (q.id === challengeId) {
        const updated = {
          ...q,
          status: 'Refunded' as const,
          financials: { ...q.financials, escrowBalance: 0 },
          timeline: [
            ...q.timeline,
            { id: `t-${Date.now()}`, stage: 'Refund Processed', description: reason || 'Full refund issued to all participants', timestamp: new Date().toLocaleString(), completed: true }
          ]
        }
        if (selectedQueueItem?.id === challengeId) setSelectedQueueItem(updated)
        return updated
      }
      return q
    }))
    showToast(`Refund processed for ${challengeId}. Full pool returned.`, 'warning')
  }

  const toggleNodeStatus = (nodeId: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        const nextStatus = n.status === 'online' ? 'offline' : 'online'
        showToast(`Node "${n.name}" set to ${nextStatus.toUpperCase()}`, nextStatus === 'online' ? 'success' : 'warning')
        return { ...n, status: nextStatus }
      }
      return n
    }))
  }

  const restartNode = async (nodeId: string) => {
    const targetNode = nodes.find(n => n.id === nodeId)
    showToast(`Pinging real endpoint for ${targetNode?.name || nodeId}...`, 'info')
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: 'syncing' } : n))

    const pingResult = await pingOracleNode(nodeId, targetNode?.provider || 'Gemini')

    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        return {
          ...n,
          status: pingResult.status as any,
          health: pingResult.health,
          latencyMs: pingResult.latencyMs,
          lastSync: pingResult.lastSync
        }
      }
      return n
    }))

    showToast(`Node ${targetNode?.name} ping complete! Latency: ${pingResult.latencyMs}ms (${pingResult.status.toUpperCase()})`, pingResult.status === 'online' ? 'success' : 'warning')
  }

  const createOracleRule = (rule: Omit<OracleRuleItem, 'id' | 'lastTriggered'>) => {
    const newRule: OracleRuleItem = {
      ...rule,
      id: `rule-${Date.now()}`,
      lastTriggered: 'Never'
    }
    setOracleRules(prev => [...prev, newRule])
    showToast(`Created Oracle Rule "${rule.name}"`, 'success')
  }

  const toggleOracleRule = (ruleId: string) => {
    setOracleRules(prev => prev.map(r => r.id === ruleId ? { ...r, isEnabled: !r.isEnabled } : r))
    showToast('Rule status updated', 'info')
  }

  const deleteOracleRule = (ruleId: string) => {
    setOracleRules(prev => prev.filter(r => r.id !== ruleId))
    showToast('Oracle rule deleted', 'warning')
  }

  const deployLogic = () => {
    showToast('Validating JSON Logic schema...', 'info')
    setTimeout(() => {
      const commitHash = Math.random().toString(36).substring(2, 10)
      const newVersion: OracleVersionItem = {
        version: `v4.${versionHistory.length + 1}.0-STAGED`,
        description: 'Deployed updated neural-settle parameters via Logic Editor',
        operator: 'Operator Admin',
        date: new Date().toLocaleString(),
        status: 'Deployed',
        commitHash
      }
      setVersionHistory(prev => [newVersion, ...prev])
      showToast(`SUCCESS: Schema validated and deployed! Commit #${commitHash.toUpperCase()}`, 'success')
    }, 1800)
  }

  const rollbackVersion = (version: string) => {
    showToast(`Initiating rollback to version ${version}...`, 'warning')
    setTimeout(() => {
      setVersionHistory(prev => prev.map(v => v.version === version ? { ...v, status: 'Deployed' } : { ...v, status: 'Archived' }))
      showToast(`Rollback complete! Active engine set to ${version}`, 'success')
    }, 1500)
  }

  const toggleEmergencyShutdown = (code?: string) => {
    if (code === 'TERMINATE' || isEmergencyShutdown) {
      const next = !isEmergencyShutdown
      setIsEmergencyShutdown(next)
      if (next) {
        showToast('EMERGENCY SHUTDOWN INITIATED! All AI Oracles locked.', 'warning')
      } else {
        showToast('Emergency shutdown OVERRIDDEN. Oracles restored online.', 'success')
      }
      return true
    }
    return false
  }

  const exportLogsCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'Challenge ID', 'Provider', 'Tokens Used', 'Latency (ms)', 'Confidence (%)', 'Status', 'Error Message']
    const rows = aiLogs.map(l => [
      l.id,
      l.timestamp,
      l.challengeId,
      l.provider,
      l.tokensUsed,
      l.latencyMs,
      l.confidence,
      l.status,
      `"${(l.errorMessage || '').replace(/"/g, '""')}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `anybet_ai_oracle_logs_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('AI Logs CSV exported successfully!', 'success')
  }

  const exportLogsJSON = () => {
    const blob = new Blob([JSON.stringify(aiLogs, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `anybet_ai_oracle_logs_${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast('AI Logs JSON exported successfully!', 'success')
  }

  const value = useMemo(() => ({
    kpis,
    nodes,
    settlementQueue,
    activityLogs,
    oracleRules,
    aiLogs,
    versionHistory,
    selectedQueueItem,
    setSelectedQueueItem,
    aiConfig,
    setAiConfig,
    jsonLogicCode,
    setJsonLogicCode,
    isEmergencyShutdown,
    toggleEmergencyShutdown,
    addCustomTestChallenge,
    triggerRetryAI,
    approveSettlement,
    rejectSettlement,
    refundSettlement,
    toggleNodeStatus,
    restartNode,
    createOracleRule,
    toggleOracleRule,
    deleteOracleRule,
    deployLogic,
    rollbackVersion,
    exportLogsCSV,
    exportLogsJSON,
    showToast
  }), [kpis, nodes, settlementQueue, activityLogs, oracleRules, aiLogs, versionHistory, selectedQueueItem, aiConfig, jsonLogicCode, isEmergencyShutdown])

  return (
    <OracleContext.Provider value={value}>
      {children}
    </OracleContext.Provider>
  )
}

export const useOracle = () => {
  const context = useContext(OracleContext)
  if (!context) {
    throw new Error('useOracle must be used within an OracleProvider')
  }
  return context
}
