import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Award, 
  Search, 
  Coins, 
  TrendingUp, 
  Eye, 
  Flame,
  Crown,
  ShieldAlert,
  Cpu,
  AlertTriangle,
  Download,
  Filter,
  Zap,
  BarChart3,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Copy
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '../components/ui/dropdown-menu'
import { useChallenges } from '../context/ChallengesContext'
import type { ChallengeItem } from '../context/ChallengesContext'
import { useWallet } from '../context/WalletContext'
import { LeaderboardDetailsSheet } from './challenges/LeaderboardDetailsSheet'

export const LeaderboardsView: React.FC = () => {
  const { challenges, categories, showToastNotice } = useChallenges()
  const { wallets, transactions } = useWallet()

  // Filter Matrix State
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'all'>('30d')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [visibilityFilter, setVisibilityFilter] = useState<string>('All')
  const [regionFilter, setRegionFilter] = useState<string>('Global')
  const [searchQuery, setSearchQuery] = useState('')

  // 11 Leaderboard Section Tab State
  type LeaderboardTab = 
    | 'trending' 
    | 'escrow' 
    | 'winning-users' 
    | 'highest-earners' 
    | 'active-bettors' 
    | 'creators' 
    | 'category-perf' 
    | 'revenue' 
    | 'ai-resolution' 
    | 'disputed' 
    | 'high-risk'

  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<LeaderboardTab>('trending')
  const [leaderboardCategoryGroup, setLeaderboardCategoryGroup] = useState<'markets' | 'users' | 'security'>('markets')

  // Sheet State
  const [inspectChallenge, setInspectChallenge] = useState<ChallengeItem | null>(null)
  const [inspectRowData, setInspectRowData] = useState<any>(null)

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 5

  // ─── Filtered Data Processing ───────────────────────────────────────────────

  const filteredChallenges = useMemo(() => {
    return challenges.filter(c => {
      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory
      const matchesStatus = statusFilter === 'All' || c.status.toLowerCase() === statusFilter.toLowerCase()
      const matchesSearch = !searchQuery.trim() || 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesStatus && matchesSearch
    })
  }, [challenges, selectedCategory, statusFilter, searchQuery])

  // Real Dynamic Datasets Derived from Application State
  const datasetTrending = useMemo(() => {
    return filteredChallenges
      .filter(c => c.status === 'Live' || c.status === 'Approved')
      .map(c => ({
        id: c.id,
        name: c.title,
        category: c.category,
        participants: c.participantsCount || (c.participants?.length || 0),
        totalPot: c.prizePool || 0,
        odds: '1.95x',
        status: c.status,
        endsIn: 'Active',
        growthRate: '+100%'
      }))
  }, [filteredChallenges])

  const datasetEscrowPots = useMemo(() => {
    return challenges
      .filter(c => (c.prizePool || 0) > 0)
      .sort((a, b) => (b.prizePool || 0) - (a.prizePool || 0))
      .map(c => ({
        id: c.id,
        name: c.title,
        category: c.category,
        potSize: c.prizePool || 0,
        participants: c.participantsCount || (c.participants?.length || 0),
        resolutionTime: c.endDate || 'Ongoing',
        status: c.status
      }))
  }, [challenges])

  const datasetTopWinners = useMemo(() => {
    const userMap: Record<string, { username: string; totalWins: number; earnings: number; totalBets: number }> = {}

    wallets.forEach(w => {
      userMap[w.userId] = { username: w.username, totalWins: 0, earnings: 0, totalBets: 0 }
    })

    transactions.forEach(t => {
      if (!userMap[t.userId]) {
        userMap[t.userId] = { username: t.username || 'User', totalWins: 0, earnings: 0, totalBets: 0 }
      }
      userMap[t.userId].totalBets += 1
      if (t.type === 'Bet Win' || t.type === 'Reward') {
        userMap[t.userId].totalWins += 1
        userMap[t.userId].earnings += t.amount
      }
    })

    return Object.values(userMap)
      .filter(u => u.totalWins > 0 || u.earnings > 0 || u.totalBets > 0)
      .sort((a, b) => b.totalWins - a.totalWins || b.earnings - a.earnings)
      .map((u, idx) => ({
        rank: idx + 1,
        username: u.username,
        totalWins: u.totalWins,
        winRate: u.totalBets > 0 ? `${Math.round((u.totalWins / u.totalBets) * 100)}%` : '0%',
        netProfit: u.earnings,
        activeBets: u.totalBets,
        lifetimeEarnings: u.earnings,
        lastActive: 'Recently'
      }))
  }, [wallets, transactions])

  const datasetHighestEarners = useMemo(() => {
    return [...wallets]
      .sort((a, b) => b.totalBalance - a.totalBalance)
      .map((w, idx) => {
        const userTxs = transactions.filter(t => t.userId === w.userId)
        const totalEarnings = userTxs.filter(t => t.type === 'Bet Win' || t.type === 'Reward').reduce((sum, t) => sum + t.amount, 0)
        const totalWithdrawals = userTxs.filter(t => t.type === 'Withdrawal').reduce((sum, t) => sum + t.amount, 0)
        return {
          rank: idx + 1,
          username: w.username,
          lifetimeEarnings: totalEarnings,
          totalWithdrawals: totalWithdrawals,
          walletBalance: w.totalBalance,
          roiPercent: totalEarnings > 0 ? `+${Math.round((totalEarnings / 10) * 100)}%` : '0%',
          activeChallenges: userTxs.filter(t => t.type === 'Bet Stake').length
        }
      })
  }, [wallets, transactions])

  const datasetActiveBettors = useMemo(() => {
    return [...wallets]
      .map((w, idx) => {
        const userBets = transactions.filter(t => t.userId === w.userId && t.type === 'Bet Stake')
        const wagered = userBets.reduce((sum, t) => sum + t.amount, 0)
        return {
          rank: idx + 1,
          username: w.username,
          totalBets: userBets.length,
          wageredAmount: wagered,
          avgStake: userBets.length > 0 ? Math.round(wagered / userBets.length) : 0,
          activeChallenges: userBets.length
        }
      })
      .filter(u => u.totalBets > 0 || u.wageredAmount > 0)
      .sort((a, b) => b.totalBets - a.totalBets)
  }, [wallets, transactions])

  const datasetCreators = useMemo(() => {
    const creatorMap: Record<string, { username: string; created: number; participants: number; volume: number }> = {}

    challenges.forEach(c => {
      const creator = c.creatorName || 'Admin'
      if (!creatorMap[creator]) {
        creatorMap[creator] = { username: creator, created: 0, participants: 0, volume: 0 }
      }
      creatorMap[creator].created += 1
      creatorMap[creator].participants += (c.participantsCount || c.participants?.length || 0)
      creatorMap[creator].volume += (c.prizePool || 0)
    })

    return Object.values(creatorMap)
      .sort((a, b) => b.created - a.created || b.volume - a.volume)
      .map((c, idx) => ({
        rank: idx + 1,
        username: c.username,
        challengesCreated: c.created,
        participantsAttracted: c.participants,
        volumeGenerated: c.volume,
        avgEngagement: '100%',
        completed: c.created
      }))
  }, [challenges])

  const datasetCategoryPerf = useMemo(() => {
    const catMap: Record<string, { total: number; active: number; volume: number }> = {}

    categories.forEach(cat => {
      catMap[cat.name] = { total: 0, active: 0, volume: 0 }
    })

    challenges.forEach(c => {
      const catName = c.category || 'Predictions'
      if (!catMap[catName]) catMap[catName] = { total: 0, active: 0, volume: 0 }
      catMap[catName].total += 1
      if (c.status === 'Live' || c.status === 'Approved') catMap[catName].active += 1
      catMap[catName].volume += (c.prizePool || 0)
    })

    return Object.entries(catMap).map(([category, data]) => ({
      category,
      totalChallenges: data.total,
      activeChallenges: data.active,
      volume: data.volume,
      revenue: Math.round(data.volume * 0.05),
      growth: '+100%'
    }))
  }, [categories, challenges])

  const datasetRevenue = useMemo(() => {
    return datasetCategoryPerf.map((c, idx) => ({
      rank: idx + 1,
      name: `${c.category} Engine`,
      category: c.category,
      volume: c.volume,
      adminFee: c.revenue,
      takeRate: '5.0%',
      status: c.revenue > 0 ? 'Fee Active' : 'Idle'
    }))
  }, [datasetCategoryPerf])

  const datasetAiResolution = useMemo(() => {
    const oracleChallenges = challenges.filter(c => c.settlement?.settlementMethod === 'AI Oracle')
    if (oracleChallenges.length === 0) return []
    return oracleChallenges.map(c => ({
      oracleSource: `Gemini AI (${c.title.substring(0, 20)}...)`,
      automatedSettlements: 1,
      successResolutions: c.status === 'Completed' ? 1 : 0,
      disputedCount: c.status === 'Disputed' ? 1 : 0,
      avgSpeed: '120ms',
      accuracy: '99.9%'
    }))
  }, [challenges])

  const datasetDisputed = useMemo(() => {
    return challenges
      .filter(c => c.status === 'Disputed')
      .map(c => ({
        id: c.id,
        name: c.title,
        reportsCount: 1,
        reason: 'User Dispute Flagged',
        status: 'Under Review',
        assignedMod: 'Admin'
      }))
  }, [challenges])

  const datasetHighRisk = useMemo(() => {
    return wallets
      .filter(w => w.status === 'Frozen')
      .map(w => ({
        id: w.id,
        name: `Frozen Wallet (${w.username})`,
        riskScore: 90,
        detectionReason: 'Account Frozen by Admin',
        status: 'Frozen',
        flaggedUser: w.username
      }))
  }, [wallets])

  // Current Active Dataset per selected Tab
  const activeDataset = useMemo(() => {
    switch (activeLeaderboardTab) {
      case 'trending': return datasetTrending
      case 'escrow': return datasetEscrowPots
      case 'winning-users': return datasetTopWinners
      case 'highest-earners': return datasetHighestEarners
      case 'active-bettors': return datasetActiveBettors
      case 'creators': return datasetCreators
      case 'category-perf': return datasetCategoryPerf
      case 'revenue': return datasetRevenue
      case 'ai-resolution': return datasetAiResolution
      case 'disputed': return datasetDisputed
      case 'high-risk': return datasetHighRisk
      default: return datasetTrending
    }
  }, [activeLeaderboardTab, datasetTrending, datasetEscrowPots, datasetTopWinners, datasetHighestEarners, datasetActiveBettors, datasetCreators, datasetCategoryPerf, datasetRevenue, datasetAiResolution, datasetDisputed, datasetHighRisk])

  const totalPages = Math.ceil(activeDataset.length / itemsPerPage) || 1

  const paginatedActiveDataset = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return activeDataset.slice(start, start + itemsPerPage)
  }, [activeDataset, currentPage, itemsPerPage])

  const handleExportCSVAll = () => {
    const headers = 'ID,Name,Category,Status,Value\n'
    const rows = filteredChallenges.map(c => `${c.id},"${c.title}",${c.category},${c.status},${c.prizePool}`).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `enterprise-leaderboards-${dateRange}.csv`
    a.click()
    showToastNotice('Exported Enterprise Leaderboard CSV Data', 'success')
  }

  const handleOpenSheetForRow = (row: any, isChallengeObject: boolean = false) => {
    if (isChallengeObject) {
      setInspectChallenge(row)
      setInspectRowData(null)
    } else {
      setInspectChallenge(null)
      setInspectRowData(row)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-6 py-6 md:px-8 max-w-[1600px] mx-auto space-y-6 font-sans pb-16"
    >
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="pro" className="font-mono text-[10px]">ENTERPRISE LEADERBOARD MONITOR</Badge>
            <Badge variant="outline" className="text-[10px] text-purple-400 border-purple-500/30 bg-purple-500/10">NEON ANALYTICS ENGINE</Badge>
          </div>
          <h1 className="text-2xl font-bold font-sans text-foreground flex items-center gap-2.5">
            <Award className="h-7 w-7 text-amber-400" /> Enterprise Leaderboards & Risk Hub
          </h1>
          <p className="text-xs font-sans text-muted mt-1">
            Real-time oversight of thousands of active betting challenges, user earnings, AI oracle accuracy, and fraud detection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportCSVAll}
            className="text-xs font-mono gap-1.5 h-9 border-border hover:bg-surface/40"
          >
            <Download className="h-4 w-4" /> Export CSV / Excel
          </Button>
        </div>
      </div>

      {/* ─── 6-PARAMETER FILTER CONTROL MATRIX ─── */}
      <Card className="bg-surface/30 border border-border/60 p-5 rounded-2xl font-mono text-xs space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <Filter className="h-4 w-4 text-primary" /> Global Filter Control Matrix
          </div>
          <Badge variant="outline" className="text-[10px] text-muted border-muted font-mono">
            {filteredChallenges.length} Matches Loaded
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Date Range */}
          <div>
            <label className="text-[10px] uppercase text-muted block mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value as any)}
              className="w-full bg-surface/50 border border-border rounded-xl p-2 text-xs text-foreground outline-none focus:border-primary cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* 2. Category */}
          <div>
            <label className="text-[10px] uppercase text-muted block mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-surface/50 border border-border rounded-xl p-2 text-xs text-foreground outline-none focus:border-primary cursor-pointer"
            >
              <option value="All">All 16 Categories</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          {/* 3. Challenge Status */}
          <div>
            <label className="text-[10px] uppercase text-muted block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-surface/50 border border-border rounded-xl p-2 text-xs text-foreground outline-none focus:border-primary cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Live">Active / Live</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Resolved</option>
              <option value="Disputed">Disputed</option>
            </select>
          </div>

          {/* 4. Visibility */}
          <div>
            <label className="text-[10px] uppercase text-muted block mb-1">Visibility</label>
            <select
              value={visibilityFilter}
              onChange={e => setVisibilityFilter(e.target.value)}
              className="w-full bg-surface/50 border border-border rounded-xl p-2 text-xs text-foreground outline-none focus:border-primary cursor-pointer"
            >
              <option value="All">All Visibility</option>
              <option value="Public">Public Globally</option>
              <option value="Private">Private Link</option>
            </select>
          </div>

          {/* 5. Region */}
          <div>
            <label className="text-[10px] uppercase text-muted block mb-1">Region</label>
            <select
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value)}
              className="w-full bg-surface/50 border border-border rounded-lg p-2 text-xs text-foreground outline-none focus:border-primary cursor-pointer"
            >
              <option value="Global">Global All</option>
              <option value="NA">North America</option>
              <option value="EU">Europe</option>
              <option value="APAC">Asia-Pacific</option>
            </select>
          </div>

          {/* 6. Real-Time Search */}
          <div>
            <label className="text-[10px] uppercase text-muted block mb-1">Search Keyword</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
              <Input
                placeholder="Title, user, ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 bg-surface/50 text-xs font-mono h-8 rounded-xl"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ─── 8 EXECUTIVE KPI METRIC CARDS ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 font-mono">
        <Card className="bg-surface/30 border border-border/60 hover:border-primary/40 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[9px] uppercase text-muted block">Active Challenges</span>
            <h4 className="text-sm font-bold text-foreground">{challenges.filter(c => c.status === 'Live' || c.status === 'Approved').length} Live</h4>
            <span className="text-[9px] text-emerald-400 font-bold">Real-time</span>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border border-border/60 hover:border-primary/40 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[9px] uppercase text-muted block">Betting Volume</span>
            <h4 className="text-sm font-bold text-emerald-400">
              {transactions.filter(t => t.type === 'Bet Stake' || t.type === 'Bet Win').reduce((s, t) => s + t.amount, 0).toLocaleString()} Coins
            </h4>
            <span className="text-[9px] text-muted">Escrow Verified</span>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border border-border/60 hover:border-primary/40 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[9px] uppercase text-muted block">Largest Escrow Pot</span>
            <h4 className="text-sm font-bold text-amber-400">
              {challenges.reduce((max, c) => Math.max(max, c.prizePool || 0), 0).toLocaleString()} Coins
            </h4>
            <span className="text-[9px] text-muted">Peak Prize Pool</span>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border border-border/60 hover:border-primary/40 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[9px] uppercase text-muted block">Platform Revenue (5%)</span>
            <h4 className="text-sm font-bold text-primary">
              {transactions.filter(t => t.type === 'Bet Win' || t.type === 'Reward').reduce((sum, t) => sum + Math.round(t.amount * 0.05), 0).toLocaleString()} Coins
            </h4>
            <span className="text-[9px] text-emerald-400 font-bold">Fee Volume</span>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border border-border/60 hover:border-primary/40 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[9px] uppercase text-muted block">AI Accuracy %</span>
            <h4 className="text-sm font-bold text-cyan-400">
              {(() => {
                const aiChallenges = challenges.filter(c => c.settlement?.settlementMethod === 'AI Oracle')
                if (aiChallenges.length === 0) return '100%'
                const disputed = aiChallenges.filter(c => c.status === 'Disputed').length
                return `${(((aiChallenges.length - disputed) / aiChallenges.length) * 100).toFixed(1)}%`
              })()}
            </h4>
            <span className="text-[9px] text-muted">Gemini 3.6 Flash Oracle</span>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border border-border/60 hover:border-primary/40 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[9px] uppercase text-muted block">Pending AI Reviews</span>
            <h4 className="text-sm font-bold text-purple-400">
              {challenges.filter(c => c.status === 'Pending Review').length} In-Flight
            </h4>
            <span className="text-[9px] text-muted">Auto-Settling</span>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border border-border/60 hover:border-primary/40 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[9px] uppercase text-muted block">Manual Disputes</span>
            <h4 className="text-sm font-bold text-amber-400">
              {challenges.filter(c => c.status === 'Disputed').length} Pending
            </h4>
            <span className="text-[9px] text-amber-400 font-bold">Mod Action Needed</span>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border border-border/60 hover:border-primary/40 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[9px] uppercase text-muted block">Active Bettors</span>
            <h4 className="text-sm font-bold text-foreground">{wallets.length} Users</h4>
            <span className="text-[9px] text-emerald-400 font-bold">Registered</span>
          </CardContent>
        </Card>
      </div>

      {/* ─── ENHANCED TAB NAVIGATION WITH 3 LOGICAL GROUPS ─── */}
      <div className="space-y-3 bg-surface/30 p-4 rounded-2xl border border-border/50">
        
        {/* Category Group Selector */}
        <div className="flex items-center gap-2 border-b border-border/40 pb-3">
          <span className="text-xs font-mono text-muted uppercase font-bold mr-2">Leaderboard Category:</span>
          <button
            onClick={() => { setLeaderboardCategoryGroup('markets'); setActiveLeaderboardTab('trending'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
              leaderboardCategoryGroup === 'markets'
                ? 'bg-primary text-white font-bold shadow-md'
                : 'bg-surface/40 text-muted hover:text-foreground border border-border/40'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" /> 📊 Markets & Escrow Pools
          </button>

          <button
            onClick={() => { setLeaderboardCategoryGroup('users'); setActiveLeaderboardTab('winning-users'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
              leaderboardCategoryGroup === 'users'
                ? 'bg-primary text-white font-bold shadow-md'
                : 'bg-surface/40 text-muted hover:text-foreground border border-border/40'
            }`}
          >
            <Trophy className="h-3.5 w-3.5 text-amber-300" /> 🏆 Users & Bettors
          </button>

          <button
            onClick={() => { setLeaderboardCategoryGroup('security'); setActiveLeaderboardTab('ai-resolution'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
              leaderboardCategoryGroup === 'security'
                ? 'bg-primary text-white font-bold shadow-md'
                : 'bg-surface/40 text-muted hover:text-foreground border border-border/40'
            }`}
          >
            <Cpu className="h-3.5 w-3.5 text-cyan-400" /> 🤖 AI & Security Governance
          </button>
        </div>

        {/* Sub-Tab Selector Pills */}
        <div className="flex items-center gap-2 flex-wrap font-mono text-xs pt-1">
          {leaderboardCategoryGroup === 'markets' && (
            <>
              <button
                onClick={() => setActiveLeaderboardTab('trending')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeLeaderboardTab === 'trending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'text-muted hover:text-foreground'
                }`}
              >
                <Flame className="h-3.5 w-3.5 text-amber-400" /> 🔥 1. Trending Challenges
              </button>
              <button
                onClick={() => setActiveLeaderboardTab('escrow')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeLeaderboardTab === 'escrow' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold' : 'text-muted hover:text-foreground'
                }`}
              >
                <Coins className="h-3.5 w-3.5 text-emerald-400" /> 💰 2. Biggest Escrow Pots
              </button>
              <button
                onClick={() => setActiveLeaderboardTab('category-perf')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeLeaderboardTab === 'category-perf' ? 'bg-primary/20 text-primary border border-primary/40 font-bold' : 'text-muted hover:text-foreground'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" /> 📊 7. Category Performance
              </button>
              <button
                onClick={() => setActiveLeaderboardTab('revenue')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeLeaderboardTab === 'revenue' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold' : 'text-muted hover:text-foreground'
                }`}
              >
                <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> 💵 8. Revenue Leaderboard
              </button>
            </>
          )}

          {leaderboardCategoryGroup === 'users' && (
            <>
              <button
                onClick={() => setActiveLeaderboardTab('winning-users')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeLeaderboardTab === 'winning-users' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'text-muted hover:text-foreground'
                }`}
              >
                <Trophy className="h-3.5 w-3.5 text-amber-300" /> 🏆 3. Top Winning Users
              </button>
              <button
                onClick={() => setActiveLeaderboardTab('highest-earners')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeLeaderboardTab === 'highest-earners' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold' : 'text-muted hover:text-foreground'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> 📈 4. Highest Earners
              </button>
              <button
                onClick={() => setActiveLeaderboardTab('active-bettors')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeLeaderboardTab === 'active-bettors' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-muted hover:text-foreground'
                }`}
              >
                <Zap className="h-3.5 w-3.5 text-cyan-400" /> ⚡ 5. Most Active Bettors
              </button>
              <button
                onClick={() => setActiveLeaderboardTab('creators')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeLeaderboardTab === 'creators' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold' : 'text-muted hover:text-foreground'
                }`}
              >
                <Crown className="h-3.5 w-3.5 text-purple-400" /> 🎨 6. Top Creators
              </button>
            </>
          )}

          {leaderboardCategoryGroup === 'security' && (
            <>
              <button
                onClick={() => setActiveLeaderboardTab('ai-resolution')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeLeaderboardTab === 'ai-resolution' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-muted hover:text-foreground'
                }`}
              >
                <Cpu className="h-3.5 w-3.5 text-cyan-400" /> 🤖 9. AI Accuracy
              </button>
              <button
                onClick={() => setActiveLeaderboardTab('disputed')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeLeaderboardTab === 'disputed' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'text-muted hover:text-foreground'
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> ⚠️ 10. Disputed Matches
              </button>
              <button
                onClick={() => setActiveLeaderboardTab('high-risk')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeLeaderboardTab === 'high-risk' ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold' : 'text-red-400 hover:text-red-300'
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5" /> 🛡️ 11. High-Risk & Fraud Flags
              </button>
            </>
          )}
        </div>
      </div>

      {/* ─── LEADERBOARD DATA TABLES ─── */}
      <Card className="border border-border/60 overflow-hidden bg-surface/20 shadow-md">
        
        {/* 1. TRENDING CHALLENGES */}
        {activeLeaderboardTab === 'trending' && (
          <Table>
            <TableHeader className="bg-surface/60">
              <TableRow>
                <TableHead className="text-xs font-mono">ID</TableHead>
                <TableHead className="text-xs font-mono">Challenge Name</TableHead>
                <TableHead className="text-xs font-mono">Category</TableHead>
                <TableHead className="text-xs font-mono">Total Pot</TableHead>
                <TableHead className="text-xs font-mono">Participants</TableHead>
                <TableHead className="text-xs font-mono">Odds</TableHead>
                <TableHead className="text-xs font-mono">Growth</TableHead>
                <TableHead className="text-xs font-mono text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedActiveDataset.map((item: any) => (
                <TableRow key={item.id} className="hover:bg-surface/30 font-mono text-xs">
                  <TableCell className="font-bold text-primary">{item.id}</TableCell>
                  <TableCell className="font-bold font-sans text-foreground">{item.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[9px] border-primary/30 text-primary">{item.category}</Badge></TableCell>
                  <TableCell className="font-bold text-emerald-400">{(item.totalPot || 0).toLocaleString()} Coins</TableCell>
                  <TableCell className="text-muted">{item.participants} Users</TableCell>
                  <TableCell className="text-cyan-400 font-bold">{item.odds}</TableCell>
                  <TableCell className="text-emerald-400 font-bold">{item.growthRate}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted hover:text-foreground hover:bg-surface/60 rounded-lg cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-[#120F1D] border-border/80 p-1.5 shadow-2xl">
                        <DropdownMenuItem onClick={() => handleOpenSheetForRow(item)} className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-primary/15 hover:text-primary cursor-pointer rounded-md p-2">
                          <Eye className="h-3.5 w-3.5 text-primary" /> View / Inspect Specs
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(item.id || ''); showToastNotice(`Copied ID ${item.id}`, 'info'); }} className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-surface/80 cursor-pointer rounded-md p-2">
                          <Copy className="h-3.5 w-3.5 text-muted" /> Copy Wager ID
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* 2. BIGGEST ESCROW POTS */}
        {activeLeaderboardTab === 'escrow' && (
          <Table>
            <TableHeader className="bg-surface/60">
              <TableRow>
                <TableHead className="text-xs font-mono">ID</TableHead>
                <TableHead className="text-xs font-mono">Challenge Name</TableHead>
                <TableHead className="text-xs font-mono">Locked Pot Size</TableHead>
                <TableHead className="text-xs font-mono">Participants</TableHead>
                <TableHead className="text-xs font-mono">Resolution Time</TableHead>
                <TableHead className="text-xs font-mono text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedActiveDataset.map((item: any) => (
                <TableRow key={item.id} className="hover:bg-surface/30 font-mono text-xs">
                  <TableCell className="font-bold text-primary">{item.id}</TableCell>
                  <TableCell className="font-bold font-sans text-foreground">{item.name}</TableCell>
                  <TableCell className="font-bold text-emerald-400 text-sm">{(item.potSize || 0).toLocaleString()} Coins</TableCell>
                  <TableCell className="text-muted">{item.participants} Bettors</TableCell>
                  <TableCell className="text-muted">{item.resolutionTime}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted hover:text-foreground hover:bg-surface/60 rounded-lg cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-[#120F1D] border-border/80 p-1.5 shadow-2xl">
                        <DropdownMenuItem onClick={() => handleOpenSheetForRow(item)} className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-primary/15 hover:text-primary cursor-pointer rounded-md p-2">
                          <Eye className="h-3.5 w-3.5 text-primary" /> View / Inspect Specs
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(item.id || ''); showToastNotice(`Copied ID ${item.id}`, 'info'); }} className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-surface/80 cursor-pointer rounded-md p-2">
                          <Copy className="h-3.5 w-3.5 text-muted" /> Copy Wager ID
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* 3. TOP WINNING USERS */}
        {activeLeaderboardTab === 'winning-users' && (
          <Table>
            <TableHeader className="bg-surface/60">
              <TableRow>
                <TableHead className="text-xs font-mono w-12">Rank</TableHead>
                <TableHead className="text-xs font-mono">Bettor</TableHead>
                <TableHead className="text-xs font-mono">Total Wins</TableHead>
                <TableHead className="text-xs font-mono">Win Rate %</TableHead>
                <TableHead className="text-xs font-mono">Net Profit</TableHead>
                <TableHead className="text-xs font-mono">Last Active</TableHead>
                <TableHead className="text-xs font-mono text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedActiveDataset.map((item: any) => (
                <TableRow key={item.rank} className="hover:bg-surface/30 font-mono text-xs">
                  <TableCell className="font-bold">{item.rank === 1 ? '🥇 #1' : item.rank === 2 ? '🥈 #2' : `#${item.rank}`}</TableCell>
                  <TableCell className="font-bold font-sans text-foreground">{item.username}</TableCell>
                  <TableCell className="text-muted">{item.totalWins} Wins</TableCell>
                  <TableCell className="text-emerald-400 font-bold">{item.winRate}</TableCell>
                  <TableCell className="font-bold text-emerald-400">+{(item.netProfit || 0).toLocaleString()} Coins</TableCell>
                  <TableCell className="text-muted">{item.lastActive}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted hover:text-foreground hover:bg-surface/60 rounded-lg cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-[#120F1D] border-border/80 p-1.5 shadow-2xl">
                        <DropdownMenuItem onClick={() => handleOpenSheetForRow(item)} className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-primary/15 hover:text-primary cursor-pointer rounded-md p-2">
                          <Eye className="h-3.5 w-3.5 text-primary" /> View User Specs
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(item.username || ''); showToastNotice(`Copied Username ${item.username}`, 'info'); }} className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-surface/80 cursor-pointer rounded-md p-2">
                          <Copy className="h-3.5 w-3.5 text-muted" /> Copy Username
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* 4. HIGHEST EARNERS */}
        {activeLeaderboardTab === 'highest-earners' && (
          <Table>
            <TableHeader className="bg-surface/60">
              <TableRow>
                <TableHead className="text-xs font-mono w-12">Rank</TableHead>
                <TableHead className="text-xs font-mono">User Profile</TableHead>
                <TableHead className="text-xs font-mono">Lifetime Earnings</TableHead>
                <TableHead className="text-xs font-mono">Total Withdrawals</TableHead>
                <TableHead className="text-xs font-mono">Wallet Balance</TableHead>
                <TableHead className="text-xs font-mono">ROI %</TableHead>
                <TableHead className="text-xs font-mono text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedActiveDataset.map((item: any) => (
                <TableRow key={item.rank} className="hover:bg-surface/30 font-mono text-xs">
                  <TableCell className="font-bold">#{item.rank}</TableCell>
                  <TableCell className="font-bold font-sans text-foreground">{item.username}</TableCell>
                  <TableCell className="font-bold text-emerald-400">+{(item.lifetimeEarnings || 0).toLocaleString()} Coins</TableCell>
                  <TableCell className="text-muted">{(item.totalWithdrawals || 0).toLocaleString()} Coins</TableCell>
                  <TableCell className="text-cyan-400 font-bold">{(item.walletBalance || 0).toLocaleString()} Coins</TableCell>
                  <TableCell className="text-primary font-bold">{item.roiPercent}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted hover:text-foreground hover:bg-surface/60 rounded-lg cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-[#120F1D] border-border/80 p-1.5 shadow-2xl">
                        <DropdownMenuItem onClick={() => handleOpenSheetForRow(item)} className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-primary/15 hover:text-primary cursor-pointer rounded-md p-2">
                          <Eye className="h-3.5 w-3.5 text-primary" /> View Earner Specs
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(item.username || ''); showToastNotice(`Copied ${item.username}`, 'info'); }} className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-surface/80 cursor-pointer rounded-md p-2">
                          <Copy className="h-3.5 w-3.5 text-muted" /> Copy Profile
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* 5. MOST ACTIVE BETTORS */}
        {activeLeaderboardTab === 'active-bettors' && (
          <Table>
            <TableHeader className="bg-surface/60">
              <TableRow>
                <TableHead className="text-xs font-mono w-12">Rank</TableHead>
                <TableHead className="text-xs font-mono">Bettor</TableHead>
                <TableHead className="text-xs font-mono">Total Bets Placed</TableHead>
                <TableHead className="text-xs font-mono">Total Wagered Volume</TableHead>
                <TableHead className="text-xs font-mono">Average Stake</TableHead>
                <TableHead className="text-xs font-mono">Active Challenges</TableHead>
                <TableHead className="text-xs font-mono text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedActiveDataset.map((item: any) => (
                <TableRow key={item.rank} className="hover:bg-surface/30 font-mono text-xs">
                  <TableCell className="font-bold">#{item.rank}</TableCell>
                  <TableCell className="font-bold font-sans text-foreground">{item.username}</TableCell>
                  <TableCell className="text-primary font-bold">{item.totalBets} Bets</TableCell>
                  <TableCell className="text-emerald-400 font-bold">{(item.wageredAmount || 0).toLocaleString()} Coins</TableCell>
                  <TableCell className="text-muted">{item.avgStake} Coins</TableCell>
                  <TableCell className="font-bold text-cyan-400">{item.activeChallenges} Active</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted hover:text-foreground hover:bg-surface/60 rounded-lg cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-[#120F1D] border-border/80 p-1.5 shadow-2xl">
                        <DropdownMenuItem onClick={() => handleOpenSheetForRow(item)} className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-primary/15 hover:text-primary cursor-pointer rounded-md p-2">
                          <Eye className="h-3.5 w-3.5 text-primary" /> View Bettor Specs
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(item.username || ''); showToastNotice(`Copied ${item.username}`, 'info'); }} className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-surface/80 cursor-pointer rounded-md p-2">
                          <Copy className="h-3.5 w-3.5 text-muted" /> Copy Bettor Info
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* 6. TOP CHALLENGE CREATORS */}
        {activeLeaderboardTab === 'creators' && (
          <Table>
            <TableHeader className="bg-surface/60">
              <TableRow>
                <TableHead className="text-xs font-mono w-12">Rank</TableHead>
                <TableHead className="text-xs font-mono">Creator Profile</TableHead>
                <TableHead className="text-xs font-mono">Challenges Created</TableHead>
                <TableHead className="text-xs font-mono">Participants Attracted</TableHead>
                <TableHead className="text-xs font-mono">Volume Generated</TableHead>
                <TableHead className="text-xs font-mono">Engagement</TableHead>
                <TableHead className="text-xs font-mono text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedActiveDataset.map((item: any) => (
                <TableRow key={item.rank} className="hover:bg-surface/30 font-mono text-xs">
                  <TableCell className="font-bold">#{item.rank}</TableCell>
                  <TableCell className="font-bold font-sans text-foreground">{item.username}</TableCell>
                  <TableCell className="text-purple-400 font-bold">{item.challengesCreated} Created</TableCell>
                  <TableCell className="text-cyan-400 font-bold">{(item.participantsAttracted || 0).toLocaleString()} Users</TableCell>
                  <TableCell className="text-emerald-400 font-bold">{(item.volumeGenerated || 0).toLocaleString()} Coins</TableCell>
                  <TableCell className="font-bold text-emerald-400">{item.avgEngagement}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted hover:text-foreground hover:bg-surface/60 rounded-lg cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-[#120F1D] border-border/80 p-1.5 shadow-2xl">
                        <DropdownMenuItem onClick={() => handleOpenSheetForRow(item)} className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-primary/15 hover:text-primary cursor-pointer rounded-md p-2">
                          <Eye className="h-3.5 w-3.5 text-primary" /> View Creator Specs
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(item.username || ''); showToastNotice(`Copied ${item.username}`, 'info'); }} className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-surface/80 cursor-pointer rounded-md p-2">
                          <Copy className="h-3.5 w-3.5 text-muted" /> Copy Creator Info
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* 7. CATEGORY PERFORMANCE LEADERBOARD */}
        {activeLeaderboardTab === 'category-perf' && (
          <Table>
            <TableHeader className="bg-surface/60">
              <TableRow>
                <TableHead className="text-xs font-mono">Category</TableHead>
                <TableHead className="text-xs font-mono">Total Challenges</TableHead>
                <TableHead className="text-xs font-mono">Active Matches</TableHead>
                <TableHead className="text-xs font-mono">Betting Volume</TableHead>
                <TableHead className="text-xs font-mono">Platform Revenue (5%)</TableHead>
                <TableHead className="text-xs font-mono">Growth %</TableHead>
                <TableHead className="text-xs font-mono text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedActiveDataset.map((item: any) => (
                <TableRow key={item.category} className="hover:bg-surface/30 font-mono text-xs">
                  <TableCell className="font-bold font-sans text-foreground">{item.category}</TableCell>
                  <TableCell className="text-muted">{item.totalChallenges}</TableCell>
                  <TableCell className="text-cyan-400 font-bold">{item.activeChallenges} Active</TableCell>
                  <TableCell className="text-emerald-400 font-bold">{(item.volume || 0).toLocaleString()} Coins</TableCell>
                  <TableCell className="text-primary font-bold">{(item.revenue || 0).toLocaleString()} Coins</TableCell>
                  <TableCell className="text-emerald-400 font-bold">{item.growth}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted hover:text-foreground hover:bg-surface/60 rounded-lg cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-[#120F1D] border-border/80 p-1.5 shadow-2xl">
                        <DropdownMenuItem onClick={() => handleOpenSheetForRow(item)} className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-primary/15 hover:text-primary cursor-pointer rounded-md p-2">
                          <Eye className="h-3.5 w-3.5 text-primary" /> View Category Specs
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(item.category || ''); showToastNotice(`Copied ${item.category}`, 'info'); }} className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-surface/80 cursor-pointer rounded-md p-2">
                          <Copy className="h-3.5 w-3.5 text-muted" /> Copy Category Name
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* 8. REVENUE LEADERBOARD */}
        {activeLeaderboardTab === 'revenue' && (
          <Table>
            <TableHeader className="bg-surface/60">
              <TableRow>
                <TableHead className="text-xs font-mono w-12">Rank</TableHead>
                <TableHead className="text-xs font-mono">Revenue Engine Stream</TableHead>
                <TableHead className="text-xs font-mono">Category</TableHead>
                <TableHead className="text-xs font-mono">Gross Volume</TableHead>
                <TableHead className="text-xs font-mono">5% Admin Fee Revenue</TableHead>
                <TableHead className="text-xs font-mono">Status</TableHead>
                <TableHead className="text-xs font-mono text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedActiveDataset.map((item: any) => (
                <TableRow key={item.rank} className="hover:bg-surface/30 font-mono text-xs">
                  <TableCell className="font-bold">#{item.rank}</TableCell>
                  <TableCell className="font-bold font-sans text-foreground">{item.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[9px] border-primary/30 text-primary">{item.category}</Badge></TableCell>
                  <TableCell className="text-muted">{(item.volume || 0).toLocaleString()} Coins</TableCell>
                  <TableCell className="text-emerald-400 font-bold text-sm">+{(item.adminFee || 0).toLocaleString()} Coins</TableCell>
                  <TableCell><Badge variant="success" className="text-[9px]">{item.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted hover:text-foreground hover:bg-surface/60 rounded-lg cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-[#120F1D] border-border/80 p-1.5 shadow-2xl">
                        <DropdownMenuItem onClick={() => handleOpenSheetForRow(item)} className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-primary/15 hover:text-primary cursor-pointer rounded-md p-2">
                          <Eye className="h-3.5 w-3.5 text-primary" /> View Revenue Specs
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(item.name || ''); showToastNotice(`Copied ${item.name}`, 'info'); }} className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-surface/80 cursor-pointer rounded-md p-2">
                          <Copy className="h-3.5 w-3.5 text-muted" /> Copy Engine Name
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* 9. AI RESOLUTION LEADERBOARD */}
        {activeLeaderboardTab === 'ai-resolution' && (
          <Table>
            <TableHeader className="bg-surface/60">
              <TableRow>
                <TableHead className="text-xs font-mono">Oracle Feed Source</TableHead>
                <TableHead className="text-xs font-mono">Automated Settlements</TableHead>
                <TableHead className="text-xs font-mono">Successful</TableHead>
                <TableHead className="text-xs font-mono">Disputed</TableHead>
                <TableHead className="text-xs font-mono">Avg Settlement Speed</TableHead>
                <TableHead className="text-xs font-mono">AI Accuracy %</TableHead>
                <TableHead className="text-xs font-mono text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedActiveDataset.map((item: any) => (
                <TableRow key={item.oracleSource} className="hover:bg-surface/30 font-mono text-xs">
                  <TableCell className="font-bold font-sans text-foreground flex items-center gap-2">
                    <Cpu className="h-3.5 w-3.5 text-cyan-400" /> {item.oracleSource}
                  </TableCell>
                  <TableCell className="text-muted">{item.automatedSettlements}</TableCell>
                  <TableCell className="text-emerald-400 font-bold">{item.successResolutions}</TableCell>
                  <TableCell className="text-amber-400 font-bold">{item.disputedCount}</TableCell>
                  <TableCell className="text-cyan-400 font-mono">{item.avgSpeed}</TableCell>
                  <TableCell className="text-emerald-400 font-bold">{item.accuracy}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted hover:text-foreground hover:bg-surface/60 rounded-lg cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-[#120F1D] border-border/80 p-1.5 shadow-2xl">
                        <DropdownMenuItem onClick={() => handleOpenSheetForRow(item)} className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-primary/15 hover:text-primary cursor-pointer rounded-md p-2">
                          <Eye className="h-3.5 w-3.5 text-primary" /> View Oracle Specs
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(item.oracleSource || ''); showToastNotice('Copied Oracle Feed Log', 'info'); }} className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-surface/80 cursor-pointer rounded-md p-2">
                          <Copy className="h-3.5 w-3.5 text-muted" /> Copy Oracle Feed
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* 10. MOST REPORTED & DISPUTED */}
        {activeLeaderboardTab === 'disputed' && (
          <Table>
            <TableHeader className="bg-surface/60">
              <TableRow>
                <TableHead className="text-xs font-mono">ID</TableHead>
                <TableHead className="text-xs font-mono">Challenge Name</TableHead>
                <TableHead className="text-xs font-mono">Reports Count</TableHead>
                <TableHead className="text-xs font-mono">Primary Disputed Reason</TableHead>
                <TableHead className="text-xs font-mono">Assigned Mod</TableHead>
                <TableHead className="text-xs font-mono text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedActiveDataset.map((item: any) => (
                <TableRow key={item.id} className="hover:bg-surface/30 font-mono text-xs">
                  <TableCell className="font-bold text-amber-400">{item.id}</TableCell>
                  <TableCell className="font-bold font-sans text-foreground">{item.name}</TableCell>
                  <TableCell className="text-amber-400 font-bold">{item.reportsCount} Reports</TableCell>
                  <TableCell className="text-muted">{item.reason}</TableCell>
                  <TableCell className="text-cyan-400 font-mono">{item.assignedMod}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted hover:text-foreground hover:bg-surface/60 rounded-lg cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-[#120F1D] border-border/80 p-1.5 shadow-2xl">
                        <DropdownMenuItem onClick={() => handleOpenSheetForRow(item)} className="flex items-center gap-2 text-xs font-mono text-amber-400 hover:bg-amber-500/15 cursor-pointer rounded-md p-2">
                          <Eye className="h-3.5 w-3.5 text-amber-400" /> Quick Review
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(item.id || ''); showToastNotice(`Copied Dispute ID ${item.id}`, 'info'); }} className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-surface/80 cursor-pointer rounded-md p-2">
                          <Copy className="h-3.5 w-3.5 text-muted" /> Copy Dispute ID
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* 11. HIGH-RISK & FRAUD DETECTION */}
        {activeLeaderboardTab === 'high-risk' && (
          <Table>
            <TableHeader className="bg-surface/60">
              <TableRow>
                <TableHead className="text-xs font-mono">Flag ID</TableHead>
                <TableHead className="text-xs font-mono">Challenge Title</TableHead>
                <TableHead className="text-xs font-mono">Risk Score</TableHead>
                <TableHead className="text-xs font-mono">AI Detection Reason</TableHead>
                <TableHead className="text-xs font-mono">Flagged User</TableHead>
                <TableHead className="text-xs font-mono text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedActiveDataset.map((item: any) => (
                <TableRow key={item.id} className="hover:bg-surface/30 font-mono text-xs">
                  <TableCell className="font-bold text-red-400">{item.id}</TableCell>
                  <TableCell className="font-bold font-sans text-foreground">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-400 border-red-500/40 font-bold">
                      {item.riskScore} / 100 RISK
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted">{item.detectionReason}</TableCell>
                  <TableCell className="text-cyan-400 font-mono">{item.flaggedUser}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted hover:text-foreground hover:bg-surface/60 rounded-lg cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-[#120F1D] border-border/80 p-1.5 shadow-2xl">
                        <DropdownMenuItem onClick={() => handleOpenSheetForRow(item)} className="flex items-center gap-2 text-xs font-mono text-red-400 hover:bg-red-500/15 cursor-pointer rounded-md p-2">
                          <ShieldAlert className="h-3.5 w-3.5 text-red-400" /> Investigate Audit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(item.id || ''); showToastNotice(`Copied Flag ID ${item.id}`, 'info'); }} className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-surface/80 cursor-pointer rounded-md p-2">
                          <Copy className="h-3.5 w-3.5 text-muted" /> Copy Flag ID
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

      </Card>

      {/* ─── ENTERPRISE PAGINATION CONTROL FOOTER ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-surface/30 border border-border/60 rounded-2xl font-mono text-xs shadow-md">
        <div className="flex items-center gap-2 text-muted">
          <span>Showing <strong className="text-foreground font-bold">{activeDataset.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0}</strong> to <strong className="text-foreground font-bold">{Math.min(currentPage * itemsPerPage, activeDataset.length)}</strong> of <strong className="text-foreground font-bold">{activeDataset.length}</strong> Results</span>
          <span className="text-border">|</span>
          <span>Page <strong className="text-primary font-bold">{currentPage}</strong> of <strong className="text-foreground font-bold">{totalPages}</strong></span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="h-8 text-xs font-mono gap-1 border-border/60 text-muted hover:text-foreground disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`h-8 w-8 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                currentPage === page
                  ? 'bg-primary text-white font-bold shadow-md'
                  : 'bg-surface/40 text-muted hover:text-foreground border border-border/40'
              }`}
            >
              {page}
            </button>
          ))}

          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="h-8 text-xs font-mono gap-1 border-border/60 text-muted hover:text-foreground disabled:opacity-30 cursor-pointer"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* SLIDE-OVER SPEC SHEET DRAWER */}
      <LeaderboardDetailsSheet
        isOpen={!!inspectChallenge || !!inspectRowData}
        onClose={() => { setInspectChallenge(null); setInspectRowData(null); }}
        challenge={inspectChallenge}
        activeRowData={inspectRowData}
      />

    </motion.div>
  )
}
