import React, { useState, useMemo } from 'react'
import { 
  Building2, 
  Coins, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Sheet, SheetContent } from '../../components/ui/sheet'
import { useWallet } from '../../context/WalletContext'
import type { WithdrawalRequest } from '../../context/WalletContext'
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
    pendingWithdrawalCount,
    platformFeePercent,
    updatePlatformFeePercent
  } = useWallet()

  // Pagination for Withdrawal Queue
  const [wdPage, setWdPage] = useState(1)
  const wdPageSize = 5

  // Local state for fee input to allow delete/type operations freely
  const [feeInput, setFeeInput] = useState<string>(platformFeePercent.toString())

  // Payout Management States
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null)
  const [txHashInput, setTxHashInput] = useState('')
  const [adminNotesInput, setAdminNotesInput] = useState('')
  const [copiedAddress, setCopiedAddress] = useState(false)

  React.useEffect(() => {
    setFeeInput(platformFeePercent.toString())
  }, [platformFeePercent])

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

  const handleApprove = (
    id: string, 
    user: string, 
    _amount: number, 
    txHash?: string, 
    taxDeducted?: number, 
    feeDeducted?: number, 
    netDisbursed?: number, 
    notes?: string
  ) => {
    approveWithdrawal(id, txHash, taxDeducted, feeDeducted, netDisbursed, notes)
    showNotice(`Disbursed payout for ${user}: Net $${netDisbursed} USD`, 'success')
    setSelectedRequest(null)
  }

  const handleReject = (id: string, user: string, _amount: number, notes?: string) => {
    rejectWithdrawal(id, notes)
    showNotice(`Declined cashout for ${user}. Coins refunded.`, 'info')
    setSelectedRequest(null)
  }

  // Simulate generating a mock TxHash
  const handleGenerateFakeTxHash = (method: string) => {
    const prefix = method === 'Crypto (USDT)' ? '0x' : 'TXN-BANK-';
    const rand = Math.floor(Math.random() * 1e12).toString(16).toUpperCase();
    const hash = prefix + rand + Math.floor(Math.random() * 1e8).toString(16).toUpperCase();
    setTxHashInput(hash);
    showNotice('Simulated transaction reference ID generated!', 'info');
  }

  const handleCopyAddress = (text: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
      showNotice('Address copied to clipboard!', 'success');
    }
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Treasury Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="bg-surface/30 border-border/60">
          <CardContent className="p-4 flex items-center justify-between h-full">
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
          <CardContent className="p-4 flex items-center justify-between h-full">
            <div>
              <span className="text-[10px] font-mono text-muted uppercase">Wager Fee Rate</span>
              <p className="text-2xl font-bold font-mono text-primary mt-1">{platformFeePercent}% Net</p>
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

      {/* Treasury Analytics & Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gross Earnings Graph */}
        <Card className="lg:col-span-2 bg-surface/30 border-border/60">
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground font-mono">Treasury Volume & Net Earnings</h3>
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

        {/* Dynamic Treasury Policy Control Card */}
        <Card className="bg-surface/30 border-border/60">
          <CardContent className="p-6 flex flex-col justify-between h-full gap-4">
            <div className="space-y-4">
              <div className="border-b border-border/40 pb-3">
                <h3 className="text-base font-bold text-foreground font-mono">Treasury Settings</h3>
                <p className="text-xs text-muted">Manage global platform fee parameters.</p>
              </div>

              {/* Platform Fee Control Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted uppercase font-bold block">
                  Platform Wager Fee (%) *
                </label>
                <div className="relative flex items-center">
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={feeInput}
                    onChange={e => {
                      const valStr = e.target.value;
                      setFeeInput(valStr);

                      if (valStr === '') {
                        updatePlatformFeePercent(0);
                        return;
                      }

                      let val = parseInt(valStr, 10);
                      if (!isNaN(val)) {
                        const clamped = Math.max(0, Math.min(10, val));
                        updatePlatformFeePercent(clamped);
                      }
                    }}
                    onBlur={() => {
                      if (feeInput === '' || isNaN(parseInt(feeInput, 10))) {
                        setFeeInput('0');
                        updatePlatformFeePercent(0);
                      } else {
                        const val = parseInt(feeInput, 10);
                        const clamped = Math.max(0, Math.min(10, val));
                        setFeeInput(clamped.toString());
                        updatePlatformFeePercent(clamped);
                      }
                    }}
                    className="bg-surface/40 text-xs font-mono h-10 pr-12 focus:border-primary"
                    placeholder="Enter fee rate..."
                  />
                  <div className="absolute right-3 font-mono text-xs text-muted select-none pointer-events-none">
                    %
                  </div>
                </div>
                <p className="text-[10px] text-muted font-mono leading-relaxed mt-1">
                  Adjust standard cashout/wager commission. Acceptable values: <strong>0% to 10%</strong>. Dynamic calculations update live.
                </p>
              </div>

              {/* Security Policy Summary */}
              <div className="p-3 bg-surface/40 border border-border/50 rounded-xl space-y-1.5">
                <span className="text-[9px] font-mono text-muted uppercase block font-bold">Policy Enforcements</span>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                  <span>Escrow locking protected</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                  <span>Auto-Settlement auditing</span>
                </div>
              </div>

              {/* Payment Gateways Status */}
              <div className="p-3 bg-surface/40 border border-border/50 rounded-xl space-y-1.5">
                <span className="text-[9px] font-mono text-muted uppercase block font-bold">Payment Gateways Status</span>
                <div className="flex items-center justify-between text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                    <span>USDT Node (TRC-20)</span>
                  </div>
                  <Badge variant="success" className="text-[8px] scale-90 px-1 py-0 font-mono bg-emerald-500/10 text-emerald-400 border-emerald-500/20">ACTIVE</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                    <span>Bank ACH Wire Rails</span>
                  </div>
                  <Badge variant="success" className="text-[8px] scale-90 px-1 py-0 font-mono bg-emerald-500/10 text-emerald-400 border-emerald-500/20">ONLINE</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></div>
                    <span>PayPal API Bridge</span>
                  </div>
                  <Badge variant="warning" className="text-[8px] scale-90 px-1 py-0 font-mono bg-amber-500/10 text-amber-400 border-amber-500/20">DEGRADED</Badge>
                </div>
              </div>
            </div>

            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-[10px] text-primary font-mono leading-normal">
              ℹ️ Standard rate is <strong>5%</strong>. Adjusting this will instantly scale payouts of all future wagers.
            </div>
          </CardContent>
        </Card>

      </div>

      {/* User Withdrawal & Payout Requests Table */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">User Withdrawal & Payout Requests</h3>
            <p className="text-xs text-muted font-mono">Audit conversion details, taxes, gas fees, and confirm disburse hashes.</p>
          </div>
          <Badge variant="warning">{pendingWithdrawalCount} Pending Operator Review</Badge>
        </div>

        <div className="border border-border/60 rounded-xl overflow-hidden bg-surface/20">
          <Table>
            <TableHeader className="bg-surface/60">
              <TableRow>
                <TableHead className="text-xs font-mono">Request ID</TableHead>
                <TableHead className="text-xs font-mono">User</TableHead>
                <TableHead className="text-xs font-mono">Method & Destination</TableHead>
                <TableHead className="text-xs font-mono">Amount</TableHead>
                <TableHead className="text-xs font-mono">Requested At</TableHead>
                <TableHead className="text-xs font-mono">Status</TableHead>
                <TableHead className="text-xs font-mono text-right">Arbitration Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedWithdrawals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted font-mono text-xs">
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
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-foreground font-mono">{req.payoutMethod || 'Crypto (USDT)'}</span>
                        <span className="font-mono text-[10px] text-muted truncate max-w-[200px]" title={req.payoutDetails}>
                          {req.payoutDetails || 'TY7H2jKx8L9PzQ10wsDmV3yTR5xzA9eS'}
                        </span>
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
                      <Button
                        size="sm"
                        variant={req.status === 'Pending' ? 'primary' : 'outline'}
                        glow={req.status === 'Pending'}
                        onClick={() => {
                          setSelectedRequest(req);
                          setTxHashInput(req.txHash || '');
                          setAdminNotesInput(req.adminNotes || '');
                        }}
                        className="h-7 px-3 text-[10px] font-mono"
                      >
                        {req.status === 'Pending' ? 'Manage Payout' : 'View Payout'}
                      </Button>
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

      {/* Payout Manager Sheet Drawer */}
      <Sheet open={!!selectedRequest} onOpenChange={(open) => {
        if (!open) setSelectedRequest(null);
      }}>
        <SheetContent side="right" className="w-full sm:max-w-xl bg-background border-l border-border p-6 overflow-y-auto font-sans">
          {selectedRequest && (
            <div className="flex flex-col gap-6 h-full justify-between">
              
              {/* Drawer Header */}
              <div className="flex flex-col gap-1.5 border-b border-border/40 pb-4">
                <span className="text-[10px] font-mono text-primary uppercase font-bold tracking-wider">
                  Disbursal Portal ({selectedRequest.status})
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  {selectedRequest.status === 'Pending' ? 'Manage Payout Request' : 'Audited Payout Details'}
                </h3>
                <p className="text-xs text-muted">Verify conversion parameters and settlement reference hash.</p>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 space-y-6 py-2 overflow-y-auto">
                
                {/* User Metadata */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-surface/30 border border-border/50 rounded-xl">
                  <div>
                    <span className="text-[9px] font-mono text-muted uppercase">Requester Username</span>
                    <p className="text-sm font-bold text-foreground mt-0.5">@{selectedRequest.username}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-muted uppercase">Requester User ID</span>
                    <p className="text-xs font-mono text-foreground mt-0.5">{selectedRequest.userId}</p>
                  </div>
                </div>

                {/* Conversion Ledger Breakdown */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-muted uppercase font-bold block">Conversion & Tax Breakdown</span>
                  <div className="p-4 bg-surface/20 border border-border/50 rounded-xl space-y-3 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted">Requested Amount:</span>
                      <span className="text-foreground font-bold">{selectedRequest.amount.toLocaleString()} BET</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Fiat Value (1-to-1):</span>
                      <span className="text-foreground font-bold">${selectedRequest.amount.toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between text-red-400">
                      <span>TDS Tax Deduction (1%):</span>
                      <span>- ${(selectedRequest.amount * 0.01).toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between text-red-400">
                      <span>Network Gas Fee ({selectedRequest.payoutMethod === 'Crypto (USDT)' ? 'TRC-20' : 'ACH Rails'}):</span>
                      <span>- ${(selectedRequest.payoutMethod === 'Crypto (USDT)' ? 1.50 : 5.00).toFixed(2)} USD</span>
                    </div>
                    <div className="pt-2 border-t border-border/30 flex justify-between text-sm font-bold text-emerald-400">
                      <span>Net Disbursal Value:</span>
                      <span>
                        ${Math.max(0, selectedRequest.amount - (selectedRequest.amount * 0.01) - (selectedRequest.payoutMethod === 'Crypto (USDT)' ? 1.5 : 5)).toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payout Channel Destination details */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-muted uppercase font-bold block">Payout Destination</span>
                  <div className="p-3 bg-surface/40 border border-border/60 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-mono text-primary font-bold uppercase block">{selectedRequest.payoutMethod || 'Crypto (USDT)'}</span>
                      <p className="text-xs font-mono text-foreground break-all select-all font-bold mt-0.5">
                        {selectedRequest.payoutDetails || 'TY7H2jKx8L9PzQ10wsDmV3yTR5xzA9eS'}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleCopyAddress(selectedRequest.payoutDetails || 'TY7H2jKx8L9PzQ10wsDmV3yTR5xzA9eS')}
                      className="p-2 bg-surface/50 border border-border hover:bg-surface/80 rounded-lg text-muted hover:text-foreground shrink-0 cursor-pointer"
                      title="Copy Address"
                    >
                      {copiedAddress ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Audit Bookkeeping TxHash / Ref ID */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-muted font-bold block">
                    {selectedRequest.payoutMethod === 'Crypto (USDT)' ? 'Blockchain TxHash / TxID' : 'Bank ACH Reference Code'}
                  </label>
                  
                  {selectedRequest.status === 'Pending' ? (
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={txHashInput}
                        onChange={e => setTxHashInput(e.target.value)}
                        placeholder={selectedRequest.payoutMethod === 'Crypto (USDT)' ? 'e.g. 0xf8e91c...2a' : 'e.g. TXN-BANK-10022'}
                        className="bg-surface/40 text-xs font-mono text-foreground flex-1"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateFakeTxHash(selectedRequest.payoutMethod || 'Crypto (USDT)')}
                        className="text-[10px] font-mono h-10 px-3 shrink-0"
                      >
                        ⚡ Auto-Gen
                      </Button>
                    </div>
                  ) : (
                    <div className="p-3 bg-surface/40 border border-border/50 rounded-xl font-mono text-xs text-foreground flex items-center justify-between">
                      <span className="truncate max-w-[320px]" title={selectedRequest.txHash}>{selectedRequest.txHash || 'None'}</span>
                      {selectedRequest.txHash && selectedRequest.payoutMethod === 'Crypto (USDT)' && (
                        <a 
                          href={`https://tronscan.org/#/transaction/${selectedRequest.txHash}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 text-[10px] font-bold"
                        >
                          Scan <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Admin Feedback Notes */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-muted font-bold block">Admin Audit Notes</label>
                  {selectedRequest.status === 'Pending' ? (
                    <Input
                      value={adminNotesInput}
                      onChange={e => setAdminNotesInput(e.target.value)}
                      placeholder="e.g. Approved and processed via blockchain hot wallet"
                      className="bg-surface/40 text-xs font-mono text-foreground"
                    />
                  ) : (
                    <div className="p-3 bg-surface/40 border border-border/50 rounded-xl text-xs text-muted font-sans">
                      {selectedRequest.adminNotes || 'No notes added.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-4 border-t border-border/40 flex justify-end gap-3 shrink-0">
                <Button type="button" variant="ghost" onClick={() => setSelectedRequest(null)} className="text-xs font-mono">
                  Close
                </Button>
                {selectedRequest.status === 'Pending' && (
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => handleReject(selectedRequest.id, selectedRequest.username, selectedRequest.amount, adminNotesInput)}
                      className="text-xs font-mono text-red-400 border-red-500/30 hover:bg-red-500/10 h-9"
                    >
                      Decline Request
                    </Button>
                    <Button 
                      type="button" 
                      variant="primary" 
                      glow
                      onClick={() => {
                        if (!txHashInput.trim()) {
                          showNotice('Transaction reference / TxHash is required to disburse funds.', 'warning');
                          return;
                        }
                        const tax = selectedRequest.amount * 0.01;
                        const fee = selectedRequest.payoutMethod === 'Crypto (USDT)' ? 1.5 : 5.0;
                        const net = Math.max(0, selectedRequest.amount - tax - fee);
                        handleApprove(selectedRequest.id, selectedRequest.username, selectedRequest.amount, txHashInput, tax, fee, net, adminNotesInput);
                      }}
                      className="text-xs font-mono bg-emerald-600 hover:bg-emerald-500 text-white h-9"
                    >
                      Mark as Disbursed
                    </Button>
                  </div>
                )}
              </div>

            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
