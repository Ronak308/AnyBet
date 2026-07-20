import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  subscribeToWallets,
  subscribeToTransactions,
  subscribeToWithdrawals,
  subscribeToCoinPackages,
  updateWalletInFirestore,
  addTransactionToFirestore,
  saveCoinPackageInFirestore,
  deleteCoinPackageFromFirestore,
  seedInitialFinancialsData
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
  totalBalance: number // In $BET Coins
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
  
  // Package Actions
  createCoinPackage: (pkg: Omit<CoinPackage, 'id'>) => void
  updateCoinPackage: (id: string, pkg: Partial<CoinPackage>) => void
  deleteCoinPackage: (id: string) => void
  toggleCoinPackage: (id: string) => void
  
  // Reward Actions
  claimDailyReward: (userId: string) => { success: boolean; message: string; coinsGranted?: number }
  updateDailyRewardConfig: (config: Partial<{ dailyCoins: number; cooldownHours: number }>) => void
  
  // Withdrawal Actions
  approveWithdrawal: (requestId: string) => void
  rejectWithdrawal: (requestId: string) => void
  requestWithdrawal: (userId: string, username: string, amount: number) => { success: boolean; message: string }
}

// ─── Initial Mock Data ────────────────────────────────────────────────────────

const INITIAL_WALLETS: UserWallet[] = [
  { id: 'wal_1', userId: 'USR_01', username: 'Ronak', totalBalance: 12500, lockedBalance: 1500, status: 'Active', createdAt: '2026-01-10T10:00:00Z', lastActivity: 'Just now' },
  { id: 'wal_2', userId: 'USR_02', username: 'block_wizard', totalBalance: 4500, lockedBalance: 600, status: 'Active', createdAt: '2026-02-14T14:30:00Z', lastActivity: '12m ago' },
  { id: 'wal_3', userId: 'USR_03', username: 'crypto_king', totalBalance: 89000, lockedBalance: 12000, status: 'Active', createdAt: '2026-03-01T09:15:00Z', lastActivity: '1h ago' },
  { id: 'wal_4', userId: 'USR_04', username: 'risky_bets', totalBalance: 1200, lockedBalance: 0, status: 'Frozen', createdAt: '2026-04-20T16:00:00Z', lastActivity: '2d ago' },
  { id: 'wal_5', userId: 'USR_05', username: 'oracle_eye', totalBalance: 24500, lockedBalance: 3200, status: 'Active', createdAt: '2026-05-11T11:45:00Z', lastActivity: '30m ago' },
]

const INITIAL_TRANSACTIONS: CoinTransaction[] = [
  { id: 'tx_101', txHash: '0x8F9...2E1', userId: 'USR_01', username: 'Ronak', type: 'Deposit', amount: 5000, status: 'Settled', timestamp: '2026-07-20T10:30:00Z', description: 'Starter Coin Pack Purchase (Virtual)' },
  { id: 'tx_102', txHash: '0x32A...BF8', userId: 'USR_02', username: 'block_wizard', type: 'Bet Win', amount: 1200, status: 'Settled', timestamp: '2026-07-20T09:15:00Z', description: 'Won Challenge #AB-9821 Payout' },
  { id: 'tx_103', txHash: '0x1A2...FF0', userId: 'USR_03', username: 'crypto_king', type: 'Reward', amount: 250, status: 'Settled', timestamp: '2026-07-20T08:00:00Z', description: 'Daily Login Streak Bonus (Day 5)' },
  { id: 'tx_104', txHash: '0xC4D...789', userId: 'USR_01', username: 'Ronak', type: 'Bet Stake', amount: 500, status: 'Settled', timestamp: '2026-07-19T22:10:00Z', description: 'Staked on Challenge #AB-9942' },
  { id: 'tx_105', txHash: '0xE5F...112', userId: 'USR_05', username: 'oracle_eye', type: 'Withdrawal', amount: 2000, status: 'Pending', timestamp: '2026-07-19T18:45:00Z', description: 'Requested Virtual Coin Redemption' },
]

const INITIAL_PACKAGES: CoinPackage[] = [
  { id: 'pkg_starter', name: 'Starter Pack', coins: 1000, bonusCoins: 100, tag: 'POPULAR', priceUsd: 10, isEnabled: true },
  { id: 'pkg_pro', name: 'Pro Pack', coins: 5000, bonusCoins: 750, tag: 'BEST VALUE', priceUsd: 45, isEnabled: true },
  { id: 'pkg_highroller', name: 'High Roller Pack', coins: 25000, bonusCoins: 5000, tag: 'VIP BONUS', priceUsd: 200, isEnabled: true },
]

const INITIAL_REWARD_RULES: RewardRule[] = [
  { id: 'rr_1', event: 'Daily Login', coinReward: 100, xpReward: 10, cooldownHours: 24 },
  { id: 'rr_2', event: 'Win Physical Challenge', coinReward: 150, xpReward: 25, cooldownHours: 0 },
  { id: 'rr_3', event: 'Win Prediction Market', coinReward: 200, xpReward: 30, cooldownHours: 0 },
  { id: 'rr_4', event: 'Participate Loss Consolation', coinReward: 20, xpReward: 5, cooldownHours: 0 },
]

