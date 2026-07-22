import React, { useState } from 'react'
import {
  ShieldAlert,
  Coins,
  TrendingUp,
  Sliders,
  Lock,
  CreditCard,
  ArrowUpRight,
  Globe,
  Cpu,
  History,
  RotateCcw,
  Save,
  Layers,
  Zap,
  CheckCircle,
  AlertOctagon,
  Search
} from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { ConfirmationModal } from '../components/ui/confirmation-modal'
import { usePlatformSettings } from '../context/PlatformSettingsContext'

export const PlatformSettingsView: React.FC = () => {
  const {
    settings,
    updateSetting,
    updateCategoryFee,
    updateGatewayLimit,
    toggleRegionalRestriction,
    toggleEmergencySwitch,
    resetToDefaults,
    toastNotice
  } = usePlatformSettings()

  const [activeTab, setActiveTab] = useState<'fees' | 'deposits' | 'withdrawals' | 'betting' | 'escrow_ai' | 'risk_emergency' | 'audit'>('fees')
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false)
  const [selectedEmergencyKey, setSelectedEmergencyKey] = useState<string>('')
  const [logSearchQuery, setLogSearchQuery] = useState('')

  // Calculate live revenue projections based on 10,000,000 Coins monthly volume baseline
  const monthlyVolumeBaseline = 10000000
  const estimatedMonthlyRevenue = (monthlyVolumeBaseline * (settings.globalFeePercent / 100))
  const estimatedDailyRevenue = Math.floor(estimatedMonthlyRevenue / 30)
  const estimatedWeeklyRevenue = Math.floor(estimatedMonthlyRevenue / 4)
  const estimatedYearlyRevenue = Math.floor(estimatedMonthlyRevenue * 12)

  const handleOpenEmergencyModal = (key: string) => {
    setSelectedEmergencyKey(key)
    setEmergencyModalOpen(true)
  }

  const handleConfirmEmergencySwitch = () => {
    if (selectedEmergencyKey) {
      toggleEmergencySwitch(selectedEmergencyKey as any, 'Operator emergency intervention')
    }
    setEmergencyModalOpen(false)
  }

  const filteredLogs = settings.auditLogs.filter(log =>
    log.settingChanged.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
    log.adminName.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
    log.reason.toLowerCase().includes(logSearchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 pb-12 font-sans px-6 py-6 md:px-8 max-w-[1600px] mx-auto">

      {/* Toast Notice Banner */}
      {toastNotice && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-4 ${toastNotice.type === 'warning' || toastNotice.type === 'danger'
            ? 'bg-red-500/20 border-red-500/40 text-red-300'
            : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
          }`}>
          <AlertOctagon className="h-5 w-5 shrink-0" />
          <span className="text-xs font-mono font-bold">{toastNotice.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Sliders className="h-7 w-7 text-primary" /> Platform Fee & Financial Controls
            </h1>
            <Badge variant="pro" className="font-mono text-[10px] tracking-wider">
              ENTERPRISE GOVERNANCE v2.4
            </Badge>
          </div>
          <p className="text-xs text-muted font-mono">
            Central Command Center for Take-Rate Fees, Deposit/Withdrawal Caps, Escrow Rules, AI Oracles & Kill Switches
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="gap-1.5 text-xs font-mono border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Defaults
          </Button>
          <Button
            variant="primary"
            size="sm"
            glow
            onClick={() => updateSetting('globalFeePercent', settings.globalFeePercent, 'Manual config save')}
            className="gap-1.5 text-xs font-mono"
          >
            <Save className="h-3.5 w-3.5" /> Save Configuration
          </Button>
        </div>
      </div>

      {/* Section 12: Executive Revenue & Financial KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-surface/40 border border-border/50 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono text-muted uppercase block">Global Take Rate</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-mono text-primary">{settings.globalFeePercent.toFixed(1)}%</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
        </div>

        <div className="p-3.5 bg-surface/40 border border-border/50 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono text-muted uppercase block">Active Escrow Pot</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-mono text-amber-400">{(settings.totalLockedEscrow / 1000000).toFixed(1)}M Coins</span>
            <Lock className="h-4 w-4 text-amber-400" />
          </div>
        </div>

        <div className="p-3.5 bg-surface/40 border border-border/50 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono text-muted uppercase block">Est. Monthly Revenue</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-mono text-emerald-400">+{estimatedMonthlyRevenue.toLocaleString()}</span>
            <Coins className="h-4 w-4 text-emerald-400" />
          </div>
        </div>

        <div className="p-3.5 bg-surface/40 border border-border/50 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono text-muted uppercase block">AI Oracle Accuracy</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-mono text-cyan-400">{settings.aiAccuracyPercent}%</span>
            <Cpu className="h-4 w-4 text-cyan-400" />
          </div>
        </div>

        <div className="p-3.5 bg-surface/40 border border-border/50 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono text-muted uppercase block">Pending Escrow Release</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-mono text-purple-400">{settings.pendingSettlementsCount} Matches</span>
            <Zap className="h-4 w-4 text-purple-400" />
          </div>
        </div>

        <div className="p-3.5 bg-surface/40 border border-border/50 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono text-muted uppercase block">System Status</span>
          <div className="flex items-center justify-between">
            {settings.pauseAllBetting || settings.pauseAllDeposits || settings.maintenanceMode ? (
              <Badge variant="danger">🔴 HALTED</Badge>
            ) : (
              <Badge variant="success">● ONLINE</Badge>
            )}
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Main Sub-Tab Navigation Bar */}
      <div className="border-b border-border/40 bg-surface/20 rounded-xl p-1 flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'fees', label: '1. Take-Rate & Category Fees', icon: Sliders },
          { id: 'deposits', label: '2. Deposit Caps & Gateways', icon: CreditCard },
          { id: 'withdrawals', label: '3. Withdrawal & Security', icon: ArrowUpRight },
          { id: 'betting', label: '4. Betting & Challenge Limits', icon: Layers },
          { id: 'escrow_ai', label: '5. Escrow & AI Oracle Governance', icon: Cpu },
          { id: 'risk_emergency', label: '6. Risk & Emergency Kill Switches', icon: ShieldAlert },
          { id: 'audit', label: '7. Audit Trail & History', icon: History }
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono tracking-wider transition-all rounded-lg font-bold cursor-pointer whitespace-nowrap ${isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted hover:text-foreground hover:bg-surface/50'
                }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: GLOBAL PLATFORM FEE & CATEGORY-BASED FEES */}
      {activeTab === 'fees' && (
        <div className="space-y-6">

          {/* Section 1: Global Platform Fee & Live Revenue Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Global Take Rate Controller */}
            <div className="p-6 bg-surface/30 border border-border/50 rounded-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">Global Platform Take-Rate Percentage</h3>
                  <p className="text-xs text-muted font-mono">Sets default commission cut on winning P2P challenge pools</p>
                </div>
                <Badge variant="pro" className="font-mono text-xs">{settings.globalFeePercent.toFixed(1)}% FEE</Badge>
              </div>

              {/* Interactive Fee Pill Badges & Sleek Stepper Input */}
              <div className="space-y-4 font-mono">
                <span className="text-xs text-muted block font-bold uppercase tracking-wider">Quick Preset Fee Badges</span>
                <div className="flex flex-wrap gap-2">
                  {[2.5, 3.5, 5.0, 7.5, 10.0, 12.5, 15.0].map(val => (
                    <button
                      key={val}
                      onClick={() => updateSetting('globalFeePercent', val)}
                      className={`px-3.5 py-2 text-xs rounded-xl font-bold transition-all border cursor-pointer ${settings.globalFeePercent === val
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30 scale-105'
                          : 'bg-surface/50 border-border/50 text-muted hover:text-foreground hover:bg-surface'
                        }`}
                    >
                      {val.toFixed(1)}% {val === 5.0 && '(Default)'}
                    </button>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between bg-surface/40 p-4 border border-border/50 rounded-xl">
                  <div>
                    <span className="text-xs text-foreground font-bold block">Fine-Tune Custom Commission %</span>
                    <span className="text-[10px] text-muted block">Adjust by ±0.5% increments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateSetting('globalFeePercent', Math.max(0.5, parseFloat((settings.globalFeePercent - 0.5).toFixed(1))))}
                      className="h-9 w-9 text-base font-extrabold border-border/60 hover:bg-primary/20 hover:text-primary"
                    >
                      -
                    </Button>
                    <div className="relative w-28">
                      <Input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="20.0"
                        value={settings.globalFeePercent}
                        onChange={e => updateSetting('globalFeePercent', Math.min(20.0, Math.max(0.5, parseFloat(e.target.value) || 0.5)))}
                        className="text-center font-mono font-bold text-sm bg-surface border-primary/40 text-primary h-9"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted pointer-events-none">%</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateSetting('globalFeePercent', Math.min(20.0, parseFloat((settings.globalFeePercent + 0.5).toFixed(1))))}
                      className="h-9 w-9 text-base font-extrabold border-border/60 hover:bg-primary/20 hover:text-primary"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl space-y-2 font-mono text-xs">
                <span className="text-primary font-bold uppercase block">Platform Formula:</span>
                <p className="text-muted">
                  Winner Net Payout = <span className="text-foreground font-bold">(100% - {settings.globalFeePercent.toFixed(1)}%) × Total Escrow Pool</span>
                </p>
              </div>
            </div>

            {/* Live Revenue Impact Simulator Card */}
            <div className="p-6 bg-surface/30 border border-border/50 rounded-2xl space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" /> Revenue Impact Simulator
                </h3>
                <span className="text-[10px] text-muted uppercase">Base Vol: 10M Coins/Mo</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-surface/40 border border-border/40 rounded-xl">
                  <span className="text-[10px] text-muted block uppercase">Daily Treasury Est.</span>
                  <span className="text-lg font-bold text-emerald-400 block">+{estimatedDailyRevenue.toLocaleString()} Coins</span>
                </div>

                <div className="p-3 bg-surface/40 border border-border/40 rounded-xl">
                  <span className="text-[10px] text-muted block uppercase">Weekly Treasury Est.</span>
                  <span className="text-lg font-bold text-emerald-400 block">+{estimatedWeeklyRevenue.toLocaleString()} Coins</span>
                </div>

                <div className="p-3 bg-surface/40 border border-border/40 rounded-xl">
                  <span className="text-[10px] text-muted block uppercase">Monthly Treasury Est.</span>
                  <span className="text-lg font-bold text-emerald-400 block">+{estimatedMonthlyRevenue.toLocaleString()} Coins</span>
                </div>

                <div className="p-3 bg-surface/40 border border-border/40 rounded-xl">
                  <span className="text-[10px] text-muted block uppercase">Annual Treasury Est.</span>
                  <span className="text-lg font-bold text-emerald-400 block">+{estimatedYearlyRevenue.toLocaleString()} Coins</span>
                </div>
              </div>
            </div>

          </div>

          {/* Section 2: Category-Based Platform Fees Table */}
          <div className="p-6 bg-surface/30 border border-border/50 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Category-Based Platform Fee Overrides</h3>
                <p className="text-xs text-muted font-mono">Custom commission percentage overrides per challenge category</p>
              </div>
              <Badge variant="outline" className="font-mono text-xs">{settings.categoryFees.length} Categories Configured</Badge>
            </div>

            <div className="border border-border/60 rounded-xl overflow-hidden bg-surface/20">
              <Table>
                <TableHeader className="bg-surface/60 font-mono">
                  <TableRow>
                    <TableHead className="text-xs">Category Name</TableHead>
                    <TableHead className="text-xs">Total Wager Volume</TableHead>
                    <TableHead className="text-xs">Total Bets</TableHead>
                    <TableHead className="text-xs">Take Rate Fee Controls</TableHead>
                    <TableHead className="text-xs text-right">Est. Monthly Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="font-mono text-xs">
                  {settings.categoryFees.map(cat => (
                    <TableRow key={cat.id} className="hover:bg-surface/30">
                      <TableCell className="font-bold text-foreground">{cat.name}</TableCell>
                      <TableCell className="text-primary font-bold">{cat.totalVolume.toLocaleString()} Coins</TableCell>
                      <TableCell>{cat.totalBets.toLocaleString()} bets</TableCell>
                      <TableCell className="w-80">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCategoryFee(cat.id, Math.max(0.5, parseFloat((cat.feePercent - 0.5).toFixed(1))))}
                            className="h-7 w-7 text-xs font-bold border-border/60 p-0 hover:bg-primary/20 hover:text-primary"
                          >
                            -
                          </Button>
                          <div className="relative w-20">
                            <Input
                              type="number"
                              step="0.1"
                              min="0.5"
                              max="20.0"
                              value={cat.feePercent}
                              onChange={e => updateCategoryFee(cat.id, Math.min(20.0, Math.max(0.5, parseFloat(e.target.value) || 0.5)))}
                              className="text-center font-mono font-bold text-xs bg-surface border-primary/30 text-emerald-400 h-7 px-1"
                            />
                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted pointer-events-none">%</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCategoryFee(cat.id, Math.min(20.0, parseFloat((cat.feePercent + 0.5).toFixed(1))))}
                            className="h-7 w-7 text-xs font-bold border-border/60 p-0 hover:bg-primary/20 hover:text-primary"
                          >
                            +
                          </Button>

                          {/* Mini preset shortcuts */}
                          <div className="flex items-center gap-1 ml-1">
                            {[3.0, 5.0, 7.5].map(p => (
                              <button
                                key={p}
                                onClick={() => updateCategoryFee(cat.id, p)}
                                className={`text-[10px] px-1.5 py-0.5 rounded border font-mono transition-all ${cat.feePercent === p
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold scale-105'
                                    : 'bg-surface/40 text-muted border-border/40 hover:text-foreground hover:bg-surface'
                                  }`}
                              >
                                {p}%
                              </button>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-400">
                        +{Math.floor(cat.totalVolume * (cat.feePercent / 100)).toLocaleString()} Coins
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: DEPOSIT LIMITS & PAYMENT GATEWAY CAPS */}
      {activeTab === 'deposits' && (
        <div className="space-y-6 font-mono">

          {/* Section 3: Deposit Limits Controls */}
          <div className="p-6 bg-surface/30 border border-border/50 rounded-2xl space-y-6">
            <div className="border-b border-border/40 pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Global User Deposit Caps
              </h3>
              <p className="text-xs text-muted">Configure deposit ceilings across daily, weekly, and monthly periods</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-muted block">Minimum Deposit (Coins)</label>
                <Input
                  type="number"
                  value={settings.minDeposit}
                  onChange={e => updateSetting('minDeposit', parseInt(e.target.value) || 0)}
                  className="bg-surface/50 text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted block">Maximum Deposit Per Tx (Coins)</label>
                <Input
                  type="number"
                  value={settings.maxDeposit}
                  onChange={e => updateSetting('maxDeposit', parseInt(e.target.value) || 0)}
                  className="bg-surface/50 text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted block">First-Time Deposit Cap (Coins)</label>
                <Input
                  type="number"
                  value={settings.firstTimeDepositLimit}
                  onChange={e => updateSetting('firstTimeDepositLimit', parseInt(e.target.value) || 0)}
                  className="bg-surface/50 text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted block">Daily Deposit Limit (Coins)</label>
                <Input
                  type="number"
                  value={settings.dailyDepositLimit}
                  onChange={e => updateSetting('dailyDepositLimit', parseInt(e.target.value) || 0)}
                  className="bg-surface/50 text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted block">Weekly Deposit Limit (Coins)</label>
                <Input
                  type="number"
                  value={settings.weeklyDepositLimit}
                  onChange={e => updateSetting('weeklyDepositLimit', parseInt(e.target.value) || 0)}
                  className="bg-surface/50 text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted block">Monthly Deposit Limit (Coins)</label>
                <Input
                  type="number"
                  value={settings.monthlyDepositLimit}
                  onChange={e => updateSetting('monthlyDepositLimit', parseInt(e.target.value) || 0)}
                  className="bg-surface/50 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Payment Gateway Specific Caps Table */}
          <div className="p-6 bg-surface/30 border border-border/50 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-foreground">Payment Gateway Specific Caps & Enables</h3>

            <div className="border border-border/60 rounded-xl overflow-hidden bg-surface/20">
              <Table>
                <TableHeader className="bg-surface/60 text-xs">
                  <TableRow>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Gateway Status</TableHead>
                    <TableHead>Min Deposit Cap</TableHead>
                    <TableHead>Max Deposit Cap</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {settings.gatewayLimits.map(gw => (
                    <TableRow key={gw.id} className="hover:bg-surface/30">
                      <TableCell className="font-bold text-foreground">{gw.name}</TableCell>
                      <TableCell>
                        {gw.enabled ? (
                          <Badge variant="success">ENABLED</Badge>
                        ) : (
                          <Badge variant="danger">DISABLED</Badge>
                        )}
                      </TableCell>
                      <TableCell>{gw.minDeposit.toLocaleString()} Coins</TableCell>
                      <TableCell className="text-primary font-bold">{gw.maxDeposit.toLocaleString()} Coins</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={gw.enabled ? 'outline' : 'primary'}
                          onClick={() => updateGatewayLimit(gw.id, { enabled: !gw.enabled })}
                          className="text-[10px] h-7"
                        >
                          {gw.enabled ? 'Disable' : 'Enable'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: WITHDRAWAL LIMITS & SECURITY THRESHOLDS */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-6 font-mono">

          {/* Section 4: Withdrawal Limits */}
          <div className="p-6 bg-surface/30 border border-border/50 rounded-2xl space-y-6">
            <div className="border-b border-border/40 pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-amber-400" /> Withdrawal Caps & Auto-Approval Thresholds
              </h3>
              <p className="text-xs text-muted">Manage instant vs manual review limits and processing fees</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-muted block">Minimum Withdrawal (Coins)</label>
                <Input
                  type="number"
                  value={settings.minWithdrawal}
                  onChange={e => updateSetting('minWithdrawal', parseInt(e.target.value) || 0)}
                  className="bg-surface/50 text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted block">Max Withdrawal Per Tx (Coins)</label>
                <Input
                  type="number"
                  value={settings.maxWithdrawalPerTx}
                  onChange={e => updateSetting('maxWithdrawalPerTx', parseInt(e.target.value) || 0)}
                  className="bg-surface/50 text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted block">Daily Withdrawal Limit (Coins)</label>
                <Input
                  type="number"
                  value={settings.dailyWithdrawalLimit}
                  onChange={e => updateSetting('dailyWithdrawalLimit', parseInt(e.target.value) || 0)}
                  className="bg-surface/50 text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted block">Auto-Withdrawal Approval Ceiling</label>
                <Input
                  type="number"
                  value={settings.autoWithdrawalThreshold}
                  onChange={e => updateSetting('autoWithdrawalThreshold', parseInt(e.target.value) || 0)}
                  className="bg-surface/50 text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted block">Manual Admin Approval Threshold</label>
                <Input
                  type="number"
                  value={settings.manualApprovalThreshold}
                  onChange={e => updateSetting('manualApprovalThreshold', parseInt(e.target.value) || 0)}
                  className="bg-surface/50 text-xs text-amber-400 font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted block">Processing Fee (% Cut)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={settings.processingFeePercent}
                  onChange={e => updateSetting('processingFeePercent', parseFloat(e.target.value) || 0)}
                  className="bg-surface/50 text-xs"
                />
              </div>
            </div>

            {/* Security Verification Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-surface/40 border border-border/40 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-foreground block">Require SMS OTP Verification</span>
                  <span className="text-[10px] text-muted block">Mandatory 2FA code sent for withdrawals over 5,000 Coins</span>
                </div>
                <Button
                  size="sm"
                  variant={settings.requireSmsVerification ? 'primary' : 'outline'}
                  onClick={() => updateSetting('requireSmsVerification', !settings.requireSmsVerification)}
                  className="text-xs"
                >
                  {settings.requireSmsVerification ? 'Enabled' : 'Disabled'}
                </Button>
              </div>

              <div className="p-4 bg-surface/40 border border-border/40 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-foreground block">Require Biometric Verification</span>
                  <span className="text-[10px] text-muted block">Require FaceID / Fingerprint scan on native mobile apps</span>
                </div>
                <Button
                  size="sm"
                  variant={settings.requireBiometricVerification ? 'primary' : 'outline'}
                  onClick={() => updateSetting('requireBiometricVerification', !settings.requireBiometricVerification)}
                  className="text-xs"
                >
                  {settings.requireBiometricVerification ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 4: BETTING & CHALLENGE LIMITS */}
      {activeTab === 'betting' && (
        <div className="space-y-6 font-mono">

          {/* Section 5 & 6: Betting & Challenge Limits */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Betting Limits */}
            <div className="p-6 bg-surface/30 border border-border/50 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-foreground border-b border-border/40 pb-2">
                User Betting & Stake Ceilings
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Minimum Stake Per Bet</span>
                  <Input
                    type="number"
                    value={settings.minBetAmount}
                    onChange={e => updateSetting('minBetAmount', parseInt(e.target.value) || 0)}
                    className="w-36 bg-surface/50 text-xs"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted">Maximum Stake Per Bet</span>
                  <Input
                    type="number"
                    value={settings.maxBetAmount}
                    onChange={e => updateSetting('maxBetAmount', parseInt(e.target.value) || 0)}
                    className="w-36 bg-surface/50 text-xs font-bold text-primary"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted">Max Active Bets Per User</span>
                  <Input
                    type="number"
                    value={settings.maxActiveBetsPerUser}
                    onChange={e => updateSetting('maxActiveBetsPerUser', parseInt(e.target.value) || 0)}
                    className="w-36 bg-surface/50 text-xs"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted">Max Stake Exposure Per User</span>
                  <Input
                    type="number"
                    value={settings.maxExposurePerUser}
                    onChange={e => updateSetting('maxExposurePerUser', parseInt(e.target.value) || 0)}
                    className="w-36 bg-surface/50 text-xs text-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Challenge Creation Limits */}
            <div className="p-6 bg-surface/30 border border-border/50 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-foreground border-b border-border/40 pb-2">
                Challenge Creation & Pot Size Limits
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Min Challenge Duration (Hours)</span>
                  <Input
                    type="number"
                    value={settings.minChallengeDurationHours}
                    onChange={e => updateSetting('minChallengeDurationHours', parseInt(e.target.value) || 0)}
                    className="w-36 bg-surface/50 text-xs"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted">Max Challenge Duration (Days)</span>
                  <Input
                    type="number"
                    value={settings.maxChallengeDurationDays}
                    onChange={e => updateSetting('maxChallengeDurationDays', parseInt(e.target.value) || 0)}
                    className="w-36 bg-surface/50 text-xs"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted">Max Challenge Pot Size</span>
                  <Input
                    type="number"
                    value={settings.maxChallengePotSize}
                    onChange={e => updateSetting('maxChallengePotSize', parseInt(e.target.value) || 0)}
                    className="w-36 bg-surface/50 text-xs font-bold text-emerald-400"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted">Resolution Timeout (Hours)</span>
                  <Input
                    type="number"
                    value={settings.resolutionTimeoutHours}
                    onChange={e => updateSetting('resolutionTimeoutHours', parseInt(e.target.value) || 0)}
                    className="w-36 bg-surface/50 text-xs text-cyan-400"
                  />
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 5: ESCROW & AI ORACLE GOVERNANCE */}
      {activeTab === 'escrow_ai' && (
        <div className="space-y-6 font-mono">

          {/* Section 7: Escrow Controls */}
          <div className="p-6 bg-surface/30 border border-border/50 rounded-2xl space-y-6">
            <div className="border-b border-border/40 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Lock className="h-5 w-5 text-amber-400" /> Escrow Protocol & Reserve Safeguards
                </h3>
                <p className="text-xs text-muted">Control automatic locking, hold times, and reserve funds</p>
              </div>
              <Badge variant="pro">RESERVE: {settings.escrowReservePercent}%</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-muted block">Escrow Hold Time (Hours)</label>
                <Input
                  type="number"
                  value={settings.escrowHoldTimeHours}
                  onChange={e => updateSetting('escrowHoldTimeHours', parseInt(e.target.value) || 0)}
                  className="bg-surface/50 text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted block">Refund Timeout (Hours)</label>
                <Input
                  type="number"
                  value={settings.refundTimeoutHours}
                  onChange={e => updateSetting('refundTimeoutHours', parseInt(e.target.value) || 0)}
                  className="bg-surface/50 text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted block">Escrow Reserve Percentage (%)</label>
                <Input
                  type="number"
                  step="0.5"
                  value={settings.escrowReservePercent}
                  onChange={e => updateSetting('escrowReservePercent', parseFloat(e.target.value) || 0)}
                  className="bg-surface/50 text-xs text-emerald-400 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 8: AI Resolution Controls */}
          <div className="p-6 bg-surface/30 border border-border/50 rounded-2xl space-y-6">
            <div className="border-b border-border/40 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-cyan-400" /> Gemini 2.0 AI Oracle Governance
                </h3>
                <p className="text-xs text-muted">Confidence score thresholds, retry attempts, and fallback triggers</p>
              </div>
              <Badge variant="success">AI ACCURACY: {settings.aiAccuracyPercent}%</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-muted block">Min AI Confidence Score (%)</label>
                <Input
                  type="number"
                  step="0.5"
                  value={settings.minAiConfidenceScore}
                  onChange={e => updateSetting('minAiConfidenceScore', parseFloat(e.target.value) || 0)}
                  className="bg-surface/50 text-xs text-cyan-400 font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted block">Auto-Settlement Threshold (%)</label>
                <Input
                  type="number"
                  step="0.5"
                  value={settings.autoSettlementThreshold}
                  onChange={e => updateSetting('autoSettlementThreshold', parseFloat(e.target.value) || 0)}
                  className="bg-surface/50 text-xs text-emerald-400 font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted block">Max AI Retry Attempts</label>
                <Input
                  type="number"
                  value={settings.maxAiRetryAttempts}
                  onChange={e => updateSetting('maxAiRetryAttempts', parseInt(e.target.value) || 0)}
                  className="bg-surface/50 text-xs"
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 6: RISK & EMERGENCY KILL SWITCHES */}
      {activeTab === 'risk_emergency' && (
        <div className="space-y-6 font-mono">

          {/* Section 11: Emergency Controls (Kill Switches) */}
          <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-red-500/20 pb-3">
              <div>
                <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
                  <AlertOctagon className="h-5 w-5 text-red-400" /> Emergency System Kill Switches
                </h3>
                <p className="text-xs text-red-300/80">Immediate 1-click circuit breakers for platform security</p>
              </div>
              <Badge variant="danger">HIGH RISK PANEL</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {[
                { key: 'pauseAllBetting', label: 'Pause All Betting', desc: 'Halt all active P2P bet placements' },
                { key: 'pauseAllDeposits', label: 'Pause All Deposits', desc: 'Block incoming wallet top-ups' },
                { key: 'pauseAllWithdrawals', label: 'Pause All Withdrawals', desc: 'Freeze outgoing treasury payouts' },
                { key: 'pauseChallengeCreation', label: 'Pause Challenge Creation', desc: 'Prevent users from creating new matches' },
                { key: 'pauseAiResolution', label: 'Pause AI Resolution', desc: 'Halt automated oracle settlements' },
                { key: 'maintenanceMode', label: 'Enable Maintenance Mode', desc: 'Put full application into maintenance' }
              ].map(sw => {
                const isActive = (settings as any)[sw.key]
                return (
                  <div key={sw.key} className="p-4 bg-surface/50 border border-border/50 rounded-xl space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-xs text-foreground block">{sw.label}</span>
                      <span className="text-[10px] text-muted block mt-0.5">{sw.desc}</span>
                    </div>
                    <Button
                      size="sm"
                      variant={isActive ? 'danger' : 'outline'}
                      onClick={() => handleOpenEmergencyModal(sw.key)}
                      className={`text-xs font-bold mt-2 ${isActive ? 'bg-red-600 text-white' : 'border-red-500/30 text-red-400'}`}
                    >
                      {isActive ? '🔴 ACTIVE (HALTED)' : 'Activate Switch'}
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section 9: Regional Restrictions */}
          <div className="p-6 bg-surface/30 border border-border/50 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Regional Compliance & Geofencing Toggles
            </h3>

            <div className="border border-border/60 rounded-xl overflow-hidden bg-surface/20">
              <Table>
                <TableHeader className="bg-surface/60 text-xs">
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>State / Region</TableHead>
                    <TableHead>Betting</TableHead>
                    <TableHead>Deposits</TableHead>
                    <TableHead>Withdrawals</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {settings.regionalRestrictions.map(r => (
                    <TableRow key={r.id} className="hover:bg-surface/30">
                      <TableCell className="font-bold text-foreground">{r.country}</TableCell>
                      <TableCell>{r.region}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={r.bettingAllowed ? 'primary' : 'outline'}
                          onClick={() => toggleRegionalRestriction(r.id, 'bettingAllowed')}
                          className="text-[10px] h-6 px-2"
                        >
                          {r.bettingAllowed ? 'Allowed' : 'Blocked'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={r.depositsAllowed ? 'primary' : 'outline'}
                          onClick={() => toggleRegionalRestriction(r.id, 'depositsAllowed')}
                          className="text-[10px] h-6 px-2"
                        >
                          {r.depositsAllowed ? 'Allowed' : 'Blocked'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={r.withdrawalsAllowed ? 'primary' : 'outline'}
                          onClick={() => toggleRegionalRestriction(r.id, 'withdrawalsAllowed')}
                          className="text-[10px] h-6 px-2"
                        >
                          {r.withdrawalsAllowed ? 'Allowed' : 'Blocked'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 7: AUDIT TRAIL & CHANGE HISTORY */}
      {activeTab === 'audit' && (
        <div className="space-y-6 font-mono">

          {/* Section 13: Audit Logs */}
          <div className="p-6 bg-surface/30 border border-border/50 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" /> Admin Configuration Audit Trail
                </h3>
                <p className="text-xs text-muted">Complete immutable log of all setting edits, timestamps, and IP addresses</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                <Input
                  placeholder="Search logs by setting, admin..."
                  value={logSearchQuery}
                  onChange={e => setLogSearchQuery(e.target.value)}
                  className="pl-9 bg-surface/50 text-xs h-8 rounded-xl"
                />
              </div>
            </div>

            <div className="border border-border/60 rounded-xl overflow-hidden bg-surface/20">
              <Table>
                <TableHeader className="bg-surface/60 text-xs">
                  <TableRow>
                    <TableHead>Log Ref</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Setting Modified</TableHead>
                    <TableHead>Previous</TableHead>
                    <TableHead>New Value</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {filteredLogs.map(log => (
                    <TableRow key={log.id} className="hover:bg-surface/30">
                      <TableCell className="font-bold text-primary">{log.id}</TableCell>
                      <TableCell className="font-bold text-foreground">{log.adminName}</TableCell>
                      <TableCell className="text-muted">{log.settingChanged}</TableCell>
                      <TableCell className="text-red-400">{log.previousValue}</TableCell>
                      <TableCell className="text-emerald-400 font-bold">{log.newValue}</TableCell>
                      <TableCell className="text-muted text-[11px]">{log.reason}</TableCell>
                      <TableCell className="text-right text-[10px] text-muted">{log.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

        </div>
      )}

      {/* Confirmation Modal for Emergency Kill Switches */}
      <ConfirmationModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
        onConfirm={handleConfirmEmergencySwitch}
        title="⚠️ Confirm Emergency Kill Switch Action"
        description={`Are you sure you want to toggle the Emergency Switch: '${selectedEmergencyKey.toUpperCase()}'? This will immediately affect platform operations.`}
        confirmText="Confirm Circuit Breaker"
        variant="danger"
      />

    </div>
  )
}
