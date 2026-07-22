import React, { createContext, useContext, useState, useEffect } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase'

export interface CategoryFee {
  id: string
  name: string
  feePercent: number
  totalVolume: number
  totalBets: number
  monthlyCommission: number
}

export interface PaymentGatewayLimit {
  id: string
  name: string
  enabled: boolean
  minDeposit: number
  maxDeposit: number
}

export interface RegionalRestriction {
  id: string
  country: string
  region: string
  bettingAllowed: boolean
  depositsAllowed: boolean
  withdrawalsAllowed: boolean
}

export interface AuditLogItem {
  id: string
  adminName: string
  settingChanged: string
  previousValue: string
  newValue: string
  timestamp: string
  ipAddress: string
  reason: string
}

export interface PlatformSettingsState {
  // 1. Global Fee
  globalFeePercent: number
  
  // 2. Category Fees
  categoryFees: CategoryFee[]

  // 3. Deposit Caps
  minDeposit: number
  maxDeposit: number
  dailyDepositLimit: number
  weeklyDepositLimit: number
  monthlyDepositLimit: number
  firstTimeDepositLimit: number
  gatewayLimits: PaymentGatewayLimit[]

  // 4. Withdrawal Caps & Security
  minWithdrawal: number
  maxWithdrawalPerTx: number
  dailyWithdrawalLimit: number
  weeklyWithdrawalLimit: number
  monthlyWithdrawalLimit: number
  instantWithdrawalFee: number
  processingFeePercent: number
  autoWithdrawalThreshold: number
  manualApprovalThreshold: number
  requireSmsVerification: boolean
  requireBiometricVerification: boolean

  // 5. Betting Limits
  minBetAmount: number
  maxBetAmount: number
  maxActiveBetsPerUser: number
  maxDailyBetsPerUser: number
  maxStakePerChallenge: number
  maxExposurePerUser: number
  maxParticipantsPerChallenge: number

  // 6. Challenge Limits
  minChallengeDurationHours: number
  maxChallengeDurationDays: number
  maxChallengePotSize: number
  maxPrivateChallengesPerUser: number
  maxPublicChallengesPerUser: number
  resolutionTimeoutHours: number

  // 7. Escrow Controls
  autoEscrowLock: boolean
  autoEscrowRelease: boolean
  escrowHoldTimeHours: number
  manualEscrowApprovalThreshold: number
  refundTimeoutHours: number
  escrowReservePercent: number
  totalLockedEscrow: number
  releasedEscrow: number
  pendingSettlementsCount: number

  // 8. AI Resolution Controls
  minAiConfidenceScore: number
  autoSettlementThreshold: number
  manualReviewThreshold: number
  maxAiRetryAttempts: number
  oracleTimeoutSeconds: number
  aiFallbackRulesEnabled: boolean
  manualOverrideEnabled: boolean
  aiAccuracyPercent: number
  avgSettlementTimeMinutes: number

  // 9. Regional Restrictions
  regionalRestrictions: RegionalRestriction[]

  // 10. Risk & Fraud Thresholds
  highValueTxAlertThreshold: number
  suspiciousVelocityBetCount: number
  rapidDepositAlertCount: number
  rapidWithdrawalAlertCount: number
  deviceRiskScoreThreshold: number
  autoFreezeOnRisk: boolean
  activeFraudAlertsCount: number

  // 11. Emergency Kill Switches
  pauseAllBetting: boolean
  pauseAllDeposits: boolean
  pauseAllWithdrawals: boolean
  pauseChallengeCreation: boolean
  pauseAiResolution: boolean
  freezeEscrow: boolean
  maintenanceMode: boolean

  // 13. Audit Logs
  auditLogs: AuditLogItem[]
}

interface PlatformSettingsContextType {
  settings: PlatformSettingsState
  updateSetting: <K extends keyof PlatformSettingsState>(key: K, value: PlatformSettingsState[K], reason?: string) => void
  updateCategoryFee: (id: string, feePercent: number) => void
  updateGatewayLimit: (id: string, updates: Partial<PaymentGatewayLimit>) => void
  toggleRegionalRestriction: (id: string, field: 'bettingAllowed' | 'depositsAllowed' | 'withdrawalsAllowed') => void
  toggleEmergencySwitch: (key: keyof PlatformSettingsState, reason: string) => void
  resetToDefaults: () => void
  showToastNotice: (msg: string, type?: 'success' | 'warning' | 'info' | 'danger') => void
  toastNotice: { msg: string; type: string } | null
}

