import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Cpu, 
  AlertTriangle,
  GitCompare,
  Binary
} from 'lucide-react'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Sheet, SheetContent } from './ui/sheet'
import { Input } from './ui/input'

export const OracleConfigView: React.FC<{ navigate: (tab: string) => void }> = ({ navigate: _navigate }) => {
  const [sportsConfidence, setSportsConfidence] = useState(94.5)
  const [ocrDepth, setOcrDepth] = useState(8)
  const [conflictRule, setConflictRule] = useState('STRICT_MAJORITY')
  const [selfCorrection, setSelfCorrection] = useState(true)
  const [isDeploying, setIsDeploying] = useState(false)
  const [savedConfig, setSavedConfig] = useState({ sportsConfidence: 94.5, ocrDepth: 8 })

  // Terminate States
  const [isTerminateOpen, setIsTerminateOpen] = useState(false)
  const [terminateVerificationText, setTerminateVerificationText] = useState('')

  // Logic editor mock file contents
  const codeContent = 
`{
  "protocol": "neural-settle-v4.2",
  "consensus": {
    "engine": "STRICT_MAJORITY",
    "threshold": ${sportsConfidence / 100},
    "calibration_delay_ms": 120
  },
  "sources": [
    { "name": "sports-api", "version": "4.2.1", "weight": 0.8 },
    { "name": "vision-link-ocr", "depth_index": ${ocrDepth}, "weight": 0.5 }
  ],
  "self_correction": ${selfCorrection ? "true" : "false"},
  "arbitration_window_s": 15
}`

  const handleRefetch = () => {
    // Reset sliders to saved/default values
    setSportsConfidence(savedConfig.sportsConfidence)
    setOcrDepth(savedConfig.ocrDepth)
    setConflictRule('STRICT_MAJORITY')
    setSelfCorrection(true)
    alert('Config reset to last deployed values. All parameters restored.')
  }

  const handleDiff = () => {
    const changes = []
    if (sportsConfidence !== savedConfig.sportsConfidence) changes.push(`confidence: ${savedConfig.sportsConfidence}% → ${sportsConfidence}%`)
    if (ocrDepth !== savedConfig.ocrDepth) changes.push(`ocr-depth: ${savedConfig.ocrDepth} → ${ocrDepth}`)
    if (changes.length === 0) {
      alert('Diff: 0 changes detected vs last deployed state.')
    } else {
      alert(`Diff: ${changes.length} change(s) detected: ${changes.join(', ')}`)
    }
  }

  const handleValidateStage = () => {
    if (isDeploying) return
    setIsDeploying(true)
    setTimeout(() => {
      setSavedConfig({ sportsConfidence, ocrDepth })
      setIsDeploying(false)
      alert(`Success: Schema validation PASSED. Config deployed to commit #${Math.random().toString(36).slice(2,8).toUpperCase()}`)
    }, 2000)
  }

  const handleTerminate = () => {
    if (terminateVerificationText === 'TERMINATE') {
      alert("GLOBAL EMERGENCY SHUTDOWN INITIATED. Autonomous settlement halted. All oracles locked.")
      setIsTerminateOpen(false)
      setTerminateVerificationText('')
    } else {
      alert("Action cancelled: Verification text mismatch. Type TERMINATE to confirm.")
    }
  }

  // Entrance variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemVariants = {
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
      {/* 2-Column Split: Config dashboard vs Logic Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Parameters: 7 Columns */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          
          {/* Section title */}
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div>
              <h3 className="text-base font-bold text-foreground font-sans uppercase tracking-wider">Oracle Configuration</h3>
              <p className="text-[11px] text-muted font-mono uppercase tracking-widest mt-1">Manage autonomous settlement engine parameters</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="h-8 font-mono text-[9px] uppercase tracking-wider" onClick={handleRefetch}>
                Reset Defaults
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="h-8 font-mono text-[9px] uppercase tracking-wider gap-1.5"
                onClick={handleValidateStage}
                disabled={isDeploying}
              >
                {isDeploying ? (
                  <><motion.div className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white" animate={{ rotate: 360 }} transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }} /> Deploying...</>
                ) : 'Deploy Logic'}
              </Button>
            </div>
          </div>

          {/* Cards for Nodes config */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Sports API */}
            <motion.div variants={itemVariants}>
              <Card>
                <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 bg-primary/10 border border-primary/20 text-primary rounded">
                      <Binary className="h-4.5 w-4.5" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground font-sans">Sports API Aggregator</span>
                      <span className="text-[8px] font-mono text-muted uppercase tracking-widest mt-0.5">v4.2.1-STABLE</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[8px] px-1.5">ACTIVE</Badge>
                </div>
                
                {/* Sliders and data */}
                <div className="flex flex-col gap-4 font-mono text-[11px]">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted font-sans font-medium">Confidence Threshold</span>
                      <span className="text-primary font-bold">{sportsConfidence}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="75" 
                      max="99" 
                      step="0.5" 
                      value={sportsConfidence} 
                      onChange={(e) => setSportsConfidence(parseFloat(e.target.value))}
                      className="w-full h-1 bg-[#22222C] rounded-lg appearance-none cursor-pointer accent-primary" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-border/30 pt-3 text-[10px]">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-muted font-sans">Latency</span>
                      <span className="text-foreground font-semibold">124 ms</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-muted font-sans">API Health</span>
                      <span className="text-emerald-400 font-semibold">99.9%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/30 pt-3 text-[9px] text-muted">
                    <span>SOURCE: DATA_REUTERS_V2</span>
                    <button className="text-primary hover:underline text-[9px] cursor-pointer">MANAGE NODES</button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Vision-Link (OCR) */}
            <motion.div variants={itemVariants}>
              <Card>
                <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 bg-secondary/10 border border-secondary/20 text-secondary rounded">
                      <Cpu className="h-4.5 w-4.5" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground font-sans">Vision-Link (OCR)</span>
                      <span className="text-[8px] font-mono text-muted uppercase tracking-widest mt-0.5">v2.0.4-NEURAL</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[8px] px-1.5">ACTIVE</Badge>
                </div>
                
                {/* Sliders and data */}
                <div className="flex flex-col gap-4 font-mono text-[11px]">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted font-sans font-medium">Validation Depth</span>
                      <span className="text-secondary font-bold">Deep ({ocrDepth}x)</span>
                    </div>
                    <input 
                      type="range" 
                      min="2" 
                      max="16" 
                      step="1" 
                      value={ocrDepth} 
                      onChange={(e) => setOcrDepth(parseInt(e.target.value))}
                      className="w-full h-1 bg-[#22222C] rounded-lg appearance-none cursor-pointer accent-secondary" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-border/30 pt-3 text-[10px]">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-muted font-sans">Process Rate</span>
                      <span className="text-foreground font-semibold">42 fps</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-muted font-sans">Confidence</span>
                      <span className="text-secondary font-semibold">88.2%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/30 pt-3 text-[9px] text-muted">
                    <span>SOURCE: LIVE_STREAM_X8</span>
                    <button className="text-secondary hover:underline text-[9px] cursor-pointer">VIEW CAM FEED</button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Neural-Settle Core (Big Card) */}
          <motion.div variants={itemVariants}>
            <Card className="flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-border/30 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-primary/10 border border-primary/20 text-primary rounded">
                    <GitCompare className="h-4.5 w-4.5" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground font-sans">Neural-Settle Core</span>
                    <span className="text-[9px] text-muted font-mono uppercase tracking-widest mt-0.5">Final arbitration layer and anomaly detection system</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold font-mono text-primary leading-none">-2 ms</span>
                  <span className="text-[8px] font-mono text-muted block uppercase tracking-widest mt-0.5">Avg Decision Time</span>
                </div>
              </div>

              {/* Configurations inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Select Option Rule */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-muted font-mono uppercase tracking-widest font-bold">Ambiguity Conflict Rule</label>
                  <select 
                    value={conflictRule} 
                    onChange={(e) => setConflictRule(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-xs font-mono text-foreground focus-visible:outline-none focus-visible:border-primary transition-all cursor-pointer"
                  >
                    <option value="STRICT_MAJORITY">STRICT_MAJORITY</option>
                    <option value="CONSENSUS_WEIGHTED">CONSENSUS_WEIGHTED</option>
                    <option value="OPTIMISTIC_TRUST">OPTIMISTIC_TRUST</option>
                  </select>
                  <span className="text-[9px] text-muted-text font-sans mt-0.5">Determines fallback logic during conflicting feed signatures.</span>
                </div>

                {/* Checkbox self-correction */}
                <div className="flex flex-col gap-2 justify-center">
                  <label className="text-[10px] text-muted font-mono uppercase tracking-widest font-bold mb-1">Self-Correction Mode</label>
                  <label className="flex items-center gap-3 bg-background/40 border border-border p-3.5 rounded-lg cursor-pointer hover:border-primary/40 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={selfCorrection}
                      onChange={(e) => setSelfCorrection(e.target.checked)}
                      className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-primary cursor-pointer accent-primary" 
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-mono font-bold text-foreground">ENABLED (SAFE)</span>
                      <span className="text-[9px] text-muted-text mt-0.5">Allows nodes to auto-resolve latency anomalies.</span>
                    </div>
                  </label>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Global AI Kill-Switch */}
          <motion.div variants={itemVariants}>
            <Card className="border border-red-500/30 bg-red-950/5 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-bold text-red-200 uppercase tracking-wider font-sans">Global AI Kill-Switch</h4>
                  <p className="text-xs text-red-400 font-sans leading-relaxed">
                    Instantly halt all autonomous settlement and lock oracle data. Requires terminal overrides to restore.
                  </p>
                </div>
              </div>

              <Button 
                variant="danger" 
                className="h-10 px-6 font-mono text-xs uppercase tracking-wider font-black shadow-[0_0_20px_rgba(239,68,68,0.25)] hover:shadow-[0_0_40px_rgba(239,68,68,0.4)]"
                onClick={() => {
                  setTerminateVerificationText('')
                  setIsTerminateOpen(true)
                }}
              >
                TERMINATE
              </Button>
            </Card>
          </motion.div>
        </div>

        {/* Right Side: Logic Editor Panel: 5 Columns */}
        <motion.div variants={itemVariants} className="lg:col-span-5 xl:col-span-4">
          <Card className="h-full flex flex-col justify-between">
            <div>
              {/* Header logic editor */}
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                <div className="flex flex-col">
                  <h3 className="text-xs font-bold text-foreground font-sans uppercase tracking-wider">Logic Editor</h3>
                  <span className="text-[8px] font-mono text-muted uppercase tracking-widest mt-0.5">oracle_settle_v4.json</span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="sm" className="h-7 px-2 font-mono text-[8px]" onClick={handleRefetch}>REFETCH</Button>
                  <Button variant="outline" size="sm" className="h-7 px-2 font-mono text-[8px]" onClick={handleDiff}>DIFF</Button>
                </div>
              </div>

              {/* Editor panel */}
              <div className="relative font-mono text-xs text-muted-text bg-background border border-border p-4 rounded-lg h-[340px] overflow-auto">
                <div className="absolute right-3 top-3 text-[9px] text-muted tracking-widest">// READ_ONLY_STAGED</div>
                <pre className="text-foreground leading-normal whitespace-pre-wrap">
                  {codeContent}
                </pre>
              </div>

              {/* Stats below */}
              <div className="flex flex-col gap-2 mt-4 font-mono text-xs text-muted">
                <div className="flex items-center justify-between pb-1 border-b border-border/30">
                  <span>Last change by</span>
                  <span className="text-foreground">sys_admin_7</span>
                </div>
                <div className="flex items-center justify-between pb-1">
                  <span>Hash Status</span>
                  <span className="text-emerald-400 text-[10px] overflow-hidden text-ellipsis whitespace-nowrap max-w-[180px]">
                    VALID (sha256:d82fa0...)
                  </span>
                </div>
              </div>
            </div>

            <Button 
              variant="primary"
              className="mt-6 w-full text-xs font-mono uppercase tracking-wider py-2.5 rounded-lg"
              onClick={handleValidateStage}
            >
              VALIDATE & STAGE
            </Button>
          </Card>
        </motion.div>
      </div>

      {/* Telemetry bottom bar */}
      <div className="w-full bg-card/60 border border-border p-3 rounded-lg flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] text-muted">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-glow"></span>
            <span>API CORE: ONLINE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary shadow-cyanGlow"></span>
            <span>VISION-LINK: SYNCED</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-glow"></span>
            <span>SENTIMENT-BRIDGE: IDLE</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <span>UPTIME: 142:12:09</span>
          <span className="text-foreground">LATEST EVENT: #93022 - SETTLED NBA_LAC_MIN</span>
        </div>
      </div>

      {/* Global AI Kill-Switch Verification Sheet Drawer */}
      <Sheet open={isTerminateOpen} onOpenChange={setIsTerminateOpen}>
        <SheetContent side="right" className="p-6 bg-[#151221]/95 text-foreground border-l border-border max-w-sm w-full h-full flex flex-col justify-between animate-in">
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              handleTerminate()
            }}
            className="flex flex-col gap-5 h-full justify-between"
          >
            <div className="flex flex-col gap-5">
              <div className="border-b border-red-500/30 pb-3 flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-sm font-bold font-sans uppercase tracking-wider">AI Kill-Switch Overrides</h3>
              </div>

              <p className="text-xs text-red-200/80 font-sans leading-relaxed">
                WARNING: This action immediately halts all autonomous settlement engines and locks all oracle contracts. 
                Requires validator consensus signature to restore.
              </p>

              {/* Input for Verification */}
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[10px] text-muted font-mono uppercase tracking-widest font-bold">Type 'TERMINATE' to confirm</label>
                <Input 
                  placeholder="e.g. TERMINATE" 
                  value={terminateVerificationText} 
                  onChange={(e) => setTerminateVerificationText(e.target.value)} 
                  required 
                  className="border-red-500/30 focus-visible:border-red-500 focus-visible:ring-red-500/40"
                />
              </div>
            </div>

            <div className="flex gap-3 border-t border-border/40 pt-4 mt-auto">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 text-xs font-mono py-2"
                onClick={() => setIsTerminateOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="danger" 
                className="flex-1 text-xs font-mono py-2 font-bold shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                Halt Engine
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </motion.div>
  )
}
