import React, { useState, useMemo } from 'react'
import { 
  Lock, 
  Unlock, 
  History,
  Search
} from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
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
  const [searchQuery, setSearchQuery] = useState('')

  // Compute userTxs safely before hooks or inside useMemo
  const userTxs = useMemo(() => {
    if (!wallet) return []
    const realTxs = transactions.filter(t => t.userId === wallet.userId || t.username === wallet.username)
    return realTxs.map(t => ({
      id: t.id,
      txHash: t.txHash || t.id,
      type: t.type,
      description: t.description || ((t.type as string) === 'Challenge Win' ? 'Won Challenge Pool' : t.type === 'Bet Stake' ? 'Escrow Bet Stake' : t.type),
      amount: t.amount,
      isCredit: t.type !== 'Withdrawal' && t.type !== 'Bet Stake',
      timestamp: typeof t.timestamp === 'string' ? t.timestamp : new Date(t.timestamp).toLocaleString(),
      status: t.status || 'Completed'
    }))
  }, [wallet, transactions])

  // Filtered transactions by Search Query
  const filteredTxs = useMemo(() => {
    if (!searchQuery.trim()) return userTxs
    const q = searchQuery.toLowerCase()
    return userTxs.filter(t => 
      t.txHash.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q) ||
      t.amount.toString().includes(q)
    )
  }, [userTxs, searchQuery])

  // EARLY RETURN PLACED STRICTLY AFTER ALL HOOKS
  if (!wallet) return null

  return (
    <Sheet open={!!wallet} onOpenChange={open => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-3xl bg-background border-l border-border p-6 overflow-y-auto font-sans">
        <div className="flex flex-col gap-6">

          {/* Header */}
          <div className="border-b border-border/40 pb-4 pr-8 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-primary font-bold">{wallet.userId}</span>
                {wallet.status === 'Active' ? (
                  <Badge variant="success">ACTIVE WALLET</Badge>
                ) : (
                  <Badge variant="danger">FROZEN</Badge>
                )}
              </div>
              <h3 className="text-xl font-bold text-foreground">{wallet.username}'s Wallet Audit & Transaction Log</h3>
              <p className="text-xs text-muted font-mono">Created at {wallet.createdAt} • Last Activity: {wallet.lastActivity}</p>
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
            <div className="p-3 bg-surface/40 border border-border/50 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-muted uppercase block">Total Balance</span>
              <span className="text-lg font-bold font-mono text-primary block">{wallet.totalBalance.toLocaleString()} Coins</span>
            </div>
            <div className="p-3 bg-surface/40 border border-border/50 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-muted uppercase block">Locked Stakes</span>
              <span className="text-lg font-bold font-mono text-amber-400 block">{wallet.lockedBalance.toLocaleString()} Coins</span>
            </div>
            <div className="p-3 bg-surface/40 border border-border/50 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-muted uppercase block">Available Balance</span>
              <span className="text-lg font-bold font-mono text-emerald-400 block">{(wallet.totalBalance - wallet.lockedBalance).toLocaleString()} Coins</span>
            </div>
          </div>

          {/* Search & Transaction History Section */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h4 className="text-xs font-bold font-mono text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <History className="h-4 w-4 text-primary" /> User Wallet History ({filteredTxs.length})
              </h4>

              {/* Real-time Search Input */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                <Input
                  placeholder="Search Tx Hash, type, description..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 bg-surface/50 text-xs font-mono h-8 rounded-xl"
                />
              </div>
            </div>

            <div className="border border-border/60 rounded-xl overflow-hidden bg-surface/20">
              <Table>
                <TableHeader className="bg-surface/60">
                  <TableRow>
                    <TableHead className="text-xs font-mono">Tx Ref ID</TableHead>
                    <TableHead className="text-xs font-mono">Type & Description</TableHead>
                    <TableHead className="text-xs font-mono">Amount (Coins)</TableHead>
                    <TableHead className="text-xs font-mono">Status</TableHead>
                    <TableHead className="text-xs font-mono text-right">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTxs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-xs font-mono text-muted">
                        No transactions found matching "{searchQuery}".
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTxs.map(tx => (
                      <TableRow key={tx.id} className="hover:bg-surface/30 font-mono text-xs">
                        <TableCell className="font-bold text-primary">{tx.txHash}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-xs">{tx.type}</span>
                            <span className="text-[10px] text-muted font-sans line-clamp-1">{tx.description}</span>
                          </div>
                        </TableCell>
                        <TableCell className={`font-bold ${tx.isCredit ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {tx.isCredit ? `+${tx.amount.toLocaleString()}` : `-${tx.amount.toLocaleString()}`} Coins
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`text-[9px] ${
                              tx.status === 'Completed' 
                                ? 'border-emerald-500/40 text-emerald-400' 
                                : 'border-amber-500/40 text-amber-400'
                            }`}
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-[10px] text-muted">{tx.timestamp}</TableCell>
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
