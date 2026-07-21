import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  RotateCcw, 
  XCircle, 
  RotateCw, 
  Coins, 
  Users, 
  Award,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Sheet, SheetContent } from '../../components/ui/sheet'
import { useOracle } from '../../context/OracleContext'
import { OracleChallengeDrawer } from './OracleChallengeDrawer'
import type { SettlementQueueItem } from '../../context/OracleContext'

export const OracleSettlementCenter: React.FC = () => {
  const { 
    settlementQueue, 
    selectedQueueItem, 
    setSelectedQueueItem, 
    approveSettlement, 
    rejectSettlement, 
    refundSettlement, 
    triggerRetryAI,
    addCustomTestChallenge
  } = useOracle()

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // New Custom Test Bet Drawer State
  const [isTestBetOpen, setIsTestBetOpen] = useState(false)
  const [testBetTitle, setTestBetTitle] = useState('')
  const [testBetCategory, setTestBetCategory] = useState<SettlementQueueItem['category']>('Custom')
  const [testBetStake, setTestBetStake] = useState('250')
  const [testBetRules, setTestBetRules] = useState('Player A bets YES for 50 pushups under 3 minutes\nPlayer B bets NO')
  const [testBetProof, setTestBetProof] = useState('Video proof uploaded by Alex_R (Duration: 2m:45s)')

  const handleCreateTestBet = (e: React.FormEvent) => {
    e.preventDefault()
    addCustomTestChallenge(
      testBetTitle.trim() || 'Custom Test Bet',
      testBetCategory,
      parseFloat(testBetStake) || 250,
      testBetRules,
      testBetProof
    )
    setIsTestBetOpen(false)
    setTestBetTitle('')
  }

  // Filter logic
  const filteredQueue = useMemo(() => {
    return settlementQueue.filter(item => {
      const matchesSearch = 
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.assignedOperator.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [settlementQueue, searchQuery, categoryFilter, statusFilter])

  // Pagination logic
  const totalPages = Math.ceil(filteredQueue.length / pageSize) || 1
  const paginatedQueue = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredQueue.slice(start, start + pageSize)
  }, [filteredQueue, currentPage])

  const getStatusBadge = (status: SettlementQueueItem['status']) => {
    switch (status) {
      case 'AI Analyzed':
        return <Badge variant="pro">AI ANALYZED</Badge>
      case 'Auto-Settled':
        return <Badge variant="success">AUTO SETTLED</Badge>
      case 'Manual Review':
        return <Badge variant="warning">MANUAL REVIEW</Badge>
      case 'Disputed':
        return <Badge variant="danger">DISPUTED</Badge>
      case 'Rejected':
        return <Badge variant="outline" className="text-muted border-muted">REJECTED</Badge>
      case 'Refunded':
        return <Badge variant="outline" className="text-orange-400 border-orange-500/40">REFUNDED</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full font-sans select-none">
      
      {/* Header Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-surface/30 p-4 rounded-xl border border-border/60">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <Input 
            placeholder="Search Challenge ID, Name, or Operator..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="pl-9 bg-background border-border/60 text-xs font-mono"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted" />
            <span className="text-xs font-mono text-muted uppercase">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="bg-background border border-border/60 rounded-lg px-2.5 py-1.5 text-xs font-mono text-foreground outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Sports">Sports</option>
              <option value="Physical">Physical</option>
              <option value="Prediction">Prediction</option>
              <option value="Performance">Performance</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-background border border-border/60 rounded-lg px-2.5 py-1.5 text-xs font-mono text-foreground outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="AI Analyzed">AI Analyzed</option>
              <option value="Manual Review">Manual Review</option>
              <option value="Disputed">Disputed</option>
              <option value="Auto-Settled">Auto-Settled</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          <Button size="sm" variant="primary" glow onClick={() => setIsTestBetOpen(true)} className="text-xs font-mono gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Create Custom Test Bet
          </Button>
        </div>

      </div>

      {/* Settlement Queue Master Table */}
      <div className="border border-border/60 rounded-xl overflow-hidden bg-surface/30">
        <Table>
          <TableHeader className="bg-surface/60">
            <TableRow>
              <TableHead className="text-xs font-mono">Challenge ID</TableHead>
              <TableHead className="text-xs font-mono">Challenge Name</TableHead>
              <TableHead className="text-xs font-mono">Category</TableHead>
              <TableHead className="text-xs font-mono">Players</TableHead>
              <TableHead className="text-xs font-mono">Prize Pool</TableHead>
              <TableHead className="text-xs font-mono">Escrow</TableHead>
              <TableHead className="text-xs font-mono">AI Confidence</TableHead>
              <TableHead className="text-xs font-mono">Status</TableHead>
              <TableHead className="text-xs font-mono">Created</TableHead>
              <TableHead className="text-xs font-mono">Assigned To</TableHead>
              <TableHead className="text-xs font-mono text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedQueue.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-12 text-muted font-mono text-xs">
                  No challenges matching settlement queue criteria.
                </TableCell>
              </TableRow>
            ) : (
              paginatedQueue.map((item) => (
                <TableRow key={item.id} className="hover:bg-surface/50 transition-colors">
                  <TableCell className="font-mono text-xs font-bold text-primary">{item.id}</TableCell>
                  <TableCell className="font-mono text-xs text-foreground font-medium max-w-[200px] truncate">{item.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">{item.category}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-foreground">{item.playersCount}</TableCell>
                  <TableCell className="font-mono text-xs text-emerald-400 font-bold">{item.prizePool.toLocaleString()} BET</TableCell>
                  <TableCell className="font-mono text-xs text-purple-400">{item.escrowAmount.toLocaleString()} BET</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className={`font-bold ${item.aiConfidence >= 95 ? 'text-emerald-400' : item.aiConfidence >= 85 ? 'text-amber-400' : 'text-red-400'}`}>
                        {item.aiConfidence}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="font-mono text-xs text-muted whitespace-nowrap">{item.createdTime}</TableCell>
                  <TableCell className="font-mono text-xs text-muted truncate max-w-[120px]">{item.assignedOperator}</TableCell>
                  
                  {/* Action Buttons */}
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setSelectedQueueItem(item)}
                        className="h-7 px-2 text-[10px] font-mono gap-1 text-primary hover:bg-primary/10"
                      >
                        <Eye className="h-3 w-3" /> Review
                      </Button>
                      
                      {item.status !== 'Auto-Settled' && item.status !== 'Refunded' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => approveSettlement(item.id)}
                            className="h-7 px-2 text-[10px] font-mono border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => triggerRetryAI(item.id)}
                            className="h-7 px-1.5 text-muted hover:text-foreground"
                          >
                            <RotateCw className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between font-mono text-xs text-muted pt-2">
        <span>Showing {paginatedQueue.length} of {filteredQueue.length} queue items</span>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="h-8 text-xs font-mono"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button 
            size="sm" 
            variant="outline" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="h-8 text-xs font-mono"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Challenge Details Slide-Over Drawer */}
      <OracleChallengeDrawer 
        item={selectedQueueItem} 
        onClose={() => setSelectedQueueItem(null)} 
      />

      {/* Create Custom Test Bet Drawer Modal */}
      <Sheet open={isTestBetOpen} onOpenChange={setIsTestBetOpen}>
        <SheetContent side="right" className="p-6 bg-background border-l border-border max-w-md w-full h-full flex flex-col justify-between">
          <form onSubmit={handleCreateTestBet} className="flex flex-col justify-between h-full space-y-5">
            <div className="space-y-4 overflow-y-auto pr-1">
              <div className="border-b border-border/40 pb-3">
                <h3 className="text-base font-bold font-sans text-foreground uppercase">Create Custom Test Wager</h3>
                <p className="text-xs text-muted font-mono mt-0.5">Input your own bet data to test live Gemini AI & Oracle resolution</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-muted uppercase font-bold">Challenge Title / Wager Description</label>
                <Input 
                  placeholder="e.g. Alex vs Rahul Arm Wrestling Match (YES/NO)"
                  value={testBetTitle}
                  onChange={e => setTestBetTitle(e.target.value)}
                  className="bg-background border-border/60 text-xs font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-muted uppercase font-bold">Category</label>
                  <select
                    value={testBetCategory}
                    onChange={e => setTestBetCategory(e.target.value as any)}
                    className="w-full bg-background border border-border/60 rounded-lg p-2.5 text-xs font-mono text-foreground outline-none cursor-pointer"
                  >
                    <option value="Custom">Custom P2P</option>
                    <option value="Prediction">Prediction</option>
                    <option value="Sports">Sports</option>
                    <option value="Physical">Physical</option>
                    <option value="Performance">Performance</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-muted uppercase font-bold">Per Player Stake (BET)</label>
                  <Input 
                    type="number"
                    value={testBetStake}
                    onChange={e => setTestBetStake(e.target.value)}
                    className="bg-background border-border/60 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-muted uppercase font-bold">Wager Rules (Line by Line)</label>
                <textarea
                  rows={3}
                  value={testBetRules}
                  onChange={e => setTestBetRules(e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-lg p-2.5 text-xs font-mono text-foreground outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-muted uppercase font-bold">Submitted Proof / Evidence Summary</label>
                <textarea
                  rows={3}
                  value={testBetProof}
                  onChange={e => setTestBetProof(e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-lg p-2.5 text-xs font-mono text-foreground outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border/40">
              <Button type="button" variant="outline" onClick={() => setIsTestBetOpen(false)} className="flex-1 text-xs font-mono">Cancel</Button>
              <Button type="submit" variant="primary" glow className="flex-1 text-xs font-mono font-bold">Add to Oracle Queue</Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

    </div>
  )
}
