import React, { useState } from 'react'
import { 
  Gift, 
  Plus, 
  Check, 
  Coins, 
  Clock,
  Sparkles,
  Edit2
} from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Sheet, SheetContent } from '../../components/ui/sheet'
import { useWallet } from '../../context/WalletContext'
import type { BonusCampaign } from '../../context/WalletContext'

export const RewardsModule: React.FC = () => {
  const {
    rewardRules,
    bonusCampaigns: initialBonusCampaigns,
    dailyRewardConfig,
    updateDailyRewardConfig,
    totalRewardsDistributed
  } = useWallet()

  const [dailyCoinsInput, setDailyCoinsInput] = useState(dailyRewardConfig.dailyCoins.toString())
  const [cooldownInput, setCooldownInput] = useState(dailyRewardConfig.cooldownHours.toString())

  // Local state for Bonus Campaigns so user can Create/Edit new campaigns
  const [campaignsList, setCampaignsList] = useState<BonusCampaign[]>(initialBonusCampaigns)

  // Campaign Modal States
  const [isCampModalOpen, setIsCampModalOpen] = useState(false)
  const [editingCampId, setEditingCampId] = useState<string | null>(null)
  const [campTitle, setCampTitle] = useState('')
  const [campCode, setCampCode] = useState('')
  const [campBonus, setCampBonus] = useState('500')
  const [campMinStake, setCampMinStake] = useState('100')
  const [campMaxClaims, setCampMaxClaims] = useState('100')
  const [campExpiry, setCampExpiry] = useState('2026-12-31')

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

  const handleOpenCampModal = (camp?: BonusCampaign) => {
    if (camp) {
      setEditingCampId(camp.id)
      setCampTitle(camp.title || camp.name || '')
      setCampCode(camp.code || camp.title.toUpperCase().replace(/\s+/g, '_'))
      setCampBonus((camp.bonusCoins || 500).toString())
      setCampMinStake((camp.minStake || 0).toString())
      setCampMaxClaims((camp.maxClaims || 100).toString())
      setCampExpiry(camp.expiresAt || '2026-12-31')
    } else {
      setEditingCampId(null)
      setCampTitle('')
      setCampCode('')
      setCampBonus('500')
      setCampMinStake('100')
      setCampMaxClaims('100')
      setCampExpiry('2026-12-31')
    }
    setIsCampModalOpen(true)
  }

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault()
    if (!campTitle.trim()) {
      showNotice('Campaign title is required.', 'warning')
      return
    }

    const bonus = parseInt(campBonus, 10) || 500
    const minStake = parseInt(campMinStake, 10) || 0
    const maxClaims = parseInt(campMaxClaims, 10) || 100
    const code = campCode.trim().toUpperCase() || campTitle.trim().toUpperCase().replace(/\s+/g, '_')

    if (editingCampId) {
      setCampaignsList(prev => prev.map(c => c.id === editingCampId ? {
        ...c,
        title: campTitle,
        name: campTitle,
        code,
        bonusCoins: bonus,
        minStake,
        maxClaims,
        expiresAt: campExpiry
      } : c))
      showNotice(`Campaign "${campTitle}" updated successfully.`, 'success')
    } else {
      const newCamp: BonusCampaign = {
        id: `cmp_${Date.now()}`,
        title: campTitle,
        name: campTitle,
        code,
        type: 'Promo Code',
        bonusCoins: bonus,
        minStake,
        currentClaims: 0,
        maxClaims,
        status: 'Active',
        expiresAt: campExpiry
      }
      setCampaignsList(prev => [newCamp, ...prev])
      showNotice(`Created new campaign "${campTitle}" (${code}).`, 'success')
    }

    setIsCampModalOpen(false)
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

          <form onSubmit={handleSaveDailyConfig} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-mono uppercase text-muted block mb-1">Daily Coin Amount ($BET)</label>
              <Input
                type="number"
                value={dailyCoinsInput}
                onChange={e => setDailyCoinsInput(e.target.value)}
                className="bg-surface/40 text-xs font-mono text-foreground"
              />
            </div>

            <div className="flex-1">
              <label className="text-[10px] font-mono uppercase text-muted block mb-1">Cooldown Duration (Hours)</label>
              <Input
                type="number"
                value={cooldownInput}
                onChange={e => setCooldownInput(e.target.value)}
                className="bg-surface/40 text-xs font-mono text-foreground"
              />
            </div>

            <div className="shrink-0">
              <Button type="submit" variant="primary" glow className="text-xs font-mono h-9 px-5 w-full sm:w-auto">
                <Check className="h-4 w-4 mr-1.5" /> Save Reward Config
              </Button>
            </div>
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
                  <TableCell className="font-bold text-xs text-foreground">{rule.name || rule.event}</TableCell>
                  <TableCell className="font-mono text-xs text-muted">{rule.trigger || rule.event}</TableCell>
                  <TableCell className="font-mono text-xs font-bold text-emerald-400">+{rule.coinReward || rule.rewardCoins || 100} BET</TableCell>
                  <TableCell>
                    {rule.isEnabled !== false ? (
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
          <div>
            <h3 className="text-sm font-bold text-foreground">Active Bonus & Promo Campaigns</h3>
            <p className="text-xs text-muted">Create promo codes and deposit bonus campaigns for players.</p>
          </div>
          <Button size="sm" variant="primary" glow onClick={() => handleOpenCampModal()} className="gap-1.5 text-xs font-mono">
            <Plus className="h-3.5 w-3.5" /> Create Campaign
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaignsList.map(camp => (
            <Card key={camp.id} className="bg-surface/30 border-border/60">
              <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-primary font-bold uppercase">{camp.code || camp.title.toUpperCase().replace(/\s+/g, '_')}</span>
                    <h4 className="font-bold text-sm text-foreground mt-0.5">{camp.title || camp.name}</h4>
                  </div>
                  <Badge variant={camp.status === 'Active' ? 'success' : 'outline'}>{camp.status}</Badge>
                </div>

                <div className="flex items-baseline gap-1 font-mono text-xs">
                  <span className="text-muted">Bonus:</span>
                  <span className="text-emerald-400 font-bold">+{camp.bonusCoins} BET</span>
                  <span className="text-muted text-[10px] ml-2">({camp.currentClaims || 0} / {camp.maxClaims || 100} claims)</span>
                </div>

                <div className="pt-2 border-t border-border/40 text-[10px] font-mono text-muted flex justify-between items-center">
                  <span>Expires: {camp.expiresAt}</span>
                  <button onClick={() => handleOpenCampModal(camp)} className="text-primary hover:underline cursor-pointer flex items-center gap-1 font-bold">
                    <Edit2 className="h-3 w-3" /> Edit
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CREATE / EDIT CAMPAIGN MODAL SHEET */}
      <Sheet open={isCampModalOpen} onOpenChange={setIsCampModalOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-background border-l border-border p-6 overflow-y-auto font-sans">
          <div className="flex flex-col gap-6">
            <div className="border-b border-border/40 pb-4 pr-8">
              <h3 className="text-lg font-bold text-foreground">
                {editingCampId ? 'Edit Bonus Campaign' : 'Create Bonus Campaign'}
              </h3>
              <p className="text-xs text-muted mt-0.5">Configure promo code and bonus coin rules for player engagement.</p>
            </div>

            <form onSubmit={handleSaveCampaign} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1">Campaign Title</label>
                <Input
                  value={campTitle}
                  onChange={e => setCampTitle(e.target.value)}
                  placeholder="e.g. IPL Festive Bonus"
                  required
                  className="bg-surface/40 text-xs font-mono text-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1">Promo Code (Optional)</label>
                <Input
                  value={campCode}
                  onChange={e => setCampCode(e.target.value)}
                  placeholder="e.g. IPL500 or FESTIVE2026"
                  className="bg-surface/40 text-xs font-mono text-foreground uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Bonus Coins ($BET)</label>
                  <Input
                    type="number"
                    value={campBonus}
                    onChange={e => setCampBonus(e.target.value)}
                    className="bg-surface/40 text-xs font-mono text-foreground"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Min Stake Req ($BET)</label>
                  <Input
                    type="number"
                    value={campMinStake}
                    onChange={e => setCampMinStake(e.target.value)}
                    className="bg-surface/40 text-xs font-mono text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Max Claims Limit</label>
                  <Input
                    type="number"
                    value={campMaxClaims}
                    onChange={e => setCampMaxClaims(e.target.value)}
                    className="bg-surface/40 text-xs font-mono text-foreground"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Expiry Date</label>
                  <Input
                    type="date"
                    value={campExpiry}
                    onChange={e => setCampExpiry(e.target.value)}
                    className="bg-surface/40 text-xs font-mono text-foreground"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border/40">
                <Button type="button" variant="ghost" onClick={() => setIsCampModalOpen(false)} className="text-xs font-mono">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" glow className="text-xs font-mono">
                  <Sparkles className="h-4 w-4 mr-1.5" /> Save Campaign
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
