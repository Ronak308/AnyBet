import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  subscribeToWallets,
  subscribeToTransactions,
  subscribeToWithdrawals,
  subscribeToCoinPackages,
  updateWalletInFirestore,
  createWalletInFirestore,
  addTransactionToFirestore,
  saveCoinPackageInFirestore,
  deleteCoinPackageFromFirestore
} from '../services/financialsService'

// ─── Interfaces & Types ───────────────────────────────────────────────────────

export type TransactionType = 'Deposit' | 'Reward' | 'Bet Stake' | 'Bet Win' | 'Refund' | 'Withdrawal'
export type TransactionStatus = 'Settled' | 'Pending' | 'Failed'
export type WalletStatus = 'Active' | 'Frozen'

export interface UserWallet {
  id: string
  userId: string
  username: string
  avatar?: string
  totalBalance: number // In Coins
  lockedBalance: number // Locked in active bets
  status: WalletStatus
  createdAt: string
  lastActivity: string
}

export interface CoinTransaction {
  id: string
  txHash: string
  userId: string
  username: string
  type: TransactionType
  amount: number
  status: TransactionStatus
  timestamp: string
  description: string
}

export interface CoinPackage {
  id: string
  name: string
  coins: number
  bonusCoins: number
  tag?: string
  priceUsd: number
  isEnabled: boolean
}

export interface RewardRule {
  id: string
  name?: string
  event: string
  trigger?: string
  rewardCoins?: number
  coinReward: number
  xpReward: number
  cooldownHours: number
  isEnabled?: boolean
}

export interface BonusCampaign {
  id: string
  name?: string
  code?: string
  title: string
  type: string
  bonusCoins: number
  minStake: number
  currentClaims?: number
  maxClaims?: number
  status: 'Active' | 'Upcoming' | 'Expired'
  expiresAt: string
}

export interface WithdrawalRequest {
  id: string
  userId: string
  username: string
  amount: number
  status: 'Pending' | 'Approved' | 'Rejected'
  requestedAt: string
  processedAt?: string
  payoutMethod?: 'Crypto (USDT)' | 'Bank Wire' | 'PayPal' | 'Plaid ACH' | 'Stripe Direct'
  payoutDetails?: string
  txHash?: string
  taxDeducted?: number
  feeDeducted?: number
  netDisbursed?: number
  adminNotes?: string
  twoFactorAuth?: 'Biometric Passkey' | 'SMS OTP' | 'Email 2FA'
  riskScore?: number
  plaidAccount?: string
  verifiedAt?: string
}

export interface TreasuryStats {
  totalCoinsIssued: number
  coinsInCirculation: number
  coinsLockedInBets: number
  totalRewardsDistributed: number
  pendingWithdrawals: number
  platformReserve: number
  totalCollectedFees?: number
  platformFeePercent?: number
  reserveFundBalance?: number
}

interface WalletContextValue {
  wallets: UserWallet[]
  transactions: CoinTransaction[]
  coinPackages: CoinPackage[]
  rewardRules: RewardRule[]
  bonusCampaigns: BonusCampaign[]
  withdrawalRequests: WithdrawalRequest[]
  treasury: TreasuryStats
  totalCoinsIssued: number
  coinsInCirculation: number
  coinsLockedInBets: number
  totalRewardsDistributed: number
  pendingWithdrawalCount: number
  dailyRewardConfig: {
    dailyCoins: number
    cooldownHours: number
    streakMultipliers: number[]
  }
  userLastClaimTimestamp: number | null
  
  // Core Actions
  creditCoins: (userId: string, amount: number, type: TransactionType, description: string) => boolean
  debitCoins: (userId: string, amount: number, type: TransactionType, description: string) => boolean
  lockCoins: (userId: string, amount: number, challengeId: string) => boolean
  unlockCoins: (userId: string, amount: number, challengeId: string) => boolean
  freezeWallet: (walletId: string) => void
  unfreezeWallet: (walletId: string) => void
  resetWallet: (walletId: string, newBalance?: number) => void
  createWallet: (userId: string, username: string) => void
  platformFeePercent: number
  updatePlatformFeePercent: (percent: number) => void
  
