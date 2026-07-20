import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Coins, 
  History, 
  Gift, 
  Building2, 
  ArrowLeft 
} from 'lucide-react'
import { WalletsModule } from './financials/WalletsModule'
import { TransactionsModule } from './financials/TransactionsModule'
import { RewardsModule } from './financials/RewardsModule'
import { TreasuryModule } from './financials/TreasuryModule'
import { WalletDetailsSheet } from './financials/WalletDetailsSheet'
import type { UserWallet } from '../context/WalletContext'

export const FinancialsView: React.FC<{ activeTab?: string; navigate: (tab: string) => void }> = ({ activeTab, navigate }) => {
  // Compute active sub-tab from activeTab prop or default to wallet
  const currentSubTab = useMemo(() => {
    if (activeTab && activeTab.startsWith('financials-')) {
      const sub = activeTab.replace('financials-', '')
      if (['wallet', 'transactions', 'rewards', 'treasury'].includes(sub)) {
        return sub as 'wallet' | 'transactions' | 'rewards' | 'treasury'
      }
    }
    return 'wallet'
  }, [activeTab])

  const [activeSubTab, setActiveSubTab] = useState<'wallet' | 'transactions' | 'rewards' | 'treasury'>(currentSubTab)
  const [inspectedWallet, setInspectedWallet] = useState<UserWallet | null>(null)

  React.useEffect(() => {
    if (activeTab && activeTab.startsWith('financials-')) {
      const sub = activeTab.replace('financials-', '')
      if (['wallet', 'transactions', 'rewards', 'treasury'].includes(sub)) {
        setActiveSubTab(sub as any)
      }
    }
  }, [activeTab])

  const activeHeaderInfo = useMemo(() => {
    switch (activeSubTab) {
      case 'transactions':
        return {
          title: 'Transactions Audit Ledger',
          description: 'Master record of all credits, debits, stakes, wins, and platform fees.',
          icon: History
        }
      case 'rewards':
        return {
          title: 'Rewards & Bonus Engine',
          description: 'Manage daily login free coins, streak rules, and promo code campaigns.',
          icon: Gift
        }
      case 'treasury':
        return {
          title: 'Treasury & Revenue Vault',
          description: 'Platform 5% wager fee accumulation, liquidity reserve, and withdrawal approvals.',
          icon: Building2
        }
      default:
        return {
          title: 'Wallets & Store Packages',
          description: 'User balance management, credit/deduct coins, coin store bundles, and wallet freezes.',
          icon: Coins
        }
    }
  }, [activeSubTab])

  const HeaderIcon = activeHeaderInfo.icon

  const renderActiveModule = () => {
    switch (activeSubTab) {
      case 'transactions':
        return <TransactionsModule />
      case 'rewards':
        return <RewardsModule />
      case 'treasury':
        return <TreasuryModule />
      default:
        return <WalletsModule onInspectWallet={w => setInspectedWallet(w)} />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="p-6 flex flex-col gap-6 w-full font-sans select-none min-h-screen pb-16"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <button
              onClick={() => navigate('operations')}
              className="text-[10px] font-mono text-muted hover:text-primary transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" /> Back to Operations
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/30 text-primary">
              <HeaderIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-sans text-foreground">{activeHeaderInfo.title}</h2>
              <p className="text-xs text-muted font-sans mt-0.5">{activeHeaderInfo.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Render Active Sub-Module */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {renderActiveModule()}
        </motion.div>
      </AnimatePresence>

      {/* User Wallet Details Slide-Over Sheet */}
      <WalletDetailsSheet
        wallet={inspectedWallet}
        onClose={() => setInspectedWallet(null)}
      />
    </motion.div>
  )
}
