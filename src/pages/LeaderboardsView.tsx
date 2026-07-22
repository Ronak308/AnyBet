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
  ChevronRight
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { useChallenges } from '../context/ChallengesContext'
import type { ChallengeItem } from '../context/ChallengesContext'
import { LeaderboardDetailsSheet } from './challenges/LeaderboardDetailsSheet'

export const LeaderboardsView: React.FC = () => {
  const { challenges, categories, showToastNotice } = useChallenges()

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

  // Mock 11 Leaderboard Datasets
  const datasetTrending = useMemo(() => [
    { id: 'AB-9921', name: 'Will Bitcoin cross $100k by midnight?', category: 'Predictions', participants: 420, totalPot: 345000, odds: '1.95x', status: 'Live', endsIn: '2h 15m', growthRate: '+142%' },
    { id: 'AB-8820', name: 'Champions League Finals Score Predictor', category: 'Sports', participants: 380, totalPot: 290000, odds: '2.40x', status: 'Live', endsIn: '5h 40m', growthRate: '+98%' },
    { id: 'AB-7712', name: 'Marathon Completion Under 3 Hours', category: 'Fitness', participants: 210, totalPot: 185000, odds: '1.80x', status: 'Live', endsIn: '12h 00m', growthRate: '+76%' },
    { id: 'AB-6610', name: 'Will it Rain in Tokyo Tomorrow?', category: 'Weather', participants: 195, totalPot: 120000, odds: '2.10x', status: 'Live', endsIn: '18h 30m', growthRate: '+64%' },
    { id: 'AB-5501', name: 'League of Legends Worlds Finals Speedrun', category: 'Gaming & Esports', participants: 310, totalPot: 240000, odds: '1.90x', status: 'Live', endsIn: '1h 10m', growthRate: '+115%' }
  ], [])

  const datasetEscrowPots = useMemo(() => [
    { id: 'AB-9921', name: 'Will Bitcoin cross $100k by midnight?', category: 'Predictions', potSize: 345000, participants: 420, resolutionTime: '2026-07-22 23:59', status: 'Live' },
    { id: 'AB-8820', name: 'Champions League Finals Score Predictor', category: 'Sports', potSize: 290000, participants: 380, resolutionTime: '2026-07-23 18:00', status: 'Live' },
    { id: 'AB-5501', name: 'League of Legends Worlds Finals Speedrun', category: 'Gaming & Esports', potSize: 240000, participants: 310, resolutionTime: '2026-07-22 16:30', status: 'Live' },
    { id: 'AB-7712', name: 'Marathon Completion Under 3 Hours', category: 'Fitness', potSize: 185000, participants: 210, resolutionTime: '2026-07-24 09:00', status: 'Live' }
  ], [])

  const datasetTopWinners = useMemo(() => [
    { rank: 1, username: 'CryptoKing_99', totalWins: 142, winRate: '88.5%', netProfit: 428000, activeBets: 8, lifetimeEarnings: 680000, lastActive: '2 mins ago' },
    { rank: 2, username: 'Alex_R', totalWins: 118, winRate: '84.2%', netProfit: 345000, activeBets: 5, lifetimeEarnings: 520000, lastActive: '15 mins ago' },
    { rank: 3, username: 'Marcus_S', totalWins: 94, winRate: '79.8%', netProfit: 290000, activeBets: 6, lifetimeEarnings: 410000, lastActive: '1 hour ago' },
    { rank: 4, username: 'Elena_V', totalWins: 82, winRate: '75.4%', netProfit: 210000, activeBets: 4, lifetimeEarnings: 310000, lastActive: '30 mins ago' }
  ], [])

  const datasetHighestEarners = useMemo(() => [
    { rank: 1, username: 'CryptoKing_99', lifetimeEarnings: 680000, totalWithdrawals: 450000, walletBalance: 230000, roiPercent: '+285.4%', activeChallenges: 8 },
    { rank: 2, username: 'Alex_R', lifetimeEarnings: 520000, totalWithdrawals: 380000, walletBalance: 140000, roiPercent: '+210.8%', activeChallenges: 5 },
    { rank: 3, username: 'Marcus_S', lifetimeEarnings: 410000, totalWithdrawals: 290000, walletBalance: 120000, roiPercent: '+175.2%', activeChallenges: 6 }
  ], [])

  const datasetActiveBettors = useMemo(() => [
    { rank: 1, username: 'GamerPro_2026', totalBets: 480, wageredAmount: 890000, avgStake: 1850, activeChallenges: 14 },
    { rank: 2, username: 'David_K', totalBets: 390, wageredAmount: 650000, avgStake: 1660, activeChallenges: 11 },
    { rank: 3, username: 'CryptoKing_99', totalBets: 320, wageredAmount: 580000, avgStake: 1810, activeChallenges: 8 }
  ], [])

  const datasetCreators = useMemo(() => [
    { rank: 1, username: 'ApexPredictor', challengesCreated: 54, participantsAttracted: 4800, volumeGenerated: 1450000, avgEngagement: '88.9%', completed: 48 },
    { rank: 2, username: 'SportsOracle_HQ', challengesCreated: 42, participantsAttracted: 3900, volumeGenerated: 1120000, avgEngagement: '84.5%', completed: 39 },
    { rank: 3, username: 'FitnessStreakPro', challengesCreated: 31, participantsAttracted: 2400, volumeGenerated: 680000, avgEngagement: '79.2%', completed: 28 }
  ], [])

  const datasetCategoryPerf = useMemo(() => [
    { category: 'Predictions', totalChallenges: 840, activeChallenges: 210, volume: 5400000, revenue: 270000, growth: '+28.4%' },
    { category: 'Sports', totalChallenges: 620, activeChallenges: 180, volume: 4100000, revenue: 205000, growth: '+22.1%' },
    { category: 'Gaming & Esports', totalChallenges: 490, activeChallenges: 140, volume: 2900000, revenue: 145000, growth: '+19.8%' },
    { category: 'Fitness', totalChallenges: 310, activeChallenges: 95, volume: 1400000, revenue: 70000, growth: '+15.2%' }
  ], [])

  const datasetRevenue = useMemo(() => [
    { rank: 1, name: 'Predictions Engine', category: 'Predictions', volume: 5400000, adminFee: 270000, takeRate: '5.0%', status: 'Top Earner' },
    { rank: 2, name: 'Sports League Matchups', category: 'Sports', volume: 4100000, adminFee: 205000, takeRate: '5.0%', status: 'High Revenue' },
    { rank: 3, name: 'Esports Tournament Pools', category: 'Gaming & Esports', volume: 2900000, adminFee: 145000, takeRate: '5.0%', status: 'Steady Fee' }
  ], [])

  const datasetAiResolution = useMemo(() => [
    { oracleSource: 'Binance Spot API (BTCUSDT)', automatedSettlements: 1240, successResolutions: 1238, disputedCount: 2, avgSpeed: '124ms', accuracy: '99.8%' },
    { oracleSource: 'The-Odds Sports API', automatedSettlements: 980, successResolutions: 974, disputedCount: 6, avgSpeed: '185ms', accuracy: '99.3%' },
    { oracleSource: 'Gemini 2.0 Vision OCR Scanner', automatedSettlements: 410, successResolutions: 402, disputedCount: 8, avgSpeed: '320ms', accuracy: '98.0%' }
  ], [])

  const datasetDisputed = useMemo(() => [
    { id: 'DISP-101', name: 'Marathon Completion Under 3h:00', reportsCount: 4, reason: 'GPS Telemetry Discrepancy', status: 'Pending Review', assignedMod: 'Mod_Sarah' },
    { id: 'DISP-102', name: 'League of Legends Finals Speedrun', reportsCount: 2, reason: 'Pause Menu Artifact', status: 'Under Review', assignedMod: 'Mod_Alex' }
  ], [])

  const datasetHighRisk = useMemo(() => [
    { id: 'RISK-901', name: 'Abnormal Volume Spike BTC Prediction', riskScore: 88, detectionReason: 'Multiple Accounts (Sybil IP match)', status: 'Investigating', flaggedUser: 'User_X99' },
    { id: 'RISK-882', name: 'Rapid Odds Manipulation Golf Bet', riskScore: 74, detectionReason: 'Collusion pattern detected', status: 'Quarantined', flaggedUser: 'Bettor_Z2' }
  ], [])

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
            <h4 className="text-sm font-bold text-foreground">2,450 Live</h4>
            <span className="text-[9px] text-emerald-400 font-bold">+12% growth</span>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border border-border/60 hover:border-primary/40 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[9px] uppercase text-muted block">Betting Volume</span>
            <h4 className="text-sm font-bold text-emerald-400">14.8M Coins</h4>
            <span className="text-[9px] text-muted">Escrow Verified</span>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border border-border/60 hover:border-primary/40 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[9px] uppercase text-muted block">Largest Escrow Pot</span>
            <h4 className="text-sm font-bold text-amber-400">345,000 Coins</h4>
            <span className="text-[9px] text-muted">BTC Prediction</span>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border border-border/60 hover:border-primary/40 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[9px] uppercase text-muted block">Platform Revenue (5%)</span>
            <h4 className="text-sm font-bold text-primary">740,000 Coins</h4>
            <span className="text-[9px] text-emerald-400 font-bold">+18.5% fee volume</span>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border border-border/60 hover:border-primary/40 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[9px] uppercase text-muted block">AI Accuracy %</span>
            <h4 className="text-sm font-bold text-cyan-400">98.6%</h4>
            <span className="text-[9px] text-muted">Gemini 2.0 Oracle</span>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border border-border/60 hover:border-primary/40 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[9px] uppercase text-muted block">Pending AI Reviews</span>
            <h4 className="text-sm font-bold text-purple-400">14 In-Flight</h4>
            <span className="text-[9px] text-muted">Auto-Settling</span>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border border-border/60 hover:border-primary/40 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[9px] uppercase text-muted block">Manual Disputes</span>
            <h4 className="text-sm font-bold text-amber-400">3 Pending</h4>
            <span className="text-[9px] text-amber-400 font-bold">Mod Action Needed</span>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border border-border/60 hover:border-primary/40 transition-all">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[9px] uppercase text-muted block">Active Bettors</span>
            <h4 className="text-sm font-bold text-foreground">12,840 Users</h4>
            <span className="text-[9px] text-emerald-400 font-bold">+1.2k today</span>
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
              {datasetTrending.map(item => (
                <TableRow key={item.id} className="hover:bg-surface/30 font-mono text-xs">
                  <TableCell className="font-bold text-primary">{item.id}</TableCell>
                  <TableCell className="font-bold font-sans text-foreground">{item.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[9px] border-primary/30 text-primary">{item.category}</Badge></TableCell>
                  <TableCell className="font-bold text-emerald-400">{item.totalPot.toLocaleString()} Coins</TableCell>
                  <TableCell className="text-muted">{item.participants} Users</TableCell>
                  <TableCell className="text-cyan-400 font-bold">{item.odds}</TableCell>
                  <TableCell className="text-emerald-400 font-bold">{item.growthRate}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => handleOpenSheetForRow(item)} className="h-7 text-[11px] font-mono gap-1 border-primary/30 text-primary">
                      <Eye className="h-3 w-3" /> Inspect Sheet
                    </Button>
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
              {datasetEscrowPots.map(item => (
                <TableRow key={item.id} className="hover:bg-surface/30 font-mono text-xs">
                  <TableCell className="font-bold text-primary">{item.id}</TableCell>
                  <TableCell className="font-bold font-sans text-foreground">{item.name}</TableCell>
                  <TableCell className="font-bold text-emerald-400 text-sm">{item.potSize.toLocaleString()} Coins</TableCell>
                  <TableCell className="text-muted">{item.participants} Bettors</TableCell>
                  <TableCell className="text-muted">{item.resolutionTime}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => handleOpenSheetForRow(item)} className="h-7 text-[11px] font-mono gap-1 border-primary/30 text-primary">
                      <Eye className="h-3 w-3" /> Inspect Sheet
                    </Button>
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
              {datasetTopWinners.map(item => (
                <TableRow key={item.rank} className="hover:bg-surface/30 font-mono text-xs">
                  <TableCell className="font-bold">{item.rank === 1 ? '🥇 #1' : item.rank === 2 ? '🥈 #2' : `#${item.rank}`}</TableCell>
                  <TableCell className="font-bold font-sans text-foreground">{item.username}</TableCell>
                  <TableCell className="text-muted">{item.totalWins} Wins</TableCell>
                  <TableCell className="text-emerald-400 font-bold">{item.winRate}</TableCell>
                  <TableCell className="font-bold text-emerald-400">+{item.netProfit.toLocaleString()} Coins</TableCell>
                  <TableCell className="text-muted">{item.lastActive}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => handleOpenSheetForRow(item)} className="h-7 text-[11px] font-mono gap-1 border-primary/30 text-primary">
                      <Eye className="h-3 w-3" /> Inspect Sheet
                    </Button>
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
                <TableHead className="text-xs font-mono text-right">ROI %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datasetHighestEarners.map(item => (
                <TableRow key={item.rank} className="hover:bg-surface/30 font-mono text-xs">
                  <TableCell className="font-bold">#{item.rank}</TableCell>
                  <TableCell className="font-bold font-sans text-foreground">{item.username}</TableCell>
                  <TableCell className="font-bold text-emerald-400">+{item.lifetimeEarnings.toLocaleString()} Coins</TableCell>
                  <TableCell className="text-muted">{item.totalWithdrawals.toLocaleString()} Coins</TableCell>
                  <TableCell className="text-cyan-400 font-bold">{item.walletBalance.toLocaleString()} Coins</TableCell>
                  <TableCell className="text-right text-primary font-bold">{item.roiPercent}</TableCell>
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
                <TableHead className="text-xs font-mono text-right">Active Challenges</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datasetActiveBettors.map(item => (
                <TableRow key={item.rank} className="hover:bg-surface/30 font-mono text-xs">
                  <TableCell className="font-bold">#{item.rank}</TableCell>
                  <TableCell className="font-bold font-sans text-foreground">{item.username}</TableCell>
                  <TableCell className="text-primary font-bold">{item.totalBets} Bets</TableCell>
                  <TableCell className="text-emerald-400 font-bold">{item.wageredAmount.toLocaleString()} Coins</TableCell>
                  <TableCell className="text-muted">{item.avgStake} Coins</TableCell>
                  <TableCell className="text-right font-bold text-cyan-400">{item.activeChallenges} Active</TableCell>
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
                <TableHead className="text-xs font-mono text-right">Engagement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datasetCreators.map(item => (
                <TableRow key={item.rank} className="hover:bg-surface/30 font-mono text-xs">
                  <TableCell className="font-bold">#{item.rank}</TableCell>
                  <TableCell className="font-bold font-sans text-foreground">{item.username}</TableCell>
                  <TableCell className="text-purple-400 font-bold">{item.challengesCreated} Created</TableCell>
                  <TableCell className="text-cyan-400 font-bold">{item.participantsAttracted.toLocaleString()} Users</TableCell>
                  <TableCell className="text-emerald-400 font-bold">{item.volumeGenerated.toLocaleString()} Coins</TableCell>
                  <TableCell className="text-right font-bold text-emerald-400">{item.avgEngagement}</TableCell>
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
                <TableHead className="text-xs font-mono text-right">Growth %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datasetCategoryPerf.map(item => (
                <TableRow key={item.category} className="hover:bg-surface/30 font-mono text-xs">
                  <TableCell className="font-bold font-sans text-foreground">{item.category}</TableCell>
                  <TableCell className="text-muted">{item.totalChallenges}</TableCell>
                  <TableCell className="text-cyan-400 font-bold">{item.activeChallenges} Active</TableCell>
                  <TableCell className="text-emerald-400 font-bold">{item.volume.toLocaleString()} Coins</TableCell>
                  <TableCell className="text-primary font-bold">{item.revenue.toLocaleString()} Coins</TableCell>
                  <TableCell className="text-right text-emerald-400 font-bold">{item.growth}</TableCell>
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
                <TableHead className="text-xs font-mono text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datasetRevenue.map(item => (
                <TableRow key={item.rank} className="hover:bg-surface/30 font-mono text-xs">
                  <TableCell className="font-bold">#{item.rank}</TableCell>
                  <TableCell className="font-bold font-sans text-foreground">{item.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[9px] border-primary/30 text-primary">{item.category}</Badge></TableCell>
                  <TableCell className="text-muted">{item.volume.toLocaleString()} Coins</TableCell>
                  <TableCell className="text-emerald-400 font-bold text-sm">+{item.adminFee.toLocaleString()} Coins</TableCell>
                  <TableCell className="text-right"><Badge variant="success" className="text-[9px]">{item.status}</Badge></TableCell>
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
                <TableHead className="text-xs font-mono text-right">AI Accuracy %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datasetAiResolution.map(item => (
                <TableRow key={item.oracleSource} className="hover:bg-surface/30 font-mono text-xs">
                  <TableCell className="font-bold font-sans text-foreground flex items-center gap-2">
                    <Cpu className="h-3.5 w-3.5 text-cyan-400" /> {item.oracleSource}
                  </TableCell>
                  <TableCell className="text-muted">{item.automatedSettlements}</TableCell>
                  <TableCell className="text-emerald-400 font-bold">{item.successResolutions}</TableCell>
                  <TableCell className="text-amber-400 font-bold">{item.disputedCount}</TableCell>
                  <TableCell className="text-cyan-400 font-mono">{item.avgSpeed}</TableCell>
                  <TableCell className="text-right text-emerald-400 font-bold">{item.accuracy}</TableCell>
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
              {datasetDisputed.map(item => (
                <TableRow key={item.id} className="hover:bg-surface/30 font-mono text-xs">
                  <TableCell className="font-bold text-amber-400">{item.id}</TableCell>
                  <TableCell className="font-bold font-sans text-foreground">{item.name}</TableCell>
                  <TableCell className="text-amber-400 font-bold">{item.reportsCount} Reports</TableCell>
                  <TableCell className="text-muted">{item.reason}</TableCell>
                  <TableCell className="text-cyan-400 font-mono">{item.assignedMod}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => handleOpenSheetForRow(item)} className="h-7 text-[11px] font-mono gap-1 border-amber-500/30 text-amber-400">
                      <Eye className="h-3 w-3" /> Quick Review
                    </Button>
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
              {datasetHighRisk.map(item => (
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
                    <Button size="sm" variant="outline" onClick={() => handleOpenSheetForRow(item)} className="h-7 text-[11px] font-mono gap-1 border-red-500/30 text-red-400">
                      <ShieldAlert className="h-3 w-3" /> Investigate Audit
                    </Button>
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
          <span>Showing <strong className="text-foreground font-bold">{((currentPage - 1) * itemsPerPage) + 1}</strong> to <strong className="text-foreground font-bold">{Math.min(currentPage * itemsPerPage, 25)}</strong> of <strong className="text-foreground font-bold">25</strong> Results</span>
          <span className="text-border">|</span>
          <span>Page <strong className="text-primary font-bold">{currentPage}</strong> of <strong className="text-foreground font-bold">5</strong></span>
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

          {[1, 2, 3, 4, 5].map(page => (
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
            disabled={currentPage === 5}
            onClick={() => setCurrentPage(prev => Math.min(5, prev + 1))}
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
