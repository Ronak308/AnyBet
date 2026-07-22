import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Smartphone,
  Clock,
  ShieldAlert,
  Search,
  Download,
  Printer,
  TrendingUp,
  Activity,
  Lock,
  FileText,
  ShieldCheck,
  Fingerprint,
  MessageSquare,
  Check,
  X,
  PauseCircle
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface PaymentTransaction {
  id: string
  txHash: string
  userId: string
  username: string
  type: 'Deposit' | 'Reward' | 'Bet Stake' | 'Bet Win' | 'Refund' | 'Withdrawal'
  amount: number
  status: 'Settled' | 'Pending' | 'Failed' | 'Compliance Hold'
  timestamp: string
  description?: string
  paymentMethod: 'Apple Pay' | 'Google Pay'
  twoFactorType: 'Biometric FaceID/TouchID' | 'SMS OTP' | 'Hardware Passkey'
  riskScore: number // 0 to 100
  riskFlags: string[]
  deviceToken?: string
  ipAddress?: string
  avatar?: string
  notes?: string
}

export interface PaymentAuditLog {
  id: string
  txId: string
  user: string
  paymentMethod: string
  amount: number
  status: string
  adminAction: string
  timestamp: string
  notes: string
}

// ─── Mock Data & Time-Series ────────────────────────────────────────────────

const MOCK_HOURLY_VOLUME_DATA = [
  { time: '00:00', applePay: 1200, googlePay: 800, total: 2000 },
  { time: '04:00', applePay: 2100, googlePay: 1100, total: 3200 },
  { time: '08:00', applePay: 3800, googlePay: 1900, total: 5700 },
  { time: '12:00', applePay: 6400, googlePay: 3100, total: 9500 },
  { time: '16:00', applePay: 8900, googlePay: 4200, total: 13100 },
  { time: '20:00', applePay: 11500, googlePay: 5250, total: 16750 }
]



const INITIAL_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'TX-WD-9901',
    txHash: '0x44b2...88f1',
    userId: 'usr-901',
    username: 'WhaleTrader_99',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    type: 'Withdrawal',
    amount: 125000, // > $50,000 High Value
    status: 'Pending',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    paymentMethod: 'Apple Pay',
    twoFactorType: 'Biometric FaceID/TouchID',
    riskScore: 84,
    riskFlags: ['High Value >$50k', 'Biometric Passkey Verified'],
    deviceToken: 'AP-HIGHVAL-9901-SEC',
    ipAddress: '172.56.12.99'
  },
  {
    id: 'TX-WD-9902',
    txHash: '0x33c1...22e4',
    userId: 'usr-902',
    username: 'VegasViper',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    type: 'Withdrawal',
    amount: 68000, // > $50,000 High Value
    status: 'Pending',
    timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    paymentMethod: 'Google Pay',
    twoFactorType: 'SMS OTP',
    riskScore: 68,
    riskFlags: ['High Value >$50k', 'SMS OTP Audit'],
    deviceToken: 'GP-HIGHVAL-9902-SEC',
    ipAddress: '10.0.4.12'
  },
  {
    id: 'TX-AP-9083',
    txHash: '0x99a2...11b4',
    userId: 'usr-103',
    username: 'BetMaster99',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    type: 'Withdrawal',
    amount: 14500,
    status: 'Pending',
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    paymentMethod: 'Apple Pay',
    twoFactorType: 'Biometric FaceID/TouchID',
    riskScore: 45,
    riskFlags: ['Biometric Passkey Required'],
    deviceToken: 'AP-TOKEN-11B4-SEC',
    ipAddress: '172.16.0.12'
  },
  {
    id: 'TX-AP-9081',
    txHash: '0x8f2a...91a2',
    userId: 'usr-101',
    username: 'CryptoKing',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    type: 'Deposit',
    amount: 1500,
    status: 'Settled',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    paymentMethod: 'Apple Pay',
    twoFactorType: 'Biometric FaceID/TouchID',
    riskScore: 12,
    riskFlags: [],
    deviceToken: 'AP-TOKEN-9081-SEC',
    ipAddress: '192.168.1.104'
  },
  {
    id: 'TX-GP-9082',
    txHash: '0x3b1c...44e1',
    userId: 'usr-102',
    username: 'HighRoller_88',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    type: 'Deposit',
    amount: 5000,
    status: 'Settled',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    paymentMethod: 'Google Pay',
    twoFactorType: 'Biometric FaceID/TouchID',
    riskScore: 78,
    riskFlags: ['High Value Deposit', 'Rapid Successive Attempt'],
    deviceToken: 'GP-TOKEN-44E1-SEC',
    ipAddress: '10.0.0.52'
  },
  {
    id: 'TX-GP-9085',
    txHash: '0x11e4...88a1',
    userId: 'usr-105',
    username: 'SatoshiSam',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    type: 'Deposit',
    amount: 10000,
    status: 'Failed',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    paymentMethod: 'Apple Pay',
    twoFactorType: 'SMS OTP',
    riskScore: 92,
    riskFlags: ['Bank Card Decline', 'Duplicate Token Attempt'],
    deviceToken: 'AP-TOKEN-88A1-SEC',
    ipAddress: '45.33.12.99'
  }
]