  // Package Actions
  createCoinPackage: (pkg: Omit<CoinPackage, 'id'>) => void
  updateCoinPackage: (id: string, pkg: Partial<CoinPackage>) => void
  deleteCoinPackage: (id: string) => void
  toggleCoinPackage: (id: string) => void
  
  // Reward Actions
  claimDailyReward: (userId: string) => { success: boolean; message: string; coinsGranted?: number }
  updateDailyRewardConfig: (config: Partial<{ dailyCoins: number; cooldownHours: number; streakMultipliers: number[] }>) => void
  updateRewardRule: (ruleId: string, updates: Partial<RewardRule>) => void
  toggleRewardRule: (ruleId: string) => void
  createBonusCampaign: (camp: Omit<BonusCampaign, 'id' | 'currentClaims'>) => void
  updateBonusCampaign: (id: string, updates: Partial<BonusCampaign>) => void
  deleteBonusCampaign: (id: string) => void
  redeemPromoCode: (userId: string, code: string) => { success: boolean; message: string; coinsGranted?: number }
  
  // Withdrawal Actions
  approveWithdrawal: (
    requestId: string,
    txHash?: string,
    taxDeducted?: number,
    feeDeducted?: number,
    netDisbursed?: number,
    adminNotes?: string
  ) => void
  rejectWithdrawal: (requestId: string, adminNotes?: string) => void
  requestWithdrawal: (userId: string, username: string, amount: number) => { success: boolean; message: string }
}

// ─── Initial Mock Data ────────────────────────────────────────────────────────

const INITIAL_WALLETS: UserWallet[] = []

const INITIAL_TRANSACTIONS: CoinTransaction[] = []

const INITIAL_PACKAGES: CoinPackage[] = [
  { id: 'pkg_starter', name: 'Starter Pack', coins: 10, bonusCoins: 1, tag: 'POPULAR', priceUsd: 10, isEnabled: true },
  { id: 'pkg_pro', name: 'Pro Pack', coins: 50, bonusCoins: 5, tag: 'BEST VALUE', priceUsd: 50, isEnabled: true },
  { id: 'pkg_highroller', name: 'High Roller Pack', coins: 200, bonusCoins: 25, tag: 'VIP BONUS', priceUsd: 200, isEnabled: true },
]

const INITIAL_REWARD_RULES: RewardRule[] = [
  { id: 'rr_1', event: 'Daily Login', coinReward: 2, xpReward: 10, cooldownHours: 24 },
  { id: 'rr_2', event: 'Win Physical Challenge', coinReward: 5, xpReward: 25, cooldownHours: 0 },
  { id: 'rr_3', event: 'Win Prediction Market', coinReward: 10, xpReward: 30, cooldownHours: 0 },
  { id: 'rr_4', event: 'Participate Loss Consolation', coinReward: 1, xpReward: 5, cooldownHours: 0 },
]

const INITIAL_CAMPAIGNS: BonusCampaign[] = [
  { id: 'cmp_1', title: 'Welcome Bonus', type: 'Onboarding', bonusCoins: 10, minStake: 0, status: 'Active', expiresAt: '2026-12-31' },
  { id: 'cmp_2', title: 'Weekly Prediction League', type: 'Tournament', bonusCoins: 50, minStake: 10, status: 'Active', expiresAt: '2026-07-27' },
]

const INITIAL_WITHDRAWALS: WithdrawalRequest[] = []

// ─── Local Storage Keys ──────────────────────────────────────────────────────

const STORAGE_WALLETS = 'anybet_wallets'
const STORAGE_TRANSACTIONS = 'anybet_transactions'
const STORAGE_PACKAGES = 'anybet_packages'
const STORAGE_WITHDRAWALS = 'anybet_withdrawals'
const STORAGE_CLAIM_TIMESTAMP = 'anybet_last_claim_ts'

// ─── Context Definition ──────────────────────────────────────────────────────

