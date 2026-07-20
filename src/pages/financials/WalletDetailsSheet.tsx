import React from 'react'
import { 
  Lock, 
  Unlock, 
  History
} from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Sheet, SheetContent } from '../../components/ui/sheet'
import { useWallet } from '../../context/WalletContext'
import type { UserWallet } from '../../context/WalletContext'

interface WalletDetailsSheetProps {
  wallet: UserWallet | null
  onClose: () => void
}

export const WalletDetailsSheet: React.FC<WalletDetailsSheetProps> = ({ wallet, onClose }) => {
  const { transactions, freezeWallet, unfreezeWallet } = useWallet()

  if (!wallet) return null

  const userTxs = transactions.filter(t => t.userId === wallet.userId || t.username === wallet.username)

  return (
    <Sheet open={!!wallet} onOpenChange={open => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl bg-background border-l border-border p-6 overflow-y-auto font-sans">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="border-b border-border/40 pb-4 pr-8 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-primary font-bold">{wallet.userId}</span>
                {wallet.status === 'Active' ? (
                  <Badge variant="success">ACTIVE</Badge>
                ) : (
                  <Badge variant="danger">FROZEN</Badge>
                )}
              </div>
              <h3 className="text-xl font-bold text-foreground">{wallet.username}'s Wallet Audit</h3>
              <p className="text-xs text-muted">Created at {wallet.createdAt} • Last Activity: {wallet.lastActivity}</p>
            </div>

            <div className="flex items-center gap-2">
              {wallet.status === 'Active' ? (
                <Button size="sm" variant="outline" onClick={() => freezeWallet(wallet.id)} className="gap-1 text-xs font-mono text-red-400 border-red-500/30">
                  <Lock className="h-3.5 w-3.5" /> Freeze
                </Button>
              ) : (
                <Button size="sm" variant="primary" glow onClick={() => unfreezeWallet(wallet.id)} className="gap-1 text-xs font-mono">
                  <Unlock className="h-3.5 w-3.5" /> Unfreeze
                </Button>
              )}
            </div>
          </div>

          {/* Balance Breakdown Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-surface/40 border border-border/50 rounded-xl">
              <span className="text-[10px] font-mono text-muted uppercase block">Total Balance</span>
              <span className="text-lg font-bold font-mono text-primary mt-0.5 block">{wallet.totalBalance.toLocaleString()} BET</span>
            </div>
            <div className="p-3 bg-surface/40 border border-border/50 rounded-xl">
              <span className="text-[10px] font-mono text-muted uppercase block">Locked Stakes</span>
              <span className="text-lg font-bold font-mono text-amber-400 mt-0.5 block">{wallet.lockedBalance.toLocaleString()} BET</span>
            </div>
            <div className="p-3 bg-surface/40 border border-border/50 rounded-xl">
              <span className="text-[10px] font-mono text-muted uppercase block">Available Balance</span>
              <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5 block">{(wallet.totalBalance - wallet.lockedBalance).toLocaleString()} BET</span>
            </div>
          </div>

          {/* User Transaction History */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold font-mono text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <History className="h-4 w-4 text-primary" /> User Transaction Log ({userTxs.length})
            </h4>

            <div className="border border-border/60 rounded-xl overflow-hidden bg-surface/20">
              <Table>
                <TableHeader className="bg-surface/60">
                  <TableRow>
                    <TableHead className="text-xs font-mono">Tx Ref ID</TableHead>
                    <TableHead className="text-xs font-mono">Type</TableHead>
                    <TableHead className="text-xs font-mono">Amount</TableHead>
                    <TableHead className="text-xs font-mono">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userTxs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted font-mono text-xs">
                        No transactions recorded for this user.
                      </TableCell>
                    </TableRow>
                  ) : (
                    userTxs.map(tx => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-xs font-bold text-primary">{tx.txHash}</TableCell>
                        <TableCell className="font-mono text-xs">{tx.type}</TableCell>
                        <TableCell className={`font-mono text-xs font-bold ${tx.type === 'Withdrawal' || tx.type === 'Bet Stake' ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {tx.type === 'Withdrawal' || tx.type === 'Bet Stake' ? '-' : '+'}{tx.amount.toLocaleString()} BET
                        </TableCell>
                        <TableCell className="font-mono text-[10px] text-muted">{new Date(tx.timestamp).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