const INITIAL_CAMPAIGNS: BonusCampaign[] = [
  { id: 'cmp_1', title: 'Welcome Bonus', type: 'Onboarding', bonusCoins: 500, minStake: 0, status: 'Active', expiresAt: '2026-12-31' },
  { id: 'cmp_2', title: 'Weekly Prediction League', type: 'Tournament', bonusCoins: 2500, minStake: 100, status: 'Active', expiresAt: '2026-07-27' },
]

const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [
  { id: 'wd_1', userId: 'USR_05', username: 'oracle_eye', amount: 2000, status: 'Pending', requestedAt: '2026-07-19T18:45:00Z' },
  { id: 'wd_2', userId: 'USR_02', username: 'block_wizard', amount: 500, status: 'Approved', requestedAt: '2026-07-18T12:00:00Z', processedAt: '2026-07-18T14:20:00Z' },
]

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
      return saved ? JSON.parse(saved) : INITIAL_WALLETS
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

  const [dailyRewardConfig, setDailyRewardConfig] = useState({
    dailyCoins: 100,
    cooldownHours: 24,
    streakMultipliers: [1.0, 1.2, 1.5, 1.8, 2.0, 2.5, 3.0]
  })

  const [userLastClaimTimestamp, setUserLastClaimTimestamp] = useState<number | null>(() => {
    const saved = localStorage.getItem(STORAGE_CLAIM_TIMESTAMP)
    return saved ? parseInt(saved, 10) : null
  })

  // Firestore Subscriptions & Initial Seeder
  useEffect(() => {
    seedInitialFinancialsData(INITIAL_WALLETS, INITIAL_TRANSACTIONS, {
      totalCoinsIssued: 250000,
      coinsInCirculation: 180000,
      coinsLockedInBets: 45000,
      totalRewardsDistributed: 14500,
      pendingWithdrawals: 12500,
      platformReserve: 500000,
      totalCollectedFees: 48500,
      platformFeePercent: 5,
      reserveFundBalance: 500000
    }, INITIAL_WITHDRAWALS, INITIAL_PACKAGES)

    const unsubWallets = subscribeToWallets((items: UserWallet[]) => {
      if (items.length > 0) setWallets(items)
    })
    const unsubTxs = subscribeToTransactions((items: CoinTransaction[]) => {
      if (items.length > 0) setTransactions(items)
    })
    const unsubWithdrawals = subscribeToWithdrawals((items: WithdrawalRequest[]) => {
      if (items.length > 0) setWithdrawalRequests(items)
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

    creditCoins(userId, grantAmount, 'Reward', 'Claimed Daily Login Reward (+100 BET)')

    return {
      success: true,
      message: `Successfully claimed +${grantAmount} BET Coins!`,
      coinsGranted: grantAmount
    }
  }, [dailyRewardConfig, userLastClaimTimestamp, creditCoins])

  const updateDailyRewardConfig = useCallback((config: Partial<{ dailyCoins: number; cooldownHours: number }>) => {
    setDailyRewardConfig(prev => ({ ...prev, ...config }))
  }, [])

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
      return { success: false, message: 'Insufficient $BET Coin balance for withdrawal request.' }
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

  const approveWithdrawal = useCallback((requestId: string) => {
    setWithdrawalRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        createTransactionRecord(req.userId, req.username, 'Withdrawal', req.amount, 'Settled', 'Virtual Withdrawal Approved by Operator')
        return { ...req, status: 'Approved', processedAt: new Date().toISOString() }
      }
      return req
    }))
  }, [createTransactionRecord])

  const rejectWithdrawal = useCallback((requestId: string) => {
    setWithdrawalRequests(prev => prev.map(req => {
      if (req.id === requestId && req.status === 'Pending') {
        // Refund coins back to user
        creditCoins(req.userId, req.amount, 'Refund', 'Virtual Withdrawal Rejected - Coins Refunded')
        return { ...req, status: 'Rejected', processedAt: new Date().toISOString() }
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

  const treasuryStats: TreasuryStats = {
    totalCoinsIssued,
    coinsInCirculation,
    coinsLockedInBets,
    totalRewardsDistributed,
    pendingWithdrawals: pendingWithdrawalCount,
    platformReserve: 500000,
    totalCollectedFees: 48500,
    platformFeePercent: 5,
    reserveFundBalance: 500000
  }

  return (
    <WalletContext.Provider value={{
      wallets,
      transactions,
      coinPackages,
      rewardRules: INITIAL_REWARD_RULES,
      bonusCampaigns: INITIAL_CAMPAIGNS,
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
      createCoinPackage,
      updateCoinPackage,
      deleteCoinPackage,
      toggleCoinPackage,
      claimDailyReward,
      updateDailyRewardConfig,
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
