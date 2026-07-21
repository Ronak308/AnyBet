import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Coins,
  TrendingUp,
  Award,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useWallet } from '@/context/WalletContext'

export const ProfilePage: React.FC<{ navigate: (tab: string) => void }> = ({ navigate: _navigate }) => {
  const { user } = useAuth()
  const { wallets, transactions, claimDailyReward } = useWallet()

  // Tabs: 'overview' | 'transactions'
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'transactions'>('overview')

  // UI state
  const [isClaiming, setIsClaiming] = useState(false)

  // Real user fallback setup
  const displayName = user?.name || 'Admin User'
  const username = user?.username || 'admin'
  const role = user?.role || 'admin'

  const formatJoinedDate = () => {
    const val = user?.createdAt || user?.joinedAt
    if (!val) return 'July 20, 2026'

    let date: Date
    if (typeof val.toDate === 'function') {
      date = val.toDate()
    } else if (val.seconds !== undefined) {
      date = new Date(val.seconds * 1000)
    } else {
      date = new Date(val)
    }

    if (isNaN(date.getTime())) return 'July 20, 2026'
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Get current user's wallet
  const userWallet = wallets.find(w => w.userId === user?.id || w.username === user?.username)
  const userBalance = userWallet ? userWallet.totalBalance : 12500
  const userLocked = userWallet ? userWallet.lockedBalance : 1500

  // Filter transactions for this user
  const userTransactions = transactions.filter(
    tx => tx.userId === user?.id || tx.username === user?.username
  )

  // Static Mock Balances fallback details
  const winRate = 72.8
  const totalBets = 84
  const netEarnings = 14850

  // Static Transactions list fallback
  const staticTransactions = [
    { id: 'tx_101', type: 'Deposit', amount: 5000, status: 'Settled', timestamp: 'July 20, 2026 at 10:30:00 AM UTC+5:30', description: 'Starter Coin Pack Purchase (Virtual)' },
    { id: 'tx_102', type: 'Bet Win', amount: 1200, status: 'Settled', timestamp: 'July 20, 2026 at 9:15:00 AM UTC+5:30', description: 'Won Challenge #AB-9821 Payout' },
    { id: 'tx_103', type: 'Reward', amount: 250, status: 'Settled', timestamp: 'July 20, 2026 at 8:00:00 AM UTC+5:30', description: 'Daily Login Streak Bonus (Day 5)' },
    { id: 'tx_104', type: 'Bet Stake', amount: 500, status: 'Settled', timestamp: 'July 19, 2026 at 10:10:00 PM UTC+5:30', description: 'Staked on Challenge #AB-9942' },
    { id: 'tx_105', type: 'Withdrawal', amount: 2000, status: 'Pending', timestamp: 'July 19, 2026 at 6:45:00 PM UTC+5:30', description: 'Requested Virtual Coin Redemption' }
  ]

  // Determine transactions to render
  const transactionsToDisplay = userTransactions.length > 0
    ? userTransactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      status: tx.status,
      timestamp: new Date(tx.timestamp).toLocaleString(),
      description: tx.description
    }))
    : staticTransactions.map(tx => ({
      ...tx,
      description: tx.description.replace('Ronak', displayName)
    }))

  // Handle Daily Reward Claim
  const handleClaimReward = async () => {
    if (!user?.id) {
      // Static fallback claim action
      setIsClaiming(true)
      setTimeout(() => {
        setIsClaiming(false)
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'Successfully claimed +100 Coins Daily Bonus!', type: 'success' }
        }))
      }, 600)
      return
    }

    setIsClaiming(true)
    try {
      const res = claimDailyReward(user.id)
      if (res.success) {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: res.message, type: 'success' }
        }))
      } else {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: res.message, type: 'warning' }
        }))
      }
    } catch (err: any) {
      console.error(err)
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Failed to claim reward.', type: 'warning' }
      }))
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <div className="p-6 flex flex-col gap-6 w-full font-sans">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-surface/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Coins className="h-64 w-64 text-primary" />
        </div>

        <div className="flex items-center gap-4.5 z-10">
          <div className="relative">
            <div className="h-18 w-18 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-xl shadow-lg">
              {displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-[#120F1D] flex items-center justify-center shadow-md">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">{displayName}</h3>
              <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                {role}
              </span>
            </div>
            <span className="text-xs font-mono text-muted block mt-0.5">@{username}</span>
            <span className="text-[10px] font-mono text-muted/70 block mt-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Member since {formatJoinedDate()}
            </span>
          </div>
        </div>

        {/* Quick Balance Summary & Daily Bonus Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 z-10 w-full md:w-auto shrink-0">
          <div className="bg-surface/60 border border-border/60 rounded-xl px-4 py-2.5 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-muted uppercase tracking-wider block">Wallet Balance</span>
              <span className="text-sm font-extrabold text-foreground font-mono">
                {userBalance.toLocaleString()} <span className="text-primary text-xs font-bold">Coins</span>
              </span>
            </div>
          </div>

          <Button
            onClick={handleClaimReward}
            disabled={isClaiming}
            variant="primary"
            glow
            className="h-11 px-5 font-mono text-xs gap-1.5 rounded-xl uppercase tracking-wider font-semibold"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            {isClaiming ? 'Claiming...' : 'Claim Daily Bonus'}
          </Button>
        </div>
      </div>

      {/* Analytics Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Bets */}
        <div className="glass-panel border border-muted/30 rounded-xl p-4 bg-surface/30 flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-muted uppercase tracking-wider block">Total Bets</span>
            <span className="text-lg font-bold text-foreground font-mono">{totalBets}</span>
          </div>
        </div>

        {/* Win Rate */}
        <div className="glass-panel border border-muted/30 rounded-xl p-4 bg-surface/30 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-muted uppercase tracking-wider block">Win Rate</span>
            <span className="text-lg font-bold text-foreground font-mono">{winRate}%</span>
          </div>
        </div>

        {/* Locked Bets */}
        <div className="glass-panel border border-muted/30 rounded-xl p-4 bg-surface/30 flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-muted uppercase tracking-wider block">Locked Stakes</span>
            <span className="text-lg font-bold text-foreground font-mono">
              {userLocked.toLocaleString()} <span className="text-amber-400 text-xs">Coins</span>
            </span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="glass-panel border border-muted/30 rounded-xl p-4 bg-surface/30 flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-400">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-muted uppercase tracking-wider block">Net Earnings</span>
            <span className="text-lg font-bold text-foreground font-mono text-purple-400">
              +{netEarnings.toLocaleString()} <span className="text-purple-400 text-xs">Coins</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs Selection */}
      <div className="flex border-b border-border/40 gap-6">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`pb-2.5 text-xs font-mono uppercase tracking-wider transition-colors relative cursor-pointer ${activeSubTab === 'overview' ? 'text-primary font-bold' : 'text-muted hover:text-foreground'
            }`}
        >
          Overview & Stats
          {activeSubTab === 'overview' && (
            <motion.div layoutId="subTabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('transactions')}
          className={`pb-2.5 text-xs font-mono uppercase tracking-wider transition-colors relative cursor-pointer ${activeSubTab === 'transactions' ? 'text-primary font-bold' : 'text-muted hover:text-foreground'
            }`}
        >
          Transaction History
          {activeSubTab === 'transactions' && (
            <motion.div layoutId="subTabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {activeSubTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Active Challenges / Stakes Summary */}
              <div className="md:col-span-2 glass-panel border border-muted/30 rounded-xl p-5 bg-surface/30 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                  <h4 className="text-xs font-bold font-mono text-foreground uppercase tracking-wider">
                    My Active Stakes & Bets
                  </h4>
                  <span className="text-[10px] font-mono text-primary font-bold">2 LIVE BETS</span>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Mock Bet Item 1 */}
                  <div className="flex items-center justify-between p-3.5 bg-surface/50 border border-muted/20 rounded-xl hover:border-primary/30 transition-all">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-foreground">Lakers vs Celtics - Match Winner</span>
                      <span className="text-[10px] font-mono text-muted">STAKED Celtics // OUTCOME PENDING</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-foreground font-mono">1,000 Coins</span>
                      <span className="text-[9px] font-mono text-blue-400 block uppercase tracking-widest mt-0.5">
                        LIVE MATCH
                      </span>
                    </div>
                  </div>

                  {/* Mock Bet Item 2 */}
                  <div className="flex items-center justify-between p-3.5 bg-surface/50 border border-muted/20 rounded-xl hover:border-primary/30 transition-all">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-foreground">BTC Price above $70,000 by July 25</span>
                      <span className="text-[10px] font-mono text-muted">STAKED Yes // SETTLING</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-foreground font-mono">500 Coins</span>
                      <span className="text-[9px] font-mono text-amber-400 block uppercase tracking-widest mt-0.5">
                        SETTLING
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievements & Badges List */}
              <div className="glass-panel border border-muted/30 rounded-xl p-5 bg-surface/30 flex flex-col gap-4">
                <div className="border-b border-border/40 pb-2.5">
                  <h4 className="text-xs font-bold font-mono text-foreground uppercase tracking-wider">
                    Profile Achievements
                  </h4>
                </div>

                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block">Streak Master</span>
                      <span className="text-[10px] text-muted block mt-0.5">Logged in 7 days in a row</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                      <Coins className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block">Betting Whale</span>
                      <span className="text-[10px] text-muted block mt-0.5">Staked over 10,000 coins total</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="glass-panel border border-muted/30 rounded-xl p-5 bg-surface/30 flex flex-col gap-4"
            >
              <div className="border-b border-border/40 pb-2.5">
                <h4 className="text-xs font-bold font-mono text-foreground uppercase tracking-wider">
                  Transaction Audit History
                </h4>
              </div>

              {transactionsToDisplay.length === 0 ? (
                <div className="text-center py-8 text-muted font-mono text-xs uppercase">
                  No coin transactions on record
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {transactionsToDisplay.map((tx) => {
                    const isCredit = tx.type === 'Deposit' || tx.type === 'Bet Win' || tx.type === 'Reward' || tx.type === 'Refund'
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 bg-surface/50 border border-muted/15 rounded-xl text-xs font-mono"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-lg shrink-0 ${isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                            }`}>
                            {isCredit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-foreground block truncate">{tx.description}</span>
                            <span className="text-[10px] text-muted block mt-0.5">
                              {tx.timestamp}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`font-bold ${isCredit ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isCredit ? '+' : '-'}{tx.amount.toLocaleString()} Coins
                          </span>
                          <span className="text-[9px] text-muted block mt-0.5 uppercase tracking-wider">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
