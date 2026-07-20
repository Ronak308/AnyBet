import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Coins, 
  Plus, 
  Minus, 
  Lock, 
  Unlock, 
  RotateCcw, 
  History, 
  Search, 
  Download, 
  Gift, 
  Sparkles,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Sheet, SheetContent } from '../components/ui/sheet'
import { useWallet } from '../context/WalletContext'
import type { UserWallet, CoinTransaction, CoinPackage } from '../context/WalletContext'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts'

export const FinancialsView: React.FC<{ activeTab?: string; navigate?: (tab: string) => void }> = ({ activeTab, navigate: _navigate }) => {
  const {
    wallets,
    transactions,
    coinPackages,
    rewardRules,
    bonusCampaigns,
    withdrawalRequests,
    treasury,
    dailyRewardConfig,
    creditCoins,
    debitCoins,
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
    rejectWithdrawal
  } = useWallet()

  // Custom Toast helper for smooth, popup-free feedback
  const showNotice = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }))
    }
  }

  // Compute active sub-tab from activeTab prop or default to wallet
  const currentSubTab = useMemo(() => {
    if (activeTab && activeTab.startsWith('financials-')) {
      const sub = activeTab.replace('financials-', '')
      if (['wallet', 'transactions', 'rewards', 'treasury'].includes(sub)) {
        return sub as 'wallet' | 'transactions' | 'rewards' | 'treasury'
      }
    }
    return 'wallet'
  }, [activeTab])

  // Active Sub-Module Tab state
  const [activeSubTab, setActiveSubTab] = useState<'wallet' | 'transactions' | 'rewards' | 'treasury'>(currentSubTab)

  React.useEffect(() => {
    if (activeTab && activeTab.startsWith('financials-')) {
      const sub = activeTab.replace('financials-', '')
      if (['wallet', 'transactions', 'rewards', 'treasury'].includes(sub)) {
        setActiveSubTab(sub as any)
      }
    }
  }, [activeTab])

  // Wallet Management States & Pagination
  const [walletSearch, setWalletSearch] = useState('')
  const [walletStatusFilter, setWalletStatusFilter] = useState<'all' | 'Active' | 'Frozen'>('all')
  const [walletPage, setWalletPage] = useState(1)
  const walletPageSize = 5

  const [selectedWallet, setSelectedWallet] = useState<UserWallet | null>(null)
  const [coinActionModal, setCoinActionModal] = useState<{ isOpen: boolean; mode: 'add' | 'deduct'; wallet: UserWallet | null }>({
    isOpen: false,
    mode: 'add',
    wallet: null
  })
  const [coinAmountInput, setCoinAmountInput] = useState('')
  const [coinReasonInput, setCoinReasonInput] = useState('')
  const [isWalletHistoryOpen, setIsWalletHistoryOpen] = useState(false)

  // Reset wallet page on filter change
  React.useEffect(() => {
    setWalletPage(1)
  }, [walletSearch, walletStatusFilter])

  // Coin Package Modal States
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false)
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null)
  const [pkgName, setPkgName] = useState('')
  const [pkgCoins, setPkgCoins] = useState('')
  const [pkgBonus, setPkgBonus] = useState('')
  const [pkgPrice, setPkgPrice] = useState('')
  const [pkgTag, setPkgTag] = useState('')

  // Transactions Ledger States & Pagination
  const [txSearch, setTxSearch] = useState('')
  const [txTypeFilter, setTxTypeFilter] = useState<string>('all')
  const [txStatusFilter, setTxStatusFilter] = useState<string>('all')
  const [txPage, setTxPage] = useState(1)
  const txPageSize = 8

  const [selectedTx, setSelectedTx] = useState<CoinTransaction | null>(null)
  const [isTxDrawerOpen, setIsTxDrawerOpen] = useState(false)

  // Reset tx page on filter change
  React.useEffect(() => {
    setTxPage(1)
  }, [txSearch, txTypeFilter, txStatusFilter])

  // Withdrawal Queue Pagination
  const [wdPage, setWdPage] = useState(1)
  const wdPageSize = 5

  // Rewards States
  const [dailyCoinsEdit, setDailyCoinsEdit] = useState(dailyRewardConfig.dailyCoins.toString())

  // --- Filtering & Pagination Logic ---
  const filteredWallets = useMemo(() => {
    return wallets.filter(w => {
      const matchesSearch = w.username.toLowerCase().includes(walletSearch.toLowerCase()) || w.userId.toLowerCase().includes(walletSearch.toLowerCase())
      const matchesStatus = walletStatusFilter === 'all' || w.status === walletStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [wallets, walletSearch, walletStatusFilter])

  const totalWalletPages = Math.max(1, Math.ceil(filteredWallets.length / walletPageSize))
  const paginatedWallets = useMemo(() => {
    const start = (walletPage - 1) * walletPageSize
    return filteredWallets.slice(start, start + walletPageSize)
  }, [filteredWallets, walletPage, walletPageSize])

  const filteredTxs = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.txHash.toLowerCase().includes(txSearch.toLowerCase()) ||
                            tx.username.toLowerCase().includes(txSearch.toLowerCase()) ||
                            tx.description.toLowerCase().includes(txSearch.toLowerCase())
      const matchesType = txTypeFilter === 'all' || tx.type === txTypeFilter
      const matchesStatus = txStatusFilter === 'all' || tx.status === txStatusFilter
      return matchesSearch && matchesType && matchesStatus
    })
  }, [transactions, txSearch, txTypeFilter, txStatusFilter])

  const totalTxPages = Math.max(1, Math.ceil(filteredTxs.length / txPageSize))
  const paginatedTxs = useMemo(() => {
    const start = (txPage - 1) * txPageSize
    return filteredTxs.slice(start, start + txPageSize)
  }, [filteredTxs, txPage, txPageSize])

  const totalWdPages = Math.max(1, Math.ceil(withdrawalRequests.length / wdPageSize))
  const paginatedWithdrawals = useMemo(() => {
    const start = (wdPage - 1) * wdPageSize
    return withdrawalRequests.slice(start, start + wdPageSize)
  }, [withdrawalRequests, wdPage, wdPageSize])

  // --- CSV Export ---
  const handleExportCSV = () => {
    if (filteredTxs.length === 0) {
      showNotice("No transactions to export.", "warning")
      return
    }

    const headers = ['Transaction ID', 'Hash', 'User', 'Type', 'Amount (BET)', 'Status', 'Timestamp', 'Description']
    const rows = filteredTxs.map(t => [
      t.id,
      t.txHash,
      t.username,
      t.type,
      t.amount,
      t.status,
      t.timestamp,
      `"${t.description.replace(/"/g, '""')}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `AnyBet_Transactions_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showNotice("Transactions CSV downloaded successfully!", "success")
  }

  // --- Handlers for Coin Adjustments ---
  const handleCoinSubmit = () => {
    if (!coinActionModal.wallet) return
    const amt = parseFloat(coinAmountInput)
    if (isNaN(amt) || amt <= 0) {
      showNotice("Please enter a valid positive coin amount.", "warning")
      return
    }

    const reason = coinReasonInput.trim() || (coinActionModal.mode === 'add' ? 'Operator Manual Credit' : 'Operator Manual Debit')

    if (coinActionModal.mode === 'add') {
      creditCoins(coinActionModal.wallet.userId, amt, 'Deposit', reason)
      showNotice(`Successfully added +${amt.toLocaleString()} BET Coins to @${coinActionModal.wallet.username}`, "success")
    } else {
      const ok = debitCoins(coinActionModal.wallet.userId, amt, 'Refund', reason)
      if (!ok) {
        showNotice("Cannot debit: Insufficient balance or wallet is frozen.", "warning")
        return
      }
      showNotice(`Deducted -${amt.toLocaleString()} BET Coins from @${coinActionModal.wallet.username}`, "success")
    }

    setCoinActionModal({ isOpen: false, mode: 'add', wallet: null })
    setCoinAmountInput('')
    setCoinReasonInput('')
  }

  // --- Handlers for Package Creation/Editing ---
  const handleSavePackage = () => {
    const coins = parseInt(pkgCoins, 10)
    const bonus = parseInt(pkgBonus || '0', 10)
    const price = parseFloat(pkgPrice)

    if (!pkgName || isNaN(coins) || coins <= 0 || isNaN(price)) {
      showNotice("Please fill in valid package details.", "warning")
      return
    }

    if (editingPkgId) {
      updateCoinPackage(editingPkgId, {
        name: pkgName,
        coins,
        bonusCoins: bonus,
        priceUsd: price,
        tag: pkgTag.trim() || undefined
      })
      showNotice("Coin package updated!", "success")
    } else {
      createCoinPackage({
        name: pkgName,
        coins,
        bonusCoins: bonus,
        priceUsd: price,
        tag: pkgTag.trim() || undefined,
        isEnabled: true
      })
      showNotice("New Coin Package created!", "success")
    }

    setIsPkgModalOpen(false)
    setEditingPkgId(null)
    setPkgName(''); setPkgCoins(''); setPkgBonus(''); setPkgPrice(''); setPkgTag('')
  }

  const openEditPackage = (pkg: CoinPackage) => {
    setEditingPkgId(pkg.id)
    setPkgName(pkg.name)
    setPkgCoins(pkg.coins.toString())
    setPkgBonus(pkg.bonusCoins.toString())
    setPkgPrice(pkg.priceUsd.toString())
    setPkgTag(pkg.tag || '')
    setIsPkgModalOpen(true)
  }

  // Analytics Datasets
  const dailyFlowData = [
    { name: 'MON', issued: 12000, redeemed: 4500 },
    { name: 'TUE', issued: 18500, redeemed: 6200 },
    { name: 'WED', issued: 15000, redeemed: 8900 },
    { name: 'THU', issued: 22000, redeemed: 11000 },
    { name: 'FRI', issued: 35000, redeemed: 19000 },
    { name: 'SAT', issued: 48000, redeemed: 24000 },
    { name: 'SUN', issued: 52000, redeemed: 31000 },
  ]

  const pieData = [
    { name: 'Circulation', value: treasury.coinsInCirculation, color: '#00E0FF' },
    { name: 'Locked in Bets', value: treasury.coinsLockedInBets, color: '#8026FF' },
    { name: 'Platform Reserve', value: treasury.platformReserve, color: '#10B981' },
  ]

  // Card Variants
  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 120, damping: 16 } }
  }

  return (
    <div className="p-6 flex flex-col gap-6 w-full font-sans select-none min-h-screen">
      
      {/* ─── Header & Sub-Navigation Tabs Bar ────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-sans tracking-tight text-foreground flex items-center gap-2">
                Financial Operations
                <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                  VIRTUAL $BET COINS
                </Badge>
              </h1>
              <p className="text-xs text-muted font-mono uppercase tracking-widest mt-0.5">
                Operator Virtual Economy • Treasury & Wallets Control Center
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono border-primary/40 text-primary bg-primary/10 px-3 py-1 uppercase tracking-wider font-bold">
            {activeSubTab === 'wallet' ? '💳 WALLET MANAGEMENT' :
             activeSubTab === 'transactions' ? '📜 TRANSACTIONS LEDGER' :
             activeSubTab === 'rewards' ? '🎁 REWARDS & RULES' :
             '🏛️ TREASURY & ANALYTICS'}
          </Badge>
        </div>
      </div>

      {/* ─── SUB-MODULE 1: WALLET MANAGEMENT ────────────────────────────── */}
      {activeSubTab === 'wallet' && (
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="flex flex-col gap-6">
          
          {/* 6 Top KPIs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { title: 'ACTIVE WALLETS', val: wallets.filter(w => w.status === 'Active').length, sub: 'Total active users' },
              { title: 'TOTAL $BET COINS', val: treasury.coinsInCirculation.toLocaleString(), sub: 'User balance pool' },
              { title: 'CIRCULATION', val: `${(treasury.coinsInCirculation / 1000).toFixed(1)}k BET`, sub: 'In active hands' },
              { title: 'LOCKED IN BETS', val: `${treasury.coinsLockedInBets.toLocaleString()} BET`, sub: 'Staked in challenges' },
              { title: 'PENDING WITHDRAWALS', val: `${treasury.pendingWithdrawals.toLocaleString()} BET`, sub: 'Redemption queue' },
              { title: "TODAY'S ACTIVITY", val: '+14.2%', sub: '24h wallet velocity' },
            ].map((kpi, idx) => (
              <motion.div key={idx} variants={cardVariants} className="h-full">
                <Card className="hover:border-primary/40 transition-all duration-300 h-full flex flex-col">
                  <CardContent className="p-4 flex flex-col justify-between h-full min-h-[110px]">
                    <span className="text-[9px] text-muted font-mono uppercase tracking-widest leading-tight">{kpi.title}</span>
                    <span className="text-xl font-bold font-mono text-foreground tracking-tight my-1">{kpi.val}</span>
                    <span className="text-[9px] text-muted font-mono leading-tight">{kpi.sub}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* User Wallets Table Section */}
          <motion.div variants={cardVariants}>
            <Card className="p-5 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground font-sans uppercase tracking-wider">Operator Wallet Management</h3>
                  <p className="text-[11px] text-muted font-mono uppercase tracking-widest mt-0.5">Control user coin balances, freeze accounts, or issue credits</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted" />
                    <Input
                      placeholder="Search username or ID..."
                      value={walletSearch}
                      onChange={(e) => setWalletSearch(e.target.value)}
                      className="pl-9 h-8 text-xs font-mono bg-surface/50 border-border/60"
                    />
                  </div>

                  <div className="flex items-center bg-surface/60 border border-border/50 rounded-lg p-0.5">
                    {['all', 'Active', 'Frozen'].map(st => (
                      <button
                        key={st}
                        onClick={() => setWalletStatusFilter(st as any)}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-wider transition-colors cursor-pointer ${
                          walletStatusFilter === st ? 'bg-primary/20 text-primary font-bold' : 'text-muted hover:text-foreground'
                        }`}
                      >
                        {st.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Wallets Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-surface/40 text-[10px] font-mono text-muted uppercase tracking-widest border-b border-border/40">
                    <tr>
                      <th className="p-3">User Wallet</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Total Balance</th>
                      <th className="p-3">Locked Balance</th>
                      <th className="p-3">Last Activity</th>
                      <th className="p-3 text-right">Operator Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {paginatedWallets.map((w) => (
                      <tr key={w.id} className="hover:bg-surface/30 transition-colors">
                        <td className="p-3 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-mono text-xs text-primary font-bold">
                            {w.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">@{w.username}</span>
                            <span className="text-[9px] font-mono text-muted">{w.userId}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={w.status === 'Active' ? 'success' : 'outline'} className={w.status === 'Frozen' ? 'bg-red-500/10 text-red-400 border-red-500/20' : ''}>
                            {w.status}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono font-bold text-foreground">
                          {w.totalBalance.toLocaleString()} <span className="text-[10px] text-primary">BET</span>
                        </td>
                        <td className="p-3 font-mono text-amber-400">
                          {w.lockedBalance.toLocaleString()} <span className="text-[10px] text-muted">BET</span>
                        </td>
                        <td className="p-3 font-mono text-[10px] text-muted">{w.lastActivity}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[10px] px-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                              onClick={() => setCoinActionModal({ isOpen: true, mode: 'add', wallet: w })}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Add
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[10px] px-2 text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                              onClick={() => setCoinActionModal({ isOpen: true, mode: 'deduct', wallet: w })}
                            >
                              <Minus className="h-3 w-3 mr-1" /> Deduct
                            </Button>
                            {w.status === 'Active' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[10px] px-2 text-red-400 border-red-500/30 hover:bg-red-500/10"
                                onClick={() => {
                                  freezeWallet(w.id)
                                  showNotice(`Wallet of @${w.username} frozen.`, 'warning')
                                }}
                              >
                                <Lock className="h-3 w-3 mr-1" /> Freeze
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[10px] px-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                                onClick={() => {
                                  unfreezeWallet(w.id)
                                  showNotice(`Wallet of @${w.username} unfrozen.`, 'success')
                                }}
                              >
                                <Unlock className="h-3 w-3 mr-1" /> Unfreeze
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-muted hover:text-foreground"
                              title="Reset Wallet Balance"
                              onClick={() => {
                                resetWallet(w.id, 1000)
                                showNotice(`Reset wallet balance of @${w.username} to 1,000 BET`, 'info')
                              }}
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-muted hover:text-foreground"
                              title="View User Tx History"
                              onClick={() => {
                                setSelectedWallet(w)
                                setIsWalletHistoryOpen(true)
                              }}
                            >
                              <History className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Wallet Pagination Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/40 pt-4 mt-2 font-sans">
                <span className="text-[10px] font-mono text-muted">
                  Showing {filteredWallets.length > 0 ? (walletPage - 1) * walletPageSize + 1 : 0} to {Math.min(walletPage * walletPageSize, filteredWallets.length)} of {filteredWallets.length} Wallets
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={walletPage <= 1}
                    onClick={() => setWalletPage(p => p - 1)}
                    className="h-7 text-[10px] font-mono px-2.5 gap-1"
                  >
                    <ChevronLeft className="h-3 w-3" /> Prev
                  </Button>
                  <span className="text-[10px] font-mono font-bold text-foreground px-2">
                    Page {walletPage} of {totalWalletPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={walletPage >= totalWalletPages}
                    onClick={() => setWalletPage(p => p + 1)}
                    className="h-7 text-[10px] font-mono px-2.5 gap-1"
                  >
                    Next <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Coin Packages Section */}
          <motion.div variants={cardVariants}>
            <Card className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground font-sans uppercase tracking-wider">Demo Coin Packages Manager</h3>
                  <p className="text-[11px] text-muted font-mono uppercase tracking-widest mt-0.5">Configure virtual coin packs available for user top-ups</p>
                </div>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground text-xs font-mono gap-1.5"
                  onClick={() => {
                    setEditingPkgId(null)
                    setPkgName(''); setPkgCoins(''); setPkgBonus(''); setPkgPrice(''); setPkgTag('')
                    setIsPkgModalOpen(true)
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> Create Package
                </Button>
              </div>

              {/* Packages Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {coinPackages.map(pkg => (
                  <div key={pkg.id} className="p-4 rounded-xl border border-border/60 bg-surface/30 flex flex-col justify-between gap-4 relative overflow-hidden group hover:border-primary/40 transition-all duration-300">
                    {pkg.tag && (
                      <span className="absolute top-3 right-3 text-[9px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                        {pkg.tag}
                      </span>
                    )}

                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-foreground">{pkg.name}</span>
                      <div className="flex items-baseline gap-2 font-mono mt-1">
                        <span className="text-2xl font-bold text-foreground">{pkg.coins.toLocaleString()}</span>
                        <span className="text-xs text-primary font-semibold">BET</span>
                        {pkg.bonusCoins > 0 && (
                          <span className="text-xs text-emerald-400 font-bold">+{pkg.bonusCoins.toLocaleString()} BONUS</span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-muted mt-1">Pack Value: {pkg.priceUsd} Coins</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/40 pt-3">
                      <Badge variant={pkg.isEnabled ? 'success' : 'outline'} className="text-[9px]">
                        {pkg.isEnabled ? 'ACTIVE' : 'DISABLED'}
                      </Badge>

                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] font-mono text-muted hover:text-foreground" onClick={() => toggleCoinPackage(pkg.id)}>
                          {pkg.isEnabled ? 'Disable' : 'Enable'}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted hover:text-foreground" onClick={() => openEditPackage(pkg)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-300" onClick={() => deleteCoinPackage(pkg.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* ─── SUB-MODULE 2: TRANSACTIONS LEDGER ──────────────────────────── */}
      {activeSubTab === 'transactions' && (
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="flex flex-col gap-6">
          <Card className="p-5 flex flex-col gap-4">
            
            {/* Header & Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/40 pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground font-sans uppercase tracking-wider">Financial Audit Trail Ledger</h3>
                <p className="text-[11px] text-muted font-mono uppercase tracking-widest mt-0.5">Immutable record of every virtual coin transaction on AnyBet</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 sm:w-56">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted" />
                  <Input
                    placeholder="Search Hash, User, Description..."
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="pl-9 h-8 text-xs font-mono bg-surface/50 border-border/60"
                  />
                </div>

                <select
                  value={txTypeFilter}
                  onChange={(e) => setTxTypeFilter(e.target.value)}
                  className="h-8 px-2.5 rounded-lg bg-surface/60 border border-border/60 text-xs font-mono text-foreground focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="Deposit">Deposit</option>
                  <option value="Reward">Reward</option>
                  <option value="Bet Stake">Bet Stake</option>
                  <option value="Bet Win">Bet Win</option>
                  <option value="Refund">Refund</option>
                  <option value="Withdrawal">Withdrawal</option>
                </select>

                <select
                  value={txStatusFilter}
                  onChange={(e) => setTxStatusFilter(e.target.value)}
                  className="h-8 px-2.5 rounded-lg bg-surface/60 border border-border/60 text-xs font-mono text-foreground focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Settled">Settled</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs font-mono gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                  onClick={handleExportCSV}
                >
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </Button>
              </div>
            </div>

            {/* Audit Trail Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead className="bg-surface/40 text-[10px] font-mono text-muted uppercase tracking-widest border-b border-border/40">
                  <tr>
                    <th className="p-3">Transaction ID / Hash</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {paginatedTxs.map((tx) => {
                    const isPositive = tx.type === 'Deposit' || tx.type === 'Reward' || tx.type === 'Bet Win' || tx.type === 'Refund'
                    return (
                      <tr key={tx.id} className="hover:bg-surface/30 transition-colors">
                        <td className="p-3 font-mono">
                          <span className="text-foreground font-semibold block">{tx.id}</span>
                          <span className="text-[10px] text-muted">{tx.txHash}</span>
                        </td>
                        <td className="p-3 font-semibold text-foreground">@{tx.username}</td>
                        <td className="p-3">
                          <Badge variant="outline" className={`text-[9px] font-mono ${
                            tx.type === 'Bet Win' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                            tx.type === 'Reward' ? 'border-primary/30 text-primary bg-primary/10' :
                            tx.type === 'Withdrawal' ? 'border-red-500/30 text-red-400 bg-red-500/10' : ''
                          }`}>
                            {tx.type}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono font-bold">
                          <span className={isPositive ? 'text-emerald-400' : 'text-amber-400'}>
                            {isPositive ? '+' : '-'}{tx.amount.toLocaleString()} BET
                          </span>
                        </td>
                        <td className="p-3">
                          <Badge variant={tx.status === 'Settled' ? 'success' : 'outline'} className={tx.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : ''}>
                            {tx.status}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono text-[10px] text-muted">
                          {new Date(tx.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted hover:text-foreground"
                            onClick={() => {
                              setSelectedTx(tx)
                              setIsTxDrawerOpen(true)
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Transactions Pagination Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/40 pt-4 mt-2 font-sans">
              <span className="text-[10px] font-mono text-muted">
                Showing {filteredTxs.length > 0 ? (txPage - 1) * txPageSize + 1 : 0} to {Math.min(txPage * txPageSize, filteredTxs.length)} of {filteredTxs.length} Transactions
              </span>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={txPage <= 1}
                  onClick={() => setTxPage(p => p - 1)}
                  className="h-7 text-[10px] font-mono px-2.5 gap-1"
                >
                  <ChevronLeft className="h-3 w-3" /> Prev
                </Button>
                <span className="text-[10px] font-mono font-bold text-foreground px-2">
                  Page {txPage} of {totalTxPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={txPage >= totalTxPages}
                  onClick={() => setTxPage(p => p + 1)}
                  className="h-7 text-[10px] font-mono px-2.5 gap-1"
                >
                  Next <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ─── SUB-MODULE 3: REWARDS & CAMPAIGNS ──────────────────────────── */}
      {activeSubTab === 'rewards' && (
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Daily Reward Config & Claim Tester (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Daily Reward Settings Card */}
            <motion.div variants={cardVariants}>
              <Card className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary" />
                    <h3 className="text-base font-bold text-foreground font-sans uppercase tracking-wider">Daily Reward Engine</h3>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-mono">RETENTION ENGINE</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl border border-border/50 bg-surface/30 flex flex-col gap-2">
                    <span className="text-[10px] font-mono text-muted uppercase">Daily Login Coin Amount</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={dailyCoinsEdit}
                        onChange={(e) => setDailyCoinsEdit(e.target.value)}
                        className="h-8 text-xs font-mono bg-background"
                      />
                      <Button
                        size="sm"
                        className="h-8 text-[10px] font-mono px-3"
                        onClick={() => {
                          const val = parseInt(dailyCoinsEdit, 10)
                          if (!isNaN(val) && val > 0) {
                            updateDailyRewardConfig({ dailyCoins: val })
                            showNotice("Daily reward coin amount updated!", "success")
                          } else {
                            showNotice("Please enter a valid positive coin amount.", "warning")
                          }
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/50 bg-surface/30 flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono text-muted uppercase">Claim Cooldown Timer</span>
                    <span className="text-lg font-bold font-mono text-foreground">{dailyRewardConfig.cooldownHours} Hours</span>
                    <span className="text-[9px] font-mono text-muted">Resets at 00:00 UTC daily</span>
                  </div>
                </div>

                {/* 7-Day Streak Multipliers Visualization */}
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-[10px] font-mono text-muted uppercase tracking-wider">7-Day Streak Multipliers Curve</span>
                  <div className="grid grid-cols-7 gap-1.5 font-mono text-center">
                    {dailyRewardConfig.streakMultipliers.map((mult, idx) => (
                      <div key={idx} className="p-2 rounded-lg border border-primary/20 bg-primary/5 flex flex-col items-center gap-1">
                        <span className="text-[9px] text-muted">Day {idx + 1}</span>
                        <span className="text-xs font-bold text-primary">{mult}x</span>
                        <span className="text-[9px] text-emerald-400">+{Math.round(100 * mult)} BET</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Claim Tester */}
                <div className="p-4 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20 text-primary">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground font-sans uppercase">Daily Reward Claim Tester</h4>
                      <p className="text-[10px] text-muted font-mono">Test claiming daily reward for active operator account</p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-mono font-bold shadow-glow"
                    onClick={() => {
                      const res = claimDailyReward('USR_01')
                      showNotice(res.message, res.success ? "success" : "warning")
                    }}
                  >
                    Claim Daily Reward (+{dailyRewardConfig.dailyCoins} BET)
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right Column: Bonus Campaigns & Rules Matrix (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Bonus Campaigns */}
            <motion.div variants={cardVariants}>
              <Card className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <h3 className="text-sm font-bold text-foreground font-sans uppercase tracking-wider">Active Bonus Campaigns</h3>
                  <Badge variant="outline" className="text-[9px]">PROMOTIONS</Badge>
                </div>

                <div className="flex flex-col gap-3">
                  {bonusCampaigns.map(cmp => (
                    <div key={cmp.id} className="p-3 border border-border/50 rounded-xl bg-surface/30 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-foreground">{cmp.title}</span>
                        <span className="text-[9px] font-mono text-muted">{cmp.type} • Expires: {cmp.expiresAt}</span>
                      </div>
                      <Badge variant="success" className="font-mono text-xs">
                        +{cmp.bonusCoins.toLocaleString()} BET
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Reward Rules Matrix */}
            <motion.div variants={cardVariants}>
              <Card className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <h3 className="text-sm font-bold text-foreground font-sans uppercase tracking-wider">Reward Rules Matrix</h3>
                  <Badge variant="outline" className="text-[9px]">RULES ENGINE</Badge>
                </div>

                <div className="flex flex-col gap-2.5 font-sans text-xs">
                  {rewardRules.map(rule => (
                    <div key={rule.id} className="p-2.5 border border-border/40 bg-surface/20 rounded-lg flex items-center justify-between font-mono">
                      <span className="text-foreground font-medium text-[11px]">{rule.event}</span>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-emerald-400 font-bold">+{rule.coinReward} BET</span>
                        <span className="text-secondary font-bold">+{rule.xpReward} XP</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* ─── SUB-MODULE 4: TREASURY & ANALYTICS ─────────────────────────── */}
      {activeSubTab === 'treasury' && (
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="flex flex-col gap-6">
          
          {/* Treasury Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'TOTAL COINS ISSUED', val: treasury.totalCoinsIssued.toLocaleString(), color: 'text-primary' },
              { label: 'CIRCULATION POOL', val: treasury.coinsInCirculation.toLocaleString(), color: 'text-emerald-400' },
              { label: 'LOCKED IN BETS', val: treasury.coinsLockedInBets.toLocaleString(), color: 'text-amber-400' },
              { label: 'REWARDS DISTRIBUTED', val: treasury.totalRewardsDistributed.toLocaleString(), color: 'text-secondary' },
              { label: 'PENDING WITHDRAWALS', val: treasury.pendingWithdrawals.toLocaleString(), color: 'text-red-400' },
              { label: 'PLATFORM RESERVE', val: treasury.platformReserve.toLocaleString(), color: 'text-emerald-400' },
            ].map((card, idx) => (
              <motion.div key={idx} variants={cardVariants} className="h-full">
                <Card className="hover:border-primary/40 transition-all border-border/60 h-full flex flex-col">
                  <CardContent className="p-4 flex flex-col justify-between h-full min-h-[110px]">
                    <span className="text-[9px] font-mono text-muted uppercase tracking-widest leading-tight">{card.label}</span>
                    <span className={`text-lg font-bold font-mono my-1 ${card.color}`}>{card.val}</span>
                    <span className="text-[9px] font-mono text-muted leading-tight">Virtual $BET</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Recharts Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 8 Cols: Daily Coin Flow Chart */}
            <motion.div variants={cardVariants} className="lg:col-span-8">
              <Card className="p-5 flex flex-col gap-4 h-full">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground font-sans uppercase tracking-wider">Daily Virtual Coin Flow</h3>
                    <p className="text-[11px] text-muted font-mono uppercase tracking-widest mt-0.5">Coins issued vs Virtual Redemptions flow</p>
                  </div>
                  <Badge variant="outline" className="text-[9px]">7-DAY VOLUME</Badge>
                </div>

                <div className="h-[260px] w-full font-mono text-[10px]">
                  <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                    <BarChart data={dailyFlowData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#A8A8B5" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#A8A8B5" fontSize={9} tickLine={false} axisLine={false} />
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: '#1B1B23',
                          borderColor: '#2A2A36',
                          borderRadius: '8px',
                          color: '#F3F0FF',
                          fontFamily: 'JetBrains Mono'
                        }}
                      />
                      <Bar dataKey="issued" fill="#8026FF" radius={[4, 4, 0, 0]} maxBarSize={35} name="Coins Issued" isAnimationActive={false} />
                      <Bar dataKey="redeemed" fill="#00E0FF" radius={[4, 4, 0, 0]} maxBarSize={35} name="Redeemed" isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            {/* Right 4 Cols: Coin Distribution Donut */}
            <motion.div variants={cardVariants} className="lg:col-span-4">
              <Card className="p-5 flex flex-col gap-4 h-full">
                <div className="border-b border-border/40 pb-3">
                  <h3 className="text-sm font-bold text-foreground font-sans uppercase tracking-wider">Economy Distribution</h3>
                  <p className="text-[10px] text-muted font-mono uppercase tracking-widest mt-0.5">Supply breakdown ratio</p>
                </div>

                <div className="h-[220px] w-full flex items-center justify-center font-mono">
                  <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        isAnimationActive={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: '#1B1B23',
                          borderColor: '#2A2A36',
                          borderRadius: '8px',
                          color: '#F3F0FF'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-col gap-2 font-mono text-[10px]">
                  {pieData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-muted">{d.name}</span>
                      </div>
                      <span className="font-bold text-foreground">{d.value.toLocaleString()} BET</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Pending Withdrawal Queue Approvals */}
          <motion.div variants={cardVariants}>
            <Card className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div>
                  <h3 className="text-base font-bold text-foreground font-sans uppercase tracking-wider">Virtual Withdrawal Approvals Queue</h3>
                  <p className="text-[11px] text-muted font-mono uppercase tracking-widest mt-0.5">Review and approve or reject pending virtual coin cash-out requests</p>
                </div>
                <Badge variant="outline" className="text-[9px] font-mono border-amber-500/30 text-amber-400">
                  {withdrawalRequests.filter(r => r.status === 'Pending').length} PENDING
                </Badge>
              </div>

              <div className="flex flex-col gap-3">
                {paginatedWithdrawals.map(req => (
                  <div key={req.id} className="p-3.5 border border-border/50 rounded-xl bg-surface/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-mono text-sm text-primary font-bold">
                        {req.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">@{req.username}</span>
                          <Badge variant={req.status === 'Pending' ? 'outline' : req.status === 'Approved' ? 'success' : 'outline'} className={req.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : ''}>
                            {req.status}
                          </Badge>
                        </div>
                        <span className="text-[10px] font-mono text-muted">Requested: {new Date(req.requestedAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="font-mono font-bold text-base text-foreground">
                        {req.amount.toLocaleString()} <span className="text-xs text-primary">BET</span>
                      </span>

                      {req.status === 'Pending' ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-mono gap-1"
                            onClick={() => {
                              approveWithdrawal(req.id)
                              showNotice(`Approved virtual withdrawal for @${req.username}`, "success")
                            }}
                          >
                            <Check className="h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-mono gap-1"
                            onClick={() => {
                              rejectWithdrawal(req.id)
                              showNotice(`Rejected withdrawal and refunded coins to @${req.username}`, "warning")
                            }}
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-muted uppercase">Processed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Withdrawal Queue Pagination Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/40 pt-3 mt-1 font-sans">
                <span className="text-[10px] font-mono text-muted">
                  Showing {withdrawalRequests.length > 0 ? (wdPage - 1) * wdPageSize + 1 : 0} to {Math.min(wdPage * wdPageSize, withdrawalRequests.length)} of {withdrawalRequests.length} Requests
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={wdPage <= 1}
                    onClick={() => setWdPage(p => p - 1)}
                    className="h-7 text-[10px] font-mono px-2.5 gap-1"
                  >
                    <ChevronLeft className="h-3 w-3" /> Prev
                  </Button>
                  <span className="text-[10px] font-mono font-bold text-foreground px-2">
                    Page {wdPage} of {totalWdPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={wdPage >= totalWdPages}
                    onClick={() => setWdPage(p => p + 1)}
                    className="h-7 text-[10px] font-mono px-2.5 gap-1"
                  >
                    Next <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* ─── MODAL: ADD / DEDUCT COINS ────────────────────────────────────── */}
      <AnimatePresence>
        {coinActionModal.isOpen && coinActionModal.wallet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 bg-surface border border-border rounded-2xl shadow-glow flex flex-col gap-4 font-sans"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="text-base font-bold text-foreground uppercase tracking-wider">
                  {coinActionModal.mode === 'add' ? 'Credit $BET Coins' : 'Deduct $BET Coins'}
                </h3>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setCoinActionModal({ isOpen: false, mode: 'add', wallet: null })}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <span className="text-muted">Target User:</span>
                <span className="font-bold text-foreground font-mono">@{coinActionModal.wallet.username} ({coinActionModal.wallet.userId})</span>
                <span className="text-[10px] text-muted font-mono">Current Balance: {coinActionModal.wallet.totalBalance.toLocaleString()} BET</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-muted uppercase">Amount (BET Coins)</label>
                <Input
                  type="number"
                  placeholder="e.g. 1000"
                  value={coinAmountInput}
                  onChange={(e) => setCoinAmountInput(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-muted uppercase">Reason / Note</label>
                <Input
                  placeholder="Operator adjustment note..."
                  value={coinReasonInput}
                  onChange={(e) => setCoinReasonInput(e.target.value)}
                  className="font-sans text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-4 mt-2">
                <Button variant="ghost" size="sm" className="text-xs font-mono" onClick={() => setCoinActionModal({ isOpen: false, mode: 'add', wallet: null })}>
                  Cancel
                </Button>
                <Button size="sm" className="bg-primary text-primary-foreground text-xs font-mono font-bold" onClick={handleCoinSubmit}>
                  Confirm Adjustment
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL: CREATE / EDIT COIN PACKAGE ───────────────────────────── */}
      <AnimatePresence>
        {isPkgModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 bg-surface border border-border rounded-2xl shadow-glow flex flex-col gap-4 font-sans"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="text-base font-bold text-foreground uppercase tracking-wider">
                  {editingPkgId ? 'Edit Coin Package' : 'Create Coin Package'}
                </h3>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setIsPkgModalOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-col gap-3 font-sans text-xs">
                <div>
                  <label className="text-[10px] font-mono text-muted uppercase">Package Name</label>
                  <Input placeholder="e.g. Champion Pack" value={pkgName} onChange={e => setPkgName(e.target.value)} className="h-8 mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-muted uppercase">Base Coins</label>
                    <Input type="number" placeholder="10000" value={pkgCoins} onChange={e => setPkgCoins(e.target.value)} className="h-8 mt-1 font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-muted uppercase">Bonus Coins</label>
                    <Input type="number" placeholder="1500" value={pkgBonus} onChange={e => setPkgBonus(e.target.value)} className="h-8 mt-1 font-mono" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-muted uppercase">Pack Value (Coins)</label>
                    <Input type="number" placeholder="50" value={pkgPrice} onChange={e => setPkgPrice(e.target.value)} className="h-8 mt-1 font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-muted uppercase">Badge Tag (Optional)</label>
                    <Input placeholder="VIP VALUE" value={pkgTag} onChange={e => setPkgTag(e.target.value)} className="h-8 mt-1" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-4">
                <Button variant="ghost" size="sm" className="text-xs font-mono" onClick={() => setIsPkgModalOpen(false)}>Cancel</Button>
                <Button size="sm" className="bg-primary text-primary-foreground text-xs font-mono font-bold" onClick={handleSavePackage}>Save Package</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── SHEET: USER TRANSACTION HISTORY ────────────────────────────── */}
      <Sheet open={isWalletHistoryOpen} onOpenChange={setIsWalletHistoryOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-6 bg-background border-l border-border flex flex-col gap-4 font-sans overflow-y-auto">
          {selectedWallet && (
            <>
              <div className="border-b border-border/40 pb-4">
                <h3 className="text-base font-bold text-foreground font-sans uppercase">Wallet History Logs</h3>
                <p className="text-xs font-mono text-primary">@{selectedWallet.username} ({selectedWallet.userId})</p>
              </div>

              <div className="flex flex-col gap-3">
                {transactions.filter(t => t.userId === selectedWallet.userId).map(t => (
                  <div key={t.id} className="p-3 border border-border/40 bg-surface/30 rounded-xl flex items-center justify-between text-xs font-sans">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-foreground">{t.type}</span>
                      <span className="text-[10px] font-mono text-muted">{t.description}</span>
                      <span className="text-[9px] font-mono text-muted">{new Date(t.timestamp).toLocaleString()}</span>
                    </div>
                    <span className="font-mono font-bold text-primary">
                      +{t.amount.toLocaleString()} BET
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ─── SHEET: TRANSACTION DETAILS ─────────────────────────────────── */}
      <Sheet open={isTxDrawerOpen} onOpenChange={setIsTxDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-6 bg-background border-l border-border flex flex-col gap-4 font-sans">
          {selectedTx && (
            <>
              <div className="border-b border-border/40 pb-4">
                <h3 className="text-base font-bold text-foreground font-sans uppercase">Transaction Audit Detail</h3>
                <span className="text-xs font-mono text-muted">{selectedTx.id}</span>
              </div>

              <div className="flex flex-col gap-3 font-mono text-xs">
                <div className="p-3 rounded-lg border border-border/50 bg-surface/30 flex justify-between">
                  <span className="text-muted">Hash</span>
                  <span className="font-bold text-primary">{selectedTx.txHash}</span>
                </div>
                <div className="p-3 rounded-lg border border-border/50 bg-surface/30 flex justify-between">
                  <span className="text-muted">User</span>
                  <span className="font-bold text-foreground">@{selectedTx.username}</span>
                </div>
                <div className="p-3 rounded-lg border border-border/50 bg-surface/30 flex justify-between">
                  <span className="text-muted">Type</span>
                  <span className="font-bold text-foreground">{selectedTx.type}</span>
                </div>
                <div className="p-3 rounded-lg border border-border/50 bg-surface/30 flex justify-between">
                  <span className="text-muted">Amount</span>
                  <span className="font-bold text-emerald-400">{selectedTx.amount.toLocaleString()} BET</span>
                </div>
                <div className="p-3 rounded-lg border border-border/50 bg-surface/30 flex justify-between">
                  <span className="text-muted">Status</span>
                  <Badge variant="success">{selectedTx.status}</Badge>
                </div>
                <div className="p-3 rounded-lg border border-border/50 bg-surface/30 flex flex-col gap-1">
                  <span className="text-muted">Description</span>
                  <span className="font-sans text-xs text-foreground">{selectedTx.description}</span>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

    </div>
  )
}
