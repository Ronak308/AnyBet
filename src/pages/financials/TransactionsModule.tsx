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
                    {tx.type === 'Withdrawal' || tx.type === 'Bet Stake' ? '-' : '+'}{tx.amount.toLocaleString()} Coins
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
            <div className="flex flex-col gap-6 h-full justify-between">
              <div>
                <div className="border-b border-border/40 pb-4 pr-8">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Transaction Invoice</span>
                    {getTypeBadge(selectedTx.type)}
                  </div>
                  <h3 className="text-lg font-bold text-foreground font-mono">Receipt Specs</h3>
                </div>

                {/* Premium Ticket/Invoice Styling */}
                <div className="mt-6 border border-border bg-surface/20 rounded-2xl p-5 relative overflow-hidden space-y-4 shadow-xl">
                  {/* Decorative cutouts on sides */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-background border-r border-border rounded-r-full -ml-px"></div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-background border-l border-border rounded-l-full -mr-px"></div>
                  
                  {/* Receipt Header */}
                  <div className="flex items-center justify-between border-b border-dashed border-border/60 pb-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground font-mono">ANYBET PROTOCOL</span>
                      <span className="text-[9px] font-mono text-muted">VIRTUAL CASHOUT RECEIPT</span>
                    </div>
                    <Badge variant={selectedTx.status === 'Settled' ? 'success' : selectedTx.status === 'Pending' ? 'warning' : 'danger'}>
                      {selectedTx.status.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Financial Details Table */}
                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted">Transaction ID:</span>
                      <span className="text-foreground font-bold">{selectedTx.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Tx Hash Ref:</span>
                      <span className="text-primary font-bold">{selectedTx.txHash}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Username:</span>
                      <span className="text-foreground">@{selectedTx.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">User ID:</span>
                      <span className="text-muted">{selectedTx.userId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Timestamp:</span>
                      <span className="text-muted">{new Date(selectedTx.timestamp).toLocaleString()}</span>
                    </div>
                    
                    <div className="border-t border-dashed border-border/60 my-2 pt-2 space-y-1.5">
                      <div className="flex justify-between text-muted text-[11px]">
                        <span>Amount:</span>
                        <span>{selectedTx.amount.toLocaleString()} Coins</span>
                      </div>
                      <div className="flex justify-between text-muted text-[11px]">
                        <span>Gas/Platform Fee:</span>
                        <span>0 Coins (Virtual)</span>
                      </div>
                      <div className="flex justify-between text-foreground font-bold text-sm border-t border-border/40 pt-2">
                        <span>Total Credited:</span>
                        <span className="text-emerald-400">+{selectedTx.amount.toLocaleString()} Coins</span>
                      </div>
                    </div>
                  </div>

                  {/* Receipt Description Box */}
                  <div className="bg-surface/40 p-3 rounded-xl border border-border/40 text-xs font-mono text-muted">
                    <span className="text-[9px] uppercase tracking-wider text-muted font-bold block mb-1">Audit Log Context</span>
                    {selectedTx.description}
                  </div>

                  {/* Mock Barcode */}
                  <div className="pt-3 border-t border-dashed border-border/60 flex flex-col items-center gap-1.5">
                    <div className="text-[20px] tracking-[3px] font-mono text-foreground/35 select-none leading-none">
                      ||| | ||| |||| | ||| || |||
                    </div>
                    <span className="text-[8px] font-mono text-muted uppercase">Signed: ANYBET-AI-ORACLE-GATEWAY</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-4 border-t border-border/40">
                <Button 
                  variant="primary" 
                  glow 
                  className="w-full text-xs font-mono"
                  onClick={() => {
                    showNotice(`Receipt generated and sent to user email.`, 'success');
                  }}
                >
                  ✉️ Email Receipt
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-xs font-mono"
                  onClick={() => {
                    window.print();
                  }}
                >
                  🖨️ Print Invoice
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
