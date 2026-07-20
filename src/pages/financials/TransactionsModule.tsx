import React, { useState, useMemo } from 'react'
import { 
  Search, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Sheet, SheetContent } from '../../components/ui/sheet'
import { useWallet } from '../../context/WalletContext'
import type { CoinTransaction } from '../../context/WalletContext'

export const TransactionsModule: React.FC = () => {
  const { transactions } = useWallet()

  // Search & Filter state
  const [txSearch, setTxSearch] = useState('')
  const [txTypeFilter, setTxTypeFilter] = useState<string>('all')
  const [txStatusFilter, setTxStatusFilter] = useState<string>('all')
  const [txPage, setTxPage] = useState(1)
  const txPageSize = 10

  // Tx Details Drawer
  const [selectedTx, setSelectedTx] = useState<CoinTransaction | null>(null)

  // Custom Toast helper
  const showNotice = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }))
    }
  }

  // Filtering & Pagination
  const filteredTxs = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.txHash.toLowerCase().includes(txSearch.toLowerCase()) ||
                            tx.username.toLowerCase().includes(txSearch.toLowerCase()) ||
                            tx.description.toLowerCase().includes(txSearch.toLowerCase())
      const matchesType = txTypeFilter === 'all' || tx.type === txTypeFilter
      const matchesStatus = txStatusFilter === 'all' || tx.status === txStatusFilter
      return matchesSearch && matchesType && matchesStatus
    })
  }, [transactions, txSearch, txTypeFilter, txStatusFilter])

  const totalTxPages = Math.max(1, Math.ceil(filteredTxs.length / txPageSize))
  const paginatedTxs = useMemo(() => {
    const start = (txPage - 1) * txPageSize
    return filteredTxs.slice(start, start + txPageSize)
  }, [filteredTxs, txPage, txPageSize])

  // CSV Export
  const handleExportCSV = () => {
    if (filteredTxs.length === 0) {
      showNotice('No transactions available to export.', 'warning')
      return
    }

    const headers = ['TxHash', 'UserID', 'Username', 'Type', 'Amount', 'Status', 'Timestamp', 'Description']
    const rows = filteredTxs.map(t => [
      t.txHash,
      t.userId,
      t.username,
      t.type,
      t.amount,
      t.status,
      t.timestamp,
      `"${t.description.replace(/"/g, '""')}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `AnyBet_Transactions_Ledger_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showNotice('Exported CSV transaction ledger successfully.', 'success')
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Deposit':
        return <Badge variant="success">DEPOSIT</Badge>
      case 'Bet Win':
        return <Badge variant="success">WIN</Badge>
      case 'Bet Stake':
        return <Badge variant="warning">STAKE</Badge>
      case 'Withdrawal':
        return <Badge variant="danger">WITHDRAWAL</Badge>
      case 'Reward':
        return <Badge variant="pro">REWARD</Badge>
      case 'Refund':
        return <Badge variant="outline">REFUND</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-5 font-sans">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <Input
            placeholder="Search Tx Ref ID, User, or Description..."
            value={txSearch}
            onChange={e => { setTxSearch(e.target.value); setTxPage(1); }}
            className="pl-9 h-9 text-xs font-mono bg-surface/40 border-border/60"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 bg-surface/40 border border-border/60 rounded-lg px-2.5 py-1 text-xs font-mono">
            <span className="text-muted text-[10px] uppercase">Type:</span>
            <select
              value={txTypeFilter}
              onChange={e => { setTxTypeFilter(e.target.value); setTxPage(1); }}
              className="bg-transparent text-foreground outline-none cursor-pointer font-bold"
            >
              <option value="all" className="bg-background text-foreground">All Types</option>
              <option value="Deposit" className="bg-background text-foreground">Deposit</option>
              <option value="Bet Stake" className="bg-background text-foreground">Bet Stake</option>
              <option value="Bet Win" className="bg-background text-foreground">Bet Win</option>
              <option value="Withdrawal" className="bg-background text-foreground">Withdrawal</option>
              <option value="Reward" className="bg-background text-foreground">Reward</option>
              <option value="Refund" className="bg-background text-foreground">Refund</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-surface/40 border border-border/60 rounded-lg px-2.5 py-1 text-xs font-mono">
            <span className="text-muted text-[10px] uppercase">Status:</span>
            <select
              value={txStatusFilter}
              onChange={e => { setTxStatusFilter(e.target.value); setTxPage(1); }}
              className="bg-transparent text-foreground outline-none cursor-pointer font-bold"
            >
              <option value="all" className="bg-background text-foreground">All Statuses</option>
              <option value="Settled" className="bg-background text-foreground">Settled</option>
              <option value="Pending" className="bg-background text-foreground">Pending</option>
              <option value="Failed" className="bg-background text-foreground">Failed</option>
            </select>
          </div>

          <Button size="sm" variant="outline" onClick={handleExportCSV} className="gap-1.5 text-xs font-mono">
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Master Transactions Table */}
      <div className="border border-border/60 rounded-xl overflow-hidden bg-surface/20">
        <Table>
          <TableHeader className="bg-surface/60">
            <TableRow>
              <TableHead className="text-xs font-mono">Tx Ref ID</TableHead>
              <TableHead className="text-xs font-mono">User</TableHead>
              <TableHead className="text-xs font-mono">Type</TableHead>
              <TableHead className="text-xs font-mono">Amount</TableHead>
              <TableHead className="text-xs font-mono">Status</TableHead>
              <TableHead className="text-xs font-mono">Timestamp</TableHead>
              <TableHead className="text-xs font-mono">Description</TableHead>
              <TableHead className="text-xs font-mono text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTxs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted font-mono text-xs">
                  No transaction records found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTxs.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-xs font-bold text-primary">{tx.txHash}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-foreground">{tx.username}</span>
                      <span className="font-mono text-[10px] text-muted">{tx.userId}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(tx.type)}</TableCell>
                  <TableCell className={`font-mono text-xs font-bold ${tx.type === 'Withdrawal' || tx.type === 'Bet Stake' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {tx.type === 'Withdrawal' || tx.type === 'Bet Stake' ? '-' : '+'}{tx.amount.toLocaleString()} BET
                  </TableCell>
                  <TableCell>
                    {tx.status === 'Settled' ? (
                      <Badge variant="success">SETTLED</Badge>
                    ) : tx.status === 'Pending' ? (
                      <Badge variant="warning">PENDING</Badge>
                    ) : (
                      <Badge variant="danger">FAILED</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted">
                    {new Date(tx.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-foreground/80 line-clamp-1 max-w-xs">{tx.description}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => setSelectedTx(tx)} className="h-7 w-7 text-muted hover:text-primary">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border/50 bg-surface/30 flex items-center justify-between text-xs font-mono">
          <span className="text-muted">Page {txPage} of {totalTxPages}</span>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" disabled={txPage === 1} onClick={() => setTxPage(p => Math.max(1, p - 1))} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" disabled={txPage === totalTxPages} onClick={() => setTxPage(p => Math.min(totalTxPages, p + 1))} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* TX DETAILS SHEET */}
      <Sheet open={!!selectedTx} onOpenChange={open => !open && setSelectedTx(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-background border-l border-border p-6 overflow-y-auto font-sans">
          {selectedTx && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-border/40 pb-4 pr-8">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-primary font-bold">{selectedTx.id}</span>
                  {getTypeBadge(selectedTx.type)}
                </div>
                <h3 className="text-lg font-bold text-foreground">Transaction Spec</h3>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div className="p-3 bg-surface/40 border border-border/50 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted">Transaction Hash</span>
                    <span className="text-primary font-bold">{selectedTx.txHash}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">User Account</span>
                    <span className="text-foreground">{selectedTx.username} ({selectedTx.userId})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Amount</span>
                    <span className="text-emerald-400 font-bold">{selectedTx.amount.toLocaleString()} BET</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Status</span>
                    <span className="text-foreground">{selectedTx.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Timestamp</span>
                    <span className="text-muted">{new Date(selectedTx.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-muted uppercase block mb-1">Description</span>
                  <div className="p-3 bg-surface/30 border border-border/40 rounded-lg text-foreground/90">
                    {selectedTx.description}
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
