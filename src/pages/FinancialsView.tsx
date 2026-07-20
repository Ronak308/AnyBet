import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  Percent, 
  Wallet
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer 
} from 'recharts'

export const FinancialsView: React.FC<{ navigate: (tab: string) => void }> = ({ navigate: _navigate }) => {
  const [financialsRange, setFinancialsRange] = useState<'1W' | '1M'>('1M')

  const kpis = [
    { title: 'Total Revenue', value: '$1.8M', change: '+14.2%', isPositive: true, subtext: 'Cumulative earnings', icon: DollarSign, color: 'text-primary border-primary/20 bg-primary/5' },
    { title: 'Fees Collected', value: '$24,500', change: '+8.1%', isPositive: true, subtext: 'Protocol settling fees', icon: Percent, color: 'text-secondary border-secondary/20 bg-secondary/5' },
    { title: 'Staked Collateral', value: '12,450 SOL', change: '+22.4%', isPositive: true, subtext: 'Validator nodes pool', icon: Coins, color: 'text-[#8026FF] border-[#8026FF]/20 bg-[#8026FF]/5' },
    { title: 'Est. APY Yield', value: '8.4%', change: 'Stable', isPositive: true, subtext: 'Staking performance', icon: Wallet, color: 'text-secondary border-secondary/20 bg-secondary/5' }
  ]

  const monthlyData = [
    { name: 'JAN', volume: 150000, revenue: 24000 },
    { name: 'FEB', volume: 180000, revenue: 28000 },
    { name: 'MAR', volume: 220000, revenue: 34000 },
    { name: 'APR', volume: 290000, revenue: 45000 },
    { name: 'MAY', volume: 320000, revenue: 52000 },
    { name: 'JUN', volume: 410000, revenue: 68000 },
    { name: 'JUL', volume: 480000, revenue: 79000 },
  ]

  const weeklyData = [
    { name: 'MON', volume: 15000, revenue: 2400 },
    { name: 'TUE', volume: 18000, revenue: 2900 },
    { name: 'WED', volume: 21000, revenue: 3400 },
    { name: 'THU', volume: 25000, revenue: 4000 },
    { name: 'FRI', volume: 32000, revenue: 5100 },
    { name: 'SAT', volume: 42000, revenue: 6700 },
    { name: 'SUN', volume: 48000, revenue: 7900 },
  ]

  const chartData = financialsRange === '1M' ? monthlyData : weeklyData

  const txLogs = [
    { tx: '0x32A...BF8', type: 'Payout', user: 'block_wizard', amount: '+4.5 SOL', value: '$675.00', status: 'Settled', isDeposit: false },
    { tx: '0x8F9...2E1', type: 'Staking', user: 'oracle_eye', amount: '+50.0 SOL', value: '$7,500.00', status: 'Active', isDeposit: true },
    { tx: '0x1A2...FF0', type: 'Fee Share', user: 'crypto_king', amount: '+1.2 SOL', value: '$180.00', status: 'Settled', isDeposit: false },
    { tx: '0xC4D...789', type: 'Deposit', user: 'risky_bets', amount: '+10.0 SOL', value: '$1,500.00', status: 'Settled', isDeposit: true }
  ]

  // Entrance variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
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
      {/* 4 KPIs row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon
          return (
            <motion.div key={idx} variants={cardVariants} className="h-full">
              <Card className="hover:border-primary/40 transition-all duration-300 h-full">
                <CardContent className="p-4 flex items-center justify-between h-full">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-muted font-mono uppercase tracking-widest">{kpi.title}</span>
                    <span className="text-2xl font-bold font-mono tracking-tight text-foreground">{kpi.value}</span>
                    <span className="text-[10px] text-muted font-mono flex items-center gap-1">
                      {kpi.subtext}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className={`p-2.5 rounded-lg border ${kpi.color}`}>
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
              <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-foreground font-sans uppercase tracking-wider">Protocol Revenue Growth</h3>
                  <p className="text-[11px] text-muted font-mono uppercase tracking-widest mt-1">Monthly fee accumulation logs</p>
                </div>
                
                <Tabs value={financialsRange} onValueChange={(val) => setFinancialsRange(val as any)}>
                  <TabsList className="bg-surface/60 border border-border/50 h-8">
                    <TabsTrigger value="1W" className="h-7 text-[10px] px-3">WEEKLY</TabsTrigger>
                    <TabsTrigger value="1M" className="h-7 text-[10px] px-3">MONTHLY</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Bar Chart */}
              <div className="h-[250px] w-full font-mono text-[10px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
                      dataKey="revenue" 
                      fill="#8026FF" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={45}
                      name="Fee Revenue"
                    />
                    <Bar 
                      dataKey="volume" 
                      fill="#00E0FF" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={45}
                      name="Total Volume"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-4 font-mono text-[9px] text-muted">
              <span>// LEDGER_STATE: SYNCHRONIZED</span>
              <span>LATEST AUDIT: SECONDS AGO</span>
            </div>
          </Card>
        </motion.div>

        {/* Right Recent Transactions Table: 4 Columns */}
        <motion.div variants={cardVariants} className="lg:col-span-4">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                <h3 className="text-sm font-bold text-foreground font-sans uppercase tracking-wider">Protocol Staking Logs</h3>
                <Badge variant="outline" className="text-[9px]">SOL NETWORK</Badge>
              </div>

              {/* Transactions logs list */}
              <div className="flex flex-col gap-3 font-sans">
                {txLogs.map((tx, idx) => (
                  <div key={idx} className="p-3 border border-border bg-background/30 rounded-lg flex items-center justify-between hover:border-muted/30 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${tx.isDeposit ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                        {tx.isDeposit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-xs text-foreground">{tx.type}</span>
                        <span className="text-[9px] font-mono text-muted">@{tx.user}</span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col gap-0.5 font-mono text-xs">
                      <span className={`font-bold ${tx.isDeposit ? 'text-emerald-400' : 'text-primary'}`}>{tx.amount}</span>
                      <span className="text-[9px] text-muted">{tx.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                alert("Redirecting to Solana explorer logs...")
                window.open("https://solscan.io", "_blank")
              }}
              className="mt-6 w-full border border-border hover:bg-surface/50 text-[10px] text-muted hover:text-foreground font-mono py-2 rounded-lg transition-colors cursor-pointer"
            >
              VIEW ON SOLSCAN
            </button>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