const defaultSettingsState: PlatformSettingsState = {
  globalFeePercent: 5.0,
  categoryFees: [
    { id: 'cat-1', name: 'Sports', feePercent: 5.0, totalVolume: 4250000, totalBets: 14200, monthlyCommission: 212500 },
    { id: 'cat-2', name: 'Fitness', feePercent: 4.5, totalVolume: 1850000, totalBets: 6800, monthlyCommission: 83250 },
    { id: 'cat-3', name: 'Weather', feePercent: 6.0, totalVolume: 920000, totalBets: 3100, monthlyCommission: 55200 },
    { id: 'cat-4', name: 'Finance & Crypto', feePercent: 5.5, totalVolume: 5100000, totalBets: 18900, monthlyCommission: 280500 },
    { id: 'cat-5', name: 'Entertainment', feePercent: 5.0, totalVolume: 1400000, totalBets: 4900, monthlyCommission: 70000 },
    { id: 'cat-6', name: 'Gaming & Esports', feePercent: 4.8, totalVolume: 2900000, totalBets: 9800, monthlyCommission: 139200 },
    { id: 'cat-7', name: 'Custom Pools', feePercent: 6.5, totalVolume: 750000, totalBets: 2100, monthlyCommission: 48750 }
  ],
  minDeposit: 100,
  maxDeposit: 1000000,
  dailyDepositLimit: 250000,
  weeklyDepositLimit: 1000000,
  monthlyDepositLimit: 3000000,
  firstTimeDepositLimit: 50000,
  gatewayLimits: [
    { id: 'gw-1', name: 'Stripe Payment Gateway', enabled: true, minDeposit: 100, maxDeposit: 500000 },
    { id: 'gw-2', name: 'Apple Pay Direct', enabled: true, minDeposit: 100, maxDeposit: 250000 },
    { id: 'gw-3', name: 'Google Pay', enabled: true, minDeposit: 100, maxDeposit: 250000 },
    { id: 'gw-4', name: 'Bank Transfer (ACH / Wire)', enabled: true, minDeposit: 1000, maxDeposit: 1000000 },
    { id: 'gw-5', name: 'Debit Card (Visa/Mastercard)', enabled: true, minDeposit: 100, maxDeposit: 100000 },
    { id: 'gw-6', name: 'Credit Card', enabled: false, minDeposit: 100, maxDeposit: 50000 }
  ],
  minWithdrawal: 500,
  maxWithdrawalPerTx: 100000,
  dailyWithdrawalLimit: 250000,
  weeklyWithdrawalLimit: 1000000,
  monthlyWithdrawalLimit: 3000000,
  instantWithdrawalFee: 25,
  processingFeePercent: 1.2,
  autoWithdrawalThreshold: 50000,
  manualApprovalThreshold: 100000,
  requireSmsVerification: true,
  requireBiometricVerification: false,

  minBetAmount: 10,
  maxBetAmount: 50000,
  maxActiveBetsPerUser: 25,
  maxDailyBetsPerUser: 100,
  maxStakePerChallenge: 500000,
  maxExposurePerUser: 250000,
  maxParticipantsPerChallenge: 10000,

  minChallengeDurationHours: 1,
  maxChallengeDurationDays: 30,
  maxChallengePotSize: 1000000,
  maxPrivateChallengesPerUser: 10,
  maxPublicChallengesPerUser: 20,
  resolutionTimeoutHours: 24,

  autoEscrowLock: true,
  autoEscrowRelease: true,
  escrowHoldTimeHours: 12,
  manualEscrowApprovalThreshold: 100000,
  refundTimeoutHours: 48,
  escrowReservePercent: 5.0,
  totalLockedEscrow: 14800000,
  releasedEscrow: 89500000,
  pendingSettlementsCount: 14,

  minAiConfidenceScore: 90.0,
  autoSettlementThreshold: 95.0,
  manualReviewThreshold: 85.0,
  maxAiRetryAttempts: 3,
  oracleTimeoutSeconds: 30,
  aiFallbackRulesEnabled: true,
  manualOverrideEnabled: true,
  aiAccuracyPercent: 98.6,
  avgSettlementTimeMinutes: 2.4,

  regionalRestrictions: [
    { id: 'reg-1', country: 'United States', region: 'California (CA)', bettingAllowed: true, depositsAllowed: true, withdrawalsAllowed: true },
    { id: 'reg-2', country: 'United States', region: 'New York (NY)', bettingAllowed: true, depositsAllowed: true, withdrawalsAllowed: true },
    { id: 'reg-3', country: 'United Kingdom', region: 'England & Wales', bettingAllowed: true, depositsAllowed: true, withdrawalsAllowed: true },
    { id: 'reg-4', country: 'India', region: 'Maharashtra', bettingAllowed: true, depositsAllowed: true, withdrawalsAllowed: true },
    { id: 'reg-5', country: 'Germany', region: 'Bavaria', bettingAllowed: true, depositsAllowed: true, withdrawalsAllowed: true },
    { id: 'reg-6', country: 'Restricted Region', region: 'High Risk Geo Zone', bettingAllowed: false, depositsAllowed: false, withdrawalsAllowed: false }
  ],

  highValueTxAlertThreshold: 50000,
  suspiciousVelocityBetCount: 15,
  rapidDepositAlertCount: 5,
  rapidWithdrawalAlertCount: 3,
  deviceRiskScoreThreshold: 80,
  autoFreezeOnRisk: true,
  activeFraudAlertsCount: 3,

  pauseAllBetting: false,
  pauseAllDeposits: false,
  pauseAllWithdrawals: false,
  pauseChallengeCreation: false,
  pauseAiResolution: false,
  freezeEscrow: false,
  maintenanceMode: false,

  auditLogs: [
    { id: 'LOG-901', adminName: 'Admin System', settingChanged: 'Platform Global Fee', previousValue: '4.5%', newValue: '5.0%', timestamp: '2026-07-22 14:15:00', ipAddress: '192.168.1.1', reason: 'Q3 Take-rate adjustment' },
    { id: 'LOG-882', adminName: 'Admin System', settingChanged: 'Max Single Bet Cap', previousValue: '25,000 Coins', newValue: '50,000 Coins', timestamp: '2026-07-21 11:30:00', ipAddress: '192.168.1.1', reason: 'High Roller demand increase' },
    { id: 'LOG-771', adminName: 'Admin System', settingChanged: 'AI Auto-Settlement Threshold', previousValue: '92.0%', newValue: '95.0%', timestamp: '2026-07-20 09:00:00', ipAddress: '192.168.1.1', reason: 'Enhanced Oracle Accuracy policy' }
  ]
}

