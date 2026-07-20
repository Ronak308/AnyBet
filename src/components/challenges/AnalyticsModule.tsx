import React, { useState, useMemo } from 'react'
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Download, 
  FileText, 
  Calendar, 
  Users
} from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { useChallenges } from '../../context/ChallengesContext'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts'

export const AnalyticsModule: React.FC = () => {
  const { challenges, categories, exportCSV, exportPDF } = useChallenges()
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  // KPI Calculations
  const totalChallenges = challenges.length
  const liveCount = challenges.filter(c => c.status === 'Live').length
  const completedCount = challenges.filter(c => c.status === 'Completed').length
  const cancelledCount = challenges.filter(c => c.status === 'Cancelled').length
  const totalParticipants = useMemo(() => challenges.reduce((sum, c) => sum + c.participantsCount, 0), [challenges])
  const totalPrizePools = useMemo(() => challenges.reduce((sum, c) => sum + c.prizePool, 0), [challenges])

  // Daily Creation Mock Chart Data
  const creationData = [
    { day: 'Mon', count: 12, volume: 45000 },
    { day: 'Tue', count: 18, volume: 62000 },
    { day: 'Wed', count: 15, volume: 58000 },
    { day: 'Thu', count: 24, volume: 95000 },
    { day: 'Fri', count: 32, volume: 140000 },
    { day: 'Sat', count: 28, volume: 110000 },
    { day: 'Sun', count: 22, volume: 88000 }
  ]

  // Category Distribution Chart Data
  const categoryData = useMemo(() => {
    return categories.map(cat => {
      const count = challenges.filter(c => c.category === cat.name).length
      return {
        name: cat.name,
        value: count || cat.challengeCount || 5,
        color: cat.color
      }
    })
  }, [categories, challenges])

  // Challenge Type Distribution Data
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
            <span className="text-[9px] font-mono text-muted uppercase">Cancelled</span>
            <p className="text-xl font-bold font-mono text-red-400 mt-1">{cancelledCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border-border/50">
          <CardContent className="p-3">
            <span className="text-[9px] font-mono text-muted uppercase">Participants</span>
            <p className="text-xl font-bold font-mono text-purple-400 mt-1">{totalParticipants.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border-border/50">
          <CardContent className="p-3">
            <span className="text-[9px] font-mono text-muted uppercase">Total Prize Pool</span>
            <p className="text-xl font-bold font-mono text-cyan-400 mt-1">{(totalPrizePools / 1000).toFixed(0)}k BET</p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 1: Daily Challenges Created */}
        <Card className="bg-surface/30 border-border/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-bold font-sans text-foreground">Daily Challenges Created</h4>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">30-Day Trend</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={creationData}>
                <XAxis dataKey="day" stroke="#888" fontSize={10} tickLine={false} />
                <YAxis stroke="#888" fontSize={10} tickLine={false} />
                <ChartTooltip
                  contentStyle={{ backgroundColor: '#120F1D', borderColor: '#2A2438', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="count" fill="#8026FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Category Distribution */}
        <Card className="bg-surface/30 border-border/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-purple-400" />
              <h4 className="text-sm font-bold font-sans text-foreground">Challenge Category Breakdown</h4>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">All Categories</Badge>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  contentStyle={{ backgroundColor: '#120F1D', borderColor: '#2A2438', borderRadius: 8, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap text-xs font-mono">
            {categoryData.map(c => (
              <div key={c.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-muted">{c.name}:</span>
                <span className="text-foreground font-bold">{c.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Chart 3: Prize Volume Growth */}
        <Card className="bg-surface/30 border-border/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <h4 className="text-sm font-bold font-sans text-foreground">Prize Pool Volume ($BET)</h4>
            </div>
            <Badge variant="success" className="text-[10px] font-mono">+24.8% Growth</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={creationData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#888" fontSize={10} tickLine={false} />
                <YAxis stroke="#888" fontSize={10} tickLine={false} />
                <ChartTooltip
                  contentStyle={{ backgroundColor: '#120F1D', borderColor: '#2A2438', borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="volume" stroke="#10B981" fillOpacity={1} fill="url(#colorVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 4: Popular Challenge Types */}
        <Card className="bg-surface/30 border-border/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-400" />
              <h4 className="text-sm font-bold font-sans text-foreground">Most Popular Challenge Types</h4>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">By Pool Volume</Badge>
          </div>

          <div className="space-y-3 pt-2">
            {typeData.map((item) => (
              <div key={item.type} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-foreground font-medium">{item.type}</span>
                  <span className="text-primary font-bold">{item.count} Wagers</span>
                </div>
                <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-border/40">
                  <div 
                    className="bg-gradient-to-r from-primary to-cyan-400 h-full rounded-full" 
                    style={{ width: `${(item.count / 50) * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>

    </div>
  )
}
