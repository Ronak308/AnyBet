import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  AlertTriangle, 
  FileText, 
  Image as ImageIcon, 
  Video,
  Navigation,
  Activity,
  Cpu, 
  RotateCcw, 
  XCircle, 
  Award, 
  Eye,
  ExternalLink,
  MessageSquarePlus,
  RefreshCw,
  X,
  ArrowLeft
} from 'lucide-react'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { useChallenges } from '../../context/ChallengesContext'
import type { DisputeItem } from '../../context/ChallengesContext'

export const DisputesModule: React.FC = () => {
  const { disputes, resolveDispute, showToastNotice } = useChallenges()

  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [winnerClaimant, setWinnerClaimant] = useState('')

  const getStatusBadge = (status: DisputeItem['status']) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="warning">PENDING</Badge>
      case 'Reviewing':
        return <Badge variant="pro">UNDER REVIEW</Badge>
      case 'Resolved':
        return <Badge variant="success">RESOLVED</Badge>
      case 'Closed':
        return <Badge variant="outline" className="text-muted border-muted">CLOSED</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'image':
      case 'photo':
        return <ImageIcon className="h-4 w-4 text-purple-400" />
      case 'video':
        return <Video className="h-4 w-4 text-red-400" />
      case 'gps':
      case 'strava':
        return <Navigation className="h-4 w-4 text-orange-400" />
      case 'fitness':
        return <Activity className="h-4 w-4 text-emerald-400" />
      default:
        return <FileText className="h-4 w-4 text-primary" />
    }
  }

  const handleResolveAction = (action: 'approve_claim' | 'reject_claim' | 'refund' | 'reopen') => {
    if (!selectedDispute) return
    resolveDispute(selectedDispute.id, action, winnerClaimant.trim() || undefined, resolutionNotes.trim() || undefined)
    setSelectedDispute(null)
    setResolutionNotes('')
    setWinnerClaimant('')
  }

  const handleRequestEvidence = () => {
    if (!selectedDispute) return
    showToastNotice(`Requested additional evidence from participants for ${selectedDispute.id}`, 'info')
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Active Disputes List */}
      <Card className="border border-border/60 overflow-hidden">
        <Table>
          <TableHeader className="bg-surface/60">
            <TableRow>
              <TableHead className="text-xs font-mono">Dispute ID</TableHead>
              <TableHead className="text-xs font-mono">Challenge Title</TableHead>
              <TableHead className="text-xs font-mono">Users Involved</TableHead>
              <TableHead className="text-xs font-mono">Evidence Logs</TableHead>
              <TableHead className="text-xs font-mono">AI Oracle Rating</TableHead>
              <TableHead className="text-xs font-mono">Status</TableHead>
              <TableHead className="text-xs font-mono text-right">Arbitration Desk</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disputes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-xs font-mono text-muted">
                  No active disputes pending operator arbitration.
                </TableCell>
              </TableRow>
            ) : (
              disputes.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs font-bold text-red-400">{d.id}</TableCell>
                  <TableCell className="font-medium text-xs text-foreground max-w-xs truncate">{d.challengeTitle}</TableCell>
                  <TableCell className="font-mono text-xs text-muted">{d.usersInvolved.join(', ')}</TableCell>
                  <TableCell className="font-mono text-xs text-primary">{d.submittedEvidence.length} Items (Photos/GPS/Video)</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                      <Cpu className="h-3.5 w-3.5" />
                      <span>{d.aiReviewResult.confidenceScore}% Confidence</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(d.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="primary"
                      glow
                      onClick={() => {
                        setSelectedDispute(d)
                        setWinnerClaimant(d.aiReviewResult.suggestedWinner || '')
                      }}
                      className="text-xs font-mono gap-1.5 h-8"
                    >
                      <Eye className="h-3.5 w-3.5" /> Review & Arbitrate
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* DISPUTE ARBITRATION MODAL OVERLAY */}
      {selectedDispute && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
          onClick={() => setSelectedDispute(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-background border border-border rounded-2xl w-full max-w-3xl p-6 space-y-6 shadow-2xl my-auto max-h-[90vh] flex flex-col relative"
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h3 className="text-base font-bold font-sans text-foreground">Dispute Arbitration — {selectedDispute.id}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">{selectedDispute.challengeId}</Badge>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setSelectedDispute(null)}
                  className="h-8 w-8 text-muted hover:text-foreground hover:bg-surface/60 rounded-lg cursor-pointer"
                  title="Close / Back to List"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-y-auto space-y-6 flex-grow pr-1">

              {/* Conflict Summary */}
              <div className="p-4 bg-surface/40 border border-border/50 rounded-xl space-y-2">
                <span className="text-[10px] font-mono uppercase text-muted">Contested Challenge</span>
                <h4 className="font-bold text-sm text-foreground">{selectedDispute.challengeTitle}</h4>
                <p className="text-xs text-foreground/80 leading-relaxed pt-1">{selectedDispute.disputeReason}</p>
                <div className="flex items-center justify-between text-[11px] font-mono text-muted pt-2 border-t border-border/30">
                  <span>Parties: <strong className="text-primary">{selectedDispute.usersInvolved.join(' vs ')}</strong></span>
                  <Button size="sm" variant="ghost" onClick={handleRequestEvidence} className="text-[10px] font-mono text-primary gap-1 h-6">
                    <MessageSquarePlus className="h-3 w-3" /> Request Additional Evidence
                  </Button>
                </div>
              </div>

              {/* AI Review Recommendation Box */}
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs font-mono">
                    <Cpu className="h-4 w-4" /> AI Oracle Review Rating
                  </div>
                  <Badge variant="pro">{selectedDispute.aiReviewResult.confidenceScore}% Confidence</Badge>
                </div>
                <p className="text-xs font-mono text-foreground/90 leading-relaxed">{selectedDispute.aiReviewResult.recommendation}</p>
              </div>

              {/* Supported Submitted Evidence Logs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-mono uppercase text-muted tracking-wider">Submitted Evidence (Photos, Videos, GPS, Strava, Fitness, Docs)</h4>
                </div>
                <div className="space-y-2">
                  {selectedDispute.submittedEvidence.map((ev, idx) => (
                    <div key={ev.id || idx} className="p-3 bg-surface/30 border border-border/40 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-background rounded-lg border border-border">
                          {getEvidenceIcon(ev.type)}
                        </div>
                        <div>
                          <p className="text-xs font-mono text-foreground font-semibold">{ev.data}</p>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-muted">
                            <span>Submitted by {ev.submittedBy}</span>
                            <span>•</span>
                            <span className="uppercase text-primary">{ev.type} proof</span>
                          </div>
                        </div>
                      </div>

                      {ev.url && (
                        <a 
                          href={ev.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs font-mono text-primary hover:underline flex items-center gap-1 shrink-0"
                        >
                          View Media <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Arbitration Panel */}
              <div className="p-4 bg-surface/20 border border-border/40 rounded-xl space-y-4">
                <h4 className="text-xs font-mono uppercase text-muted tracking-wider">Operator Arbitration Panel</h4>
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Declared Winner Username</label>
                  <input
                    type="text"
                    value={winnerClaimant}
                    onChange={e => setWinnerClaimant(e.target.value)}
                    placeholder="e.g. Alex_R"
                    className="w-full bg-background border border-border rounded-lg p-2.5 text-xs font-mono text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Resolution Rationale / Notes</label>
                  <textarea
                    value={resolutionNotes}
                    onChange={e => setResolutionNotes(e.target.value)}
                    placeholder="Rationale for ruling..."
                    rows={2}
                    className="w-full bg-background border border-border rounded-lg p-2 text-xs font-sans text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

            </div>

            {/* Operator Actions */}
            <div className="p-4 border-t border-border/50 bg-surface/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <Button size="sm" variant="outline" onClick={() => setSelectedDispute(null)} className="text-xs font-mono gap-1.5 border-border/60 hover:bg-surface/60">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Disputes List
              </Button>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => handleResolveAction('reopen')} 
                  className="text-xs font-mono text-muted hover:text-foreground gap-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Reopen Settlement
                </Button>

                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleResolveAction('refund')} 
                  className="text-xs font-mono border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Refund Both Participants
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleResolveAction('reject_claim')} 
                  className="text-xs font-mono border-red-500/40 text-red-400 hover:bg-red-500/10 gap-1.5"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject Claim
                </Button>

                <Button 
                  size="sm" 
                  variant="primary" 
                  glow
                  onClick={() => handleResolveAction('approve_claim')} 
                  className="text-xs font-mono gap-1.5"
                >
                  <Award className="h-3.5 w-3.5" /> Approve Winner
                </Button>
              </div>
            </div>

          </motion.div>
        </div>
      )}

    </div>
  )
}
