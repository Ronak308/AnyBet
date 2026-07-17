import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ShieldCheck, 
  Trophy, 
  Zap, 
  Shield, 
  Star, 
  Mail, 
  Ban, 
  Edit3, 
  SlidersHorizontal,
  Download
} from 'lucide-react'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Progress } from './ui/progress'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Sheet, SheetContent } from './ui/sheet'

export const ReputationView: React.FC<{ navigate: (tab: string) => void }> = ({ navigate: _navigate }) => {
  const [users, setUsers] = useState([
    {
      id: 1,
      username: 'crypto_king',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      tier: 'elite' as const,
      reputation: 98,
      earnings: '1,240.50',
      status: 'active',
      joined: 'Jan 2024',
      badgeList: ['trophy', 'bolt', 'shield'],
      notes: 'Consistent high performer. No flagged events in 6 months. Candidate for community moderator role.',
      activity: [
        { title: 'Market Prediction Finalized', text: "Won +5.4 SOL in 'ETH/BTC Cross'", time: '12m ago' },
        { title: 'Reputation Boosted', text: '+12 pts for Oracle Accuracy', time: '2h ago' },
        { title: 'Liquidity Provision', text: 'Added 10 SOL to Main Pool', time: 'Yesterday' }
      ]
    },
    {
      id: 2,
      username: 'block_wizard',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      tier: 'pro' as const,
      reputation: 75,
      earnings: '412.25',
      status: 'active',
      joined: 'Mar 2024',
      badgeList: ['bolt', 'star'],
      notes: 'Active protocol participant. High consensus matching accuracy index.',
      activity: [
        { title: 'Oracle Query Solved', text: "Settled UCL Real Madrid vs Man City", time: '1h ago' },
        { title: 'Dispute Resolution Completed', text: 'Matched GPS coordinates validation', time: '5h ago' }
      ]
    },
    {
      id: 3,
      username: 'risky_bets',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
      tier: 'new' as const,
      reputation: 22,
      earnings: '12.00',
      status: 'idle',
      joined: 'Jul 2026',
      badgeList: ['star'],
      notes: 'Newly registered node. Undergoing basic onboarding telemetry.',
      activity: [
        { title: 'Account Initialized', text: 'Verified wallet linkage sequence', time: '1d ago' }
      ]
    },
    {
      id: 4,
      username: 'oracle_eye',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      tier: 'elite' as const,
      reputation: 92,
      earnings: '890.30',
      status: 'active',
      joined: 'Nov 2023',
      badgeList: ['trophy', 'shield', 'star'],
      notes: 'Veteran validator node. Extremely low validation skew. High compliance rating.',
      activity: [
        { title: 'Oracle Duty Logged', text: 'Consensus settling verified for Oscars 2024', time: '12m ago' },
        { title: 'Staking Boosted', text: 'Staked additional 50 SOL for node validation', time: '3d ago' }
      ]
    }
  ])

  const [selectedUser, setSelectedUser] = useState(users[0])

  // Filter and Export states
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [tierFilter, setTierFilter] = useState<'all' | 'elite' | 'pro' | 'new'>('all')
  const [isActivityOpen, setIsActivityOpen] = useState(false)

  // Direct Message and Ban states
  const [isMessageOpen, setIsMessageOpen] = useState(false)
  const [messageText, setMessageText] = useState('')

  const handleToggleBan = () => {
    const isCurrentlySuspended = selectedUser.status === 'suspended'
    const newStatus = isCurrentlySuspended ? 'active' : 'suspended'
    
    setUsers(prev => prev.map(u => {
      if (u.id === selectedUser.id) {
        const updated = { ...u, status: newStatus }
        setSelectedUser(updated)
        return updated
      }
      return u
    }))
    
    alert(`Success: User @${selectedUser.username} has been ${isCurrentlySuspended ? 'unsuspended' : 'suspended'}!`)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim()) return
    alert(`Success: Message dispatched to @${selectedUser.username}!`)
    setMessageText('')
    setIsMessageOpen(false)
  }

  const handleExportReport = () => {
    alert("Preparing reputation audit report export...")
    
    // Generate mock CSV data
    const headers = "ID,Username,Tier,Reputation,Earnings,Status,Joined\n"
    const rows = users.map(u => `${u.id},${u.username},${u.tier},${u.reputation},${u.earnings.replace(/[^\d.]/g, '')},${u.status},${u.joined}`).join("\n")
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows
    const encodedUri = encodeURI(csvContent)
    
    // Trigger download link
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `community_reputation_report_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    alert("Success: Community reputation CSV report downloaded successfully!")
  }

  // Adjust Reputation States
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)
  const [newReputationValue, setNewReputationValue] = useState('')

  const handleAdjustReputation = () => {
    const num = parseInt(newReputationValue)
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setUsers(prev => prev.map(u => {
        if (u.id === selectedUser.id) {
          const updated = { ...u, reputation: num }
          setSelectedUser(updated)
          return updated
        }
        return u
      }))
      setIsAdjustOpen(false)
      alert(`Success: Adjusted reputation score for ${selectedUser.username} to ${num}!`)
    } else {
      alert('Please enter a valid number between 0 and 100.')
    }
  }

  // Filter logic
  const filteredUsers = users.filter(u => {
    if (tierFilter !== 'all' && u.tier !== tierFilter) return false
    if (searchQuery.trim() !== '' && !u.username.toLowerCase().includes(searchQuery.toLowerCase())) return false
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

  const cardVariants = {
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
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h3 className="text-base font-bold text-foreground font-sans uppercase tracking-wider">Community Reputation</h3>
          <p className="text-[11px] text-muted font-mono uppercase tracking-widest mt-1">Managing 12,408 active participants across tiers</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className={`h-8 gap-1.5 font-mono text-[9px] uppercase tracking-wider transition-all ${isFilterOpen ? 'bg-secondary/15 text-secondary border-secondary shadow-[0_0_10px_rgba(0,224,255,0.2)]' : ''}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <SlidersHorizontal className="h-3 w-3" />
            Filter
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            className="h-8 gap-1.5 font-mono text-[9px] uppercase tracking-wider"
            onClick={handleExportReport}
          >
            <Download className="h-3.5 w-3.5" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Expandable Filter Row */}
      {isFilterOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-border bg-background/40 grid grid-cols-1 sm:grid-cols-2 gap-4 select-none"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] text-muted font-mono uppercase tracking-widest font-bold">Search Username</label>
            <Input 
              placeholder="e.g. validator, alpha..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] text-muted font-mono uppercase tracking-widest font-bold">Filter by Tier</label>
            <select 
              value={tierFilter} 
              onChange={(e) => setTierFilter(e.target.value as any)}
              className="h-8 w-full rounded-lg border border-border bg-background px-3 py-1 text-xs font-mono text-foreground focus-visible:outline-none focus-visible:border-primary transition-all cursor-pointer"
            >
              <option value="all">ALL TIERS</option>
              <option value="elite">ELITE</option>
              <option value="pro">PRO</option>
              <option value="new">NEW</option>
            </select>
          </div>
        </motion.div>
      )}

      {/* Main Content Splitted Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Users List: 8 Columns */}
        <motion.div variants={cardVariants} className="lg:col-span-7 xl:col-span-8">
          <Card className="h-full">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Username</TableHead>
                    <TableHead className="w-[100px]">Tier</TableHead>
                    <TableHead className="w-[200px]">Reputation Score</TableHead>
                    <TableHead className="w-[120px]">Earnings (SOL)</TableHead>
                    <TableHead className="text-right w-[80px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow 
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={`hover:bg-surface/30 cursor-pointer ${selectedUser.id === u.id ? 'bg-surface/50 border-l-2 border-primary' : ''}`}
                    >
                      <TableCell className="font-sans flex items-center gap-3">
                        <Avatar className="h-7 w-7 border-none">
                          <AvatarImage src={u.avatar} />
                          <AvatarFallback className="text-[10px]">{u.username.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-foreground text-xs">{u.username}</span>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={u.tier} className="text-[9px]">
                          {u.tier}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-3 w-full">
                          <Progress 
                            value={u.reputation} 
                            className="h-2 flex-1"
                            indicatorClassName={u.tier === 'elite' ? 'bg-primary' : u.tier === 'pro' ? 'bg-secondary' : 'bg-muted-text'} 
                          />
                          <span className="font-mono text-xs text-foreground font-semibold min-w-[24px] text-right">{u.reputation}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="font-mono font-bold text-foreground text-xs">{u.earnings}</TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 text-[10px] font-mono font-medium">
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            u.status === 'active' ? 'bg-emerald-500 shadow-glow' : 
                            u.status === 'suspended' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                            'bg-muted-text/50'
                          }`}></span>
                          <span className={
                            u.status === 'active' ? 'text-emerald-400' : 
                            u.status === 'suspended' ? 'text-red-400 font-bold' : 
                            'text-muted-text/70'
                          }>
                            {u.status.toUpperCase()}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </motion.div>

        {/* User Detailed Panel: 4 Columns */}
        <motion.div variants={cardVariants} className="lg:col-span-5 xl:col-span-4">
          <Card className="h-full flex flex-col justify-between">
            <div>
              {/* Header profile info */}
              <div className="flex flex-col items-center justify-center border-b border-border/40 pb-5 mb-5 text-center">
                <div className="relative group mb-3">
                  <Avatar className="h-16 w-16 border-2 border-border/60">
                    <AvatarImage src={selectedUser.avatar} />
                    <AvatarFallback className="text-lg">{selectedUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-background border border-border p-1 rounded-full">
                    <ShieldCheck className="h-3.5 w-3.5 text-secondary shadow-cyanGlow" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-foreground font-sans mt-2">@{selectedUser.username}</h3>
                
                <div className="flex items-center gap-1.5 mt-2">
                  <Badge variant="outline" className="text-[8px] tracking-wide text-muted-text/80 flex items-center gap-1.5">
                    <span className="h-1 w-1 bg-secondary rounded-full"></span>
                    IDENTITY VERIFIED
                  </Badge>
                  <span className="text-[9px] font-mono text-muted">• Joined {selectedUser.joined}</span>
                </div>

                {/* Profile shortcuts */}
                <div className="flex items-center gap-2 mt-4">
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-8 w-8 text-muted hover:text-foreground"
                    onClick={() => setIsMessageOpen(true)}
                  >
                    <Mail className="h-4.5 w-4.5" />
                  </Button>
                  <Button 
                    variant={selectedUser.status === 'suspended' ? 'outline' : 'danger'} 
                    size="icon" 
                    className={`h-8 w-8 ${selectedUser.status === 'suspended' ? 'border-emerald-500 text-emerald-400 hover:bg-emerald-500/10' : ''}`}
                    onClick={handleToggleBan}
                  >
                    <Ban className="h-4.5 w-4.5" />
                  </Button>
                </div>
              </div>

              {/* Earned Badges */}
              <div className="mb-5">
                <span className="text-[9px] font-mono text-muted uppercase tracking-widest">Earned Badges</span>
                <div className="grid grid-cols-4 gap-2 mt-2 bg-background/50 border border-border/40 p-2.5 rounded-lg max-w-[260px]">
                  {/* Badge 1 (Trophy) */}
                  <div className={`p-2 rounded border border-border bg-card/45 flex items-center justify-center relative group ${selectedUser.badgeList.includes('trophy') ? 'text-primary' : 'text-muted/20 border-border/20 bg-transparent'}`}>
                    <Trophy className="h-4.5 w-4.5" />
                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-[#1B1B23] border border-border text-[8px] font-mono rounded px-1 text-foreground">consensus trophy</div>
                  </div>
                  {/* Badge 2 (Bolt) */}
                  <div className={`p-2 rounded border border-border bg-card/45 flex items-center justify-center relative group ${selectedUser.badgeList.includes('bolt') ? 'text-secondary' : 'text-muted/20 border-border/20 bg-transparent'}`}>
                    <Zap className="h-4.5 w-4.5" />
                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-[#1B1B23] border border-border text-[8px] font-mono rounded px-1 text-foreground">fast responder</div>
                  </div>
                  {/* Badge 3 (Shield) */}
                  <div className={`p-2 rounded border border-border bg-card/45 flex items-center justify-center relative group ${selectedUser.badgeList.includes('shield') ? 'text-primary' : 'text-muted/20 border-border/20 bg-transparent'}`}>
                    <Shield className="h-4.5 w-4.5" />
                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-[#1B1B23] border border-border text-[8px] font-mono rounded px-1 text-foreground">guardian node</div>
                  </div>
                  {/* Badge 4 (Star) */}
                  <div className={`p-2 rounded border border-border bg-card/45 flex items-center justify-center relative group ${selectedUser.badgeList.includes('star') ? 'text-secondary' : 'text-muted/20 border-border/20 bg-transparent'}`}>
                    <Star className="h-4.5 w-4.5" />
                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-[#1B1B23] border border-border text-[8px] font-mono rounded px-1 text-foreground">highly rated</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Timeline */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono text-muted uppercase tracking-widest">Recent Activity</span>
                  <span 
                    onClick={() => setIsActivityOpen(true)}
                    className="text-[8px] font-mono text-primary cursor-pointer hover:underline"
                  >
                    View All
                  </span>
                </div>
                <div className="flex flex-col gap-3 font-sans">
                  {selectedUser.activity.map((act, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="relative flex flex-col items-center mt-1">
                        <div className="h-2 w-2 rounded-full bg-primary shadow-glow shrink-0"></div>
                        {i < selectedUser.activity.length - 1 && <div className="h-full w-px bg-border/40 mt-1"></div>}
                      </div>
                      
                      <div className="flex flex-col gap-0.5 pb-2">
                        <span className="font-semibold text-[11px] text-foreground leading-none">{act.title}</span>
                        <p className="text-[10px] text-muted font-mono leading-tight mt-0.5">{act.text}</p>
                        <span className="text-[8px] font-mono text-muted/80">{act.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <span className="text-[9px] font-mono text-muted uppercase tracking-widest">Admin Notes</span>
                <p className="italic text-xs text-muted-text bg-background/40 border border-border/50 p-3 rounded-lg mt-1.5 font-sans leading-relaxed">
                  "{selectedUser.notes}"
                </p>
              </div>
            </div>

            <Button 
              variant="outline"
              onClick={() => {
                setNewReputationValue(String(selectedUser.reputation))
                setIsAdjustOpen(true)
              }}
              className="mt-6 w-full text-xs font-mono uppercase tracking-wider py-2 rounded-lg gap-1.5 border-border hover:bg-surface/50 hover:text-foreground"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Adjust Reputation Score
            </Button>
          </Card>
        </motion.div>
      </div>

      {/* Adjust Reputation Sheet Drawer */}
      <Sheet open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <SheetContent side="right" className="p-6 bg-[#151221]/95 text-foreground border-l border-border max-w-sm w-full h-full flex flex-col justify-between">
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              handleAdjustReputation()
            }}
            className="flex flex-col gap-5 h-full justify-between"
          >
            <div className="flex flex-col gap-5">
              <div className="border-b border-border/40 pb-3">
                <h3 className="text-sm font-bold text-[#E5C0FF] font-sans uppercase tracking-wider">Adjust Reputation</h3>
                <p className="text-[10px] text-muted font-mono uppercase tracking-widest mt-1">Set user credibility weight</p>
              </div>

              {/* Display Username */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-mono text-muted uppercase tracking-widest">Username</span>
                <span className="text-xs font-bold text-foreground font-mono">@{selectedUser.username}</span>
              </div>

              {/* Input for Reputation */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-muted font-mono uppercase tracking-widest font-bold">Reputation Score (0 - 100)</label>
                <Input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={newReputationValue} 
                  onChange={(e) => setNewReputationValue(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="flex gap-3 border-t border-border/40 pt-4 mt-auto">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 text-xs font-mono py-2"
                onClick={() => setIsAdjustOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                className="flex-1 text-xs font-mono py-2"
              >
                Save
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Detailed Activity Sheet Drawer */}
      <Sheet open={isActivityOpen} onOpenChange={setIsActivityOpen}>
        <SheetContent side="right" className="p-6 bg-[#151221]/95 text-foreground border-l border-border max-w-sm w-full h-full flex flex-col justify-between animate-in">
          <div className="flex flex-col h-full justify-between">
            <div className="flex flex-col">
              <div className="border-b border-border/40 pb-3 mb-4">
                <h3 className="text-sm font-bold text-[#E5C0FF] font-sans uppercase tracking-wider">User Activity History</h3>
                <p className="text-[10px] text-muted font-mono uppercase tracking-widest mt-1">Full transaction and event logs for @{selectedUser.username}</p>
              </div>

              <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto font-sans">
                {/* Standard activities */}
                {selectedUser.activity.map((act, i) => (
                  <div key={i} className="p-3 border border-border/60 bg-background/50 rounded-lg flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground">{act.title}</span>
                      <span className="text-[9px] font-mono text-muted">{act.time}</span>
                    </div>
                    <p className="text-[10.5px] text-muted-text font-mono mt-1">{act.text}</p>
                  </div>
                ))}
                
                {/* Simulated extra activity logs to make it look full */}
                <div className="p-3 border border-border/60 bg-background/50 rounded-lg flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground">Reputation Score Calibrated</span>
                    <span className="text-[9px] font-mono text-muted">1w ago</span>
                  </div>
                  <p className="text-[10.5px] text-muted-text font-mono mt-1">Automatic verification pass: 0% deviation detected across 12 node settlements.</p>
                </div>

                <div className="p-3 border border-border/60 bg-background/50 rounded-lg flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground">Validator Node Registered</span>
                    <span className="text-[9px] font-mono text-muted">2w ago</span>
                  </div>
                  <p className="text-[10.5px] text-muted-text font-mono mt-1">Node connection secured at consensus index 0x981FA.</p>
                </div>
              </div>
            </div>

            <Button 
              variant="outline"
              className="mt-6 w-full text-xs font-mono py-2.5"
              onClick={() => setIsActivityOpen(false)}
            >
              Close Activity Panel
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Direct Message Sheet Drawer */}
      <Sheet open={isMessageOpen} onOpenChange={setIsMessageOpen}>
        <SheetContent side="right" className="p-6 bg-[#151221]/95 text-foreground border-l border-border max-w-sm w-full h-full flex flex-col justify-between animate-in">
          <form 
            onSubmit={handleSendMessage}
            className="flex flex-col gap-5 h-full justify-between"
          >
            <div className="flex flex-col gap-5">
              <div className="border-b border-border/40 pb-3">
                <h3 className="text-sm font-bold text-[#E5C0FF] font-sans uppercase tracking-wider">Send Direct Notification</h3>
                <p className="text-[10px] text-muted font-mono uppercase tracking-widest mt-1">Dispatches secure telemetry alert to participant</p>
              </div>

              {/* Display Username */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-mono text-muted uppercase tracking-widest">Recipient</span>
                <span className="text-xs font-bold text-foreground font-mono">@{selectedUser.username}</span>
              </div>

              {/* Textarea for message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-muted font-mono uppercase tracking-widest font-bold">Message Content</label>
                <textarea 
                  value={messageText} 
                  onChange={(e) => setMessageText(e.target.value)} 
                  placeholder="Type secure message dispatch..."
                  required
                  rows={6}
                  className="w-full p-3 rounded-lg border border-border bg-card/60 text-xs font-mono text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 border-t border-border/40 pt-4 mt-auto">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 text-xs font-mono py-2"
                onClick={() => setIsMessageOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                className="flex-1 text-xs font-mono py-2"
              >
                Dispatch
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </motion.div>
  )
}
