import React from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'

export interface DisputeUser {
  username: string
  avatar: string
}

export interface Dispute {
  id: string
  challengeTitle: string
  creator: DisputeUser
  opponent: DisputeUser
  stake: number
  oracleEvidence: string
  confidenceScore: number
  status: 'Pending Review' | 'Resolved'
  winnerSelected?: string
}

interface DisputeResolutionProps {
  disputes: Dispute[]
  handleResolveDispute: (disputeId: string, winner: string) => void
  handleRefundStake: (disputeId: string) => void
}

export const DisputeResolution: React.FC<DisputeResolutionProps> = ({
  disputes,
  handleResolveDispute,
  handleRefundStake
}) => {
  return (
    <div className="border border-muted/30 rounded-xl overflow-hidden bg-surface/30 w-full overflow-x-auto">
      <Table>
        <TableHeader className="bg-surface/75 border-b border-muted/30">
          <TableRow className="border-b border-muted/30 hover:bg-transparent h-14">
            <TableHead className="text-xs font-mono h-14 pl-4">Dispute ID</TableHead>
            <TableHead className="text-xs font-mono h-14">Challenge</TableHead>
            <TableHead className="text-xs font-mono h-14">Users Involved</TableHead>
            <TableHead className="text-xs font-mono h-14 text-center">Stake</TableHead>
            <TableHead className="text-xs font-mono h-14">Oracle Proof Evidence</TableHead>
            <TableHead className="text-xs font-mono h-14 text-center">Confidence</TableHead>
            <TableHead className="text-xs font-mono h-14 text-center">Status</TableHead>
            <TableHead className="text-xs font-mono h-14 pr-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {disputes.map(d => (
            <TableRow key={d.id} className="border-b border-muted/20 hover:bg-surface/40">
              <TableCell className="py-3 pl-4 font-mono text-xs font-bold text-foreground">{d.id}</TableCell>
              <TableCell className="py-3 text-xs font-bold text-foreground max-w-[200px] truncate">{d.challengeTitle}</TableCell>
              <TableCell className="py-3 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted block">Creator: <span className="text-foreground font-mono">@{d.creator.username}</span></span>
                  <span className="text-muted block">Opponent: <span className="text-foreground font-mono">@{d.opponent.username}</span></span>
                </div>
              </TableCell>
              <TableCell className="py-3 text-center text-xs font-mono font-bold text-primary">{d.stake} Coins</TableCell>
              <TableCell className="py-3 text-xs max-w-xs truncate text-muted font-mono">{d.oracleEvidence}</TableCell>
              <TableCell className="py-3 text-center">
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                  d.confidenceScore >= 95 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                }`}>
                  {d.confidenceScore}%
                </span>
              </TableCell>
              <TableCell className="py-3 text-center">
                <span className={`inline-block px-2 py-0.5 text-[9px] font-mono font-extrabold uppercase rounded-md border ${
                  d.status === 'Resolved' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                }`}>
                  {d.status}
                </span>
              </TableCell>
              <TableCell className="py-3 pr-4 text-right">
                {d.status === 'Pending Review' ? (
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[10px] font-mono hover:bg-emerald-950/20 hover:text-emerald-400 border border-muted/30"
                      onClick={() => handleResolveDispute(d.id, d.creator.username)}
                    >
                      Settle Creator
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[10px] font-mono hover:bg-emerald-950/20 hover:text-emerald-400 border border-muted/30"
                      onClick={() => handleResolveDispute(d.id, d.opponent.username)}
                    >
                      Settle Opponent
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[10px] font-mono text-muted hover:text-red-400"
                      onClick={() => handleRefundStake(d.id)}
                    >
                      Refund Both
                    </Button>
                  </div>
                ) : (
                  <span className="text-[10px] font-mono text-muted">Settled: @{d.winnerSelected}</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
