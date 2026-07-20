import React, { useState, useMemo } from 'react'
import { 
  Building2, 
  Coins, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { useWallet } from '../../context/WalletContext'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer
} from 'recharts'

export const TreasuryModule: React.FC = () => {
  const {
    treasury,
    withdrawalRequests,
    approveWithdrawal,
    rejectWithdrawal,
    pendingWithdrawalCount
  } = useWallet()

  // Pagination for Withdrawal Queue
  const [wdPage, setWdPage] = useState(1)
  const wdPageSize = 5

  // Custom Toast helper
  const showNotice = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }))
    }
  }

  const totalWdPages = Math.max(1, Math.ceil(withdrawalRequests.length / wdPageSize))
  const paginatedWithdrawals = useMemo(() => {
    const start = (wdPage - 1) * wdPageSize
    return withdrawalRequests.slice(start, start + wdPageSize)
  }, [withdrawalRequests, wdPage, wdPageSize])

  // Mock revenue vs payout chart data
  const chartData = [
    { name: 'Mon', revenue: 14200, payouts: 11000 },
    { name: 'Tue', revenue: 18500, payouts: 14200 },
    { name: 'Wed', revenue: 22400, payouts: 16800 },
    { name: 'Thu', revenue: 19800, payouts: 15100 },
    { name: 'Fri', revenue: 31000, payouts: 23500 },
    { name: 'Sat', revenue: 42500, payouts: 32000 },
    { name: 'Sun', revenue: 38900, payouts: 29400 }
  ]

  const handleApprove = (id: string, user: string, amount: number) => {
    approveWithdrawal(id)
    showNotice(`Approved withdrawal request of ${amount.toLocaleString()} BET for ${user}`, 'success')
  }

  const handleReject = (id: string, user: string, amount: number) => {
    rejectWithdrawal(id)
    showNotice(`Rejected withdrawal request of ${amount.toLocaleString()} BET for ${user}. Coins refunded.`, 'info')
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Treasury Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="bg-surface/30 border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-muted uppercase">Platform Treasury Vault</span>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{(treasury.totalCollectedFees ?? 48500).toLocaleString()} BET</p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-muted uppercase">Wager Fee Rate</span>
              <p className="text-2xl font-bold font-mono text-primary mt-1">{treasury.platformFeePercent ?? 5}% Net</p>
            </div>
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary">
              <Coins className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-muted uppercase">Liquidity Reserve</span>
              <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{(treasury.reserveFundBalance ?? 500000).toLocaleString()} BET</p>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-muted uppercase">Virtual Redemptions</span>
              <p className="text-2xl font-bold font-mono text-foreground mt-1">{pendingWithdrawalCount} Pending</p>
            </div>
            <div className="p-3 bg-surface border border-border rounded-xl text-muted">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Banner Note */}
      <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs font-mono text-primary flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        <span>Notice: Escrow balances and wager payouts are automatically synced live from the <strong>Challenges → Live & Settlement</strong> module.</span>
      </div>

      {/* Revenue vs Payout Analytics Graph */}
      <Card className="bg-surface/30 border-border/60">
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div>
              <h3 className="text-base font-bold text-foreground">Treasury Volume & Net Earnings</h3>
              <p className="text-xs text-muted">7-Day comparison of gross wager revenue vs winner payouts.</p>
            </div>
            <Badge variant="pro">LIVE METRICS</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#808090" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#808090" fontSize={11} fontFamily="monospace" />
                <ChartTooltip
                  contentStyle={{ backgroundColor: '#120F1D', borderColor: '#2D283E', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#B366FF" radius={[6, 6, 0, 0]} name="Gross Revenue" />
                <Bar dataKey="payouts" fill="#10B981" radius={[6, 6, 0, 0]} name="Winner Payouts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Virtual Redemption Queue Table */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Virtual Redemption Queue (Simulation)</h3>
            <p className="text-xs text-muted font-mono">Phase-1 Virtual Economy coin redemption approvals.</p>
          </div>
          <Badge variant="warning">{pendingWithdrawalCount} Pending Operator Review</Badge>
        </div>

        <div className="border border-border/60 rounded-xl overflow-hidden bg-surface/20">
          <Table>
            <TableHeader className="bg-surface/60">
              <TableRow>
                <TableHead className="text-xs font-mono">Request ID</TableHead>
                <TableHead className="text-xs font-mono">User</TableHead>
                <TableHead className="text-xs font-mono">Amount</TableHead>
                <TableHead className="text-xs font-mono">Requested At</TableHead>
                <TableHead className="text-xs font-mono">Status</TableHead>
                <TableHead className="text-xs font-mono text-right">Arbitration Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedWithdrawals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted font-mono text-xs">
                    No withdrawal requests in queue.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedWithdrawals.map(req => (
                  <TableRow key={req.id}>
                    <TableCell className="font-mono text-xs font-bold text-primary">{req.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-foreground">{req.username}</span>
                        <span className="font-mono text-[10px] text-muted">{req.userId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-amber-400">{req.amount.toLocaleString()} BET</TableCell>
                    <TableCell className="font-mono text-xs text-muted">{new Date(req.requestedAt).toLocaleString()}</TableCell>
                    <TableCell>
                      {req.status === 'Approved' ? (
                        <Badge variant="success">APPROVED</Badge>
                      ) : req.status === 'Pending' ? (
                        <Badge variant="warning">PENDING REVIEW</Badge>
                      ) : (
                        <Badge variant="danger">REJECTED</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            glow
                            onClick={() => handleApprove(req.id, req.username, req.amount)}
                            className="h-7 px-2.5 text-[10px] font-mono bg-emerald-600 hover:bg-emerald-500 text-white"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(req.id, req.username, req.amount)}
                            className="h-7 px-2.5 text-[10px] font-mono text-red-400 border-red-500/30 hover:bg-red-500/10"
                          >
                            <XCircle className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="font-mono text-[10px] text-muted uppercase">Processed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="p-4 border-t border-border/50 bg-surface/30 flex items-center justify-between text-xs font-mono">
            <span className="text-muted">Page {wdPage} of {totalWdPages}</span>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" disabled={wdPage === 1} onClick={() => setWdPage(p => Math.max(1, p - 1))} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" disabled={wdPage === totalWdPages} onClick={() => setWdPage(p => Math.min(totalWdPages, p + 1))} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
