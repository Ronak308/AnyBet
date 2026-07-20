import React, { useState } from 'react'
import { 
  Gift, 
  Plus, 
  Check, 
  Coins, 
  Clock 
} from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { useWallet } from '../../context/WalletContext'

export const RewardsModule: React.FC = () => {
  const {
    rewardRules,
    bonusCampaigns,
    dailyRewardConfig,
    updateDailyRewardConfig,
    totalRewardsDistributed
  } = useWallet()

  const [dailyCoinsInput, setDailyCoinsInput] = useState(dailyRewardConfig.dailyCoins.toString())
  const [cooldownInput, setCooldownInput] = useState(dailyRewardConfig.cooldownHours.toString())

  // Custom Toast helper
  const showNotice = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }))
    }
  }

  const handleSaveDailyConfig = (e: React.FormEvent) => {
    e.preventDefault()
    const coins = parseInt(dailyCoinsInput, 10)
    const cooldown = parseInt(cooldownInput, 10)

    if (isNaN(coins) || coins <= 0 || isNaN(cooldown) || cooldown <= 0) {
      showNotice('Please enter valid positive values for daily reward coins and cooldown.', 'warning')
      return
    }

    updateDailyRewardConfig({ dailyCoins: coins, cooldownHours: cooldown })
    showNotice(`Daily Reward Config updated: +${coins} BET every ${cooldown} hours.`, 'success')
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-surface/30 border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-muted uppercase">Total Rewards Distributed</span>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{totalRewardsDistributed.toLocaleString()} BET</p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Gift className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-muted uppercase">Daily Login Reward</span>
              <p className="text-2xl font-bold font-mono text-primary mt-1">+{dailyRewardConfig.dailyCoins} BET</p>
            </div>
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary">
              <Coins className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-muted uppercase">Claim Cooldown</span>
              <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{dailyRewardConfig.cooldownHours} Hours</p>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Reward Settings Card */}
      <Card className="bg-surface/30 border-border/60">
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="border-b border-border/40 pb-3">
            <h3 className="text-base font-bold text-foreground">Daily Login Reward Engine</h3>
            <p className="text-xs text-muted">Configure daily free coin grants and claim cooldown rules for players.</p>
          </div>

          <form onSubmit={handleSaveDailyConfig} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-[10px] font-mono uppercase text-muted block mb-1">Daily Coin Amount ($BET)</label>
              <Input
                type="number"
                value={dailyCoinsInput}
                onChange={e => setDailyCoinsInput(e.target.value)}
                className="bg-surface/40 text-xs font-mono text-foreground"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-muted block mb-1">Cooldown Duration (Hours)</label>
              <Input
                type="number"
                value={cooldownInput}
                onChange={e => setCooldownInput(e.target.value)}
                className="bg-surface/40 text-xs font-mono text-foreground"
              />
            </div>

            <Button type="submit" variant="primary" glow className="text-xs font-mono h-9">
              <Check className="h-4 w-4 mr-1" /> Save Reward Config
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Streak Multiplier Rules Table */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-foreground">Streak & Achievement Reward Rules</h3>

        <div className="border border-border/60 rounded-xl overflow-hidden bg-surface/20">
          <Table>
            <TableHeader className="bg-surface/60">
              <TableRow>
                <TableHead className="text-xs font-mono">Rule Name</TableHead>
                <TableHead className="text-xs font-mono">Trigger Event</TableHead>
                <TableHead className="text-xs font-mono">Reward Amount</TableHead>
                <TableHead className="text-xs font-mono">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewardRules.map(rule => (
                <TableRow key={rule.id}>
                  <TableCell className="font-bold text-xs text-foreground">{rule.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted">{rule.trigger}</TableCell>
                  <TableCell className="font-mono text-xs font-bold text-emerald-400">+{rule.rewardCoins} BET</TableCell>
                  <TableCell>
                    {rule.isEnabled ? (
                      <Badge variant="success">ENABLED</Badge>
                    ) : (
                      <Badge variant="outline">DISABLED</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Bonus Campaigns & Promo Codes Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Active Bonus & Promo Campaigns</h3>
          <Button size="sm" variant="outline" className="gap-1 text-xs font-mono">
            <Plus className="h-3.5 w-3.5" /> Create Campaign
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bonusCampaigns.map(camp => (
            <Card key={camp.id} className="bg-surface/30 border-border/60">
              <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-primary font-bold uppercase">{camp.code}</span>
                    <h4 className="font-bold text-sm text-foreground mt-0.5">{camp.name}</h4>
                  </div>
                  <Badge variant={camp.status === 'Active' ? 'success' : 'outline'}>{camp.status}</Badge>
                </div>

                <div className="flex items-baseline gap-1 font-mono text-xs">
                  <span className="text-muted">Bonus:</span>
                  <span className="text-emerald-400 font-bold">+{camp.bonusCoins} BET</span>
                  <span className="text-muted text-[10px] ml-2">({camp.currentClaims} / {camp.maxClaims} claims)</span>
                </div>

                <div className="pt-2 border-t border-border/40 text-[10px] font-mono text-muted flex justify-between">
                  <span>Expires: {camp.expiresAt}</span>
                  <span className="text-primary hover:underline cursor-pointer">Edit</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
