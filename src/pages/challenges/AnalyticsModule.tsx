import React, { useState } from 'react'
import { 
  Download, 
  Calendar, 
  FileText
} from 'lucide-react'
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { useChallenges } from '../../context/ChallengesContext'

export const AnalyticsModule: React.FC = () => {
  const { challenges, exportCSV, exportPDF } = useChallenges()
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  // Calculated Metrics
  const totalChallenges = challenges.length
  const liveCount = challenges.filter(c => c.status === 'Live').length
  const completedCount = challenges.filter(c => c.status === 'Completed').length
  const disputedCount = challenges.filter(c => c.status === 'Disputed').length
  const totalVolume = challenges.reduce((sum, c) => sum + c.prizePool, 0)
  const totalFees = challenges.reduce((sum, c) => sum + (c.financials?.platformFee || 0), 0)

  // Chart Data Series
  const creationTrendData = [
    { day: 'Mon', challenges: 12, volume: 45000 },
    { day: 'Tue', challenges: 18, volume: 68000 },
    { day: 'Wed', challenges: 15, volume: 52000 },
    { day: 'Thu', challenges: 25, volume: 95000 },
    { day: 'Fri', challenges: 32, volume: 140000 },
    { day: 'Sat', challenges: 40, volume: 185000 },
    { day: 'Sun', challenges: 28, volume: 110000 }
  ]

  const categoryDistributionData = [
    { name: 'Sports', value: 35, color: '#3B82F6' },
    { name: 'Physical', value: 25, color: '#10B981' },
    { name: 'Prediction', value: 20, color: '#8B5CF6' },
    { name: 'Performance', value: 12, color: '#F59E0B' },
    { name: 'Custom', value: 8, color: '#EC4899' }
  ]

  const typeData = [
    { type: 'Binary Option', count: 42 },
    { type: 'Time Trial', count: 28 },
    { type: 'Group Goal', count: 19 },
    { type: 'Peer Wager', count: 15 },
    { type: 'Match Winner', count: 12 }
  ]

  return (
    <div className="flex flex-col gap-6">

      {/* Controls Bar */}
      <div className="flex items-center justify-end gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-surface/40 border border-border/60 rounded-lg px-2.5 py-1 text-xs font-mono">
          <Calendar className="h-3.5 w-3.5 text-muted" />
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value as any)}
            className="bg-transparent text-foreground outline-none cursor-pointer"
          >
            <option value="7d" className="bg-background text-foreground">Last 7 Days</option>
            <option value="30d" className="bg-background text-foreground">Last 30 Days</option>
            <option value="90d" className="bg-background text-foreground">Last 90 Days</option>
            <option value="all" className="bg-background text-foreground">All Time</option>
          </select>
        </div>

        <Button
          variant="outline"
          onClick={exportCSV}
          className="gap-1.5 text-xs font-mono border-primary/30 text-primary hover:bg-primary/10"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>

        <Button
          variant="primary"
          glow
          onClick={exportPDF}
          className="gap-1.5 text-xs font-mono"
        >
          <FileText className="h-3.5 w-3.5" /> Export PDF Report
        </Button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="bg-surface/30 border-border/50">
          <CardContent className="p-3">
            <span className="text-[9px] font-mono text-muted uppercase">Total Challenges</span>
            <p className="text-xl font-bold font-mono text-foreground mt-1">{totalChallenges}</p>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border-border/50">
          <CardContent className="p-3">
            <span className="text-[9px] font-mono text-muted uppercase">Live Challenges</span>
            <p className="text-xl font-bold font-mono text-emerald-400 mt-1">{liveCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border-border/50">
          <CardContent className="p-3">
            <span className="text-[9px] font-mono text-muted uppercase">Completed</span>
            <p className="text-xl font-bold font-mono text-blue-400 mt-1">{completedCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border-border/50">
          <CardContent className="p-3">
            <span className="text-[9px] font-mono text-muted uppercase">Disputed</span>
            <p className="text-xl font-bold font-mono text-red-400 mt-1">{disputedCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border-border/50">
          <CardContent className="p-3">
            <span className="text-[9px] font-mono text-muted uppercase">Prize Volume</span>
            <p className="text-xl font-bold font-mono text-purple-400 mt-1">{(totalVolume / 1000).toFixed(1)}k BET</p>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border-border/50">
          <CardContent className="p-3">
            <span className="text-[9px] font-mono text-muted uppercase">Platform Revenue (5%)</span>
            <p className="text-xl font-bold font-mono text-amber-400 mt-1">{totalFees.toLocaleString()} BET</p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Challenge Creation & Volume Area Chart */}
        <Card className="lg:col-span-2 bg-surface/30 border-border/60">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold font-sans text-foreground">Challenge Creation & Volume Trend</h4>
                <p className="text-[11px] font-mono text-muted mt-0.5">Daily wagers published & total BET volume</p>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] border-primary/30 text-primary">REAL-TIME</Badge>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={creationTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8026FF" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8026FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#8A8F9D" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#8A8F9D" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#151221', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }} 
                  />
                  <Area type="monotone" dataKey="volume" stroke="#8026FF" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown Pie Chart */}
        <Card className="bg-surface/30 border-border/60">
          <CardContent className="p-5 space-y-4">
            <h4 className="text-sm font-bold font-sans text-foreground">Category Distribution</h4>
            <p className="text-[11px] font-mono text-muted">Share of active challenge categories</p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={categoryDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#151221', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }} 
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-border/30">
              {categoryDistributionData.map(cat => (
                <div key={cat.name} className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-muted">{cat.name}</span>
                  </div>
                  <span className="text-foreground font-bold">{cat.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Popular Wager Formats Bar Chart */}
      <Card className="bg-surface/30 border-border/60">
        <CardContent className="p-5 space-y-4">
          <h4 className="text-sm font-bold font-sans text-foreground">Popular Wager Formats</h4>
          <p className="text-[11px] font-mono text-muted">Most created wager types on the platform</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="type" stroke="#8A8F9D" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8A8F9D" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151221', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }} 
                />
                <Bar dataKey="count" fill="#00E0FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
