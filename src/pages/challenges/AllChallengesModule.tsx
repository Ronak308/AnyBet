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
  ChevronRight,
  MoreVertical,
  TrendingUp,
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Sheet, SheetContent } from '../../components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '../../components/ui/dropdown-menu'
import { useChallenges } from '../../context/ChallengesContext'
import { useWallet } from '../../context/WalletContext'
import type { ChallengeStatus, ChallengeCategoryType } from '../../context/ChallengesContext'

export const AllChallengesModule: React.FC = () => {
  const {
    challenges,
    categories,
    setSelectedChallenge,
    createChallenge,
    approveChallenge,
    updateChallenge,
    duplicateChallenge,
    deleteChallenge,
    bulkApprove,
    bulkReject,
    bulkSuspend,
    bulkDelete
  } = useChallenges()

  const walletContext = useWallet()
  const userWallet = walletContext?.wallets.find(w => w.userId === 'USR_01')
  const userBalance = userWallet ? userWallet.totalBalance : 5000 // default fallback

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Helper for datetime-local format (YYYY-MM-DDTHH:mm)
  const formatDateTimeLocal = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  // New Challenge Sheet state
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<ChallengeCategoryType>('Prediction')
  const [newType, setNewType] = useState('Binary Option')
  const [newFrequency, setNewFrequency] = useState<'Single Event' | 'Day-wise' | 'Weekly' | 'Monthly'>('Single Event')
  const [newSource] = useState<'Admin Portal' | 'Mobile App'>('Admin Portal')
  const [newCreatorName, setNewCreatorName] = useState('System Admin')
  const [newOpponentName, setNewOpponentName] = useState('')
  const [newStartDate, setNewStartDate] = useState(() => formatDateTimeLocal(new Date()))
  const [newEndDate, setNewEndDate] = useState(() => formatDateTimeLocal(new Date(Date.now() + 7 * 86400000)))
  const [newDescription, setNewDescription] = useState('')
  const [newStake, setNewStake] = useState('100')
  const [newMaxParticipants, setNewMaxParticipants] = useState('100')
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1)
  const [stepError, setStepError] = useState<string | null>(null)
  const [newRules, setNewRules] = useState('Standard AnyBet rules apply\nOfficial settlement source is final\nAll participants must agree to escrow terms')

  // Validation Handlers per Step
  const validateStep1 = (): boolean => {
    setStepError(null)
    if (new Date(newEndDate) <= new Date(newStartDate)) {
      setStepError('End Date & Time must be set AFTER Start Date & Time!')
      return false
    }
    setWizardStep(2)
    return true
  }

  const validateStep2 = (): boolean => {
    setStepError(null)
    const activeRules = newRules.split('\n').filter(r => r.trim() !== '')
    if (activeRules.length === 0) {
      setStepError('At least 1 Challenge Rule is required!')
      return false
    }
    setWizardStep(3)
    return true
  }

  const validateStep3 = (): boolean => {
    setStepError(null)
    const stake = Number(newStake)
    const maxP = Number(newMaxParticipants)
    if (isNaN(stake) || stake <= 0) {
      setStepError('Stake Amount must be a positive number greater than 0 Coins!')
      return false
    }
    if (isNaN(maxP) || maxP < 1) {
      setStepError('Max Participants must be at least 1!')
      return false
    }
    // EDGE CASE 3: Insufficient Wallet Balance Check
    if (userBalance < stake) {
      setStepError(`Insufficient wallet balance! You only have ${userBalance} Coins. You need at least ${stake} Coins to lock the stake.`)
      return false
    }
    setWizardStep(4)
    return true
  }

  // Rule Presets Loader
  const loadCategoryPresetRules = (category: string) => {
    switch (category) {
      case 'Prediction':
        setNewRules('Binance 24h UTC daily close candle price is reference benchmark\nTarget price threshold must be crossed prior to end date\nAI Oracle auto-settlement enabled with 95% confidence threshold')
        break
      case 'Sports':
        setNewRules('Official league box score is final reference\nOvertime and extra time included in total score\nSettled automatically within 30 minutes of final whistle')
        break
      case 'Physical':
        setNewRules('Uninterrupted GPS telemetry or video proof required\nHealthKit / Garmin sensor telemetry must show zero anomaly flags\nSubmitted proof must be uploaded before midnight')
        break
      default:
        setNewRules('Standard AnyBet Wager Rules apply\nParticipant consensus or AI evidence verification required\nFull escrow refund in case of disputed tie')
    }
  }

  // Computed Auto-Generated Title Preview
  const computedTitlePreview = useMemo(() => {
    if (newTitle.trim()) return newTitle.trim()
    if (newOpponentName.trim()) {
      return `${newCreatorName || 'User'} vs ${newOpponentName.trim()}: ${newCategory} ${newType}`
    }
    return `${newCreatorName || 'System'}: ${newCategory} ${newType}`
  }, [newTitle, newCreatorName, newOpponentName, newCategory, newType])

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

  const handleFrequencyChange = (freq: 'Single Event' | 'Day-wise' | 'Weekly' | 'Monthly') => {
    setNewFrequency(freq)
    const now = new Date()
    setNewStartDate(formatDateTimeLocal(now))

    let daysToAdd = 7
    if (freq === 'Day-wise') daysToAdd = 1
    if (freq === 'Weekly') daysToAdd = 7
    if (freq === 'Monthly') daysToAdd = 30
    if (freq === 'Single Event') daysToAdd = 1

    const end = new Date(now.getTime() + daysToAdd * 86400000)
    setNewEndDate(formatDateTimeLocal(end))
  }

  const [showInviteAlert, setShowInviteAlert] = useState(false)
  const [inviteUrl, setInviteUrl] = useState('')

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const activeRulesList = newRules.split('\n').filter(r => r.trim() !== '')
    if (activeRulesList.length === 0) {
      setWizardStep(2)
      setStepError('At least 1 Challenge Rule is required!')
      return
    }

    const finalTitle = computedTitlePreview

    // Auto-approve Admin Portal creations so no manual approval click is required for Public Pools
    const initialStatus: ChallengeStatus = (newSource === 'Admin Portal' || newCategory === 'Sports' || newCategory === 'Prediction') ? 'Approved' : 'Pending Review'

    createChallenge({
      title: finalTitle,
      category: newCategory,
      type: newType.trim(),
      frequency: newFrequency,
      source: newSource,
      creatorName: newCreatorName.trim() || 'Public Pool',
      startDate: newStartDate,
      endDate: newEndDate,
      description: newDescription.trim() || 'No detailed description provided.',
      stakeAmount: Number(newStake) || 100,
      maxParticipants: Number(newMaxParticipants) || 100,
      rules: activeRulesList,
      status: initialStatus
    })

    // GROWTH HACK CHECK: If opponent or creator is custom unregistered (e.g. not 'System Admin' / 'alex' / 'marcus'), generate onboarding invite link
    const isNewUser = newOpponentName.trim() && !['alex', 'marcus', 'alex_runner', 'crypto_king', 'GamerPro_99'].includes(newOpponentName.toLowerCase().trim())
    if (isNewUser) {
      const generatedLink = `https://anybet.io/claim-wager?wagerId=AB-${Math.floor(1000 + Math.random() * 9000)}&opponent=${encodeURIComponent(newOpponentName.trim())}`
      setInviteUrl(generatedLink)
      setShowInviteAlert(true)
    } else {
      setIsAddSheetOpen(false)
    }

    setWizardStep(1)
    setStepError(null)
    setNewTitle('')
    setNewOpponentName('')
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
              <TableHead className="text-xs font-mono">Source</TableHead>
              <TableHead className="text-xs font-mono">Time Period</TableHead>
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
                <TableCell colSpan={11} className="text-center py-10 text-muted font-mono text-xs">
                  No challenges found matching your search and filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              paginatedChallenges.map(c => {
                const isSelected = selectedIds.includes(c.id)
                const isAdminSource = (c.source || (c.creatorId === 'USR_01' || c.creatorName === 'Operator Admin' ? 'Admin Portal' : 'Mobile App')) === 'Admin Portal'
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
                          {c.frequency === 'Day-wise' && <Badge variant="warning" className="text-[8px] py-0 px-1">⚡ DAY-WISE (24H)</Badge>}
                          {c.frequency === 'Weekly' && <Badge variant="pro" className="text-[8px] py-0 px-1">📅 WEEKLY (7D)</Badge>}
                          {c.frequency === 'Monthly' && <Badge variant="elite" className="text-[8px] py-0 px-1">🏆 MONTHLY (30D)</Badge>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isAdminSource ? (
                        <Badge variant="pro" className="text-[9px]">Admin</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] text-cyan-400 border-cyan-500/30">App</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 font-mono text-[11px]">
                        <span className="text-foreground/90">{c.startDate} → {c.endDate}</span>
                        <span className="text-[10px] text-muted font-mono">
                          {c.status === 'Live' ? '⏳ Active Countdown' : '🗓️ Duration Fixed'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted">{c.type}</TableCell>
                    <TableCell className="font-mono text-xs text-foreground/90">{c.creatorName}</TableCell>
                    <TableCell className="font-mono text-xs text-muted">{(c.participantsCount || 0)} users</TableCell>
                    <TableCell className="font-mono text-xs text-primary">{(c.stakeAmount || 0)} Coins</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-emerald-400">{(c.prizePool || 0).toLocaleString()} Coins</TableCell>
                    <TableCell>{getStatusBadge(c.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted hover:text-foreground hover:bg-surface/60 rounded-lg cursor-pointer"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-[#120F1D] border-border/80 p-1.5 shadow-2xl">
                          <DropdownMenuItem
                            onClick={() => setSelectedChallenge(c)}
                            className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-primary/15 hover:text-primary cursor-pointer rounded-md p-2"
                          >
                            <Eye className="h-3.5 w-3.5 text-primary" /> View Details
                          </DropdownMenuItem>

                          {c.status === 'Pending Review' && (
                            <DropdownMenuItem
                              onClick={() => approveChallenge(c.id)}
                              className="flex items-center gap-2 text-xs font-mono text-emerald-400 hover:bg-emerald-500/15 cursor-pointer rounded-md p-2"
                            >
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Approve Challenge
                            </DropdownMenuItem>
                          )}

                          {(c.status === 'Approved' || c.status === 'Draft') && (
                            <DropdownMenuItem
                              onClick={() => updateChallenge(c.id, { status: 'Live' })}
                              className="flex items-center gap-2 text-xs font-mono text-emerald-400 hover:bg-emerald-500/15 cursor-pointer rounded-md p-2"
                            >
                              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Go Live
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem
                            onClick={() => duplicateChallenge(c.id)}
                            className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-surface/80 cursor-pointer rounded-md p-2"
                          >
                            <Copy className="h-3.5 w-3.5 text-muted" /> Duplicate
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="my-1 bg-border/50" />

                          <DropdownMenuItem
                            onClick={() => deleteChallenge(c.id)}
                            className="flex items-center gap-2 text-xs font-mono text-red-400 hover:bg-red-500/15 cursor-pointer rounded-md p-2"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-400" /> Delete Challenge
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      {/* UNREGISTERED USER ONBOARDING CLAIM POPUP MODAL */}
      {showInviteAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-[#110E1C] border border-primary/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-border/40 pb-3">
              <div className="p-2 bg-primary/25 rounded-xl text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">Opponent Invitation Link Generated!</h4>
                <p className="text-xs text-muted">The opponent is not registered on AnyBet yet.</p>
              </div>
            </div>

            <p className="text-xs text-muted leading-relaxed font-sans">
              We have initialized a <strong className="text-primary">Shadow Profile</strong> for this user. Copy and share this claim link with them via WhatsApp, SMS, or Telegram. Once they sign up using this link, they will claim their wallet, and this 1v1 wager will automatically sync!
            </p>

            <div className="p-3 bg-surface/40 border border-border/50 rounded-xl flex items-center justify-between gap-3">
              <span className="text-[11px] font-mono text-foreground truncate select-all flex-grow">{inviteUrl}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(inviteUrl)
                  alert('Copied to clipboard!')
                }}
                className="h-7 text-[10px] font-mono border-primary/40 text-primary shrink-0 hover:bg-primary/10"
              >
                <Copy className="h-3 w-3 mr-1" /> Copy Link
              </Button>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                onClick={() => {
                  setShowInviteAlert(false)
                  setIsAddSheetOpen(false)
                }}
                className="text-xs font-mono px-6"
              >
                Got It
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW CHALLENGE WIZARD SHEET (Mobile App Design Aligned) */}
      <Sheet open={isAddSheetOpen} onOpenChange={(open) => { 
        if(!showInviteAlert) {
          setIsAddSheetOpen(open)
          if(!open) setWizardStep(1)
        }
      }}>
        <SheetContent side="right" className="w-full sm:max-w-2xl md:max-w-3xl bg-background border-l border-border p-6 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div className="border-b border-border/40 pb-4 pr-8 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-sans text-foreground">Create New Challenge</h3>
                <p className="text-xs text-muted font-sans mt-0.5">Mobile-aligned 4-Step Challenge Creator & Rules Engine</p>
              </div>
              <Badge variant="pro" className="font-mono text-[10px]">Step {wizardStep} of 4</Badge>
            </div>

            {/* Step Progress Indicator Bar (Details -> Rules -> Stake -> Review) */}
            <div className="grid grid-cols-4 gap-2 border-b border-border/50 pb-4">
              {[
                { step: 1, label: '1. Details' },
                { step: 2, label: '2. Rules' },
                { step: 3, label: '3. Stake' },
                { step: 4, label: '4. Review' }
              ].map(s => (
                <button
                  key={s.step}
                  onClick={() => {
                    if (s.step > wizardStep) {
                      if (wizardStep === 1 && !validateStep1()) return
                      if (wizardStep === 2 && !validateStep2()) return
                      if (wizardStep === 3 && !validateStep3()) return
                    }
                    setStepError(null)
                    setWizardStep(s.step as any)
                  }}
                  className={`py-2 text-[11px] font-mono rounded-lg border text-center transition-all ${
                    wizardStep === s.step
                      ? 'bg-primary/20 border-primary text-primary font-bold shadow-sm'
                      : wizardStep > s.step
                        ? 'bg-surface/50 border-emerald-500/40 text-emerald-400 font-medium'
                        : 'bg-surface/20 border-border/40 text-muted opacity-60'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Validation Error Alert Banner */}
            {stepError && (
              <div className="p-3 bg-red-500/10 border border-red-500/40 rounded-xl text-xs font-mono text-red-400 flex items-center justify-between">
                <span>⚠️ {stepError}</span>
                <button onClick={() => setStepError(null)} className="text-muted hover:text-foreground text-xs font-mono font-bold">×</button>
              </div>
            )}

            {/* STEP 1: DETAILS */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs font-mono text-foreground space-y-1">
                  <span className="text-[10px] text-primary uppercase font-bold block">Generated Title Preview</span>
                  <p className="font-bold text-xs text-primary">{computedTitlePreview}</p>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Custom Title (Optional Override)</label>
                  <Input
                    value={newTitle}
                    onChange={e => { setStepError(null); setNewTitle(e.target.value) }}
                    placeholder="Leave empty to use generated title preview..."
                    className="bg-surface/40 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Select Challenge Category</label>
                  <select
                    value={newCategory}
                    onChange={e => {
                      const cat = e.target.value as ChallengeCategoryType
                      setNewCategory(cat)
                      loadCategoryPresetRules(cat)
                    }}
                    className="w-full bg-surface/40 border border-border rounded-md p-2 text-xs font-mono text-foreground outline-none cursor-pointer"
                  >
                    <option value="Prediction">Prediction (Crypto / Market Predictions)</option>
                    <option value="Sports">Sports (Live Football / Cricket / League)</option>
                    <option value="Physical">Physical (Fitness / Activity Streaks)</option>
                    <option value="Performance">Performance (Esports / Gaming)</option>
                    <option value="Custom">Custom P2P Wager</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted block mb-1">Format / Wager Type</label>
                    <select
                      value={newType}
                      onChange={e => setNewType(e.target.value)}
                      className="w-full bg-surface/40 border border-border rounded-md p-2 text-xs font-mono text-foreground outline-none"
                    >
                      <option value="Binary Option">Binary Option (Yes / No)</option>
                      <option value="Day-wise Streak">Day-wise Streak (24h Goal)</option>
                      <option value="Weekly Tournament">Weekly Tournament</option>
                      <option value="Solo Time Trial">Solo Time Trial</option>
                      <option value="Peer Wager">Peer Wager (Head-to-Head)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted block mb-1">Duration Frequency</label>
                    <select
                      value={newFrequency}
                      onChange={e => handleFrequencyChange(e.target.value as any)}
                      className="w-full bg-surface/40 border border-border rounded-md p-2 text-xs font-mono text-foreground outline-none"
                    >
                      <option value="Single Event">Single Event (Standard 24h)</option>
                      <option value="Day-wise">Day-wise (Daily 24h)</option>
                      <option value="Weekly">Weekly (7-Day Pool)</option>
                      <option value="Monthly">Monthly (30-Day)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted block mb-1">Challenger Name (Optional for Public / Sports Pool)</label>
                    <Input
                      value={newCreatorName}
                      onChange={e => { setStepError(null); setNewCreatorName(e.target.value) }}
                      placeholder="e.g. Public Pool or Username"
                      className="bg-surface/40 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted block mb-1">Opponent (User B - Optional)</label>
                    <Input
                      value={newOpponentName}
                      onChange={e => setNewOpponentName(e.target.value)}
                      placeholder="Open Pool or Username"
                      className="bg-surface/40 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Description</label>
                  <textarea
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    placeholder="Brief description of objectives..."
                    rows={2}
                    className="w-full bg-surface/40 border border-border rounded-md p-2 text-xs font-sans text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="button" onClick={validateStep1} variant="primary" glow className="gap-2 text-xs font-mono">
                    Next: Step 2 Rules <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: RULES CONFIGURATION (The requested screen) */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-xs font-mono font-bold text-foreground">Step 2: Challenge Rules Configuration</span>
                  <Badge variant="outline" className="text-[10px] border-secondary/40 text-secondary">AI Oracle Sync</Badge>
                </div>

                {/* Preset Category Loaders */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-muted block">Load Smart Rule Presets</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => { setStepError(null); loadCategoryPresetRules('Prediction') }}
                      className="h-7 text-[10px] font-mono border-primary/30 text-primary hover:bg-primary/10"
                    >
                      🪙 Crypto Rules
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => { setStepError(null); loadCategoryPresetRules('Sports') }}
                      className="h-7 text-[10px] font-mono border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                    >
                      ⚽ Sports Rules
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => { setStepError(null); loadCategoryPresetRules('Physical') }}
                      className="h-7 text-[10px] font-mono border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    >
                      🏃 Fitness Rules
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => { setStepError(null); loadCategoryPresetRules('Custom') }}
                      className="h-7 text-[10px] font-mono border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                    >
                      ✨ Standard Rules
                    </Button>
                  </div>
                </div>

                {/* Rules Textarea */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono uppercase text-muted">Challenge Rules (One rule per line) *</label>
                    <span className="text-[10px] font-mono text-muted">{newRules.split('\n').filter(r => r.trim() !== '').length} Active Rules</span>
                  </div>
                  <textarea
                    value={newRules}
                    onChange={e => { setStepError(null); setNewRules(e.target.value) }}
                    rows={6}
                    placeholder="Enter rule line-by-line..."
                    className="w-full bg-surface/40 border border-border rounded-xl p-3 text-xs font-mono text-foreground outline-none focus:border-primary"
                  />
                </div>

                {/* Preview Parsed Rules List */}
                <div className="p-3 bg-surface/30 border border-border/40 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-muted uppercase font-bold block">Live Parsed Rules Preview</span>
                  <div className="space-y-1.5">
                    {newRules.split('\n').filter(r => r.trim() !== '').map((rule, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs font-sans text-foreground/90">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Button type="button" onClick={() => { setStepError(null); setWizardStep(1) }} variant="outline" className="gap-2 text-xs font-mono">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back: Details
                  </Button>
                  <Button type="button" onClick={validateStep2} variant="primary" glow className="gap-2 text-xs font-mono">
                    Next: Step 3 Stake <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: STAKE & FINANCIALS */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div className="border-b border-border/40 pb-2">
                  <span className="text-xs font-mono font-bold text-foreground">Step 3: Stake & Financials Parameters</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted block mb-1">Per Player Stake (Coins) *</label>
                    <Input
                      type="number"
                      value={newStake}
                      onChange={e => { setStepError(null); setNewStake(e.target.value) }}
                      className="bg-surface/40 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted block mb-1">Max Participants *</label>
                    <Input
                      type="number"
                      value={newMaxParticipants}
                      onChange={e => { setStepError(null); setNewMaxParticipants(e.target.value) }}
                      className="bg-surface/40 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Live Financial Breakdown Card */}
                {(() => {
                  const feePercent = walletContext ? walletContext.platformFeePercent : 5;
                  const totalPool = Number(newStake) * Number(newMaxParticipants);
                  const feeAmt = (totalPool * feePercent) / 100;
                  const netPayout = totalPool - feeAmt;
                  return (
                    <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl space-y-3 font-mono">
                      <span className="text-[10px] text-primary uppercase font-bold block">Financial Calculations</span>
                      <div className="flex items-center justify-between text-xs py-1 border-b border-border/30">
                        <span className="text-muted">Total Prize Pool</span>
                        <span className="font-bold text-emerald-400">{totalPool.toLocaleString()} Coins</span>
                      </div>
                      <div className="flex items-center justify-between text-xs py-1 border-b border-border/30">
                        <span className="text-muted">Platform Treasury Fee ({feePercent}%)</span>
                        <span className="text-muted">{feeAmt.toLocaleString()} Coins</span>
                      </div>
                      <div className="flex items-center justify-between text-xs py-1">
                        <span className="text-muted">Net Winner Payout</span>
                        <span className="font-bold text-primary">{netPayout.toLocaleString()} Coins</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="pt-2 flex items-center justify-between">
                  <Button type="button" onClick={() => { setStepError(null); setWizardStep(2) }} variant="outline" className="gap-2 text-xs font-mono">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back: Rules
                  </Button>
                  <Button type="button" onClick={validateStep3} variant="primary" glow className="gap-2 text-xs font-mono">
                    Next: Step 4 Review <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & LAUNCH */}
            {wizardStep === 4 && (
              <div className="space-y-4">
                <div className="border-b border-border/40 pb-2">
                  <span className="text-xs font-mono font-bold text-foreground">Step 4: Final Review & Launch</span>
                </div>

                <div className="p-4 bg-surface/30 border border-border/50 rounded-xl space-y-3 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Title:</span>
                    <span className="font-bold text-foreground">{computedTitlePreview}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Category / Type:</span>
                    <Badge variant="outline">{newCategory} • {newType}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Prize Pool:</span>
                    <span className="font-bold text-emerald-400 font-mono">{(Number(newStake) * Number(newMaxParticipants)).toLocaleString()} Coins</span>
                  </div>
                  <div className="border-t border-border/30 pt-2 space-y-1">
                    <span className="text-[10px] text-muted uppercase font-bold block">Configured Rules ({newRules.split('\n').filter(r => r.trim() !== '').length}):</span>
                    {newRules.split('\n').filter(r => r.trim() !== '').map((r, i) => (
                      <p key={i} className="text-[11px] text-foreground/80 font-sans">✓ {r}</p>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleCreateSubmit} className="pt-2 flex items-center justify-between gap-3">
                  <Button type="button" onClick={() => setWizardStep(3)} variant="outline" className="gap-2 text-xs font-mono">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back: Stake
                  </Button>
                  <Button type="submit" variant="primary" glow className="gap-2 text-xs font-mono bg-emerald-600 hover:bg-emerald-500 text-white">
                    <Sparkles className="h-3.5 w-3.5" /> Launch & Sync to Oracle
                  </Button>
                </form>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

    </div>
  )
}
