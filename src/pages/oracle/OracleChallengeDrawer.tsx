import React, { useState } from 'react'
import {
  X,
  CheckCircle,
  Clock,
  Coins,
  FileText,
  Cpu,
  Award,
  Check,
  RotateCcw,
  ShieldCheck,
  Image as ImageIcon,
  Navigation,
  Search
} from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { scanImageWithGeminiVisionOCR } from '../../services/apiServices'
import { Sheet, SheetContent } from '../../components/ui/sheet'
import { useOracle } from '../../context/OracleContext'
import type { SettlementQueueItem } from '../../context/OracleContext'

interface OracleChallengeDrawerProps {
  item: SettlementQueueItem | null
  onClose: () => void
}

export const OracleChallengeDrawer: React.FC<OracleChallengeDrawerProps> = ({ item, onClose }) => {
  const {
    approveSettlement,
    refundSettlement,
    triggerRetryAI
  } = useOracle()

  const [activeTab, setActiveTab] = useState<'overview' | 'ai_decision' | 'evidence' | 'financials' | 'timeline'>('ai_decision')
  const [isOcrScanning, setIsOcrScanning] = useState(false)

  const handleScanVisionOCR = async (url: string, label: string) => {
    if (!item) return
    setIsOcrScanning(true)
    const result = await scanImageWithGeminiVisionOCR(url, label)

    // Append to item's OCR evidence
    item.evidence.ocrData.push({
      id: result.id,
      source: result.source,
      extractedText: result.extractedText,
      accuracyScore: result.accuracyScore
    })

    setIsOcrScanning(false)
  }

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
    <Sheet open={!!item} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent
        side="right"
        hideClose={true}
        className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl bg-background border-l border-border p-0 overflow-hidden flex flex-col h-full shadow-2xl"
      >
        {item && (
          <div className="flex flex-col h-full overflow-hidden">

            {/* Sheet Header */}
            <div className="p-6 border-b border-border/60 bg-surface/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs text-primary font-bold tracking-wider">{item.id}</span>
                  {getStatusBadge(item.status)}
                  <Badge variant="outline" className="border-primary/30 text-primary">{item.category}</Badge>
                  <Badge variant="outline" className="border-border text-muted">{item.type}</Badge>
                </div>
                <h2 className="text-xl font-bold font-sans text-foreground">{item.title}</h2>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={item.status === 'Auto-Settled' || item.status === 'Refunded'}
                  onClick={() => triggerRetryAI(item.id)}
                  className="gap-1.5 text-xs font-mono border-primary/40 text-primary hover:bg-primary/10"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Retry AI
                </Button>

                {item.status !== 'Auto-Settled' && item.status !== 'Refunded' && (
                  <Button
                    size="sm"
                    variant="primary"
                    glow
                    onClick={() => approveSettlement(item.id)}
                    className="gap-1.5 text-xs font-mono bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Approve AI Decision
                  </Button>
                )}

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onClose}
                  className="h-8 w-8 text-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Sub Navigation Tabs */}
            <div className="border-b border-border/50 bg-surface/20 px-4 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                {[
                  { id: 'ai_decision', label: 'AI Decision', icon: Cpu },
                  { id: 'overview', label: 'Overview & Rules', icon: FileText },
                  { id: 'evidence', label: `Evidence (${item.evidence.images.length + item.evidence.gpsData.length + item.evidence.ocrData.length})`, icon: ShieldCheck },
                  { id: 'financials', label: 'Financials', icon: Coins },
                  { id: 'timeline', label: 'Audit Timeline', icon: Clock }
                ].map(tab => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono tracking-wider transition-all border-b-2 font-medium cursor-pointer whitespace-nowrap shrink-0 ${isActive
                          ? 'border-primary text-primary font-bold bg-primary/10 rounded-t-lg'
                          : 'border-transparent text-muted hover:text-foreground hover:bg-surface/40 rounded-t-lg'
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

              {/* TAB 1: AI DECISION & EXPLANATION */}
              {activeTab === 'ai_decision' && (
                <div className="space-y-6">
                  {/* Predicted Winner Banner */}
                  <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/20 rounded-xl text-primary border border-primary/30">
                        <Award className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">AI Declared / Predicted Winner</span>
                        <p className="text-lg font-bold font-mono text-emerald-400">{item.aiAnalysis.predictedWinnerName}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-mono text-muted uppercase">Confidence Score</span>
                      <span className="text-2xl font-black font-mono text-primary">{item.aiConfidence}%</span>
                    </div>
                  </div>

                  {/* AI Detailed Rationale */}
                  <div className="p-4 bg-surface/30 border border-border/50 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-border/30 pb-2">
                      <span className="text-xs font-mono uppercase text-muted tracking-wider font-bold">AI Rationale & Decision Logic</span>
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">Verified by Gemini 1.5 Pro</Badge>
                    </div>
                    <p className="text-xs text-foreground/90 font-sans leading-relaxed">
                      {item.aiAnalysis.explanation}
                    </p>
                  </div>

                  {/* Supporting Rationale Points */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono uppercase text-muted tracking-wider">Key Supporting Points</h4>
                    <div className="space-y-2">
                      {item.aiAnalysis.supportingRationale.map((pt, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 p-3 bg-surface/20 border border-border/30 rounded-lg text-xs font-mono text-foreground/90">
                          <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar inside Drawer */}
                  <div className="p-4 bg-surface/40 border border-border/60 rounded-xl flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-mono text-muted">Operator Manual Decision:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        glow
                        onClick={() => approveSettlement(item.id)}
                        className="text-xs font-mono bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        Approve Winner ({item.aiAnalysis.predictedWinnerName})
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => refundSettlement(item.id, 'Manual refund issued by operator')}
                        className="text-xs font-mono"
                      >
                        Full Refund Pool
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: OVERVIEW & RULES */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-surface/40 border border-border/40 rounded-xl">
                      <span className="text-[10px] font-mono text-muted uppercase">Total Stake</span>
                      <p className="text-base font-bold font-mono text-primary mt-1">{item.stakeAmount} Coins</p>
                    </div>
                    <div className="p-3 bg-surface/40 border border-border/40 rounded-xl">
                      <span className="text-[10px] font-mono text-muted uppercase">Prize Pool</span>
                      <p className="text-base font-bold font-mono text-emerald-400 mt-1">{item.prizePool.toLocaleString()} Coins</p>
                    </div>
                    <div className="p-3 bg-surface/40 border border-border/40 rounded-xl">
                      <span className="text-[10px] font-mono text-muted uppercase">Escrow Locked</span>
                      <p className="text-base font-bold font-mono text-purple-400 mt-1">{item.escrowAmount.toLocaleString()} Coins</p>
                    </div>
                    <div className="p-3 bg-surface/40 border border-border/40 rounded-xl">
                      <span className="text-[10px] font-mono text-muted uppercase">Created Time</span>
                      <p className="text-xs font-mono text-foreground mt-1">{item.createdTime}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-mono uppercase text-muted tracking-wider mb-2">Challenge Rules</h3>
                    <ul className="space-y-2">
                      {item.rules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-foreground/80 bg-surface/20 p-2.5 rounded-lg border border-border/30">
                          <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-mono uppercase text-muted tracking-wider mb-2">Participants ({item.playersCount})</h3>
                    {item.participants.length === 0 ? (
                      <p className="text-xs font-mono text-muted italic">Pool participation active across {item.playersCount} players.</p>
                    ) : (
                      <div className="border border-border/60 rounded-xl overflow-hidden">
                        <Table>
                          <TableHeader className="bg-surface/50">
                            <TableRow>
                              <TableHead className="text-xs font-mono">User</TableHead>
                              <TableHead className="text-xs font-mono">Joined</TableHead>
                              <TableHead className="text-xs font-mono">Stake</TableHead>
                              <TableHead className="text-xs font-mono">Result</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {item.participants.map(p => (
                              <TableRow key={p.id}>
                                <TableCell className="font-mono text-xs font-bold text-foreground">{p.username}</TableCell>
                                <TableCell className="font-mono text-xs text-muted">{p.joinedAt}</TableCell>
                                <TableCell className="font-mono text-xs text-primary">{p.stakeAmount} Coins</TableCell>
                                <TableCell>
                                  {p.result === 'Winner' ? <Badge variant="success">WINNER</Badge> : <Badge variant="outline">{p.result || 'Active'}</Badge>}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: EVIDENCE */}
              {activeTab === 'evidence' && (
                <div className="space-y-6">
                  {/* Images Evidence */}
                  {item.evidence.images.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-primary" />
                        <h4 className="text-xs font-mono uppercase text-muted tracking-wider font-bold">Image Verification Proof</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {item.evidence.images.map(img => (
                          <div key={img.id} className="border border-border/50 bg-surface/30 rounded-xl overflow-hidden group">
                            <div className="h-36 overflow-hidden relative">
                              <img src={img.url} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                                <span className="text-[10px] font-mono text-white/90 truncate">{img.label}</span>
                              </div>
                            </div>
                            <div className="p-2.5 flex items-center justify-between text-[10px] font-mono text-muted">
                              <span>Submitted by: {img.submittedBy}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isOcrScanning}
                                onClick={() => handleScanVisionOCR(img.url, img.label)}
                                className="h-6 text-[9px] font-mono gap-1 border-secondary/40 text-secondary hover:bg-secondary/10"
                              >
                                <Search className="h-2.5 w-2.5" /> {isOcrScanning ? 'Scanning...' : 'OCR Scan'}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* GPS & Telemetry Data */}
                  {item.evidence.gpsData.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-orange-400" />
                        <h4 className="text-xs font-mono uppercase text-muted tracking-wider font-bold">GPS & Telemetry Logs</h4>
                      </div>
                      <div className="space-y-2">
                        {item.evidence.gpsData.map(g => (
                          <div key={g.id} className="p-3 bg-surface/30 border border-border/40 rounded-xl flex items-center justify-between text-xs font-mono">
                            <div>
                              <span className="font-bold text-foreground">{g.type}</span>
                              <p className="text-muted text-[11px] mt-0.5">{g.summary}</p>
                            </div>
                            <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                              {g.matchConfidence}% Match
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* OCR Extractions */}
                  {item.evidence.ocrData.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-secondary" />
                        <h4 className="text-xs font-mono uppercase text-muted tracking-wider font-bold">OCR Extract Payloads</h4>
                      </div>
                      <div className="space-y-2">
                        {item.evidence.ocrData.map(ocr => (
                          <div key={ocr.id} className="p-3 bg-black/40 border border-border/50 rounded-xl font-mono text-xs space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-muted">
                              <span>SOURCE: {ocr.source}</span>
                              <span className="text-emerald-400">Accuracy: {ocr.accuracyScore}%</span>
                            </div>
                            <pre className="text-foreground text-[11px] whitespace-pre-wrap">{ocr.extractedText}</pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: FINANCIALS */}
              {activeTab === 'financials' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-surface/40 border border-border/50 rounded-xl flex flex-col justify-between">
                      <span className="text-xs font-mono text-muted">Total Coins Collected</span>
                      <p className="text-xl font-bold font-mono text-foreground mt-2">{item.financials.totalCollected.toLocaleString()} Coins</p>
                    </div>
                    <div className="p-4 bg-surface/40 border border-border/50 rounded-xl flex flex-col justify-between">
                      <span className="text-xs font-mono text-muted">Platform Fee (5%)</span>
                      <p className="text-xl font-bold font-mono text-emerald-400 mt-2">{item.financials.platformFee.toLocaleString()} Coins</p>
                    </div>
                    <div className="p-4 bg-surface/40 border border-border/50 rounded-xl flex flex-col justify-between">
                      <span className="text-xs font-mono text-muted">Net Winner Payout</span>
                      <p className="text-xl font-bold font-mono text-purple-400 mt-2">{item.financials.winnerPayout.toLocaleString()} Coins</p>
                    </div>
                  </div>

                  <div className="p-4 bg-surface/20 border border-border/40 rounded-xl space-y-3">
                    <h4 className="text-xs font-mono uppercase text-muted tracking-wider font-bold">Escrow Lock Protocol</h4>
                    <div className="flex items-center justify-between text-xs font-mono py-1 border-b border-border/30">
                      <span className="text-muted">Currently Locked Escrow</span>
                      <span className="text-foreground font-bold">{item.financials.escrowBalance.toLocaleString()} Coins</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: AUDIT TIMELINE */}
              {activeTab === 'timeline' && (
                <div className="space-y-4 pl-2">
                  <div className="relative border-l-2 border-primary/30 pl-6 space-y-6 my-2">
                    {item.timeline.map((ev, idx) => (
                      <div key={ev.id || idx} className="relative">
                        <div className={`absolute -left-[31px] top-0 h-4 w-4 rounded-full border-2 flex items-center justify-center ${ev.completed ? 'bg-primary border-primary text-background' : 'bg-background border-border text-muted'
                          }`}>
                          {ev.completed && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-sans text-foreground">{ev.stage}</span>
                            <span className="text-[10px] font-mono text-muted">{ev.timestamp}</span>
                          </div>
                          <p className="text-xs text-muted font-sans">{ev.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Sheet Footer */}
            <div className="p-4 border-t border-border/60 bg-surface/30 flex items-center justify-between shrink-0">
              <span className="text-[10px] font-mono text-muted">AnyBet Oracle Protocol Engine v4.3</span>
              <Button size="sm" variant="ghost" onClick={onClose} className="text-xs font-mono">Close</Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
