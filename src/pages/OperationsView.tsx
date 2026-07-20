import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap, 
  Wallet, 
  Cpu, 
  Users, 
  RefreshCw,
  ExternalLink,
  Compass
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer 
} from 'recharts'

interface OperationsViewProps {
  onNavigateToChallenges: () => void
  navigate: (tab: string) => void
}

export const OperationsView: React.FC<OperationsViewProps> = ({ onNavigateToChallenges, navigate }) => {
  const [chartRange, setChartRange] = useState<'1W' | '1M' | 'ALL'>('1W')
  const [chartType, setChartType] = useState<'area' | 'bar'>('area')
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [streamingFeed, setStreamingFeed] = useState([
    { id: '#20459-B', market: 'UCL: Real Madrid vs Man City', outcome: 'Draw (3-3)', type: 'AI Oracle', value: '12,450 BET', time: 'Just now', source: 'oracle' },
    { id: '#20458-X', market: 'BTC Closes Above 100k (24h)', outcome: 'True', type: 'API Feed', value: '8,120 BET', time: '2m ago', source: 'api' },
    { id: '#20457-A', market: 'Formula 1: Monaco GP Winner', outcome: 'Verstappen', type: 'AI Oracle', value: '45,000 BET', time: '5m ago', source: 'oracle' },
    { id: '#20456-D', market: 'Oscars: Best Picture 2024', outcome: 'Oppenheimer', type: 'API Feed', value: '2,900 BET', time: '12m ago', source: 'api' },
  ])

  // Mock charts data
  const chartData = {
    '1W': [
      { name: 'MON', transactions: 12000, volume: 45000 },
      { name: 'TUE', transactions: 15000, volume: 52000 },
      { name: 'WED', transactions: 18000, volume: 61000 },
      { name: 'THU', transactions: 14000, volume: 48000 },
      { name: 'FRI', transactions: 22000, volume: 78000 },
      { name: 'SAT', transactions: 26000, volume: 92000 },
      { name: 'SUN', transactions: 24500, volume: 88400 },
    ],
    '1M': [
      { name: 'WEEK 1', transactions: 65000, volume: 220000 },
      { name: 'WEEK 2', transactions: 78000, volume: 280000 },
      { name: 'WEEK 3', transactions: 92000, volume: 340000 },
      { name: 'WEEK 4', transactions: 110000, volume: 420000 },
    ],
    'ALL': [
      { name: 'JAN', transactions: 250000, volume: 950000 },
      { name: 'FEB', transactions: 280000, volume: 1100000 },
      { name: 'MAR', transactions: 340000, volume: 1450000 },
      { name: 'APR', transactions: 390000, volume: 1780000 },
      { name: 'MAY', transactions: 420000, volume: 2100000 },
      { name: 'JUN', transactions: 490000, volume: 2600000 },
      { name: 'JUL', transactions: 580000, volume: 3200000 },
      { name: 'AUG', transactions: 620000, volume: 3700000 },
      { name: 'SEP', transactions: 690000, volume: 4200000 },
    ]
  }

  // AI nodes status mock grid
  const [nodes, setNodes] = useState(
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      status: i % 5 === 0 ? 'calibrating' : i % 7 === 0 ? 'idle' : 'active'
    }))
  )

  // Simulation: Add data stream updates periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const markets = [
        'ETH Closes Above 5k (1h)', 'Super Bowl Winner 2026',
        'NBA Finals Game 1 Winner', 'Nasdaq closing rate > +1.2%',
        'Solana TVL > 10B (24h)', 'Cannes Film Festival Palme d\'Or'
      ]
      const outcomes = ['True', 'False', 'Awaiting API', 'Settled (AI)', 'Override Pending']
      const sources = ['oracle', 'api']
      const values = ['4,200 BET', '1,850 BET', '22,400 BET', '9,800 BET', '32,150 BET']
      
      const newId = `#20${Math.floor(Math.random() * 900) + 100}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`
      const newMarket = markets[Math.floor(Math.random() * markets.length)]
      const newOutcome = outcomes[Math.floor(Math.random() * outcomes.length)]
      const newSource = sources[Math.floor(Math.random() * sources.length)]
      const newValue = values[Math.floor(Math.random() * values.length)]
      
      setStreamingFeed(prev => [
        {
          id: newId,
          market: newMarket,
          outcome: newOutcome,
          type: newSource === 'oracle' ? 'AI Oracle' : 'API Feed',
          value: newValue,
          time: 'Just now',
          source: newSource
        },
        ...prev.slice(0, 3).map(item => {
          if (item.time === 'Just now') return { ...item, time: '1m ago' }
          if (item.time.endsWith('m ago')) {
            const mins = parseInt(item.time)
            return { ...item, time: `${mins + 1}m ago` }
          }
          return item
        })
      ])

      // Randomly flicker/update a node state
      setNodes(prev => prev.map(n => {
        if (Math.random() > 0.8) {
          const states: ('active' | 'calibrating' | 'idle')[] = ['active', 'calibrating', 'idle']
          return { ...n, status: states[Math.floor(Math.random() * 3)] }
        }
        return n
      }))
    }, 4500)

    return () => clearInterval(interval)
  }, [])

  // KPI metadata
  const kpis = [
    { title: 'Active Challenges', value: '2,450', change: '+12%', isPositive: true, subtext: 'Daily operations', icon: Zap, color: 'text-primary border-primary/20 bg-primary/5', tab: 'challenges' },
    { title: 'Coins Locked', value: '4.2M BET', change: '+5.2%', isPositive: true, subtext: 'Staked in challenges', icon: Wallet, color: 'text-secondary border-secondary/20 bg-secondary/5', tab: 'financials' },
    { title: 'AI Settled Efficiency', value: '98.4%', change: 'Precision', isPositive: true, subtext: 'Arbitration rate', icon: Cpu, color: 'text-[#8026FF] border-[#8026FF]/20 bg-[#8026FF]/5', tab: 'ai-oracle' },
    { title: 'Active Users', value: '12k', change: '+1.8%', isPositive: true, subtext: 'Hourly interaction', icon: Users, color: 'text-secondary border-secondary/20 bg-secondary/5', tab: 'reputation' }
  ]

  // Entrance variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 flex flex-col gap-6 w-full font-sans select-none"
    >
      {/* 4 KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon
          return (
            <motion.div key={idx} variants={cardVariants} className="h-full">
              <Card
                className="hover:border-primary/40 transition-all duration-300 h-full cursor-pointer group"
                onClick={() => navigate(kpi.tab)}
              >
                <CardContent className="p-4 flex items-center justify-between h-full">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-muted font-mono uppercase tracking-widest">{kpi.title}</span>
                    <span className="text-2xl font-bold font-mono tracking-tight text-foreground group-hover:text-primary transition-colors">{kpi.value}</span>
                    <span className="text-[10px] text-muted font-mono flex items-center gap-1">
                      {kpi.subtext}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className={`p-2.5 rounded-lg border ${kpi.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <Badge variant={kpi.isPositive ? 'success' : 'outline'} className="text-[9px]">
                      {kpi.change}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Main Charts & Side Node Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart Card: 8 Columns */}
        <motion.div variants={cardVariants} className="lg:col-span-8">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-foreground font-sans uppercase tracking-wider">Platform Growth</h3>
                  <p className="text-[11px] text-muted font-mono uppercase tracking-widest mt-1">Daily transaction volume & engagement</p>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Area/Bar Toggle */}
                  <Tabs value={chartType} onValueChange={(val) => setChartType(val as 'area' | 'bar')}>
                    <TabsList className="bg-surface/60 border border-border/50 h-8">
                      <TabsTrigger value="area" className="h-7 text-[10px] px-2.5">AREA</TabsTrigger>
                      <TabsTrigger value="bar" className="h-7 text-[10px] px-2.5">BAR</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Range Selector */}
                  <Tabs value={chartRange} onValueChange={(val) => setChartRange(val as '1W' | '1M' | 'ALL')}>
                    <TabsList className="bg-surface/60 border border-border/50 h-8">
                      <TabsTrigger value="1W" className="h-7 text-[10px] px-2.5">1W</TabsTrigger>
                      <TabsTrigger value="1M" className="h-7 text-[10px] px-2.5">1M</TabsTrigger>
                      <TabsTrigger value="ALL" className="h-7 text-[10px] px-2.5">ALL</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {/* Chart Visualizer */}
              <div className="h-[250px] w-full mt-2 font-mono text-[10px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                  {chartType === 'area' ? (
                    <AreaChart data={chartData[chartRange]} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8026FF" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8026FF" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="cyanGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00E0FF" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00E0FF" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="name" 
                        stroke="#A8A8B5" 
                        fontSize={9} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="#A8A8B5" 
                        fontSize={9} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <ChartTooltip 
                        contentStyle={{ 
                          backgroundColor: '#1B1B23', 
                          borderColor: '#2A2A36', 
                          borderRadius: '8px',
                          color: '#F3F0FF',
                          fontFamily: 'JetBrains Mono'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="volume" 
                        stroke="#8026FF" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#purpleGlow)" 
                        name="TVL Volume"
                        dot={false}
                        activeDot={{ r: 4 }}
                        isAnimationActive={false}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="transactions" 
                        stroke="#00E0FF" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#cyanGlow)" 
                        name="Transactions"
                        dot={false}
                        activeDot={{ r: 4 }}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={chartData[chartRange]} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <XAxis 
                        dataKey="name" 
                        stroke="#A8A8B5" 
                        fontSize={9} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="#A8A8B5" 
                        fontSize={9} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <ChartTooltip 
                        contentStyle={{ 
                          backgroundColor: '#1B1B23', 
                          borderColor: '#2A2A36', 
                          borderRadius: '8px',
                          color: '#F3F0FF',
                          fontFamily: 'JetBrains Mono'
                        }}
                      />
                      <Bar 
                        dataKey="volume" 
                        fill="#8026FF" 
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                        name="TVL Volume"
                        isAnimationActive={false}
                      />
                      <Bar 
                        dataKey="transactions" 
                        fill="#00E0FF" 
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                        name="Transactions"
                        isAnimationActive={false}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-4 font-mono text-[9px] text-muted">
              <span>// METRIC_INTEGRITY: COMPRESSED</span>
              <button
                onClick={() => navigate('financials')}
                className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
              >
                VIEW FINANCIALS <ExternalLink className="h-2.5 w-2.5" />
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Right Node Matrix Panel: 4 Columns */}
        <motion.div variants={cardVariants} className="lg:col-span-4">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                <h3 className="text-sm font-bold text-foreground font-sans uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" />
                  AI Oracle Nodes
                </h3>
                <Badge variant="primary" className="text-[9px]">SOLO CLUSTER</Badge>
              </div>

              {/* Status Nodes Grid */}
              <div className="grid grid-cols-4 gap-3 bg-background/50 border border-border/50 p-4 rounded-lg my-4 max-w-[240px] mx-auto">
                {nodes.map((node) => (
                  <motion.div
                    key={node.id}
                    layoutId={`node-${node.id}`}
                    className="relative flex items-center justify-center w-8 h-8 rounded border border-border/40 bg-surface/30 group"
                  >
                    {/* Status Glow Node dot */}
                    <span className="relative flex h-2.5 w-2.5">
                      {node.status === 'active' && (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </>
                      )}
                      {node.status === 'calibrating' && (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary/80 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
                        </>
                      )}
                      {node.status === 'idle' && (
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary/60 border border-primary/20"></span>
                      )}
                    </span>
                    
                    {/* Tooltip on Node */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-50 bg-[#1B1B23] border border-border text-[8px] font-mono rounded px-1.5 py-0.5 whitespace-nowrap text-foreground">
                      NODE_{node.id}: {node.status.toUpperCase()}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Node Stats List */}
              <div className="flex flex-col gap-2 mt-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-border/30 pb-2">
                  <span className="text-muted">Global Availability</span>
                  <span className="text-emerald-400 font-bold">100%</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/30 pb-2">
                  <span className="text-muted">Average Latency</span>
                  <span className="text-secondary font-bold">18ms</span>
                </div>
                <div className="flex items-center justify-between pb-1">
                  <span className="text-muted">Last Calibration</span>
                  <span className="text-primary font-bold">4m ago</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                if (isCalibrating) return
                setIsCalibrating(true)
                // Immediately randomize nodes into calibrating state
                setNodes(prev => prev.map(n => ({ ...n, status: Math.random() > 0.5 ? 'calibrating' : 'idle' })))
                setTimeout(() => {
                  // After 2.5s, all nodes go back to active and fire success toast
                  setNodes(prev => prev.map(n => ({ ...n, status: 'active' })))
                  setIsCalibrating(false)
                  alert('Success: Node calibration complete. All 16 nodes online. Latency: 14ms')
                }, 2500)
              }}
              disabled={isCalibrating}
              className={`mt-6 w-full border text-[10px] font-mono py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isCalibrating
                  ? 'border-secondary/40 text-secondary bg-secondary/5 cursor-not-allowed'
                  : 'border-primary/20 hover:border-primary/50 text-primary hover:text-primary-hover bg-primary/5'
              }`}
            >
              <RefreshCw className={`h-3 w-3 ${isCalibrating ? 'animate-spin' : ''}`} />
              {isCalibrating ? 'CALIBRATING...' : 'RUN CALIBRATION SUITE'}
            </button>
          </Card>
        </motion.div>
      </div>

      {/* Streaming Live Feed Table */}
      <motion.div variants={cardVariants}>
        <Card>
          <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-foreground font-sans uppercase tracking-wider flex items-center gap-2">
                <Compass className="h-4.5 w-4.5 text-primary" />
                Live Feed
              </h3>
              <Badge variant="primary" className="animate-pulse bg-primary/20 text-primary text-[9px]">STREAMING</Badge>
            </div>
            <button 
              onClick={onNavigateToChallenges}
              className="text-xs text-muted hover:text-foreground flex items-center gap-1 cursor-pointer font-mono text-[9px] uppercase tracking-wider"
            >
              View All Challenges
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[120px]">Challenge ID</TableHead>
                  <TableHead>Market</TableHead>
                  <TableHead className="w-[140px]">Outcome</TableHead>
                  <TableHead className="w-[120px]">Type</TableHead>
                  <TableHead className="text-right w-[120px]">Value</TableHead>
                  <TableHead className="text-right w-[120px]">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {streamingFeed.map((row, idx) => (
                  <TableRow key={row.id + idx} className="hover:bg-surface/30">
                    <TableCell className="font-mono text-xs text-primary font-semibold">{row.id}</TableCell>
                    <TableCell className="font-medium text-foreground">{row.market}</TableCell>
                    <TableCell>
                      <Badge variant={row.outcome.includes('True') ? 'success' : row.outcome.includes('Draw') ? 'secondary' : 'outline'} className="text-[9px]">
                        {row.outcome}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs flex items-center gap-1.5">
                      {row.source === 'oracle' ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-glow"></span>
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary shadow-cyanGlow"></span>
                      )}
                      {row.type}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-foreground text-xs">{row.value}</TableCell>
                    <TableCell className="text-right text-muted font-mono text-xs">{row.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
