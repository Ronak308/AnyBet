import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  AlertTriangle, 
  CheckCircle, 
  Lock,
  Sliders
} from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Button } from './ui/button'
import { AICore } from './AICore'
import { Sheet, SheetContent } from './ui/sheet'
import { Input } from './ui/input'

export const ChallengesView: React.FC<{ navigate: (tab: string) => void }> = ({ navigate }) => {
  const [filter, setFilter] = useState<'all' | 'Pending' | 'AI Settling' | 'Disputed' | 'Settled'>('all')
  const [selectedDispute, setSelectedDispute] = useState({
    id: '#AB-9821',
    conflict: "Conflicting IoT data from 'Garmin Connect' vs 'Strava' for Challenge #AB-9821. Gap: 12.4 seconds in final timestamp.",
    recommendation: "Validate against secondary GPS satellite logs. Confidence Score: 89% that Strava is the accurate source.",
    score: 89
  })

  const MOCK_CHALLENGES = [
    { id: '#AB-9821', type: 'PHYSICAL',   title: 'Marathon Completion Under 3h:00',          pot: '$12,450.00',  participants: 'JD, MS +42',   status: 'Disputed'    },
    { id: '#AB-9942', type: 'PREDICTION', title: 'BTC Price Closes Above $100k (Dec 31)',     pot: '$542,800.00', participants: '1,204 users',  status: 'AI Settling' },
    { id: '#AB-1005', type: 'PHYSICAL',   title: 'Weight Loss Challenge: Group Delta',        pot: '$2,100.00',   participants: '8 users',      status: 'Pending'     },
    { id: '#AB-8720', type: 'PREDICTION', title: 'Political Election Outcome: Region X',      pot: '$1.2M',       participants: '14,882 users', status: 'Disputed'    },
    { id: '#AB-7761', type: 'PREDICTION', title: 'NBA Finals: G7 Winner',                    pot: '$890,000.00', participants: '8,230 users',  status: 'Settled'     },
    { id: '#AB-3310', type: 'PREDICTION', title: 'ETH/USD Closes Above $5k (Q1 2025)',       pot: '$320,000.00', participants: '2,100 users',  status: 'AI Settling' },
    { id: '#AB-4412', type: 'PHYSICAL',   title: '100km Cycling Race – Group Bravo',          pot: '$8,750.00',   participants: '22 users',     status: 'Pending'     },
    { id: '#AB-5501', type: 'PREDICTION', title: 'Oscars: Best Picture 2025',                pot: '$45,000.00',  participants: '980 users',    status: 'Settled'     },
    { id: '#AB-6632', type: 'PHYSICAL',   title: '10k Steps Daily for 30 Days – Alpha Pod',  pot: '$3,200.00',   participants: '15 users',     status: 'Disputed'    },
    { id: '#AB-7743', type: 'PREDICTION', title: 'Formula 1: Monaco GP Winner 2025',         pot: '$210,000.00', participants: '4,450 users',  status: 'AI Settling' },
    { id: '#AB-2201', type: 'PREDICTION', title: 'SOL/USD Above $300 by June 30',            pot: '$88,000.00',  participants: '1,860 users',  status: 'Pending'     },
    { id: '#AB-2302', type: 'PHYSICAL',   title: 'Push-up Challenge: 1000 in 24h',           pot: '$1,500.00',   participants: '6 users',      status: 'Settled'     },
    { id: '#AB-2403', type: 'PREDICTION', title: 'UEFA Champions League Winner 2025',        pot: '$1.5M',       participants: '28,000 users', status: 'AI Settling' },
    { id: '#AB-2504', type: 'PHYSICAL',   title: 'Iron Man Triathlon – Sub 10h Finish',      pot: '$22,400.00',  participants: 'RA, TK +8',    status: 'Disputed'    },
    { id: '#AB-2605', type: 'PREDICTION', title: 'Nasdaq Closes +2% on Jan 15 2025',        pot: '$175,000.00', participants: '3,200 users',  status: 'Settled'     },
    { id: '#AB-2706', type: 'PHYSICAL',   title: 'Sleep 8h/night for 14 Days – Beta Pod',   pot: '$4,800.00',   participants: '10 users',     status: 'Pending'     },
    { id: '#AB-2807', type: 'PREDICTION', title: 'Apple WWDC 2025: AR Headset Announced?',  pot: '$65,000.00',  participants: '1,100 users',  status: 'Settled'     },
    { id: '#AB-2908', type: 'PHYSICAL',   title: 'Bench Press 120kg – Verified Gym Rep',    pot: '$950.00',     participants: '2 users',      status: 'Disputed'    },
    { id: '#AB-3009', type: 'PREDICTION', title: 'Fed Rate Cut: September 2025',             pot: '$290,000.00', participants: '6,700 users',  status: 'AI Settling' },
    { id: '#AB-3110', type: 'PHYSICAL',   title: '5km Run Under 18 Minutes',                pot: '$2,800.00',   participants: '4 users',      status: 'Pending'     },
    { id: '#AB-3211', type: 'PREDICTION', title: 'Super Bowl LX Winner 2026',               pot: '$2.1M',       participants: '38,500 users', status: 'Pending'     },
    { id: '#AB-3312', type: 'PHYSICAL',   title: 'Intermittent Fast: 72h Water Only',       pot: '$5,500.00',   participants: '7 users',      status: 'Settled'     },
    { id: '#AB-3413', type: 'PREDICTION', title: 'Bitcoin Halving Block Price: >$75k',      pot: '$480,000.00', participants: '9,200 users',  status: 'Settled'     },
    { id: '#AB-3514', type: 'PHYSICAL',   title: 'Deadlift 180kg Verified Rep',             pot: '$1,200.00',   participants: '3 users',      status: 'Disputed'    },
    { id: '#AB-3615', type: 'PREDICTION', title: 'US CPI Inflation < 3% in Q2 2025',       pot: '$155,000.00', participants: '2,800 users',  status: 'AI Settling' },
    { id: '#AB-3716', type: 'PHYSICAL',   title: '30-Day Meditation Streak – Mind Group',   pot: '$3,600.00',   participants: '12 users',     status: 'Pending'     },
    { id: '#AB-3817', type: 'PREDICTION', title: 'Solana TVL Exceeds $10B',                 pot: '$92,000.00',  participants: '1,740 users',  status: 'AI Settling' },
    { id: '#AB-3918', type: 'PHYSICAL',   title: 'Swimming 5km Open Water',                 pot: '$7,800.00',   participants: 'MV, SK +3',    status: 'Disputed'    },
    { id: '#AB-4019', type: 'PREDICTION', title: 'Tesla FSD Level 4 Approved 2025',         pot: '$320,000.00', participants: '5,600 users',  status: 'Pending'     },
    { id: '#AB-4120', type: 'PHYSICAL',   title: 'No Sugar Diet – 60 Day Streak',           pot: '$4,100.00',   participants: '9 users',      status: 'Settled'     },
    { id: '#AB-4221', type: 'PREDICTION', title: 'Gold Price > $3,000/oz by Dec 2025',      pot: '$260,000.00', participants: '4,300 users',  status: 'AI Settling' },
    { id: '#AB-4322', type: 'PHYSICAL',   title: 'Spartan Race Beast – Under 4h',           pot: '$9,500.00',   participants: 'KL, PR +6',    status: 'Pending'     },
    { id: '#AB-4423', type: 'PREDICTION', title: 'GPT-5 Released Before July 2025',         pot: '$78,000.00',  participants: '1,650 users',  status: 'Settled'     },
    { id: '#AB-4524', type: 'PHYSICAL',   title: 'No Phone for 7 Days Challenge',           pot: '$2,400.00',   participants: '5 users',      status: 'Disputed'    },
    { id: '#AB-4625', type: 'PREDICTION', title: 'Cannes Palme d Or: European Film',        pot: '$48,000.00',  participants: '880 users',    status: 'Settled'     },
    { id: '#AB-4726', type: 'PHYSICAL',   title: 'Pull-up Max Reps in 3 Minutes',           pot: '$1,800.00',   participants: '4 users',      status: 'Pending'     },
    { id: '#AB-4827', type: 'PREDICTION', title: 'UK General Election Winner 2025',         pot: '$560,000.00', participants: '11,200 users', status: 'AI Settling' },
    { id: '#AB-4928', type: 'PHYSICAL',   title: 'Cold Shower 30 Days – Verified Streak',  pot: '$3,100.00',   participants: '8 users',      status: 'Settled'     },
    { id: '#AB-5029', type: 'PREDICTION', title: 'NVIDIA Market Cap Exceeds $4T',           pot: '$440,000.00', participants: '7,800 users',  status: 'Pending'     },
    { id: '#AB-5130', type: 'PHYSICAL',   title: 'Hike Kilimanjaro Summit',                 pot: '$18,000.00',  participants: 'Group Gamma',  status: 'Disputed'    },
    { id: '#AB-5231', type: 'PREDICTION', title: 'SpaceX Starship Orbit 2025',              pot: '$390,000.00', participants: '6,900 users',  status: 'AI Settling' },
    { id: '#AB-5332', type: 'PHYSICAL',   title: 'Squat 200kg Verified Rep',                pot: '$2,100.00',   participants: '3 users',      status: 'Settled'     },
    { id: '#AB-5433', type: 'PREDICTION', title: 'Netflix Q3 Subscriber Growth > 10M',     pot: '$125,000.00', participants: '2,450 users',  status: 'Settled'     },
    { id: '#AB-5534', type: 'PHYSICAL',   title: 'Read 12 Books in 12 Months',              pot: '$1,600.00',   participants: '6 users',      status: 'Pending'     },
    { id: '#AB-5635', type: 'PREDICTION', title: 'EUR/USD Parity Breach 2025',              pot: '$205,000.00', participants: '3,700 users',  status: 'AI Settling' },
    { id: '#AB-5736', type: 'PHYSICAL',   title: 'Polar Plunge – 5 Consecutive Days',       pot: '$4,400.00',   participants: '11 users',     status: 'Disputed'    },
    { id: '#AB-5837', type: 'PREDICTION', title: 'India Wins Cricket World Cup 2026',       pot: '$980,000.00', participants: '21,000 users', status: 'Pending'     },
    { id: '#AB-5938', type: 'PHYSICAL',   title: '24h Fasting Challenge – Group Zeta',      pot: '$3,900.00',   participants: '13 users',     status: 'Settled'     },
    { id: '#AB-6039', type: 'PREDICTION', title: 'Amazon AWS Revenue > $120B 2025',         pot: '$315,000.00', participants: '5,300 users',  status: 'AI Settling' },
    { id: '#AB-6140', type: 'PHYSICAL',   title: 'Sub-4-Minute Mile – Treadmill Verified',  pot: '$12,800.00',  participants: 'JD, AR',       status: 'Disputed'    },
    { id: '#AB-6241', type: 'PREDICTION', title: 'Dogecoin Price > $1 in 2025',             pot: '$750,000.00', participants: '18,400 users', status: 'Pending'     },
    { id: '#AB-6342', type: 'PHYSICAL',   title: 'Surf 50 Waves in a Week',                 pot: '$6,200.00',   participants: 'KR, MJ +4',    status: 'Settled'     },
  ]

  const [challenges, setChallenges] = useState(MOCK_CHALLENGES)

  // Sheet form states
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState('PREDICTION')
  const [newPot, setNewPot] = useState('')
  const [newParticipants, setNewParticipants] = useState('')
  const [newStatus, setNewStatus] = useState('Pending')

  // Advanced Filters and Logs states
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchId, setSearchId] = useState('')
  const [isLogsOpen, setIsLogsOpen] = useState(false)

  const handleApproveProposal = () => {
    const targetId = selectedDispute.id
    setChallenges(prev => prev.map(c => {
      if (c.id === targetId) {
        return { ...c, status: 'Settled' }
      }
      return c
    }))
    alert(`Success: AI Proposal approved. Challenge ${targetId} settled successfully!`)
  }

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newPot.trim()) {
      alert("Please fill in the Title and Total Pot fields.")
      return
    }
    const newId = `#AB-${Math.floor(1000 + Math.random() * 9000)}`
    const newChallenge = {
      id: newId,
      type: newType,
      title: newTitle,
      pot: newPot,
      participants: newParticipants.trim() || '1 user',
      status: newStatus
    }
    setChallenges(prev => [newChallenge, ...prev])
    setIsAddSheetOpen(false)
    // Reset form inputs
    setNewTitle('')
    setNewType('PREDICTION')
    setNewPot('')
    setNewParticipants('')
    setNewStatus('Pending')
  }

  const alerts = [
    { id: 1, title: 'New Dispute Triggered', text: 'Challenge #AB-1052 reported for irregular activity.', time: '2 minutes ago', type: 'warn' },
    { id: 2, title: 'AI Model Refreshed', text: 'Prediction settling logic updated for "Crypto" markets.', time: '1 hour ago', type: 'info' },
    { id: 3, title: 'Security Escalation', text: 'Admin_Beta requested override for ID #AB-8720.', time: '3 hours ago', type: 'escalate' }
  ]

  const handleOverride = (id: string) => {
    setChallenges(prev => prev.map(c =>
      c.id === id ? { ...c, status: 'Disputed' } : c
    ))
    alert(`Warning: Manual override initiated for ${id}. Challenge flagged for admin arbitration.`)
  }

  const handleReviewAI = (row: typeof challenges[0]) => {
    setSelectedDispute({
      id: row.id,
      conflict: `Discrepancy detected in validation hashes for Challenge ${row.id} "${row.title}". Final payload mismatch.`,
      recommendation: `Confirm node state transition index. High probability (${row.pot.includes('M') ? '92%' : '85%'}) that settling sequence complies with API feed protocol.`,
      score: row.pot.includes('M') ? 92 : 85
    })
  }

  // Filter logic
  const filteredChallenges = challenges.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false
    if (searchQuery.trim() !== '' && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (searchId.trim() !== '' && !c.id.toLowerCase().includes(searchId.toLowerCase())) return false
    return true
  })

  // Entrance animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 flex flex-col gap-6 w-full font-sans select-none"
    >
      {/* Page Header */}
      <div className="px-1 select-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => navigate('operations')}
              className="text-[9px] font-mono text-muted hover:text-primary transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              ← Operations
            </button>
          </div>
          <h2 className="text-2xl font-bold font-sans text-foreground">Challenge Oversight</h2>
          <p className="text-xs text-muted font-sans mt-1.5 leading-relaxed max-w-3xl">
            Real-time management and settlement monitoring for high-stakes decentralized predictions. Use AI insights to resolve disputes efficiently.
          </p>
        </div>
        <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
          <Button 
            variant="primary" 
            size="sm" 
            className="h-9 px-4 font-mono text-[10px] uppercase tracking-wider font-bold shrink-0 shadow-glow"
            onClick={() => setIsAddSheetOpen(true)}
          >
            Add Challenge
          </Button>
          <SheetContent side="right" className="p-6 bg-[#151221]/95 text-foreground border-l border-border max-w-sm w-full h-full flex flex-col justify-between">
            <form onSubmit={handleCreateChallenge} className="flex flex-col gap-5 h-full justify-between">
              <div className="flex flex-col gap-5">
                <div className="border-b border-border/40 pb-3">
                  <h3 className="text-sm font-bold text-foreground font-sans uppercase tracking-wider">Add New Challenge</h3>
                  <p className="text-[10px] text-muted font-mono uppercase tracking-widest mt-1">Input prediction or contract details</p>
                </div>

                {/* Title Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-muted font-mono uppercase tracking-widest font-bold">Challenge Title</label>
                  <Input 
                    placeholder="e.g. Marathon Completion Under 3h:00" 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)} 
                    required 
                  />
                </div>

                {/* Type Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-muted font-mono uppercase tracking-widest font-bold">Contract Type</label>
                  <select 
                    value={newType} 
                    onChange={(e) => setNewType(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono text-foreground focus-visible:outline-none focus-visible:border-primary transition-all cursor-pointer"
                  >
                    <option value="PREDICTION">PREDICTION</option>
                    <option value="PHYSICAL">PHYSICAL</option>
                  </select>
                </div>

                {/* Pot Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-muted font-mono uppercase tracking-widest font-bold">Total Pot Size</label>
                  <Input 
                    placeholder="e.g. $12,450.00" 
                    value={newPot} 
                    onChange={(e) => setNewPot(e.target.value)} 
                    required 
                  />
                </div>

                {/* Participants Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-muted font-mono uppercase tracking-widest font-bold">Participants</label>
                  <Input 
                    placeholder="e.g. 1,204 users or JD, MS +42" 
                    value={newParticipants} 
                    onChange={(e) => setNewParticipants(e.target.value)} 
                  />
                </div>

                {/* Status Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-muted font-mono uppercase tracking-widest font-bold">Initial Status</label>
                  <select 
                    value={newStatus} 
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono text-foreground focus-visible:outline-none focus-visible:border-primary transition-all cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="AI Settling">AI Settling</option>
                    <option value="Disputed">Disputed</option>
                    <option value="Settled">Settled</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 border-t border-border/40 pt-4 mt-auto">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 text-xs font-mono py-2"
                  onClick={() => setIsAddSheetOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="flex-1 text-xs font-mono py-2"
                >
                  Create
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {/* 4 Custom Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Volume */}
        <motion.div variants={itemVariants} className="h-full">
          <Card className="relative overflow-hidden h-full">
            <CardContent className="p-5 flex flex-col justify-between h-full min-h-[115px]">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-muted font-mono uppercase tracking-widest">Active Volume</span>
                <span className="text-2xl font-bold font-mono tracking-tight text-foreground">2.4M <span className="text-xs font-light text-muted">USD</span></span>
              </div>
              <div className="h-1.5 w-full bg-surface/50 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-primary w-2/3 shadow-glow rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Awaiting Resolution */}
        <motion.div variants={itemVariants} className="h-full">
          <Card className="h-full">
            <CardContent className="p-5 flex flex-col justify-between h-full min-h-[115px]">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-muted font-mono uppercase tracking-widest">Awaiting Resolution</span>
                <span className="text-2xl font-bold font-mono tracking-tight text-foreground">142</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 mt-2 block font-semibold">+12 THIS HOUR</span>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Disputes */}
        <motion.div variants={itemVariants} className="h-full">
          <Card className="h-full">
            <CardContent className="p-5 flex flex-col justify-between h-full min-h-[115px]">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-muted font-mono uppercase tracking-widest">Active Disputes</span>
                <span className="text-2xl font-bold font-mono tracking-tight text-foreground">28</span>
              </div>
              <span className="text-[10px] font-mono text-red-400 mt-2 block font-semibold">CRITICAL ACTION REQUIRED</span>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Settlement Rate */}
        <motion.div variants={itemVariants} className="h-full">
          <Card className="h-full">
            <CardContent className="p-5 flex flex-col justify-between h-full min-h-[115px]">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-muted font-mono uppercase tracking-widest">AI Settlement Rate</span>
                <span className="text-2xl font-bold font-mono tracking-tight text-foreground">94.2%</span>
              </div>
              <span className="text-[10px] font-mono text-primary mt-2 block font-semibold">OPTIMAL EFFICIENCY</span>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-2 px-1 select-none">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted font-mono uppercase tracking-widest font-bold">Filter by:</span>
          
          <button 
            onClick={() => setFilter(filter === 'Pending' ? 'all' : 'Pending')}
            className={`px-3.5 py-1 rounded-full border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${filter === 'Pending' ? 'bg-[#FFB020]/15 border-[#FFB020] text-foreground font-bold shadow-[0_0_10px_rgba(255,176,32,0.25)]' : 'bg-transparent border-border/70 text-muted hover:text-foreground hover:border-muted/30'}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#FFB020]"></span>
            Pending
          </button>

          <button 
            onClick={() => setFilter(filter === 'AI Settling' ? 'all' : 'AI Settling')}
            className={`px-3.5 py-1 rounded-full border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${filter === 'AI Settling' ? 'bg-primary/15 border-primary text-foreground font-bold shadow-[0_0_10px_rgba(179,102,255,0.25)]' : 'bg-transparent border-border/70 text-muted hover:text-foreground hover:border-muted/30'}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
            AI Settling
          </button>

          <button 
            onClick={() => setFilter(filter === 'Disputed' ? 'all' : 'Disputed')}
            className={`px-3.5 py-1 rounded-full border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${filter === 'Disputed' ? 'bg-[#FF5A5F]/15 border-[#FF5A5F] text-foreground font-bold shadow-[0_0_10px_rgba(255,90,95,0.25)]' : 'bg-transparent border-border/70 text-muted hover:text-foreground hover:border-muted/30'}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF5A5F]"></span>
            Disputed
          </button>

          <button 
            onClick={() => setFilter(filter === 'Settled' ? 'all' : 'Settled')}
            className={`px-3.5 py-1 rounded-full border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${filter === 'Settled' ? 'bg-emerald-500/15 border-emerald-500 text-foreground font-bold shadow-[0_0_10px_rgba(16,185,129,0.25)]' : 'bg-transparent border-border/70 text-muted hover:text-foreground hover:border-muted/30'}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Settled
          </button>
        </div>

        <button 
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-semibold cursor-pointer transition-colors ${isAdvancedOpen ? 'text-secondary' : 'text-primary hover:text-primary-hover'}`}
        >
          <Sliders className="h-3.5 w-3.5" />
          Advanced Filters
        </button>
      </div>

      {/* Advanced Filters Expandable Inputs Panel */}
      {isAdvancedOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="p-4 rounded-xl border border-border bg-background/40 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-1 select-none"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] text-muted font-mono uppercase tracking-widest font-bold">Query Title</label>
            <Input 
              placeholder="e.g. Marathon, BTC..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] text-muted font-mono uppercase tracking-widest font-bold">Query ID</label>
            <Input 
              placeholder="e.g. #AB-9821" 
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1.5 justify-end">
            <Button
              variant="outline"
              size="sm"
              className="h-8 font-mono text-[9px] uppercase tracking-wider hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
              onClick={() => {
                setSearchQuery('')
                setSearchId('')
              }}
            >
              Clear Filters
            </Button>
          </div>
        </motion.div>
      )}

      {/* Main Table Card */}
      <motion.div variants={itemVariants} className="relative">
        <Card className="flex flex-col gap-4 relative">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead>Challenge Title</TableHead>
                  <TableHead className="w-[130px]">Total Pot</TableHead>
                  <TableHead className="w-[150px]">Participants</TableHead>
                  <TableHead className="w-[130px]">Resolution Status</TableHead>
                  <TableHead className="text-right w-[200px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChallenges.map((row) => (
                  <TableRow key={row.id} className="hover:bg-surface/30">
                    <TableCell className="font-mono text-xs text-primary font-semibold">{row.id}</TableCell>
                    <TableCell>
                      <Badge variant={row.type === 'PHYSICAL' ? 'outline' : 'primary'} className="text-[9px]">
                        {row.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{row.title}</TableCell>
                    <TableCell className="font-mono font-bold text-foreground text-xs">{row.pot}</TableCell>
                    <TableCell className="text-muted text-xs font-mono">{row.participants}</TableCell>
                    <TableCell>
                      <Badge variant={
                        row.status === 'Disputed' ? 'danger' :
                        row.status === 'AI Settling' ? 'secondary' :
                        row.status === 'Settled' ? 'success' : 'warning'
                      } className="text-[9px]">
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {row.status === 'Disputed' && (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="h-7 text-[9px] font-mono uppercase tracking-wider px-2.5"
                            onClick={() => handleReviewAI(row)}
                          >
                            Review AI Logic
                          </Button>
                        )}
                        {row.status !== 'Settled' && (
                          <Button 
                            variant="danger" 
                            size="sm" 
                            className="h-7 text-[9px] font-mono uppercase tracking-wider px-2.5"
                            onClick={() => handleOverride(row.id)}
                          >
                            Override
                          </Button>
                        )}
                        {row.status === 'Settled' && (
                          <span className="text-[10px] font-mono text-muted uppercase tracking-wider pr-4">ARCHIVED</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-2 px-1 text-muted text-xs select-none">
            <span className="font-mono">Showing 1-10 of 1,248 challenges</span>
            
            <div className="flex items-center gap-1.5 font-mono">
              <button className="p-1 rounded border border-border bg-surface/30 hover:border-muted/30 text-muted hover:text-foreground transition-all cursor-pointer">
                &lt;
              </button>
              <button className="w-7 h-7 rounded border border-primary bg-primary/10 text-primary font-bold text-xs flex items-center justify-center cursor-pointer">
                1
              </button>
              <button className="w-7 h-7 rounded border border-border bg-transparent hover:border-muted/30 hover:bg-surface/30 text-xs flex items-center justify-center cursor-pointer">
                2
              </button>
              <button className="w-7 h-7 rounded border border-border bg-transparent hover:border-muted/30 hover:bg-surface/30 text-xs flex items-center justify-center cursor-pointer">
                3
              </button>
              <span className="px-1 text-xs">...</span>
              <button className="w-7 h-7 rounded border border-border bg-transparent hover:border-muted/30 hover:bg-surface/30 text-xs flex items-center justify-center cursor-pointer">
                125
              </button>
              <button className="p-1 rounded border border-border bg-surface/30 hover:border-muted/30 text-muted hover:text-foreground transition-all cursor-pointer">
                &gt;
              </button>
            </div>
          </div>

        </Card>
      </motion.div>

      {/* Bottom Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Oracle Intelligence Insight: 8 Cols */}
        <motion.div variants={itemVariants} className="lg:col-span-8">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                <h3 className="text-sm font-bold text-foreground font-sans uppercase tracking-wider">Oracle Intelligence Insight</h3>
                <Badge variant="secondary" className="text-[9px]">DECISION SUPPORT</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-2">
                {/* Left Side: Conflict Details */}
                <div className="md:col-span-8 flex flex-col gap-4">
                  <div className="bg-background/50 border border-border/50 p-4 rounded-lg">
                    <span className="text-[9px] font-mono text-primary uppercase tracking-widest font-bold">Primary Conflict</span>
                    <p className="text-xs text-foreground font-sans leading-relaxed mt-2">{selectedDispute.conflict}</p>
                  </div>

                  <div className="bg-background/50 border border-border/50 p-4 rounded-lg">
                    <span className="text-[9px] font-mono text-secondary uppercase tracking-widest font-bold">Recommended Action</span>
                    <p className="text-xs text-foreground font-sans leading-relaxed mt-2">{selectedDispute.recommendation}</p>
                  </div>
                </div>

                {/* Right Side: AICore & Action Button */}
                <div className="md:col-span-4 flex flex-col items-center justify-between gap-4">
                  <AICore score={selectedDispute.score} />
                  <Button 
                    className="w-full text-xs font-mono uppercase tracking-wider py-2.5 rounded-lg"
                    onClick={handleApproveProposal}
                  >
                    Approve AI Proposal
                  </Button>
                  <button
                    onClick={() => navigate('ai-oracle')}
                    className="text-[9px] font-mono text-muted hover:text-secondary transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    Configure AI Oracle →
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* System Alerts: 4 Cols */}
        <motion.div variants={itemVariants} className="lg:col-span-4">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                <h3 className="text-sm font-bold text-foreground font-sans uppercase tracking-wider flex items-center gap-2">
                  System Alerts
                </h3>
                <Badge variant="outline" className="text-[9px]">LATEST 3</Badge>
              </div>

              {/* Alerts List */}
              <div className="flex flex-col gap-3 font-sans">
                {alerts.map((a) => (
                  <div 
                    key={a.id}
                    className="p-3 border border-border bg-background/30 rounded-lg flex gap-3 hover:border-muted/30 transition-all duration-200"
                  >
                    <div className="mt-0.5 shrink-0">
                      {a.type === 'warn' ? (
                        <AlertTriangle className="h-4.5 w-4.5 text-orange-400" />
                      ) : a.type === 'escalate' ? (
                        <Lock className="h-4.5 w-4.5 text-secondary" />
                      ) : (
                        <CheckCircle className="h-4.5 w-4.5 text-primary" />
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-xs text-foreground leading-none">{a.title}</span>
                      <p className="text-[10px] text-muted font-mono leading-tight mt-1">{a.text}</p>
                      <span className="text-[9px] font-mono text-muted mt-0.5">{a.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setIsLogsOpen(true)}
              className="mt-6 w-full border border-border hover:bg-surface/50 text-[10px] text-muted hover:text-foreground font-mono py-2 rounded-lg transition-colors cursor-pointer"
            >
              VIEW SECURITY LOGS
            </button>
          </Card>
        </motion.div>
      </div>

      {/* Security Logs Side Sheet */}
      <Sheet open={isLogsOpen} onOpenChange={setIsLogsOpen}>
        <SheetContent side="right" className="p-6 bg-[#151221]/95 text-foreground border-l border-border max-w-lg w-full h-full flex flex-col justify-between">
          <div className="flex flex-col h-full justify-between">
            <div className="flex flex-col">
              <div className="border-b border-border/40 pb-3 mb-4">
                <h3 className="text-sm font-bold text-[#E5C0FF] font-sans uppercase tracking-wider">Security Telemetry Logs</h3>
                <p className="text-[10px] text-muted font-mono uppercase tracking-widest mt-1">Live audit trail of consensus overrides & dispute cycles</p>
              </div>
              
              <div className="flex flex-col gap-3.5 p-4 bg-background border border-border/60 rounded-lg max-h-[70vh] overflow-y-auto font-mono text-[10px] leading-relaxed select-text">
                <div><span className="text-primary">[13:30:12 UTC]</span> SECURITY_MONITOR: Link established to SECURE_NODE_CONN // 0xAF3D9</div>
                <div><span className="text-secondary">[13:28:45 UTC]</span> ORACLE_SETTLE: AI model run finished with 94.2% consensus weight</div>
                <div><span className="text-primary">[13:25:01 UTC]</span> SYS_AUDIT: Dispute {selectedDispute.id} validation sequence triggered by Strava API discrepancy</div>
                <div><span className="text-amber-400">[13:12:30 UTC]</span> COLLATERAL_POOL: Verified 12,450 SOL locked across validator pools</div>
                <div><span className="text-red-400">[12:45:18 UTC]</span> SECURITY_ESCALATION: Manual override requested for challenge #AB-8720 by Admin_Alpha</div>
                <div><span className="text-primary">[12:30:00 UTC]</span> SYSTEM: Daily automated oracle calibration cycle complete. Precision rate: 98.4%.</div>
                <div><span className="text-muted">[10:00:15 UTC]</span> HEALTHCHECK: 16 AI Settlement Nodes active & calibrating. State optimal.</div>
              </div>
            </div>

            <Button 
              variant="outline"
              className="mt-6 w-full text-xs font-mono py-2.5"
              onClick={() => setIsLogsOpen(false)}
            >
              Close Logs Panel
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  )
}
