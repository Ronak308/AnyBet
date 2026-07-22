import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, 
  ListFilter, 
  Settings, 
  History, 
  ArrowLeft,
  ShieldAlert
} from 'lucide-react'
import { useOracle } from '../context/OracleContext'
import { OracleControlCenter } from './oracle/OracleControlCenter'
import { OracleSettlementCenter } from './oracle/OracleSettlementCenter'
import { OracleConfiguration } from './oracle/OracleConfiguration'
import { OracleMonitoring } from './oracle/OracleMonitoring'

interface OracleConfigViewProps {
  activeTab?: string
  navigate: (tab: string) => void
}

export const OracleConfigView: React.FC<OracleConfigViewProps> = ({ activeTab, navigate }) => {
  const { isEmergencyShutdown } = useOracle()

  // Compute active sub-tab from route path or prop
  const currentSubTab = useMemo(() => {
    if (activeTab) {
      if (activeTab === 'ai-oracle-settlement' || activeTab === 'oracle-settlement') return 'settlement'
      if (activeTab === 'ai-oracle-config' || activeTab === 'oracle-config') return 'config'
      if (activeTab === 'ai-oracle-monitoring' || activeTab === 'oracle-monitoring') return 'monitoring'
      if (activeTab === 'ai-oracle-control' || activeTab === 'ai-oracle' || activeTab === 'oracle') return 'control'
    }
    return 'control'
  }, [activeTab])

  const activeHeaderInfo = useMemo(() => {
    switch (currentSubTab) {
      case 'control':
        return {
          title: 'AI Oracle Control Center',
          description: 'Autonomous settlement engine telemetry, node metrics, and live activity feed.',
          icon: Activity
        }
      case 'settlement':
        return {
          title: 'Settlement Workspace & Queue',
          description: 'Review challenge outcomes, AI confidence scores, supporting evidence, and manual overrides.',
          icon: ListFilter
        }
      case 'config':
        return {
          title: 'Oracle Engine Configuration',
          description: 'Configure Gemini API parameters, node weights, business rules, and JSON logic schema.',
          icon: Settings
        }
      case 'monitoring':
        return {
          title: 'AI System Logs & Monitoring',
          description: 'High-density system logs, service latency telemetry, and deployment version history.',
          icon: History
        }
      default:
        return {
          title: 'AI Oracle Control Center',
          description: 'Autonomous settlement engine telemetry, node metrics, and live activity feed.',
          icon: Activity
        }
    }
  }, [currentSubTab])

  const HeaderIcon = activeHeaderInfo.icon

  const renderActiveModule = () => {
    switch (currentSubTab) {
      case 'control':
        return (
          <OracleControlCenter 
            onNavigateToSettlement={() => navigate('ai-oracle-settlement')}
            onNavigateToLogs={() => navigate('ai-oracle-monitoring')}
            onNavigateToConfig={() => navigate('ai-oracle-config')}
          />
        )
      case 'settlement':
        return <OracleSettlementCenter />
      case 'config':
        return <OracleConfiguration />
      case 'monitoring':
        return <OracleMonitoring />
      default:
        return (
          <OracleControlCenter 
            onNavigateToSettlement={() => navigate('ai-oracle-settlement')}
            onNavigateToLogs={() => navigate('ai-oracle-monitoring')}
            onNavigateToConfig={() => navigate('ai-oracle-config')}
          />
        )
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
            <div className={`p-2.5 rounded-xl border ${
              isEmergencyShutdown 
                ? 'bg-red-500/15 border-red-500/40 text-red-400' 
                : 'bg-primary/15 border-primary/30 text-primary'
            }`}>
              {isEmergencyShutdown ? <ShieldAlert className="h-6 w-6 animate-pulse" /> : <HeaderIcon className="h-6 w-6" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold font-sans text-foreground">{activeHeaderInfo.title}</h2>
              <p className="text-xs text-muted font-sans mt-0.5">{activeHeaderInfo.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Module Content with Framer Motion Transition */}
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

    </motion.div>
  )
}