const PlatformSettingsContext = createContext<PlatformSettingsContextType | undefined>(undefined)

export const PlatformSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PlatformSettingsState>(() => {
    const saved = localStorage.getItem('anybet_platform_settings')
    if (saved) {
      try {
        return { ...defaultSettingsState, ...JSON.parse(saved) }
      } catch (e) {
        return defaultSettingsState
      }
    }
    return defaultSettingsState
  })

  const [toastNotice, setToastNotice] = useState<{ msg: string; type: string } | null>(null)

  // Real-time Firestore Listener & LocalStorage Sync
  useEffect(() => {
    // 1. Sync to LocalStorage
    localStorage.setItem('anybet_platform_settings', JSON.stringify(settings))

    // 2. Sync to Firebase Firestore asynchronously
    const docRef = doc(db, 'platform_settings', 'global_config')
    setDoc(docRef, settings, { merge: true }).catch(err => {
      console.warn('Firestore sync note:', err)
    })
  }, [settings])

  // Subscribe to Firestore Real-time Updates
  useEffect(() => {
    const docRef = doc(db, 'platform_settings', 'global_config')
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const cloudData = snapshot.data() as PlatformSettingsState
        setSettings(prev => ({ ...prev, ...cloudData }))
      }
    }, (error) => {
      console.warn('Firestore subscription note:', error)
    })

    return () => unsubscribe()
  }, [])

  const showToastNotice = (msg: string, type: 'success' | 'warning' | 'info' | 'danger' = 'success') => {
    setToastNotice({ msg, type })
    setTimeout(() => setToastNotice(null), 3500)
  }

  const updateSetting = <K extends keyof PlatformSettingsState>(key: K, value: PlatformSettingsState[K], reason: string = 'Operator manual update') => {
    setSettings(prev => {
      const prevValStr = String(prev[key])
      const newValStr = String(value)

      const newLog: AuditLogItem = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        adminName: 'Super Admin',
        settingChanged: String(key).replace(/([A-Z])/g, ' $1').toUpperCase(),
        previousValue: prevValStr,
        newValue: newValStr,
        timestamp: new Date().toLocaleString(),
        ipAddress: '192.168.1.100',
        reason
      }

      return {
        ...prev,
        [key]: value,
        auditLogs: [newLog, ...prev.auditLogs]
      }
    })
    showToastNotice(`Setting '${String(key)}' updated successfully.`, 'success')
  }

  const updateCategoryFee = (id: string, feePercent: number) => {
    setSettings(prev => ({
      ...prev,
      categoryFees: prev.categoryFees.map(cat => cat.id === id ? { ...cat, feePercent } : cat)
    }))
    showToastNotice('Category fee percentage updated.', 'success')
  }

  const updateGatewayLimit = (id: string, updates: Partial<PaymentGatewayLimit>) => {
    setSettings(prev => ({
      ...prev,
      gatewayLimits: prev.gatewayLimits.map(gw => gw.id === id ? { ...gw, ...updates } : gw)
    }))
    showToastNotice('Payment gateway rules updated.', 'success')
  }

  const toggleRegionalRestriction = (id: string, field: 'bettingAllowed' | 'depositsAllowed' | 'withdrawalsAllowed') => {
    setSettings(prev => ({
      ...prev,
      regionalRestrictions: prev.regionalRestrictions.map(r => r.id === id ? { ...r, [field]: !r[field] } : r)
    }))
    showToastNotice('Regional restriction policy updated.', 'info')
  }

  const toggleEmergencySwitch = (key: keyof PlatformSettingsState, reason: string) => {
    setSettings(prev => {
      const currentVal = !!prev[key]
      const newVal = !currentVal
      
      const newLog: AuditLogItem = {
        id: `EMG-${Date.now().toString().slice(-4)}`,
        adminName: 'Super Admin (Emergency)',
        settingChanged: `KILL SWITCH: ${String(key).toUpperCase()}`,
        previousValue: currentVal ? 'ACTIVE (TRUE)' : 'NORMAL (FALSE)',
        newValue: newVal ? 'ACTIVATED (TRUE)' : 'DEACTIVATED (FALSE)',
        timestamp: new Date().toLocaleString(),
        ipAddress: '192.168.1.100',
        reason: reason || 'Emergency intervention trigger'
      }

      return {
        ...prev,
        [key]: newVal,
        auditLogs: [newLog, ...prev.auditLogs]
      }
    })
    showToastNotice(`Emergency Switch '${String(key)}' toggled.`, 'warning')
  }

  const resetToDefaults = () => {
    setSettings(defaultSettingsState)
    showToastNotice('All platform settings reset to system defaults.', 'warning')
  }

  return (
    <PlatformSettingsContext.Provider
      value={{
        settings,
        updateSetting,
        updateCategoryFee,
        updateGatewayLimit,
        toggleRegionalRestriction,
        toggleEmergencySwitch,
        resetToDefaults,
        showToastNotice,
        toastNotice
      }}
    >
      {children}
    </PlatformSettingsContext.Provider>
  )
}

export const usePlatformSettings = () => {
  const context = useContext(PlatformSettingsContext)
  if (!context) {
    throw new Error('usePlatformSettings must be used within a PlatformSettingsProvider')
  }
  return context
}