const INITIAL_AUDIT_LOGS: PaymentAuditLog[] = [
  {
    id: 'LOG-101',
    txId: 'TX-WD-9901',
    user: 'WhaleTrader_99',
    paymentMethod: 'Apple Pay',
    amount: 125000,
    status: 'Pending Review',
    adminAction: 'High Value Flagged (> $50k)',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    notes: 'Payout exceeds $50,000 threshold. Biometric FaceID 2FA token verified.'
  },
  {
    id: 'LOG-102',
    txId: 'TX-GP-9082',
    user: 'HighRoller_88',
    paymentMethod: 'Google Pay',
    amount: 5000,
    status: 'Settled',
    adminAction: 'Approved Fast Deposit',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    notes: 'Deposit cleared automatically via Google Pay secure token'
  }
]

// ─── Custom Recharts Tooltip ────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs font-sans space-y-1">
        <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-mono font-bold text-white">${entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// ─── Main Component ─────────────────────────────────────────────────────────

export const PaymentsModule: React.FC = () => {
  // Transactions & Audit Logs State
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(INITIAL_TRANSACTIONS)
  const [auditLogs, setAuditLogs] = useState<PaymentAuditLog[]>(INITIAL_AUDIT_LOGS)

  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'analytics' | 'withdrawals' | 'fraud' | 'audit'>('overview')

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('')

  // Slide-over & Modal Drawer States
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null)
  const [rejectModalTx, setRejectModalTx] = useState<PaymentTransaction | null>(null)
  const [rejectNoteInput, setRejectNoteInput] = useState('')

  // Toast Helper
  const showNotice = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }))
    }
  }

  // ─── Dynamic Metrics ───────────────────────────────────────────────────────

  const kpis = useMemo(() => {
    const applePayTxs = transactions.filter(t => t.paymentMethod === 'Apple Pay')
    const googlePayTxs = transactions.filter(t => t.paymentMethod === 'Google Pay')

    const applePayVol = applePayTxs.reduce((sum, t) => sum + t.amount, 0)
    const googlePayVol = googlePayTxs.reduce((sum, t) => sum + t.amount, 0)

    const depositsToday = transactions
      .filter(t => t.type === 'Deposit' && t.status === 'Settled')
      .reduce((sum, t) => sum + t.amount, 0)

    const withdrawalsToday = transactions
      .filter(t => t.type === 'Withdrawal')
      .reduce((sum, t) => sum + t.amount, 0)

    const successfulCount = transactions.filter(t => t.status === 'Settled').length
    const pendingCount = transactions.filter(t => t.status === 'Pending').length
    const failedCount = transactions.filter(t => t.status === 'Failed').length

    const platformRevenue = Math.round((applePayVol + googlePayVol) * 0.035)

    return {
      depositsToday,
      withdrawalsToday,
      applePayVol,
      googlePayVol,
      successfulCount,
      pendingCount,
      failedCount,
      refundedCount: 1,
      platformRevenue
    }
  }, [transactions])

  // Filtered Transactions
  const filteredTxs = useMemo(() => {
    return transactions.filter(tx =>
      tx.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [transactions, searchQuery])

  // ─── 1-Click Withdrawal Actions ──────────────────────────────────────────

  // 1. Approve Payout
  const handleApprovePayout = (tx: PaymentTransaction) => {
    setTransactions(prev =>
      prev.map(t => (t.id === tx.id ? { ...t, status: 'Settled' as const } : t))
    )

    const newLog: PaymentAuditLog = {
      id: `LOG-${Date.now()}`,
      txId: tx.id,
      user: tx.username,
      paymentMethod: tx.paymentMethod,
      amount: tx.amount,
      status: 'Approved & Released',
      adminAction: tx.amount > 50000 ? 'High Value (> $50k) Payout Approved' : 'Payout Approved',
      timestamp: new Date().toISOString(),
      notes: `1-Click Instant Release. Authenticated via ${tx.twoFactorType}.`
    }
    setAuditLogs(prev => [newLog, ...prev])

    showNotice(`Withdrawal ${tx.id} for $${tx.amount.toLocaleString()} Approved & Released!`, 'success')
  }

  // 2. Hold for Compliance
  const handleHoldPayout = (tx: PaymentTransaction) => {
    setTransactions(prev =>
      prev.map(t => (t.id === tx.id ? { ...t, status: 'Compliance Hold' as const } : t))
    )

    const newLog: PaymentAuditLog = {
      id: `LOG-${Date.now()}`,
      txId: tx.id,
      user: tx.username,
      paymentMethod: tx.paymentMethod,
      amount: tx.amount,
      status: 'Compliance Hold',
      adminAction: 'Hold for Compliance Audit',
      timestamp: new Date().toISOString(),
      notes: `Flagged for secondary AML/KYC review. Risk Score: ${tx.riskScore}`
    }
    setAuditLogs(prev => [newLog, ...prev])

    showNotice(`Withdrawal ${tx.id} placed on Compliance Hold.`, 'warning')
  }

  // 3. Open Reject Modal
  const handleOpenRejectModal = (tx: PaymentTransaction) => {
    setRejectModalTx(tx)
    setRejectNoteInput('')
  }

  // Submit Rejection
  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectModalTx) return

    const note = rejectNoteInput.trim() || 'Rejected due to risk compliance policy.'

    setTransactions(prev =>
      prev.map(t => (t.id === rejectModalTx.id ? { ...t, status: 'Failed' as const, notes: note } : t))
    )

    const newLog: PaymentAuditLog = {
      id: `LOG-${Date.now()}`,
      txId: rejectModalTx.id,
      user: rejectModalTx.username,
      paymentMethod: rejectModalTx.paymentMethod,
      amount: rejectModalTx.amount,
      status: 'Rejected',
      adminAction: 'Withdrawal Rejected',
      timestamp: new Date().toISOString(),
      notes: note
    }
    setAuditLogs(prev => [newLog, ...prev])

    showNotice(`Withdrawal ${rejectModalTx.id} Rejected. Logged to Audit Trail.`, 'warning')
    setRejectModalTx(null)
    setRejectNoteInput('')
  }

  // CSV Export
  const handleExportCSV = () => {
    const headers = 'Transaction ID,User,Payment Method,Type,Amount,Status,Risk Score,2FA Type,Timestamp\n'
    const rows = filteredTxs
      .map(t => `${t.id},${t.username},${t.paymentMethod},${t.type},${t.amount},${t.status},${t.riskScore},${t.twoFactorType},${t.timestamp}`)
      .join('\n')

    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Payment_Report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    showNotice('Payment transactions report exported successfully!', 'success')
  }

  // Print Report
  const handlePrint = () => {
    window.print()
  }

  // Withdrawal Queue Stats
  const withdrawalPendingTxs = useMemo(() => transactions.filter(t => t.type === 'Withdrawal' && t.status === 'Pending'), [transactions])
  const totalPendingWithdrawalVal = useMemo(() => withdrawalPendingTxs.reduce((sum, t) => sum + t.amount, 0), [withdrawalPendingTxs])

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Sleek Underline Sub-Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'ledger', label: 'Master Ledger', icon: FileText },
            { id: 'analytics', label: 'Deposit Analytics', icon: TrendingUp },
            { id: 'withdrawals', label: 'Withdrawal Queue', icon: Lock, count: withdrawalPendingTxs.length },
            { id: 'fraud', label: 'Risk & Fraud', icon: ShieldAlert },
            { id: 'audit', label: 'Audit Logs', icon: Clock }
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-3.5 py-2 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap rounded-lg ${
                  isActive
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-extrabold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Quick Export Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCSV}
            size="sm"
            variant="outline"
            className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" /> Export CSV
          </Button>
          <Button
            onClick={handlePrint}
            size="sm"
            variant="outline"
            className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" /> Print
          </Button>
        </div>
      </div>

      {/* ─── TAB 1: DASHBOARD OVERVIEW ─── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* INSTANT DEPOSIT TELEMETRY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-900/60 border-slate-800/80 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Apple Pay Direct</h3>
                    <p className="text-[11px] text-slate-400">iOS Native Secure Enclave</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-emerald-400">${kpis.applePayVol.toLocaleString()}</span>
                  <span className="block text-[10px] text-slate-500 font-mono">67.5% Share</span>
                </div>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-slate-800 text-slate-400">
                <span>Success: <strong className="text-emerald-400">99.6%</strong></span>
                <span>Latency: <strong className="text-white font-mono">0.018s</strong></span>
                <span>Status: <strong className="text-emerald-400">Active</strong></span>
              </div>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800/80 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Google Pay Direct</h3>
                    <p className="text-[11px] text-slate-400">Android Passkey Token API</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-blue-400">${kpis.googlePayVol.toLocaleString()}</span>
                  <span className="block text-[10px] text-slate-500 font-mono">32.5% Share</span>
                </div>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-slate-800 text-slate-400">
                <span>Success: <strong className="text-emerald-400">99.2%</strong></span>
                <span>Latency: <strong className="text-white font-mono">0.024s</strong></span>
                <span>Status: <strong className="text-emerald-400">Active</strong></span>
              </div>
            </Card>
          </div>

          {/* 9 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-slate-900/60 border-slate-800/80 p-4 rounded-xl">
              <span className="text-xs text-slate-400 block font-medium">Total Deposits Today</span>
              <div className="text-2xl font-extrabold text-white mt-1">${kpis.depositsToday.toLocaleString()}</div>
            </Card>
            <Card className="bg-slate-900/60 border-slate-800/80 p-4 rounded-xl">
              <span className="text-xs text-slate-400 block font-medium">Total Withdrawals Today</span>
              <div className="text-2xl font-extrabold text-white mt-1">${kpis.withdrawalsToday.toLocaleString()}</div>
            </Card>
            <Card className="bg-slate-900/60 border-slate-800/80 p-4 rounded-xl">
              <span className="text-xs text-slate-400 block font-medium">Platform Fee Revenue</span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">${kpis.platformRevenue.toLocaleString()}</div>
            </Card>
          </div>

          {/* Recharts Chart */}
          <Card className="bg-slate-900/60 border-slate-800/80 p-5 rounded-xl space-y-4">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Hourly Deposit Trend</h4>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_HOURLY_VOLUME_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={val => `$${val}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="applePay" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                  <Area type="monotone" dataKey="googlePay" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* ─── TAB 2: MASTER TRANSACTION LEDGER ─── */}
      {activeTab === 'ledger' && (
        <Card className="bg-slate-900/60 border-slate-800/80 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-sm">Master Payment Ledger</h3>
              <p className="text-xs text-slate-400">Real-time ledger of Apple Pay & Google Pay transactions</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search user..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[11px]">
                  <th className="py-2.5 px-3">Tx ID</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">2FA</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTxs.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-300">{tx.id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-200">{tx.username}</td>
                    <td className="py-3 px-3 text-emerald-400 font-medium">{tx.paymentMethod}</td>
                    <td className="py-3 px-3 text-slate-300">{tx.type}</td>
                    <td className="py-3 px-3 font-bold text-white">${tx.amount.toLocaleString()}</td>
                    <td className="py-3 px-3 text-slate-400">{tx.twoFactorType === 'Biometric FaceID/TouchID' ? 'FaceID' : 'SMS OTP'}</td>
                    <td className="py-3 px-3 font-bold text-emerald-400">{tx.status}</td>
                    <td className="py-3 px-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedTx(tx)} className="text-xs text-emerald-400 hover:text-white">
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ─── TAB 3: DEPOSIT ANALYTICS ─── */}
      {activeTab === 'analytics' && (
        <Card className="bg-slate-900/60 border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-white text-sm">Channel Analytics</h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-emerald-400">Apple Pay Direct</span>
              <div className="text-2xl font-black text-white">${kpis.applePayVol.toLocaleString()}</div>
              <span className="text-slate-400 block">67.5% market share</span>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-blue-400">Google Pay</span>
              <div className="text-2xl font-black text-white">${kpis.googlePayVol.toLocaleString()}</div>
              <span className="text-slate-400 block">32.5% market share</span>
            </div>
          </div>
        </Card>
      )}

      {/* ─── TAB 4: ULTRA-CLEAN STRIPE-STYLE DATA TABLE WITHDRAWAL QUEUE ─── */}
      {activeTab === 'withdrawals' && (
        <Card className="bg-slate-900/60 border-slate-800/80 p-5 rounded-2xl space-y-4 shadow-xl">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                Withdrawal Approval Queue
              </h3>
              <p className="text-xs text-slate-400">Biometric 2FA verification & high-value payout authorization (&gt; $50,000 threshold)</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                Pending: <strong className="text-amber-400">{withdrawalPendingTxs.length}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                Total Value: <strong className="text-emerald-400">${totalPendingWithdrawalVal.toLocaleString()}</strong>
              </span>
            </div>
          </div>

          {/* Clean Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3">User / ID</th>
                  <th className="py-3 px-3">Gateway</th>
                  <th className="py-3 px-3">Requested Payout</th>
                  <th className="py-3 px-3">2FA Audit</th>
                  <th className="py-3 px-3">Risk Score</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions
                  .filter(t => t.type === 'Withdrawal')
                  .map(w => {
                    const isHighValue = w.amount >= 50000

                    return (
                      <tr key={w.id} className="hover:bg-slate-800/30 transition-colors">
                        {/* User & ID */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            {w.avatar && (
                              <img src={w.avatar} alt={w.username} className="w-8 h-8 rounded-full border border-slate-700 object-cover" />
                            )}
                            <div>
                              <div className="font-bold text-slate-100">{w.username}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{w.id}</div>
                            </div>
                          </div>
                        </td>

                        {/* Gateway */}
                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-300 flex items-center gap-1">
                            <Smartphone className={`w-3.5 h-3.5 ${w.paymentMethod === 'Apple Pay' ? 'text-emerald-400' : 'text-blue-400'}`} />
                            {w.paymentMethod}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-white text-sm">${w.amount.toLocaleString()}</span>
                            {isHighValue && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-extrabold">
                                &gt; $50k
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 2FA Audit */}
                        <td className="py-3 px-3">
                          {w.twoFactorType === 'Biometric FaceID/TouchID' ? (
                            <span className="text-emerald-400 font-medium flex items-center gap-1">
                              <Fingerprint className="w-3.5 h-3.5" /> FaceID Verified
                            </span>
                          ) : (
                            <span className="text-amber-400 font-medium flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5" /> SMS OTP Verified
                            </span>
                          )}
                        </td>

                        {/* Risk Score */}
                        <td className="py-3 px-3">
                          <span className={`font-bold ${w.riskScore > 70 ? 'text-rose-400' : w.riskScore > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {w.riskScore} / 100
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <span className={`font-bold text-xs ${w.status === 'Settled' ? 'text-emerald-400' : w.status === 'Pending' ? 'text-amber-400' : w.status === 'Compliance Hold' ? 'text-purple-400' : 'text-rose-400'}`}>
                            {w.status}
                          </span>
                        </td>

                        {/* Actions Toolbar */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {w.status !== 'Settled' && (
                              <button
                                title="Approve Payout"
                                onClick={() => handleApprovePayout(w)}
                                className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer border border-emerald-500/30"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}

                            {w.status !== 'Compliance Hold' && w.status !== 'Settled' && (
                              <button
                                title="Hold for Compliance"
                                onClick={() => handleHoldPayout(w)}
                                className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-all cursor-pointer border border-amber-500/30"
                              >
                                <PauseCircle className="w-4 h-4" />
                              </button>
                            )}

                            {w.status !== 'Failed' && (
                              <button
                                title="Reject with Notes"
                                onClick={() => handleOpenRejectModal(w)}
                                className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white transition-all cursor-pointer border border-rose-500/30"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ─── TAB 5: RISK & FRAUD ─── */}
      {activeTab === 'fraud' && (
        <Card className="bg-slate-900/60 border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" /> High Severity Risk Flags
          </h3>
          <div className="space-y-2">
            {transactions.filter(t => t.riskScore >= 70).map(t => (
              <div key={t.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs flex justify-between items-center">
                <div>
                  <span className="font-mono font-bold text-rose-400">{t.id}</span>
                  <span className="text-slate-300 ml-2">{t.username} — ${t.amount.toLocaleString()}</span>
                </div>
                <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30">Score: {t.riskScore}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ─── TAB 6: AUDIT LOGS ─── */}
      {activeTab === 'audit' && (
        <Card className="bg-slate-900/60 border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" /> Admin Audit Log Trail
          </h3>
          <div className="space-y-2">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-200">{log.adminAction}</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">{log.notes}</p>
                </div>
                <span className="font-mono text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ─── REJECT WITH AUDIT NOTES MODAL ─── */}
      <AnimatePresence>
        {rejectModalTx && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-white text-sm">Reject Payout & Log Audit Note</h3>
                <button onClick={() => setRejectModalTx(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>User / ID:</span>
                  <strong className="text-white font-mono">{rejectModalTx.username} ({rejectModalTx.id})</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Amount:</span>
                  <strong className="text-rose-400 font-bold">${rejectModalTx.amount.toLocaleString()}</strong>
                </div>
              </div>

              <form onSubmit={handleConfirmReject} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Audit Note Reason *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter compliance reason for rejection..."
                    value={rejectNoteInput}
                    onChange={e => setRejectNoteInput(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <Button type="button" variant="ghost" onClick={() => setRejectModalTx(null)} className="text-xs text-slate-400">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer">
                    Confirm Rejection
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-over Inspection Sheet Drawer */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-md bg-slate-900 border-l border-slate-800 p-6 h-full overflow-y-auto space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-extrabold text-white text-base">Transaction Details</h3>
                </div>
                <button onClick={() => setSelectedTx(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Tx Token:</span>
                    <span className="font-mono text-emerald-400 font-bold">{selectedTx.txHash}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>IP Address:</span>
                    <span className="font-mono text-slate-200">{selectedTx.ipAddress}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">ID:</span>
                    <span className="font-mono font-bold text-white">{selectedTx.id}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">User:</span>
                    <span className="font-bold text-white">{selectedTx.username}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Amount:</span>
                    <span className="text-emerald-400 font-black text-sm">${selectedTx.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
