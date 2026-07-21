import React from 'react'
import { motion } from 'framer-motion'
import { 
  Cpu, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Activity, 
  TrendingUp, 
  RefreshCw, 
  Shield, 
  ListFilter,
  FileText,
  Play
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { useOracle } from '../../context/OracleContext'
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts'

interface OracleControlCenterProps {
  onNavigateToSettlement: () => void
  onNavigateToLogs: () => void
  onNavigateToConfig: () => void
}

// Recharts Mock Datasets
const requests24hData = [
  { time: '00:00', requests: 120, latency: 95 },
  { time: '04:00', requests: 85, latency: 88 },
  { time: '08:00', requests: 240, latency: 110 },
  { time: '12:00', requests: 480, latency: 135 },
  { time: '16:00', requests: 390, latency: 120 },
  { time: '20:00', requests: 520, latency: 128 },
  { time: '24:00', requests: 310, latency: 105 }
]


const settlementVolumeData = [
  { category: 'Sports', volume: 420 },
  { category: 'Physical', volume: 280 },
  { category: 'Prediction', volume: 590 },
  { category: 'Performance', volume: 150 },
  { category: 'Custom', volume: 90 }
]

const autoVsManualData = [
  { name: 'Auto Settled (86%)', value: 86, color: '#10B981' },
  { name: 'Manual Review (14%)', value: 14, color: '#F59E0B' }
]

export const OracleControlCenter: React.FC<OracleControlCenterProps> = ({
  onNavigateToSettlement,
  onNavigateToLogs,
  onNavigateToConfig
}) => {
  const { kpis, activityLogs, showToast, isEmergencyShutdown } = useOracle()

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 w-full font-sans select-none"
    >
      {/* Emergency Alert Banner if Active */}
      {isEmergencyShutdown && (
        <div className="p-4 bg-red-950/60 border border-red-500/40 rounded-xl flex items-center justify-between text-red-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              GLOBAL EMERGENCY SHUTDOWN ACTIVE — Autonomous Oracles Suspended
            </span>
          </div>
          <Button size="sm" variant="danger" onClick={onNavigateToConfig} className="text-xs font-mono">
            Go to Config
          </Button>
        </div>
      )}

      {/* 8 Enterprise KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Nodes */}
        <motion.div variants={itemVariants}>
          <Card className="bg-surface/30 border-border/60 hover:border-primary/40 transition-colors">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Active Oracle Nodes</span>
                <span className="p-2 bg-primary/10 border border-primary/20 text-primary rounded-lg">
                  <Cpu className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="text-2xl font-bold font-mono text-foreground">{kpis.activeNodes} <span className="text-xs text-muted font-normal">/ {kpis.totalNodes}</span></p>
                <Badge variant="success" className="text-[9px]">100% ONLINE</Badge>
              </div>
              <div className="mt-2 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +2 nodes added this month
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 2: Pending Settlements */}
        <motion.div variants={itemVariants}>
          <Card className="bg-surface/30 border-border/60 hover:border-primary/40 transition-colors">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Pending Settlements</span>
                <span className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
                  <Clock className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="text-2xl font-bold font-mono text-amber-400">{kpis.pendingSettlements}</p>
                <Badge variant="warning" className="text-[9px]">QUEUE ACTIVE</Badge>
              </div>
              <div className="mt-2 text-[10px] font-mono text-muted flex items-center gap-1">
                <span>Avg wait time: 45 sec</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 3: Today's AI Decisions */}
        <motion.div variants={itemVariants}>
          <Card className="bg-surface/30 border-border/60 hover:border-primary/40 transition-colors">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Today's AI Decisions</span>
                <span className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                  <Zap className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="text-2xl font-bold font-mono text-emerald-400">{kpis.todaysDecisions}</p>
                <Badge variant="pro" className="text-[9px]">HIGH VOL</Badge>
              </div>
              <div className="mt-2 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +14.2% vs yesterday
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 4: Manual Reviews */}
        <motion.div variants={itemVariants}>
          <Card className="bg-surface/30 border-border/60 hover:border-primary/40 transition-colors">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Manual Reviews</span>
                <span className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg">
                  <Shield className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="text-2xl font-bold font-mono text-purple-400">{kpis.manualReviews}</p>
                <Badge variant="outline" className="text-[9px]">FLAGGED</Badge>
              </div>
              <div className="mt-2 text-[10px] font-mono text-muted">
                Requires operator signoff
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 5: Average AI Confidence */}
        <motion.div variants={itemVariants}>
          <Card className="bg-surface/30 border-border/60 hover:border-primary/40 transition-colors">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Average AI Confidence</span>
                <span className="p-2 bg-primary/10 border border-primary/20 text-primary rounded-lg">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="text-2xl font-bold font-mono text-primary">{kpis.avgConfidence}%</p>
                <Badge variant="success" className="text-[9px]">OPTIMAL</Badge>
              </div>
              <div className="mt-2 text-[10px] font-mono text-emerald-400">
                Target: ≥ 95.0%
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 6: Settlement Success Rate */}
        <motion.div variants={itemVariants}>
          <Card className="bg-surface/30 border-border/60 hover:border-primary/40 transition-colors">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Settlement Success Rate</span>
                <span className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                  <Activity className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="text-2xl font-bold font-mono text-emerald-400">{kpis.successRate}%</p>
                <Badge variant="success" className="text-[9px]">EXCELLENT</Badge>
              </div>
              <div className="mt-2 text-[10px] font-mono text-muted">
                0.02% dispute rate
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 7: API Response Time */}
        <motion.div variants={itemVariants}>
          <Card className="bg-surface/30 border-border/60 hover:border-primary/40 transition-colors">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">API Response Time</span>
                <span className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg">
                  <Zap className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="text-2xl font-bold font-mono text-cyan-400">{kpis.avgLatencyMs} ms</p>
                <Badge variant="pro" className="text-[9px]">ULTRA FAST</Badge>
              </div>
              <div className="mt-2 text-[10px] font-mono text-emerald-400">
                -12ms faster than baseline
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 8: Failed Requests */}
        <motion.div variants={itemVariants}>
          <Card className="bg-surface/30 border-border/60 hover:border-primary/40 transition-colors">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Failed Requests</span>
                <span className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                  <AlertTriangle className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="text-2xl font-bold font-mono text-red-400">{kpis.failedRequests}</p>
                <Badge variant="outline" className="text-[9px]">LOW</Badge>
              </div>
              <div className="mt-2 text-[10px] font-mono text-muted">
                Auto-retried successfully
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>

      {/* Quick Actions Bar */}
      <div className="p-4 bg-surface/30 border border-border/60 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase text-muted tracking-wider font-bold">Quick Actions:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="primary" glow onClick={onNavigateToSettlement} className="gap-1.5 text-xs font-mono">
            <ListFilter className="h-3.5 w-3.5" /> Open Settlement Queue
          </Button>
          <Button size="sm" variant="outline" onClick={onNavigateToLogs} className="gap-1.5 text-xs font-mono">
            <FileText className="h-3.5 w-3.5" /> View AI Logs
          </Button>
          <Button size="sm" variant="outline" onClick={() => showToast('Simulating Oracle ping test...', 'info')} className="gap-1.5 text-xs font-mono">
            <Play className="h-3.5 w-3.5 text-emerald-400" /> Test Oracle Ping
          </Button>
          <Button size="sm" variant="ghost" onClick={() => showToast('Telemetry status refreshed', 'success')} className="gap-1.5 text-xs font-mono">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Status
          </Button>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: AI Requests 24h AreaChart (8 cols) */}
        <div className="lg:col-span-8">
          <Card className="bg-surface/30 border-border/60 h-full flex flex-col justify-between">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-mono uppercase text-foreground">AI Requests & Latency (24 Hours)</CardTitle>
                <span className="text-[10px] font-mono text-muted">Throughput per 4-hour window</span>
              </div>
              <Badge variant="outline" className="text-[9px]">REAL-TIME</Badge>
            </CardHeader>
            <CardContent className="pt-4 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={requests24hData}>
                  <defs>
                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8026FF" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8026FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D243F" />
                  <XAxis dataKey="time" stroke="#71717A" fontSize={10} fontFamily="monospace" />
                  <YAxis stroke="#71717A" fontSize={10} fontFamily="monospace" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#151221', borderColor: '#2D243F', fontSize: '12px', fontFamily: 'monospace' }}
                  />
                  <Area type="monotone" dataKey="requests" stroke="#8026FF" fillOpacity={1} fill="url(#colorRequests)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Chart 2: Auto vs Manual Settlements Donut Chart (4 cols) */}
        <div className="lg:col-span-4">
          <Card className="bg-surface/30 border-border/60 h-full flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase text-foreground">Auto vs Manual Settlements</CardTitle>
              <span className="text-[10px] font-mono text-muted">Resolution distribution</span>
            </CardHeader>
            <CardContent className="pt-2 flex flex-col items-center justify-center h-[280px]">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={autoVsManualData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {autoVsManualData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#151221', borderColor: '#2D243F', fontSize: '11px', fontFamily: 'monospace' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 text-xs font-mono mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span>Auto (86%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span>Manual (14%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Live Activity Stream Feed & Confidence Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Live Activity Stream (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="bg-surface/30 border-border/60">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-border/40">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <CardTitle className="text-sm font-mono uppercase text-foreground">Live Oracle Activity Stream</CardTitle>
              </div>
              <span className="text-[10px] font-mono text-muted uppercase">Auto-updating feed</span>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {activityLogs.map((log) => (
                <div key={log.id} className="p-3 bg-surface/20 border border-border/30 rounded-lg flex items-start justify-between gap-3 text-xs font-mono">
                  <div className="flex items-start gap-2.5">
                    <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                      log.type === 'success' ? 'bg-emerald-400' : log.type === 'warning' ? 'bg-amber-400' : 'bg-primary'
                    }`} />
                    <div>
                      <p className="text-foreground/90 font-sans">{log.message}</p>
                      {log.provider && <span className="text-[10px] text-muted">Source: {log.provider}</span>}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted shrink-0">{log.timestamp}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Confidence Trend BarChart (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="bg-surface/30 border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase text-foreground">Category Settlement Volume</CardTitle>
              <span className="text-[10px] font-mono text-muted">Settled volume by category</span>
            </CardHeader>
            <CardContent className="pt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={settlementVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D243F" />
                  <XAxis dataKey="category" stroke="#71717A" fontSize={10} fontFamily="monospace" />
                  <YAxis stroke="#71717A" fontSize={10} fontFamily="monospace" />
                  <Tooltip contentStyle={{ backgroundColor: '#151221', borderColor: '#2D243F', fontSize: '11px', fontFamily: 'monospace' }} />
                  <Bar dataKey="volume" fill="#00E0FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

      </div>

    </motion.div>
  )
}
