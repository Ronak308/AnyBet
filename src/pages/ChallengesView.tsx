import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ListFilter, 
  Layers, 
  Zap, 
  AlertTriangle, 
  BarChart3, 
  ArrowLeft 
} from 'lucide-react'
import { useChallenges } from '../context/ChallengesContext'
import { AllChallengesModule } from './challenges/AllChallengesModule'
import { CategoriesModule } from './challenges/CategoriesModule'
import { LiveSettlementModule } from './challenges/LiveSettlementModule'
import { DisputesModule } from './challenges/DisputesModule'
import { AnalyticsModule } from './challenges/AnalyticsModule'
import { ChallengeDetailsSheet } from './challenges/ChallengeDetailsSheet'

interface ChallengesViewProps {
  activeTab?: string
  navigate: (tab: string) => void
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({ activeTab, navigate }) => {
  const { selectedChallenge, setSelectedChallenge } = useChallenges()

  // Compute active sub-tab from prop or default to 'all'
  const currentSubTab = useMemo(() => {
    if (activeTab && activeTab.startsWith('challenges-')) {
      const sub = activeTab.replace('challenges-', '')
      if (['all', 'categories', 'live', 'disputes', 'analytics'].includes(sub)) {
        return sub as 'all' | 'categories' | 'live' | 'disputes' | 'analytics'
      }
    }
    return 'all'
  }, [activeTab])

  // Get active tab metadata
  const activeHeaderInfo = useMemo(() => {
    switch (currentSubTab) {
      case 'all':
        return {
          title: 'All Challenges',
          description: 'Centralized master list of all wagers and prediction pools across AnyBet.',
          icon: ListFilter
        }
      case 'categories':
        return {
          title: 'Categories',
          description: 'Manage all available challenge categories, display order, and visibility settings.',
          icon: Layers
        }
      case 'live':
        return {
          title: 'Live Challenges & Settlement',
          description: 'Real-time oversight of ongoing events, AI Oracle resolution feeds, and reward distribution.',
          icon: Zap
        }
      case 'disputes':
        return {
          title: 'Disputes Resolution Desk',
          description: 'Fair arbitration desk for contested challenge results, evidence inspection, and automated refunds.',
          icon: AlertTriangle
        }
      case 'analytics':
        return {
          title: 'Challenge Analytics & Reports',
          description: 'Platform performance intelligence, participation metrics, and exportable audit reports.',
          icon: BarChart3
        }
      default:
        return {
          title: 'All Challenges',
          description: 'Centralized master list of all wagers and prediction pools across AnyBet.',
          icon: ListFilter
        }
    }
  }, [currentSubTab])

  const HeaderIcon = activeHeaderInfo.icon

  const renderActiveModule = () => {
    switch (currentSubTab) {
      case 'all':
        return <AllChallengesModule />
      case 'categories':
        return <CategoriesModule />
      case 'live':
        return <LiveSettlementModule />
      case 'disputes':
        return <DisputesModule />
      case 'analytics':
        return <AnalyticsModule />
      default:
        return <AllChallengesModule />
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
              onClick={() => navigate('dashboard')}
              className="text-[10px] font-mono text-muted hover:text-primary transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" /> Back to Dashboard
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

      {/* Render Sub-Module */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSubTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {renderActiveModule()}
        </motion.div>
      </AnimatePresence>

      {/* Challenge Details Slide-Over Sheet */}
      <ChallengeDetailsSheet
        challenge={selectedChallenge}
        onClose={() => setSelectedChallenge(null)}
      />

    </motion.div>
  )
}
