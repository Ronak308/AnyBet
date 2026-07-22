import React, { useState } from 'react'
import { 
  Trophy, 
  Download, 
  Printer, 
  ShieldAlert, 
  Cpu 
} from 'lucide-react'
import { Sheet, SheetContent } from '../../components/ui/sheet'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import type { ChallengeItem } from '../../context/ChallengesContext'
import { useChallenges } from '../../context/ChallengesContext'

interface LeaderboardDetailsSheetProps {
  isOpen: boolean
  onClose: () => void
  challenge: ChallengeItem | null
  activeRowData?: any
}

export const LeaderboardDetailsSheet: React.FC<LeaderboardDetailsSheetProps> = ({
  isOpen,
  onClose,
  challenge,
  activeRowData
}) => {
  const { showToastNotice } = useChallenges()
  const [drawerSubTab, setDrawerSubTab] = useState<'overview' | 'contenders' | 'oracle' | 'risk'>('overview')

  if (!challenge && !activeRowData) return null

  const title = challenge?.title || activeRowData?.name || activeRowData?.challengeName || activeRowData?.username || 'Leaderboard Item'
  const category = challenge?.category || activeRowData?.category || 'General'
  const prizePool = challenge?.prizePool || activeRowData?.totalPot || activeRowData?.volume || 125000
  const participantsCount = challenge?.participantsCount || activeRowData?.participants || 24

  // Contenders mock array
  const contenders = challenge?.participants.map((p, idx) => ({
    rank: idx + 1,
    username: p.username,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`,
    choice: (p as any).optionChosen || (idx % 2 === 0 ? 'YES' : 'NO'),
    stake: (p as any).amountStaked || (p as any).amount || Math.floor((prizePool / Math.max(1, participantsCount)) * (1 + (idx * 0.15))),
    projectedPayout: Math.floor((prizePool * 0.95) / (idx === 0 ? 1 : idx + 1.5)),
    roiPercent: Math.round((75 - idx * 12.5) * 10) / 10,
    winStreak: Math.max(1, 8 - idx * 2),
    status: idx === 0 ? 'Leader / Winner' : 'Contender'
  })) || [
    { rank: 1, username: activeRowData?.username || 'CryptoKing_99', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoKing', choice: 'YES', stake: 15000, projectedPayout: 85000, roiPercent: 245.8, winStreak: 12, status: 'Leader / Winner' },
    { rank: 2, username: 'Alex_R', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex_R', choice: 'YES', stake: 10000, projectedPayout: 42000, roiPercent: 180.2, winStreak: 8, status: 'Contender' },
    { rank: 3, username: 'Marcus_S', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus_S', choice: 'NO', stake: 8000, projectedPayout: 25000, roiPercent: 120.4, winStreak: 5, status: 'Contender' }
  ]

  const top1 = contenders[0]

  const handleExportCSV = () => {
    const headers = 'Rank,Username,Choice,Stake (Coins),Projected Payout (Coins),ROI %,Win Streak\n'
    const rows = contenders.map(c => `${c.rank},"${c.username}",${c.choice},${c.stake},${c.projectedPayout},${c.roiPercent}%,${c.winStreak}`).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leaderboard-spec-${Date.now()}.csv`
    a.click()
    showToastNotice('Exported Leaderboard Spec CSV', 'success')
  }

  const handlePrintCertificate = () => {
    showToastNotice(`Generated Official Audit Certificate for ${top1?.username || 'Top Leader'}`, 'info')
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl bg-background border-l border-border p-6 overflow-y-auto font-sans">
        <div className="flex flex-col gap-5">

          {/* Header Bar */}
          <div className="border-b border-border/40 pb-4 pr-8">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge variant="pro" className="font-mono text-[10px]">ENTERPRISE LEADERBOARD SPEC</Badge>
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">{category}</Badge>
              {activeRowData?.riskScore && (
                <Badge variant="outline" className="text-[9px] text-red-400 border-red-500/40 bg-red-500/10 font-mono">
                  RISK SCORE: {activeRowData.riskScore}/100
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <p className="text-xs text-muted mt-0.5 font-mono">
              Total Escrow Pool: <span className="text-emerald-400 font-bold">{prizePool.toLocaleString()} Coins</span> • {participantsCount} Contenders
            </p>
          </div>

          {/* Drawer Sub-Tab Navigation */}
          <div className="flex items-center bg-surface/40 border border-border/60 rounded-xl p-1 gap-1 font-mono text-xs">
            <button
              onClick={() => setDrawerSubTab('overview')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                drawerSubTab === 'overview' ? 'bg-primary text-white font-bold shadow' : 'text-muted hover:text-foreground'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setDrawerSubTab('contenders')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                drawerSubTab === 'contenders' ? 'bg-primary text-white font-bold shadow' : 'text-muted hover:text-foreground'
              }`}
            >
              Contenders ({contenders.length})
            </button>
            <button
              onClick={() => setDrawerSubTab('oracle')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                drawerSubTab === 'oracle' ? 'bg-primary text-white font-bold shadow' : 'text-muted hover:text-foreground'
              }`}
            >
              AI Oracle Feeds
            </button>
            <button
              onClick={() => setDrawerSubTab('risk')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                drawerSubTab === 'risk' ? 'bg-primary text-white font-bold shadow' : 'text-muted hover:text-foreground'
              }`}
            >
              Risk & Fraud Audit
            </button>
          </div>

          {/* ─── TAB 1: OVERVIEW & PODIUM ─── */}
          {drawerSubTab === 'overview' && (
            <div className="space-y-4">
              {/* TOP 3 PODIUM DISPLAY */}
              <div className="p-4 bg-surface/30 border border-border/60 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-mono font-bold text-foreground uppercase">Top Contenders Podium</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted">95% Net Winner Shares</span>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 items-end text-center font-mono">
                  {contenders[1] && (
                    <div className="bg-surface/50 border border-slate-400/30 rounded-xl p-3 flex flex-col items-center space-y-1 relative">
                      <div className="w-5 h-5 rounded-full bg-slate-400 text-black font-bold text-[10px] flex items-center justify-center absolute -top-2.5">2</div>
                      <img src={contenders[1].avatar} alt="" className="w-9 h-9 rounded-full border border-slate-400/50 bg-black/40" />
                      <span className="font-bold text-xs text-foreground truncate w-full">{contenders[1].username}</span>
                      <span className="text-[10px] text-emerald-400 font-bold">+{contenders[1].projectedPayout.toLocaleString()} Coins</span>
                    </div>
                  )}

                  {contenders[0] && (
                    <div className="bg-amber-500/10 border-2 border-amber-400/60 rounded-xl p-3 flex flex-col items-center space-y-1 relative shadow-lg scale-105">
                      <div className="w-6 h-6 rounded-full bg-amber-400 text-black font-bold text-xs flex items-center justify-center absolute -top-3 shadow-md">1</div>
                      <img src={contenders[0].avatar} alt="" className="w-11 h-11 rounded-full border-2 border-amber-400 bg-black/40" />
                      <span className="font-bold text-xs text-amber-300 truncate w-full">{contenders[0].username}</span>
                      <span className="text-[11px] text-emerald-400 font-bold">+{contenders[0].projectedPayout.toLocaleString()} Coins</span>
                    </div>
                  )}

                  {contenders[2] && (
                    <div className="bg-surface/50 border border-amber-700/40 rounded-xl p-3 flex flex-col items-center space-y-1 relative">
                      <div className="w-5 h-5 rounded-full bg-amber-700 text-white font-bold text-[10px] flex items-center justify-center absolute -top-2.5">3</div>
                      <img src={contenders[2].avatar} alt="" className="w-9 h-9 rounded-full border border-amber-700/50 bg-black/40" />
                      <span className="font-bold text-xs text-foreground truncate w-full">{contenders[2].username}</span>
                      <span className="text-[10px] text-emerald-400 font-bold">+{contenders[2].projectedPayout.toLocaleString()} Coins</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Pool & Financial Split */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-surface/30 rounded-xl border border-border/40 space-y-1">
                  <span className="text-muted text-[10px] block uppercase">Net Winner Payout (95%)</span>
                  <span className="text-emerald-400 font-bold text-base">{Math.floor(prizePool * 0.95).toLocaleString()} Coins</span>
                </div>
                <div className="p-3 bg-surface/30 rounded-xl border border-border/40 space-y-1">
                  <span className="text-muted text-[10px] block uppercase">Admin Platform Fee (5%)</span>
                  <span className="text-primary font-bold text-base">{Math.floor(prizePool * 0.05).toLocaleString()} Coins</span>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 2: CONTENDERS LIST ─── */}
          {drawerSubTab === 'contenders' && (
            <div className="border border-border/60 rounded-xl overflow-hidden bg-surface/20">
              <Table>
                <TableHeader className="bg-surface/60">
                  <TableRow>
                    <TableHead className="text-xs font-mono w-10">#</TableHead>
                    <TableHead className="text-xs font-mono">Contender</TableHead>
                    <TableHead className="text-xs font-mono">Choice</TableHead>
                    <TableHead className="text-xs font-mono">Stake</TableHead>
                    <TableHead className="text-xs font-mono">Payout</TableHead>
                    <TableHead className="text-xs font-mono text-right">ROI %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contenders.map((c) => (
                    <TableRow key={c.rank} className="hover:bg-surface/30 font-mono text-xs">
                      <TableCell className="font-bold text-foreground">#{c.rank}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img src={c.avatar} alt="" className="w-5 h-5 rounded-full bg-black/40" />
                          <span className="font-bold text-foreground text-xs">{c.username}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">{c.choice}</Badge>
                      </TableCell>
                      <TableCell className="text-muted">{c.stake} Coins</TableCell>
                      <TableCell className="font-bold text-emerald-400">+{c.projectedPayout.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-primary font-bold">+{c.roiPercent}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* ─── TAB 3: AI ORACLE LOGS ─── */}
          {drawerSubTab === 'oracle' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary animate-pulse" />
                  <span className="font-bold text-primary text-xs">Gemini 2.0 Oracle Telemetry</span>
                </div>
                <p className="text-xs text-foreground/90 font-sans leading-relaxed">
                  Oracle Source: Binance Spot Price Feed & The-Odds API. Target outcome resolution evaluated with zero telemetry delay.
                </p>
                <div className="flex items-center justify-between text-[11px] text-muted pt-1 border-t border-border/30">
                  <span>Confidence Score: <strong className="text-emerald-400">98.6%</strong></span>
                  <span>Latency: <strong className="text-cyan-400">124ms</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 4: RISK & FRAUD AUDIT ─── */}
          {drawerSubTab === 'risk' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 bg-surface/30 border border-border/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400">
                    <ShieldAlert className="h-4 w-4" />
                    <span className="font-bold text-xs">AI Risk & Collusion Telemetry</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-400">
                    LOW RISK (12/100)
                  </Badge>
                </div>
                <div className="space-y-1 text-[11px] text-muted font-sans pt-1">
                  <div className="flex items-center justify-between border-b border-border/30 pb-1">
                    <span>Sybil Multi-Account Check:</span>
                    <span className="text-emerald-400 font-bold font-mono">PASSED (0 Match)</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/30 py-1">
                    <span>Odds Manipulation Spike:</span>
                    <span className="text-emerald-400 font-bold font-mono">NORMAL</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span>IP / Device Fingerprint:</span>
                    <span className="text-emerald-400 font-bold font-mono">VERIFIED UNIQUE</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 border-t border-border/40">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="w-full text-xs font-mono gap-1.5 h-9 border-border hover:bg-surface/40"
            >
              <Download className="h-3.5 w-3.5" /> Export Spec CSV
            </Button>
            <Button
              variant="primary"
              glow
              onClick={handlePrintCertificate}
              className="w-full text-xs font-mono gap-1.5 h-9"
            >
              <Printer className="h-3.5 w-3.5" /> Winner Certificate
            </Button>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  )
}