const WalletContext = createContext<WalletContextValue | null>(null)

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallets, setWallets] = useState<UserWallet[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_WALLETS)
      if (saved) {
        const parsed: UserWallet[] = JSON.parse(saved)
        return parsed.filter(w => !['USR_01', 'USR_02', 'USR_03', 'USR_04'].includes(w.userId) && !['USR_01', 'USR_02', 'USR_03', 'USR_04', 'wal_1', 'wal_2', 'wal_3', 'wal_4'].includes(w.id))
      }
      return INITIAL_WALLETS
    } catch {
      return INITIAL_WALLETS
    }
  })

  const [transactions, setTransactions] = useState<CoinTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TRANSACTIONS)
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS
    } catch {
      return INITIAL_TRANSACTIONS
    }
  })

  const [coinPackages, setCoinPackages] = useState<CoinPackage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PACKAGES)
      return saved ? JSON.parse(saved) : INITIAL_PACKAGES
    } catch {
      return INITIAL_PACKAGES
    }
  })

  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_WITHDRAWALS)
      return saved ? JSON.parse(saved) : INITIAL_WITHDRAWALS
    } catch {
      return INITIAL_WITHDRAWALS
    }
  })

  const [bonusCampaigns, setBonusCampaigns] = useState<BonusCampaign[]>(() => {
    try {
      const saved = localStorage.getItem('anybet_campaigns')
      return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS
    } catch {
      return INITIAL_CAMPAIGNS
    }
  })

  const [rewardRules, setRewardRules] = useState<RewardRule[]>(() => {
    try {
      const saved = localStorage.getItem('anybet_reward_rules')
      return saved ? JSON.parse(saved) : INITIAL_REWARD_RULES
    } catch {
      return INITIAL_REWARD_RULES
    }
  })

  const [platformFeePercent, setPlatformFeePercent] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('anybet_platform_fee')
      return saved ? parseInt(saved, 10) : 5
    } catch {
      return 5
    }
  })

  const [dailyRewardConfig, setDailyRewardConfig] = useState<{ dailyCoins: number; cooldownHours: number; streakMultipliers: number[] }>(() => {
    try {
      const saved = localStorage.getItem('anybet_daily_reward_config')
      return saved ? JSON.parse(saved) : {
        dailyCoins: 2,
        cooldownHours: 24,
        streakMultipliers: [1.0, 1.2, 1.5, 1.8, 2.0, 2.5, 3.0]
      }
    } catch {
      return {
        dailyCoins: 2,
        cooldownHours: 24,
        streakMultipliers: [1.0, 1.2, 1.5, 1.8, 2.0, 2.5, 3.0]
      }
    }
  })

  const [userLastClaimTimestamp, setUserLastClaimTimestamp] = useState<number | null>(() => {
    const saved = localStorage.getItem(STORAGE_CLAIM_TIMESTAMP)
    return saved ? parseInt(saved, 10) : null
  })

  // Firestore Subscriptions
  useEffect(() => {
    const unsubWallets = subscribeToWallets((items: UserWallet[]) => {
      const filtered = items.filter(w => !['USR_01', 'USR_02', 'USR_03', 'USR_04'].includes(w.userId) && !['USR_01', 'USR_02', 'USR_03', 'USR_04', 'wal_1', 'wal_2', 'wal_3', 'wal_4'].includes(w.id))
      setWallets(filtered)
    })
    const unsubTxs = subscribeToTransactions((items: CoinTransaction[]) => {
      const filtered = items.filter(t => !['USR_01', 'USR_02', 'USR_03', 'USR_04'].includes(t.userId))
      setTransactions(filtered)
    })
    const unsubWithdrawals = subscribeToWithdrawals((items: WithdrawalRequest[]) => {
      setWithdrawalRequests(items)
    })
    const unsubPackages = subscribeToCoinPackages((items: CoinPackage[]) => {
      if (items.length > 0) setCoinPackages(items)
    })

    return () => {
      unsubWallets?.()
      unsubTxs?.()
      unsubWithdrawals?.()
      unsubPackages?.()
    }
  }, [])

  // Helper generator for tx hashes
  const generateTxHash = () => {
    const chars = '0123456789ABCDEF'
    let hash = '0x'
    for (let i = 0; i < 3; i++) hash += chars[Math.floor(Math.random() * chars.length)]
    hash += '...'
    for (let i = 0; i < 3; i++) hash += chars[Math.floor(Math.random() * chars.length)]
    return hash
  }

  // ─── Actions ─────────────────────────────────────────────────────────────

  const createTransactionRecord = useCallback((
    userId: string,
    username: string,
    type: TransactionType,
    amount: number,
    status: TransactionStatus,
    description: string
  ) => {
    const newTx: CoinTransaction = {
      id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      txHash: generateTxHash(),
      userId,
      username,
      type,
      amount,
      status,
      timestamp: new Date().toISOString(),
      description
    }
    setTransactions(prev => [newTx, ...prev])
    addTransactionToFirestore(newTx)
  }, [])

  const creditCoins = useCallback((userId: string, amount: number, type: TransactionType, description: string) => {
    setWallets(prev => prev.map(w => {
      if (w.userId === userId || w.id === userId) {
        createTransactionRecord(w.userId, w.username, type, amount, 'Settled', description)
        const updated = {
          ...w,
          totalBalance: w.totalBalance + amount,
          lastActivity: 'Just now'
        }
        updateWalletInFirestore(w.id, updated)
        return updated
      }
      return w
    }))
    return true
  }, [createTransactionRecord])

  const debitCoins = useCallback((userId: string, amount: number, type: TransactionType, description: string) => {
    let success = false
    setWallets(prev => prev.map(w => {
      if (w.userId === userId || w.id === userId) {
        if (w.totalBalance >= amount && w.status === 'Active') {
          createTransactionRecord(w.userId, w.username, type, amount, 'Settled', description)
          success = true
          const updated = {
            ...w,
            totalBalance: w.totalBalance - amount,
            lastActivity: 'Just now'
          }
          updateWalletInFirestore(w.id, updated)
          return updated
        }
      }
      return w
    }))
    return success
  }, [createTransactionRecord])

  const lockCoins = useCallback((userId: string, amount: number, challengeId: string) => {
    let success = false
    setWallets(prev => prev.map(w => {
      if (w.userId === userId || w.id === userId) {
        if (w.totalBalance >= amount && w.status === 'Active') {
          createTransactionRecord(w.userId, w.username, 'Bet Stake', amount, 'Settled', `Staked in Challenge ${challengeId}`)
          success = true
          const updated = {
            ...w,
            totalBalance: w.totalBalance - amount,
            lockedBalance: w.lockedBalance + amount,
            lastActivity: 'Just now'
          }
          updateWalletInFirestore(w.id, updated)
          return updated
        }
      }
      return w
    }))
    return success
  }, [createTransactionRecord])

  const unlockCoins = useCallback((userId: string, amount: number, _challengeId: string) => {
    setWallets(prev => prev.map(w => {
      if (w.userId === userId || w.id === userId) {
        const unlockAmt = Math.min(w.lockedBalance, amount)
        const updated = {
          ...w,
          totalBalance: w.totalBalance + unlockAmt, // FIX: return to total balance
          lockedBalance: w.lockedBalance - unlockAmt,
          lastActivity: 'Just now'
        }
        updateWalletInFirestore(w.id, updated)
        return updated
      }
      return w
    }))
    return true
  }, [])

  const freezeWallet = useCallback((walletId: string) => {
    setWallets(prev => prev.map(w => {
      if (w.id === walletId) {
        const updated = { ...w, status: 'Frozen' as const }
        updateWalletInFirestore(w.id, { status: 'Frozen' })
        return updated
      }
      return w
    }))
  }, [])

  const unfreezeWallet = useCallback((walletId: string) => {
    setWallets(prev => prev.map(w => {
      if (w.id === walletId) {
        const updated = { ...w, status: 'Active' as const }
        updateWalletInFirestore(w.id, { status: 'Active' })
        return updated
      }
      return w
    }))
  }, [])

  const resetWallet = useCallback((walletId: string, newBalance = 1000) => {
    setWallets(prev => prev.map(w => {
      if (w.id === walletId) {
        createTransactionRecord(w.userId, w.username, 'Deposit', newBalance, 'Settled', 'Operator Wallet Reset')
        const updated = { ...w, totalBalance: newBalance, lockedBalance: 0, status: 'Active' as const, lastActivity: 'Just now' }
        updateWalletInFirestore(w.id, updated)
        return updated
      }
      return w
    }))
  }, [createTransactionRecord])

  const createWallet = useCallback((userId: string, username: string) => {
    // Check if wallet already exists
    const exists = wallets.some(w => w.userId === userId)
    if (exists) return

    // Find dynamic Welcome Bonus from campaigns state
    const welcomeCmp = bonusCampaigns.find(c => c.title.toLowerCase().includes('welcome') || c.id === 'cmp_1')
    const welcomeAmount = (welcomeCmp && welcomeCmp.status === 'Active') ? welcomeCmp.bonusCoins : 0

    const newWallet: UserWallet = {
      id: `wal_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId,
      username,
      totalBalance: welcomeAmount,
      lockedBalance: 0,
      status: 'Active' as const,
      createdAt: new Date().toISOString(),
      lastActivity: 'Account Created'
    }

    setWallets(prev => {
      const updated = [newWallet, ...prev]
      localStorage.setItem(STORAGE_WALLETS, JSON.stringify(updated))
      return updated
    })

    if (welcomeAmount > 0) {
      createTransactionRecord(userId, username, 'Reward', welcomeAmount, 'Settled', `Dynamic Welcome Bonus Claimed`)
    }

    createWalletInFirestore(newWallet)
  }, [wallets, bonusCampaigns, createTransactionRecord])

  // Package management
  const createCoinPackage = useCallback((pkg: Omit<CoinPackage, 'id'>) => {
    const newPkg: CoinPackage = {
      ...pkg,
      id: `pkg_${Date.now()}`
    }
    setCoinPackages(prev => [...prev, newPkg])
    saveCoinPackageInFirestore(newPkg)
  }, [])

  const updateCoinPackage = useCallback((id: string, pkg: Partial<CoinPackage>) => {
    setCoinPackages(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...pkg }
        saveCoinPackageInFirestore(updated)
        return updated
      }
      return p
    }))
  }, [])

  const deleteCoinPackage = useCallback((id: string) => {
    setCoinPackages(prev => prev.filter(p => p.id !== id))
    deleteCoinPackageFromFirestore(id)
  }, [])

  const toggleCoinPackage = useCallback((id: string) => {
    setCoinPackages(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, isEnabled: !p.isEnabled }
        saveCoinPackageInFirestore(updated)
        return updated
      }
      return p
    }))
  }, [])

  // Reward management
  const claimDailyReward = useCallback((userId: string) => {
    const now = Date.now()
    const cooldownMs = dailyRewardConfig.cooldownHours * 60 * 60 * 1000

    if (userLastClaimTimestamp && (now - userLastClaimTimestamp < cooldownMs)) {
      const remainingMs = cooldownMs - (now - userLastClaimTimestamp)
      const hoursLeft = Math.ceil(remainingMs / (1000 * 60 * 60))
      return { success: false, message: `Cooldown active. Please try again in ${hoursLeft}h.` }
    }

    const grantAmount = dailyRewardConfig.dailyCoins
    setUserLastClaimTimestamp(now)
    localStorage.setItem(STORAGE_CLAIM_TIMESTAMP, now.toString())

    creditCoins(userId, grantAmount, 'Reward', 'Claimed Daily Login Reward (+100 Coins)')

    return {
      success: true,
      message: `Successfully claimed +${grantAmount} Coins!`,
      coinsGranted: grantAmount
    }
  }, [dailyRewardConfig, userLastClaimTimestamp, creditCoins])

  const updateDailyRewardConfig = useCallback((config: Partial<{ dailyCoins: number; cooldownHours: number; streakMultipliers: number[] }>) => {
    setDailyRewardConfig(prev => {
      const updated = { ...prev, ...config }
      localStorage.setItem('anybet_daily_reward_config', JSON.stringify(updated))
      return updated
    })
  }, [])

  const updateRewardRule = useCallback((ruleId: string, updates: Partial<RewardRule>) => {
    setRewardRules(prev => {
      const updated = prev.map(r => r.id === ruleId ? { ...r, ...updates } : r)
      localStorage.setItem('anybet_reward_rules', JSON.stringify(updated))
      return updated
    })
  }, [])

  const toggleRewardRule = useCallback((ruleId: string) => {
    setRewardRules(prev => {
      const updated = prev.map(r => r.id === ruleId ? { ...r, isEnabled: r.isEnabled === false } : r)
      localStorage.setItem('anybet_reward_rules', JSON.stringify(updated))
      return updated
    })
  }, [])

  const updateBonusCampaign = useCallback((id: string, updates: Partial<BonusCampaign>) => {
    setBonusCampaigns(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c)
      localStorage.setItem('anybet_campaigns', JSON.stringify(updated))
      return updated
    })
  }, [])

  const createBonusCampaign = useCallback((camp: Omit<BonusCampaign, 'id' | 'currentClaims'>) => {
    const newCamp: BonusCampaign = {
      ...camp,
      id: `cmp_${Date.now()}`,
      currentClaims: 0
    }
    setBonusCampaigns(prev => {
      const updated = [newCamp, ...prev]
      localStorage.setItem('anybet_campaigns', JSON.stringify(updated))
      return updated
    })
  }, [])

  const deleteBonusCampaign = useCallback((id: string) => {
    setBonusCampaigns(prev => {
      const updated = prev.filter(c => c.id !== id)
      localStorage.setItem('anybet_campaigns', JSON.stringify(updated))
      return updated
    })
  }, [])

  const redeemPromoCode = useCallback((userId: string, codeStr: string) => {
    const code = codeStr.trim().toUpperCase()
    let rewardAmt = 0
    let matchedCamp: BonusCampaign | null = null

    // Find the campaign matching the code
    setBonusCampaigns(prev => {
      const target = prev.find(c => c.code?.toUpperCase() === code && c.status === 'Active')
      if (target) {
        const claims = target.currentClaims || 0
        const max = target.maxClaims || 9999
        if (claims < max) {
          rewardAmt = target.bonusCoins
          matchedCamp = target
          const updated = prev.map(c => c.id === target.id ? { ...c, currentClaims: claims + 1 } : c)
          localStorage.setItem('anybet_campaigns', JSON.stringify(updated))
          return updated
        }
      }
      return prev
    })

    if (!matchedCamp) {
      return { success: false, message: 'Invalid, inactive, or fully claimed promotional code.' }
    }

    // Find user details to credit coins
    const uWallet = wallets.find(w => w.userId === userId || w.id === userId)
    if (!uWallet) {
      return { success: false, message: 'User wallet not found.' }
    }

    creditCoins(uWallet.userId, rewardAmt, 'Reward', `Promo code ${code} redeemed successfully`)
    return {
      success: true,
      message: `Promo code ${code} redeemed! Credited +${rewardAmt} Coins to @${uWallet.username}`,
      coinsGranted: rewardAmt
    }
  }, [wallets, creditCoins])

  // Withdrawal management
  const requestWithdrawal = useCallback((userId: string, username: string, amount: number) => {
    let allowed = false
    setWallets(prev => prev.map(w => {
      if ((w.userId === userId || w.username === username) && w.totalBalance >= amount) {
        allowed = true
        return {
          ...w,
          totalBalance: w.totalBalance - amount,
          lastActivity: 'Just now'
        }
      }
      return w
    }))

    if (!allowed) {
      return { success: false, message: 'Insufficient Coin balance for withdrawal request.' }
    }

    const req: WithdrawalRequest = {
      id: `wd_${Date.now()}`,
      userId,
      username,
      amount,
      status: 'Pending',
      requestedAt: new Date().toISOString()
    }

    setWithdrawalRequests(prev => [req, ...prev])
    createTransactionRecord(userId, username, 'Withdrawal', amount, 'Pending', 'Virtual Coin Redemption Requested')

    return { success: true, message: 'Withdrawal request submitted for operator review.' }
  }, [createTransactionRecord])

  const approveWithdrawal = useCallback((
    requestId: string,
    txHash?: string,
    taxDeducted?: number,
    feeDeducted?: number,
    netDisbursed?: number,
    adminNotes?: string
  ) => {
    setWithdrawalRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        createTransactionRecord(
          req.userId, 
          req.username, 
          'Withdrawal', 
          req.amount, 
          'Settled', 
          `Withdrawal Approved: Disbursed $${netDisbursed || req.amount} (Tax: $${taxDeducted || 0}, Fee: $${feeDeducted || 0})`
        )
        return { 
          ...req, 
          status: 'Approved', 
          processedAt: new Date().toISOString(),
          txHash,
          taxDeducted,
          feeDeducted,
          netDisbursed,
          adminNotes
        }
      }
      return req
    }))
  }, [createTransactionRecord])

  const rejectWithdrawal = useCallback((requestId: string, adminNotes?: string) => {
    setWithdrawalRequests(prev => prev.map(req => {
      if (req.id === requestId && req.status === 'Pending') {
        // Refund coins back to user
        creditCoins(req.userId, req.amount, 'Refund', `Withdrawal Rejected - Coins Refunded. Notes: ${adminNotes || 'None'}`)
        return { 
          ...req, 
          status: 'Rejected', 
          processedAt: new Date().toISOString(),
          adminNotes
        }
      }
      return req
    }))
  }, [creditCoins])

  // Compute platform treasury stats
  const totalCoinsIssued = wallets.reduce((acc, w) => acc + w.totalBalance + w.lockedBalance, 50000)
  const coinsInCirculation = wallets.reduce((acc, w) => acc + w.totalBalance, 0)
  const coinsLockedInBets = wallets.reduce((acc, w) => acc + w.lockedBalance, 0)
  const totalRewardsDistributed = transactions
    .filter(t => t.type === 'Reward' && t.status === 'Settled')
    .reduce((acc, t) => acc + t.amount, 14500)

  const pendingWithdrawalCount = withdrawalRequests.filter(r => r.status === 'Pending').length

  const updatePlatformFeePercent = useCallback((percent: number) => {
    const val = Math.max(0, Math.min(10, percent)) // FIX: allow 0% fee rate
    setPlatformFeePercent(val)
    localStorage.setItem('anybet_platform_fee', val.toString())
  }, [])

  const treasuryStats: TreasuryStats = {
    totalCoinsIssued,
    coinsInCirculation,
    coinsLockedInBets,
    totalRewardsDistributed,
    pendingWithdrawals: pendingWithdrawalCount,
    platformReserve: 500000,
    totalCollectedFees: 48500,
    platformFeePercent: platformFeePercent, // FIX: use dynamic state
    reserveFundBalance: 500000
  }

  return (
    <WalletContext.Provider value={{
      wallets,
      transactions,
      coinPackages,
      rewardRules,
      updateRewardRule,
      toggleRewardRule,
      bonusCampaigns,
      withdrawalRequests,
      treasury: treasuryStats,
      totalCoinsIssued,
      coinsInCirculation,
      coinsLockedInBets,
      totalRewardsDistributed,
      pendingWithdrawalCount,
      dailyRewardConfig,
      userLastClaimTimestamp,
      creditCoins,
      debitCoins,
      lockCoins,
      unlockCoins,
      freezeWallet,
      unfreezeWallet,
      resetWallet,
      createWallet,
      platformFeePercent,
      updatePlatformFeePercent,
      createCoinPackage,
      updateCoinPackage,
      deleteCoinPackage,
      toggleCoinPackage,
      claimDailyReward,
      updateDailyRewardConfig,
      createBonusCampaign,
      updateBonusCampaign,
      deleteBonusCampaign,
      redeemPromoCode,
      approveWithdrawal,
      rejectWithdrawal,
      requestWithdrawal
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}
