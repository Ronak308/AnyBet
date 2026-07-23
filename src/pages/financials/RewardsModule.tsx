import React, { useState } from 'react'
import { 
  Gift, 
  Plus, 
  Check, 
  Coins, 
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  Power,
  Ban
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
    updateRewardRule,
    toggleRewardRule,
    bonusCampaigns,
    dailyRewardConfig,
    updateDailyRewardConfig,
    createBonusCampaign,
    updateBonusCampaign,
    deleteBonusCampaign,
    transactions,
    totalRewardsDistributed
  } = useWallet()

  const [dailyCoinsInput, setDailyCoinsInput] = useState(dailyRewardConfig.dailyCoins.toString())
  const [cooldownInput, setCooldownInput] = useState(dailyRewardConfig.cooldownHours.toString())
  const [streakInputs, setStreakInputs] = useState<string[]>(() => 
    (dailyRewardConfig.streakMultipliers || [1.0, 1.2, 1.5, 1.8, 2.0, 2.5, 3.0]).map(m => m.toString())
  )

  // Keep inputs synced if dailyRewardConfig updates
  React.useEffect(() => {
    setDailyCoinsInput(dailyRewardConfig.dailyCoins.toString())
    setCooldownInput(dailyRewardConfig.cooldownHours.toString())
    if (dailyRewardConfig.streakMultipliers) {
      setStreakInputs(dailyRewardConfig.streakMultipliers.map(m => m.toString()))
    }
  }, [dailyRewardConfig])

  // Reward Rule Modal States
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<import('../../context/WalletContext').RewardRule | null>(null)
  const [ruleNameInput, setRuleNameInput] = useState('')
  const [ruleCoinsInput, setRuleCoinsInput] = useState('10')
  const [ruleXpInput, setRuleXpInput] = useState('10')

  const handleOpenRuleModal = (rule: import('../../context/WalletContext').RewardRule) => {
    setEditingRule(rule)
    setRuleNameInput(rule.name || rule.event)
    setRuleCoinsInput((rule.coinReward || rule.rewardCoins || 10).toString())
    setRuleXpInput((rule.xpReward || 10).toString())
    setIsRuleModalOpen(true)
  }

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRule) return
    const coins = parseInt(ruleCoinsInput, 10) || 0
    const xp = parseInt(ruleXpInput, 10) || 0

    updateRewardRule(editingRule.id, {
      name: ruleNameInput,
      coinReward: coins,
      rewardCoins: coins,
      xpReward: xp
    })
    showNotice(`Reward rule "${ruleNameInput}" updated successfully.`, 'success')
    setIsRuleModalOpen(false)
  }

  // Select last 4 reward claims or promo code usage for audit ledger
  const rewardTransactions = React.useMemo(() => {
    return transactions.filter(t => t.type === 'Reward').slice(0, 4)
  }, [transactions])

  // Campaign Modal States
  const [isCampModalOpen, setIsCampModalOpen] = useState(false)
  const [editingCampId, setEditingCampId] = useState<string | null>(null)
  const [campTitle, setCampTitle] = useState('')
  const [campCode, setCampCode] = useState('')
  const [campBonus, setCampBonus] = useState('10')
  const [campMinStake, setCampMinStake] = useState('10')
  const [campMaxClaims, setCampMaxClaims] = useState('100')
  const [campExpiry, setCampExpiry] = useState('2026-12-31T23:59')

  // Helper to safely format stored date string to HTML5 datetime-local format
  const formatToDateTimeLocal = (dateStr: string) => {
    if (!dateStr) return '2026-12-31T23:59'
    if (dateStr.includes('T')) {
      return dateStr.substring(0, 16) // extract YYYY-MM-DDTHH:MM
    }
    return `${dateStr}T23:59`
  }

  // Format date display for campaigns
  const formatExpiryDisplay = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

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
    const multipliers = streakInputs.map(val => {
      const parsed = parseFloat(val)
      return isNaN(parsed) || parsed <= 0 ? 1.0 : parsed
    })

    if (isNaN(coins) || coins <= 0 || isNaN(cooldown) || cooldown <= 0) {
      showNotice('Please enter valid positive values for daily reward coins and cooldown.', 'warning')
      return
    }

    updateDailyRewardConfig({
      dailyCoins: coins,
      cooldownHours: cooldown,
      streakMultipliers: multipliers
    })
    showNotice(`Daily Reward Engine config updated successfully!`, 'success')
  }

  const handleOpenCampModal = (camp?: BonusCampaign) => {
    if (camp) {
      setEditingCampId(camp.id)
      setCampTitle(camp.title || camp.name || '')
      setCampCode(camp.code || camp.title.toUpperCase().replace(/\s+/g, '_'))
      setCampBonus((camp.bonusCoins || 10).toString())
      setCampMinStake((camp.minStake || 10).toString())
      setCampMaxClaims((camp.maxClaims || 100).toString())
      setCampExpiry(formatToDateTimeLocal(camp.expiresAt))
    } else {
      setEditingCampId(null)
      setCampTitle('')
      setCampCode('')
      setCampBonus('10')
      setCampMinStake('10')
      setCampMaxClaims('100')
      setCampExpiry('2026-12-31T23:59')
    }
    setIsCampModalOpen(true)
  }

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault()
    if (!campTitle.trim()) {
      showNotice('Campaign title is required.', 'warning')
      return
    }

    const bonus = parseInt(campBonus, 10) || 10
    const minStake = parseInt(campMinStake, 10) || 0
    const maxClaims = parseInt(campMaxClaims, 10) || 100
    const code = campCode.trim().toUpperCase() || campTitle.trim().toUpperCase().replace(/\s+/g, '_')

    if (editingCampId) {
      updateBonusCampaign(editingCampId, {
        title: campTitle,
        name: campTitle,
        code,
        bonusCoins: bonus,
        minStake,
        maxClaims,
        expiresAt: campExpiry
      })
      showNotice(`Campaign "${campTitle}" updated successfully.`, 'success')
    } else {
      createBonusCampaign({
        title: campTitle,
        name: campTitle,
        code,
        type: 'Promo Code',
        bonusCoins: bonus,
        minStake,
        status: 'Active',
        expiresAt: campExpiry,
        maxClaims
      })
      showNotice(`Created new campaign "${campTitle}" (${code}).`, 'success')
    }

    setIsCampModalOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 font-sans relative">
      {/* Top Action Bar - Aligned to Page Header */}
      <div className="flex justify-end md:absolute md:-top-16 md:right-0 z-30">
        <Button size="sm" variant="primary" glow onClick={() => handleOpenCampModal()} className="gap-1.5 text-xs font-mono">
          <Plus className="h-3.5 w-3.5" /> Create Campaign
        </Button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-surface/30 border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-muted uppercase">Total Rewards Distributed</span>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{totalRewardsDistributed.toLocaleString()} Coins</p>
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
              <p className="text-2xl font-bold font-mono text-primary mt-1">+{dailyRewardConfig.dailyCoins} Coins</p>
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

      {/* Daily Reward Settings & Audit Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Daily Reward Settings Card */}
        <Card className="bg-surface/30 border-border/60">
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="border-b border-border/40 pb-3">
              <h3 className="text-base font-bold text-foreground">Daily Login Reward Engine Settings</h3>
              <p className="text-xs text-muted mt-0.5">Configure base daily coin grants, claim cooldown, and 7-day streak multipliers.</p>
            </div>

            <form onSubmit={handleSaveDailyConfig} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Base Daily Coins</label>
                  <Input
                    type="number"
                    value={dailyCoinsInput}
                    onChange={e => setDailyCoinsInput(e.target.value)}
                    className="bg-surface/40 text-xs font-mono text-foreground"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Claim Cooldown (Hours)</label>
                  <Input
                    type="number"
                    value={cooldownInput}
                    onChange={e => setCooldownInput(e.target.value)}
                    className="bg-surface/40 text-xs font-mono text-foreground"
                  />
                </div>
              </div>

              {/* Editable 7-Day Streak Multipliers */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-mono uppercase text-muted block">
                  7-Day Streak Multipliers (Day 1 to Day 7)
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {streakInputs.map((val, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-muted text-center uppercase">Day {idx + 1}</span>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={val}
                        onChange={e => {
                          const newArr = [...streakInputs]
                          newArr[idx] = e.target.value
                          setStreakInputs(newArr)
                        }}
                        className="bg-surface/40 text-xs font-mono text-foreground text-center px-1 h-8"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end border-t border-border/30">
                <Button type="submit" variant="primary" glow className="text-xs font-mono h-9 px-5 w-full sm:w-auto">
                  <Check className="h-4 w-4 mr-1.5" /> Save Reward Config
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Recent Reward Claims Log Card */}
        <Card className="bg-surface/30 border-border/60">
          <CardContent className="p-6 flex flex-col justify-between h-full gap-4">
            <div className="border-b border-border/40 pb-3">
              <h3 className="text-base font-bold text-foreground">Recent Reward Claims Log</h3>
              <p className="text-xs text-muted">Audited login reward claims and promo redemptions.</p>
            </div>

            <div className="space-y-3.5">
              {rewardTransactions.length === 0 ? (
                <p className="text-xs text-muted font-mono py-4 text-center">No login reward or promo claim logs recorded yet.</p>
              ) : (
                rewardTransactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-xl border border-border/30 bg-surface/20">
                    <div>
                      <span className="text-xs font-bold text-foreground">@{tx.username}</span>
                      <p className="text-[10px] text-muted font-mono mt-0.5">{tx.description || 'Claimed login bonus'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-400">+{tx.amount} Coins</span>
                      <p className="text-[9px] text-muted font-mono mt-0.5">{new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Streak Multiplier Rules Table */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Streak & Achievement Reward Rules</h3>
          <span className="text-xs text-muted font-mono">Click status badge to toggle or ✏️ to edit rule values</span>
        </div>

        <div className="border border-border/60 rounded-xl overflow-hidden bg-surface/20">
          <Table>
            <TableHeader className="bg-surface/60">
              <TableRow>
                <TableHead className="text-xs font-mono">Rule Name</TableHead>
                <TableHead className="text-xs font-mono">Trigger Event</TableHead>
                <TableHead className="text-xs font-mono">Reward Amount</TableHead>
                <TableHead className="text-xs font-mono">Status</TableHead>
                <TableHead className="text-xs font-mono text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewardRules.map(rule => (
                <TableRow key={rule.id}>
                  <TableCell className="font-bold text-xs text-foreground">{rule.name || rule.event}</TableCell>
                  <TableCell className="font-mono text-xs text-muted">{rule.trigger || rule.event}</TableCell>
                  <TableCell className="font-mono text-xs font-bold text-emerald-400">
                    +{rule.coinReward || rule.rewardCoins || 0} Coins
                    {rule.xpReward ? <span className="text-primary text-[10px] ml-2">(+{rule.xpReward} XP)</span> : null}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => {
                        toggleRewardRule(rule.id)
                        showNotice(`Reward rule status updated.`, 'info')
                      }}
                      className="cursor-pointer"
                      title="Click to Toggle Rule Status"
                    >
                      {rule.isEnabled !== false ? (
                        <Badge variant="success" className="hover:opacity-80">ENABLED</Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-400 border-red-500/40 hover:opacity-80">DISABLED</Badge>
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => handleOpenRuleModal(rule)}
                      className="p-1.5 rounded-md text-primary hover:bg-surface/60 transition-colors cursor-pointer"
                      title="Edit Reward Rule Values"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bonusCampaigns.map(camp => (
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
                  <span className="text-emerald-400 font-bold">+{camp.bonusCoins} Coins</span>
                  <span className="text-muted text-[10px] ml-2">({camp.currentClaims || 0} / {camp.maxClaims || 100} claims)</span>
                </div>

                <div className="pt-2 border-t border-border/40 text-[10px] font-mono text-muted flex justify-between items-center gap-2">
                  <span>Expires: {formatExpiryDisplay(camp.expiresAt)}</span>
                  <div className="flex items-center gap-1 bg-surface/20 border border-border/40 rounded-lg p-0.5 shrink-0">
                    <button
                      onClick={() => {
                        const newStatus = camp.status === 'Active' ? 'Expired' : 'Active';
                        updateBonusCampaign(camp.id, { status: newStatus });
                        showNotice(`Campaign status changed to ${newStatus}`, 'info');
                      }}
                      className={`p-1.5 rounded-md hover:bg-surface/60 transition-colors cursor-pointer ${
                        camp.status === 'Active' ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'
                      }`}
                      title={camp.status === 'Active' ? 'Pause Campaign' : 'Activate Campaign'}
                    >
                      {camp.status === 'Active' ? <Ban className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                    </button>
                    <button 
                      onClick={() => handleOpenCampModal(camp)} 
                      className="p-1.5 rounded-md text-primary hover:bg-surface/60 hover:text-primary-foreground transition-colors cursor-pointer"
                      title="Edit Campaign"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete campaign "${camp.title}"?`)) {
                          deleteBonusCampaign(camp.id);
                          showNotice(`Deleted campaign "${camp.title}"`, 'info');
                        }
                      }} 
                      className="p-1.5 rounded-md text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
                      title="Delete Campaign"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CREATE / EDIT CAMPAIGN MODAL SHEET */}
      <Sheet open={isCampModalOpen} onOpenChange={setIsCampModalOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl bg-background border-l border-border p-6 overflow-y-auto font-sans">
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
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Bonus Coins</label>
                  <Input
                    type="number"
                    value={campBonus}
                    onChange={e => setCampBonus(e.target.value)}
                    className="bg-surface/40 text-xs font-mono text-foreground"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Min Stake Req (Coins)</label>
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
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Expiry Date & Time</label>
                  <Input
                    type="datetime-local"
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

      {/* EDIT REWARD RULE MODAL SHEET */}
      <Sheet open={isRuleModalOpen} onOpenChange={setIsRuleModalOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-background border-l border-border p-6 overflow-y-auto font-sans">
          <div className="flex flex-col gap-6">
            <div className="border-b border-border/40 pb-4 pr-8">
              <h3 className="text-lg font-bold text-foreground">Edit Achievement Reward Rule</h3>
              <p className="text-xs text-muted mt-0.5">Modify coins reward and XP granted for this trigger event.</p>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1">Rule Name / Description</label>
                <Input
                  type="text"
                  value={ruleNameInput}
                  onChange={e => setRuleNameInput(e.target.value)}
                  className="bg-surface/40 text-xs font-mono text-foreground"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Reward Coins</label>
                  <Input
                    type="number"
                    value={ruleCoinsInput}
                    onChange={e => setRuleCoinsInput(e.target.value)}
                    className="bg-surface/40 text-xs font-mono text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">XP Reward</label>
                  <Input
                    type="number"
                    value={ruleXpInput}
                    onChange={e => setRuleXpInput(e.target.value)}
                    className="bg-surface/40 text-xs font-mono text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border/40">
                <Button type="button" variant="ghost" onClick={() => setIsRuleModalOpen(false)} className="text-xs font-mono">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" glow className="text-xs font-mono">
                  <Check className="h-4 w-4 mr-1.5" /> Save Rule
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
