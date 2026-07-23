import React, { useState } from 'react'
import { 
  X, 
  CheckCircle, 
  Coins, 
  Users, 
  FileText, 
  TrendingUp, 
  Cpu, 
  Award, 
  Check,
  Swords,
  Plus,
  Edit2
} from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Sheet, SheetContent } from '../../components/ui/sheet'
import { useChallenges } from '../../context/ChallengesContext'
import type { ChallengeItem, ChallengeStatus } from '../../context/ChallengesContext'

interface ChallengeDetailsSheetProps {
  challenge: ChallengeItem | null
  onClose: () => void
}

export const ChallengeDetailsSheet: React.FC<ChallengeDetailsSheetProps> = ({ challenge, onClose }) => {
  const { 
    settleChallenge, 
    approveChallenge, 
    updateTournamentMatch,
    addTournamentMatch,
    showToastNotice 
  } = useChallenges()

  const [activeSubTab, setActiveSubTab] = useState<'info' | 'matches' | 'participants' | 'financials' | 'settlement' | 'timeline'>('info')
  const [winnerInput, setWinnerInput] = useState('')
  const [isSettling, setIsSettling] = useState(false)

  // Sub-Match Add Form State
  const [isAddingMatch, setIsAddingMatch] = useState(false)
  const [newRoundName, setNewRoundName] = useState('Round 1')
  const [newTeam1, setNewTeam1] = useState('')
  const [newTeam2, setNewTeam2] = useState('')
  const [newMatchScore, setNewMatchScore] = useState('0 - 0')

  // Sub-Match Quick Edit State
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null)
  const [editScoreInput, setEditScoreInput] = useState('')
  const [editWinnerInput, setEditWinnerInput] = useState('')

  const getStatusBadge = (status: ChallengeStatus) => {
    switch (status) {
      case 'Live':
        return <Badge variant="success">● LIVE</Badge>
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

  const handleSettle = (e: React.FormEvent) => {
    e.preventDefault()
    if (!challenge) return
    if (!winnerInput.trim()) {
      showToastNotice('Please specify the winner username or ID', 'warning')
      return
    }
    settleChallenge(challenge.id, winnerInput, winnerInput, 'Operator manual settlement')
    setIsSettling(false)
  }

  return (
    <Sheet open={!!challenge} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent 
        side="right" 
        hideClose={true}
        className="w-full sm:max-w-2xl lg:max-w-3xl bg-background border-l border-border p-0 overflow-hidden flex flex-col h-full shadow-2xl"
      >
        {challenge && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Sheet Header */}
            <div className="p-6 border-b border-border/60 bg-surface/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs text-primary font-bold tracking-wider">{challenge.id}</span>
                  {getStatusBadge(challenge.status)}
                  <Badge variant="outline" className="border-primary/30 text-primary">{challenge.category}</Badge>
                  <Badge variant="outline" className="border-border text-muted">{challenge.type}</Badge>
                </div>
                <h2 className="text-xl font-bold font-sans text-foreground">{challenge.title}</h2>
              </div>

              <div className="flex items-center gap-2">
                {challenge.status === 'Pending Review' && (
                  <Button 
                    size="sm" 
                    variant="primary"
                    glow
                    onClick={() => approveChallenge(challenge.id)}
                    className="gap-1.5 text-xs font-mono"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Approve
                  </Button>
                )}
                {challenge.status === 'Live' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setIsSettling(!isSettling)}
                    className="gap-1.5 text-xs font-mono border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                  >
                    <Award className="h-3.5 w-3.5" /> Settle
                  </Button>
                )}
                <button 
                  onClick={onClose}
                  className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface/60 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Quick Settle Banner */}
            {isSettling && (
              <div className="p-4 bg-purple-500/10 border-b border-purple-500/20 shrink-0">
                <form onSubmit={handleSettle} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-purple-300 font-bold shrink-0">Manual Settlement:</span>
                  <input
                    type="text"
                    value={winnerInput}
                    onChange={e => setWinnerInput(e.target.value)}
                    placeholder="Enter winner username or ID..."
                    className="flex-1 bg-surface/60 border border-purple-500/30 rounded-md px-3 py-1.5 text-xs font-mono text-foreground outline-none focus:border-purple-500"
                  />
                  <Button type="submit" size="sm" variant="primary" glow className="text-xs font-mono h-8">
                    Confirm Winner
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setIsSettling(false)} className="text-xs font-mono h-8 text-muted">
                    Cancel
                  </Button>
                </form>
              </div>
            )}

            {/* Navigation Sub-Tabs */}
            <div className="border-b border-border/40 bg-surface/20 shrink-0">
              <div className="flex items-center gap-1 px-6 overflow-x-auto">
                {[
                  { id: 'info', label: 'Overview & Rules', icon: FileText },
                  { id: 'matches', label: `Fixtures & Matches (${(challenge.matches || []).length})`, icon: Swords },
                  { id: 'participants', label: `Participants (${challenge.participantsCount})`, icon: Users },
                  { id: 'financials', label: 'Financials & Odds', icon: Coins },
                  { id: 'settlement', label: 'Settlement & Oracle', icon: Cpu }
                ].map(tab => {
                  const Icon = tab.icon
                  const isActive = activeSubTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSubTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono tracking-wider transition-all border-b-2 font-medium cursor-pointer whitespace-nowrap shrink-0 ${
                        isActive 
                          ? 'border-primary text-primary font-bold bg-primary/5' 
                          : 'border-transparent text-muted hover:text-foreground hover:bg-surface/40'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sheet Body Content */}
            <div className="p-6 overflow-y-auto flex-grow space-y-6">

              {/* TAB 1: OVERVIEW & RULES */}
              {activeSubTab === 'info' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-mono uppercase text-muted tracking-wider mb-2">Description</h3>
                    <p className="text-sm text-foreground/90 leading-relaxed bg-surface/30 p-4 rounded-xl border border-border/50">
                      {challenge.description || 'No detailed description provided.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-surface/40 border border-border/40 rounded-xl">
                      <span className="text-[10px] font-mono text-muted uppercase block">Stake Amount</span>
                      <p className="text-base font-bold font-mono text-primary mt-1">{challenge.stakeAmount || 100} Coins</p>
                    </div>
                    <div className="p-3 bg-surface/40 border border-border/40 rounded-xl">
                      <span className="text-[10px] font-mono text-muted uppercase block">Total Prize Pool</span>
                      <p className="text-base font-bold font-mono text-emerald-400 mt-1">{(challenge.prizePool || 100).toLocaleString()} Coins</p>
                    </div>
                    <div className="p-3 bg-surface/40 border border-border/40 rounded-xl">
                      <span className="text-[10px] font-mono text-muted uppercase block">Start Date</span>
                      <p className="text-xs font-mono text-foreground mt-1">{challenge.startDate}</p>
                    </div>
                    <div className="p-3 bg-surface/40 border border-border/40 rounded-xl">
                      <span className="text-[10px] font-mono text-muted uppercase block">End Date</span>
                      <p className="text-xs font-mono text-foreground mt-1">{challenge.endDate}</p>
                    </div>
                  </div>

                  {/* ODDS PREVIEW CARD */}
                  <div className="p-4 bg-surface/30 border border-border/50 rounded-2xl space-y-2 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground uppercase">Live Weight-Based Odds Preview</span>
                      <Badge variant="pro" className="text-[9px]">P2P ESCROW</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-2.5 bg-surface/40 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                        <span className="text-emerald-400 font-bold">YES Side Odds</span>
                        <span className="font-bold text-foreground">1.95x Multiplier</span>
                      </div>
                      <div className="p-2.5 bg-surface/40 border border-rose-500/30 rounded-xl flex items-center justify-between">
                        <span className="text-rose-400 font-bold">NO Side Odds</span>
                        <span className="font-bold text-foreground">2.05x Multiplier</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-mono uppercase text-muted tracking-wider mb-2">Challenge Rules</h3>
                    <ul className="space-y-2">
                      {challenge.rules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-foreground/80 bg-surface/20 p-2.5 rounded-lg border border-border/30">
                          <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 1.5: FIXTURES & SUB-MATCHES (Team 1 vs Team 2) */}
              {activeSubTab === 'matches' && (
                <div className="space-y-4 font-mono">
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Swords className="h-4 w-4 text-primary" /> Tournament Sub-Matches & Fixtures
                      </h3>
                      <p className="text-xs text-muted font-sans mt-0.5">Manage Team 1 vs Team 2 fixtures, live scores, and winning teams.</p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsAddingMatch(!isAddingMatch)}
                      className="text-xs font-mono gap-1.5 h-8 border-primary/40 text-primary hover:bg-primary/10 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> {isAddingMatch ? 'Close Form' : 'Add Fixture'}
                    </Button>
                  </div>

                  {/* ADD SUB-MATCH FORM */}
                  {isAddingMatch && (
                    <div className="p-4 bg-surface/40 border border-primary/30 rounded-2xl space-y-3">
                      <h4 className="text-xs font-bold text-primary uppercase">New Sub-Match Fixture</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-muted block mb-1">Round Name</label>
                          <input
                            type="text"
                            value={newRoundName}
                            onChange={e => setNewRoundName(e.target.value)}
                            placeholder="e.g. Round 1, Semi-Final"
                            className="w-full bg-surface/60 border border-border rounded-xl p-2 text-xs text-foreground outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted block mb-1">Initial Score</label>
                          <input
                            type="text"
                            value={newMatchScore}
                            onChange={e => setNewMatchScore(e.target.value)}
                            placeholder="e.g. 0 - 0"
                            className="w-full bg-surface/60 border border-border rounded-xl p-2 text-xs text-foreground outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-emerald-400 font-bold block mb-1">Team 1 Name</label>
                          <input
                            type="text"
                            value={newTeam1}
                            onChange={e => setNewTeam1(e.target.value)}
                            placeholder="e.g. Real Madrid / Team Alpha"
                            className="w-full bg-surface/60 border border-emerald-500/40 rounded-xl p-2 text-xs text-foreground outline-none focus:border-emerald-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-rose-400 font-bold block mb-1">Team 2 Name</label>
                          <input
                            type="text"
                            value={newTeam2}
                            onChange={e => setNewTeam2(e.target.value)}
                            placeholder="e.g. Barcelona / Team Bravo"
                            className="w-full bg-surface/60 border border-rose-500/40 rounded-xl p-2 text-xs text-foreground outline-none focus:border-rose-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsAddingMatch(false)}
                          className="text-xs font-mono h-8"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          glow
                          onClick={() => {
                            if (!newTeam1.trim() || !newTeam2.trim()) {
                              showToastNotice('Please specify Team 1 and Team 2 names', 'warning')
                              return
                            }
                            addTournamentMatch(challenge.id, {
                              roundName: newRoundName || 'Round 1',
                              matchNumber: (challenge.matches || []).length + 1,
                              team1Name: newTeam1,
                              team2Name: newTeam2,
                              status: 'Scheduled',
                              score: newMatchScore || '0 - 0'
                            })
                            setNewTeam1('')
                            setNewTeam2('')
                            setIsAddingMatch(false)
                          }}
                          className="text-xs font-mono h-8"
                        >
                          Save Fixture
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* MATCHES LIST / CARDS */}
                  {(!challenge.matches || challenge.matches.length === 0) ? (
                    <div className="p-8 text-center bg-surface/20 rounded-xl border border-border/40 space-y-2">
                      <Swords className="h-8 w-8 text-muted mx-auto opacity-50" />
                      <p className="text-xs text-muted">No sub-matches / fixtures created for this tournament yet.</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsAddingMatch(true)}
                        className="text-xs font-mono mt-2"
                      >
                        + Add First Sub-Match Fixture
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {challenge.matches.map((m, idx) => (
                        <div key={m.id || idx} className="p-4 bg-surface/30 border border-border/60 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between border-b border-border/30 pb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="pro" className="text-[9px] font-mono">{m.roundName || `Match #${idx + 1}`}</Badge>
                              <span className="text-xs text-muted">Match #{m.matchNumber || idx + 1}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {m.status === 'Completed' ? (
                                <Badge variant="success">COMPLETED</Badge>
                              ) : m.status === 'Live' ? (
                                <Badge variant="warning">● LIVE</Badge>
                              ) : (
                                <Badge variant="outline">SCHEDULED</Badge>
                              )}
                              <button
                                onClick={() => {
                                  setEditingMatchId(editingMatchId === m.id ? null : m.id)
                                  setEditScoreInput(m.score || '0 - 0')
                                  setEditWinnerInput(m.winningTeam || '')
                                }}
                                className="p-1 text-primary hover:bg-surface/60 rounded cursor-pointer"
                                title="Edit Match Score / Declare Winner"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* TEAM 1 vs TEAM 2 CARD DISPLAY */}
                          <div className="grid grid-cols-3 items-center text-center p-3 bg-surface/50 rounded-xl border border-border/40">
                            <div className="text-left space-y-1">
                              <span className="text-[10px] text-muted uppercase block">Team 1</span>
                              <h4 className={`text-sm font-bold ${m.winningTeam === m.team1Name ? 'text-emerald-400' : 'text-foreground'}`}>
                                {m.team1Name} {m.winningTeam === m.team1Name && '👑'}
                              </h4>
                            </div>

                            <div>
                              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                                {m.score || 'VS'}
                              </span>
                            </div>

                            <div className="text-right space-y-1">
                              <span className="text-[10px] text-muted uppercase block">Team 2</span>
                              <h4 className={`text-sm font-bold ${m.winningTeam === m.team2Name ? 'text-emerald-400' : 'text-foreground'}`}>
                                {m.team2Name} {m.winningTeam === m.team2Name && '👑'}
                              </h4>
                            </div>
                          </div>

                          {/* WINNING TEAM BADGE IF DECLARED */}
                          {m.winningTeam && (
                            <div className="text-xs text-center text-emerald-400 font-bold bg-emerald-500/10 py-1.5 rounded-lg border border-emerald-500/30">
                              🏆 Winner Declared: {m.winningTeam}
                            </div>
                          )}

                          {/* INLINE EDIT SCORE / WINNER PANEL */}
                          {editingMatchId === m.id && (
                            <div className="p-3 bg-surface/60 border border-primary/40 rounded-xl space-y-3 text-xs pt-3">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-muted block mb-1">Score</label>
                                  <input
                                    type="text"
                                    value={editScoreInput}
                                    onChange={e => setEditScoreInput(e.target.value)}
                                    className="w-full bg-surface border border-border rounded-lg p-1.5 text-xs text-foreground"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] text-muted block mb-1">Winning Team</label>
                                  <select
                                    value={editWinnerInput}
                                    onChange={e => setEditWinnerInput(e.target.value)}
                                    className="w-full bg-surface border border-border rounded-lg p-1.5 text-xs text-foreground cursor-pointer"
                                  >
                                    <option value="">-- Select Winner --</option>
                                    <option value={m.team1Name}>{m.team1Name} (Team 1)</option>
                                    <option value={m.team2Name}>{m.team2Name} (Team 2)</option>
                                  </select>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 pt-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingMatchId(null)}
                                  className="text-xs font-mono h-7"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  variant="primary"
                                  glow
                                  onClick={() => {
                                    updateTournamentMatch(challenge.id, m.id, {
                                      score: editScoreInput,
                                      winningTeam: editWinnerInput,
                                      status: editWinnerInput ? 'Completed' : 'Live'
                                    })
                                    setEditingMatchId(null)
                                  }}
                                  className="text-xs font-mono h-7"
                                >
                                  Update Match
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PARTICIPANTS */}
              {activeSubTab === 'participants' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted">Total Joined: {challenge.participantsCount} Users</span>
                    <span className="text-xs font-mono text-muted">Max Capacity: {challenge.maxParticipants || 'Unlimited'}</span>
                  </div>

                  {challenge.participants.length === 0 ? (
                    <div className="p-8 text-center bg-surface/20 rounded-xl border border-border/40">
                      <Users className="h-8 w-8 text-muted mx-auto mb-2 opacity-50" />
                      <p className="text-xs text-muted font-mono">No detailed participant rows available for this event.</p>
                    </div>
                  ) : (
                    <div className="border border-border/60 rounded-xl overflow-hidden">
                      <Table>
                        <TableHeader className="bg-surface/50">
                          <TableRow>
                            <TableHead className="text-xs font-mono">User</TableHead>
                            <TableHead className="text-xs font-mono">Joined Date</TableHead>
                            <TableHead className="text-xs font-mono">Stake</TableHead>
                            <TableHead className="text-xs font-mono">Progress</TableHead>
                            <TableHead className="text-xs font-mono">Result</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {challenge.participants.map(p => (
                            <TableRow key={p.id}>
                              <TableCell className="font-mono text-xs font-bold text-foreground">{p.username}</TableCell>
                              <TableCell className="font-mono text-xs text-muted">{p.joinedAt}</TableCell>
                              <TableCell className="font-mono text-xs text-primary">{p.stakeAmount} Coins</TableCell>
                              <TableCell>
                                <div className="w-24 bg-surface rounded-full h-2 overflow-hidden border border-border/50">
                                  <div className="bg-primary h-full rounded-full" style={{ width: `${p.progressPercent}%` }} />
                                </div>
                              </TableCell>
                              <TableCell>
                                {p.result === 'Winner' ? (
                                  <Badge variant="success">WINNER</Badge>
                                ) : (
                                  <Badge variant="outline">{p.result || 'Active'}</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: FINANCIALS & ODDS */}
              {activeSubTab === 'financials' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-surface/40 border border-border/50 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-muted">Total Coins Collected</span>
                        <Coins className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-xl font-bold font-mono text-foreground mt-2">{(challenge.financials?.totalCollected || challenge.prizePool || 100).toLocaleString()} Coins</p>
                    </div>

                    <div className="p-4 bg-surface/40 border border-border/50 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-muted">Platform Fee (5%)</span>
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                      </div>
                      <p className="text-xl font-bold font-mono text-emerald-400 mt-2">{(challenge.financials?.platformFee || Math.floor((challenge.prizePool || 100) * 0.05) || 5).toLocaleString()} Coins</p>
                    </div>

                    <div className="p-4 bg-surface/40 border border-border/50 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-muted">Net Winner Payout</span>
                        <Award className="h-4 w-4 text-purple-400" />
                      </div>
                      <p className="text-xl font-bold font-mono text-purple-400 mt-2">{((challenge.financials as any)?.netPayout || Math.floor((challenge.prizePool || 100) * 0.95) || 95).toLocaleString()} Coins</p>
                    </div>
                  </div>

                  {/* WEIGHT-BASED ODDS MULTIPLIER & PROJECTED PAYOUTS CARD */}
                  <div className="p-4 bg-primary/10 border border-primary/30 rounded-2xl space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary uppercase flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" /> Live Weight-Based Odds Multipliers & Payouts
                      </span>
                      <Badge variant="pro" className="text-[9px]">P2P ESCROW RATIO</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-3 bg-surface/40 border border-emerald-500/30 rounded-xl space-y-1">
                        <span className="text-[10px] text-muted block uppercase">YES Side Odds</span>
                        <span className="text-lg font-bold text-emerald-400 block">1.95x Multiplier</span>
                        <span className="text-[10px] text-muted">Proj. Payout: +95 Coins / 100 Stake</span>
                      </div>

                      <div className="p-3 bg-surface/40 border border-rose-500/30 rounded-xl space-y-1">
                        <span className="text-[10px] text-muted block uppercase">NO Side Odds</span>
                        <span className="text-lg font-bold text-rose-400 block">2.05x Multiplier</span>
                        <span className="text-[10px] text-muted">Proj. Payout: +105 Coins / 100 Stake</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-surface/20 border border-border/40 rounded-xl space-y-3 font-mono">
                    <h4 className="text-xs uppercase text-muted tracking-wider font-bold">Escrow Lock & Release Protocol</h4>
                    <div className="flex items-center justify-between text-xs py-1 border-b border-border/30">
                      <span className="text-muted">Currently Locked Escrow Balance</span>
                      <span className="text-foreground font-bold">{(challenge.financials?.lockedCoins || challenge.prizePool || 100).toLocaleString()} Coins</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1">
                      <span className="text-muted">Refund Reserve Allocated</span>
                      <span className="text-foreground font-bold">{(challenge.financials?.refundAmount || 0).toLocaleString()} Coins</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SETTLEMENT & ORACLE */}
              {activeSubTab === 'settlement' && (
                <div className="space-y-6">
                  <div className="p-4 bg-surface/30 border border-border/40 rounded-xl space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase text-muted font-bold">Oracle Engine Status</span>
                      <Badge variant="pro">GEMINI 2.0 AI ORACLE</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1 border-b border-border/30">
                      <span className="text-muted">Resolution Provider</span>
                      <span className="text-cyan-400 font-bold">{(challenge as any).oracleProvider || (challenge as any).oracleSource || 'Binance Spot API & Sports Feed'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1">
                      <span className="text-muted">AI Confidence Interval</span>
                      <span className="text-emerald-400 font-bold">98.6% Confidence</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
