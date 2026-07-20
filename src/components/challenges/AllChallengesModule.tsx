import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  CheckCircle, 
  Copy, 
  Trash2, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Sheet, SheetContent } from '../ui/sheet'
import { useChallenges } from '../../context/ChallengesContext'
import type { ChallengeStatus, ChallengeCategoryType } from '../../context/ChallengesContext'

export const AllChallengesModule: React.FC = () => {
  const {
    challenges,
    categories,
    setSelectedChallenge,
    createChallenge,
    approveChallenge,
    duplicateChallenge,
    deleteChallenge,
    bulkApprove,
    bulkReject,
    bulkSuspend,
    bulkDelete,
    showToastNotice
  } = useChallenges()

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // New Challenge Sheet state
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<ChallengeCategoryType>('Prediction')
  const [newType, setNewType] = useState('Binary Option')
  const [newFrequency, setNewFrequency] = useState<'Single Event' | 'Day-wise' | 'Weekly' | 'Monthly'>('Single Event')
  const [newDescription, setNewDescription] = useState('')
  const [newStake, setNewStake] = useState('100')
  const [newMaxParticipants, setNewMaxParticipants] = useState('100')
  const [newRules, setNewRules] = useState('Standard AnyBet rules apply')

  // Filtered List
  const filteredChallenges = useMemo(() => {
    return challenges.filter(c => {
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return false
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchTitle = c.title.toLowerCase().includes(q)
        const matchId = c.id.toLowerCase().includes(q)
        const matchCreator = c.creatorName.toLowerCase().includes(q)
        if (!matchTitle && !matchId && !matchCreator) return false
      }
      return true
    })
  }, [challenges, categoryFilter, statusFilter, searchQuery])

  // Paginated List
  const totalPages = Math.ceil(filteredChallenges.length / pageSize) || 1
  const paginatedChallenges = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredChallenges.slice(start, start + pageSize)
  }, [filteredChallenges, currentPage, pageSize])

  // Bulk Selection Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedChallenges.map(c => c.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id])
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) {
      showToastNotice('Title is required', 'warning')
      return
    }

    createChallenge({
      title: newTitle.trim(),
      category: newCategory,
      type: newType.trim(),
      frequency: newFrequency,
      description: newDescription.trim() || 'No detailed description provided.',
      stakeAmount: Number(newStake) || 100,
      maxParticipants: Number(newMaxParticipants) || 100,
      rules: newRules.split('\n').filter(r => r.trim() !== ''),
      status: 'Pending Review'
    })

    setIsAddSheetOpen(false)
    setNewTitle('')
    setNewDescription('')
  }

  const getStatusBadge = (status: ChallengeStatus) => {
    switch (status) {
      case 'Live':
        return <Badge variant="success">LIVE</Badge>
      case 'Pending Review':
        return <Badge variant="warning">PENDING REVIEW</Badge>
      case 'Approved':
        return <Badge variant="pro">APPROVED</Badge>
      case 'Completed':
        return <Badge variant="success">COMPLETED</Badge>
      case 'Disputed':
        return <Badge variant="danger">DISPUTED</Badge>
      case 'Cancelled':
        return <Badge variant="outline">CANCELLED</Badge>
      case 'Draft':
        return <Badge variant="outline">DRAFT</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Control Bar: Search, Filters & Create Action */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-1">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <Input
            placeholder="Search by Title, ID, or Creator..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="pl-9 h-9 text-xs font-mono bg-surface/40 border-border/60"
          />
        </div>

        {/* Filters & Create Action */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-between md:justify-end">
          <div className="flex items-center gap-1.5 bg-surface/40 border border-border/60 rounded-lg px-2.5 py-1 text-xs font-mono">
            <Filter className="h-3.5 w-3.5 text-muted" />
            <span className="text-muted text-[10px] uppercase">Category:</span>
            <select
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-foreground outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name} className="bg-background text-foreground">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-surface/40 border border-border/60 rounded-lg px-2.5 py-1 text-xs font-mono">
            <span className="text-muted text-[10px] uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-foreground outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Draft" className="bg-background text-foreground">Draft</option>
              <option value="Pending Review" className="bg-background text-foreground">Pending Review</option>
              <option value="Approved" className="bg-background text-foreground">Approved</option>
              <option value="Live" className="bg-background text-foreground">Live</option>
              <option value="Completed" className="bg-background text-foreground">Completed</option>
              <option value="Cancelled" className="bg-background text-foreground">Cancelled</option>
              <option value="Disputed" className="bg-background text-foreground">Disputed</option>
            </select>
          </div>

          <Button
            variant="primary"
            glow
            onClick={() => setIsAddSheetOpen(true)}
            className="gap-2 text-xs font-mono shrink-0 h-9"
          >
            <Plus className="h-4 w-4" /> Create Challenge
          </Button>
        </div>

      </div>

      {/* Bulk Action Strip if Selection > 0 */}
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-primary/15 border border-primary/40 rounded-xl flex items-center justify-between gap-4"
        >
          <span className="text-xs font-mono text-primary font-bold">
            {selectedIds.length} challenge{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="primary" glow onClick={() => { bulkApprove(selectedIds); setSelectedIds([]); }} className="text-xs font-mono h-8">Approve</Button>
            <Button size="sm" variant="outline" onClick={() => { bulkSuspend(selectedIds); setSelectedIds([]); }} className="text-xs font-mono h-8">Suspend</Button>
            <Button size="sm" variant="outline" onClick={() => { bulkReject(selectedIds); setSelectedIds([]); }} className="text-xs font-mono h-8 text-red-400 border-red-500/30">Reject</Button>
            <Button size="sm" variant="ghost" onClick={() => { bulkDelete(selectedIds); setSelectedIds([]); }} className="text-xs font-mono h-8 text-muted hover:text-red-400">Delete</Button>
          </div>
        </motion.div>
      )}

      {/* Master Data Table */}
      <div className="border border-border/60 rounded-xl overflow-hidden bg-surface/20">
        <Table>
          <TableHeader className="bg-surface/60">
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={paginatedChallenges.length > 0 && selectedIds.length === paginatedChallenges.length}
                  onChange={e => handleSelectAll(e.target.checked)}
                  className="rounded border-border accent-primary cursor-pointer"
                />
              </TableHead>
              <TableHead className="text-xs font-mono">ID</TableHead>
              <TableHead className="text-xs font-mono">Title & Category</TableHead>
              <TableHead className="text-xs font-mono">Type</TableHead>
              <TableHead className="text-xs font-mono">Creator</TableHead>
              <TableHead className="text-xs font-mono">Participants</TableHead>
              <TableHead className="text-xs font-mono">Stake</TableHead>
              <TableHead className="text-xs font-mono">Prize Pool</TableHead>
              <TableHead className="text-xs font-mono">Status</TableHead>
              <TableHead className="text-xs font-mono text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedChallenges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-10 text-muted font-mono text-xs">
                  No challenges found matching your search and filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              paginatedChallenges.map(c => {
                const isSelected = selectedIds.includes(c.id)
                return (
                  <TableRow key={c.id} className={isSelected ? 'bg-primary/5' : ''}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(c.id)}
                        className="rounded border-border accent-primary cursor-pointer"
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-primary">{c.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-xs text-foreground line-clamp-1">{c.title}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-muted">{c.category}</span>
                          {c.frequency === 'Day-wise' && <Badge variant="warning" className="text-[8px] py-0 px-1">⚡ DAY-WISE</Badge>}
                          {c.frequency === 'Weekly' && <Badge variant="pro" className="text-[8px] py-0 px-1">📅 WEEKLY</Badge>}
                          {c.frequency === 'Monthly' && <Badge variant="elite" className="text-[8px] py-0 px-1">🏆 MONTHLY</Badge>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted">{c.type}</TableCell>
                    <TableCell className="font-mono text-xs text-foreground/90">{c.creatorName}</TableCell>
                    <TableCell className="font-mono text-xs text-muted">{c.participantsCount} users</TableCell>
                    <TableCell className="font-mono text-xs text-primary">{c.stakeAmount} BET</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-emerald-400">{c.prizePool.toLocaleString()} BET</TableCell>
                    <TableCell>{getStatusBadge(c.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setSelectedChallenge(c)}
                          title="View Details"
                          className="h-7 w-7 text-muted hover:text-primary"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>

                        {c.status === 'Pending Review' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => approveChallenge(c.id)}
                            title="Approve Challenge"
                            className="h-7 w-7 text-muted hover:text-emerald-400"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => duplicateChallenge(c.id)}
                          title="Duplicate"
                          className="h-7 w-7 text-muted hover:text-foreground"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteChallenge(c.id)}
                          title="Delete"
                          className="h-7 w-7 text-muted hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border/50 bg-surface/30 flex items-center justify-between text-xs font-mono">
          <span className="text-muted">
            Showing {filteredChallenges.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredChallenges.length)} of {filteredChallenges.length} challenges
          </span>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-foreground font-bold">{currentPage} / {totalPages}</span>
            <Button
              size="icon"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* CREATE NEW CHALLENGE SHEET */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-background border-l border-border p-6 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-bold font-sans text-foreground">Create New Challenge</h3>
              <p className="text-xs text-muted font-sans mt-0.5">Define challenge specs, rules, and stake parameters.</p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1">Challenge Title</label>
                <Input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Marathon Completion Under 3h"
                  required
                  className="bg-surface/40 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full bg-surface/40 border border-border rounded-md p-2 text-xs font-mono text-foreground outline-none"
                  >
                    <option value="Sports">Sports</option>
                    <option value="Physical">Physical</option>
                    <option value="Prediction">Prediction</option>
                    <option value="Performance">Performance</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Wager Type (Format)</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value)}
                    className="w-full bg-surface/40 border border-border rounded-md p-2 text-xs font-mono text-foreground outline-none cursor-pointer"
                  >
                    <option value="Binary Option">Binary Option (Yes / No)</option>
                    <option value="Day-wise Streak">Day-wise Streak (24h Daily Goal)</option>
                    <option value="Weekly Tournament">Weekly Tournament (7-Day Pool)</option>
                    <option value="Solo Time Trial">Solo Time Trial (Target Time/Score)</option>
                    <option value="Group Goal">Group Goal (Collective Target)</option>
                    <option value="Match Winner">Match Winner / Spread</option>
                    <option value="Peer Wager">Peer Wager (Head-to-Head)</option>
                    <option value="Esports Speedrun">Esports Speedrun</option>
                    <option value="Custom Format">Custom Format</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1">Challenge Duration / Frequency</label>
                <select
                  value={newFrequency}
                  onChange={e => setNewFrequency(e.target.value as any)}
                  className="w-full bg-surface/40 border border-border rounded-md p-2 text-xs font-mono text-foreground outline-none"
                >
                  <option value="Single Event">Single Event (Standard Wager)</option>
                  <option value="Day-wise">Day-wise (Daily 24h Streak)</option>
                  <option value="Weekly">Weekly (7-Day Tournament / Pool)</option>
                  <option value="Monthly">Monthly (30-Day Championship)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1">Description</label>
                <textarea
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Detailed description of challenge objectives & proof requirements..."
                  rows={3}
                  className="w-full bg-surface/40 border border-border rounded-md p-2 text-xs font-sans text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Stake Amount ($BET)</label>
                  <Input
                    type="number"
                    value={newStake}
                    onChange={e => setNewStake(e.target.value)}
                    className="bg-surface/40 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Max Participants</label>
                  <Input
                    type="number"
                    value={newMaxParticipants}
                    onChange={e => setNewMaxParticipants(e.target.value)}
                    className="bg-surface/40 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1">Rules (One per line)</label>
                <textarea
                  value={newRules}
                  onChange={e => setNewRules(e.target.value)}
                  rows={3}
                  className="w-full bg-surface/40 border border-border rounded-md p-2 text-xs font-sans text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="pt-4 flex items-center gap-3">
                <Button type="submit" variant="primary" glow className="w-full text-xs font-mono">
                  Publish Challenge
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

    </div>
  )
}
