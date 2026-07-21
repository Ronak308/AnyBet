import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Cpu, 
  Binary, 
  GitCompare, 
  AlertTriangle, 
  Save, 
  Play, 
  Plus, 
  Check, 
  Trash2, 
  RotateCcw,
  CheckCircle,
  XCircle,
  Settings,
  ListFilter,
  FileCode,
  ShieldAlert
} from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Sheet, SheetContent } from '../../components/ui/sheet'
import { useOracle } from '../../context/OracleContext'
import type { OracleRuleItem } from '../../context/OracleContext'

export const OracleConfiguration: React.FC = () => {
  const { 
    nodes, 
    toggleNodeStatus, 
    restartNode, 
    aiConfig, 
    setAiConfig, 
    oracleRules, 
    createOracleRule, 
    toggleOracleRule, 
    deleteOracleRule, 
    jsonLogicCode, 
    setJsonLogicCode, 
    deployLogic, 
    toggleEmergencyShutdown, 
    isEmergencyShutdown, 
    showToast 
  } = useOracle()

  const [activeSubTab, setActiveSubTab] = useState<'nodes' | 'ai_config' | 'rules' | 'logic_editor'>('nodes')
  
  // New Rule Form State
  const [newRuleName, setNewRuleName] = useState('')
  const [newRuleCondition, setNewRuleCondition] = useState('AI Confidence ≥ 90.0%')
  const [newRuleAction, setNewRuleAction] = useState<OracleRuleItem['action']>('Auto Settlement')
  const [newRuleThreshold, setNewRuleThreshold] = useState('90.0')

  // Kill Switch State
  const [isKillSwitchOpen, setIsKillSwitchOpen] = useState(false)
  const [terminateInput, setTerminateInput] = useState('')

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRuleName.trim()) {
      showToast('Rule name is required', 'warning')
      return
    }
    createOracleRule({
      name: newRuleName.trim(),
      condition: newRuleCondition,
      action: newRuleAction,
      threshold: parseFloat(newRuleThreshold) || 90.0,
      isEnabled: true
    })
    setNewRuleName('')
  }

  const handleKillSwitchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const success = toggleEmergencyShutdown(terminateInput.trim())
    if (success) {
      setIsKillSwitchOpen(false)
      setTerminateInput('')
    } else {
      showToast('Verification mismatch. Type "TERMINATE" to confirm.', 'warning')
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full font-sans select-none pb-12">
      
      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-2 overflow-x-auto">
        {[
          { id: 'nodes', label: 'Oracle Nodes & Health', icon: Cpu },
          { id: 'ai_config', label: 'AI Model & API Config', icon: Settings },
          { id: 'rules', label: 'Oracle Rules Matrix', icon: ListFilter },
          { id: 'logic_editor', label: 'JSON Logic Editor', icon: FileCode }
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeSubTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                isActive 
                  ? 'bg-primary/15 text-primary font-bold border border-primary/30' 
                  : 'text-muted hover:text-foreground hover:bg-surface/40'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* SUB-TAB 1: ORACLE NODES & HEALTH */}
      {activeSubTab === 'nodes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold font-mono text-foreground uppercase">Connected Oracle Nodes</h3>
              <p className="text-xs text-muted font-mono mt-0.5">Real-time status and telemetry of automated services</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => showToast('Refreshed all node connections', 'success')} className="text-xs font-mono gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Refresh Nodes
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodes.map(node => (
              <Card key={node.id} className="bg-surface/30 border-border/60 flex flex-col justify-between">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold font-sans text-foreground">{node.name}</h4>
                      <span className="text-[10px] font-mono text-muted uppercase block mt-0.5">{node.provider}</span>
                    </div>
                    {node.status === 'online' ? (
                      <Badge variant="success" className="text-[9px]">ONLINE</Badge>
                    ) : node.status === 'syncing' ? (
                      <Badge variant="pro" className="text-[9px]">SYNCING</Badge>
                    ) : (
                      <Badge variant="danger" className="text-[9px]">OFFLINE</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-black/40 border border-border/40 rounded-lg text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-muted block uppercase">Health Score</span>
                      <span className="text-emerald-400 font-bold">{node.health}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted block uppercase">Uptime</span>
                      <span className="text-foreground font-bold">{node.uptime}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted block uppercase">Latency</span>
                      <span className="text-cyan-400 font-bold">{node.latencyMs} ms</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted block uppercase">Last Sync</span>
                      <span className="text-foreground font-bold">{node.lastSync}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => toggleNodeStatus(node.id)} 
                      className={`flex-1 text-[10px] font-mono h-7 ${node.status === 'online' ? 'text-red-400 border-red-500/30' : 'text-emerald-400 border-emerald-500/30'}`}
                    >
                      {node.status === 'online' ? 'Disable' : 'Enable'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => restartNode(node.id)} 
                      className="flex-1 text-[10px] font-mono h-7 text-primary border-primary/30"
                    >
                      Restart Node
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AI MODEL & API CONFIGURATION */}
      {activeSubTab === 'ai_config' && (
        <div className="space-y-6 max-w-4xl">
          <Card className="bg-surface/30 border-border/60">
            <CardContent className="p-6 space-y-6">
              <div className="border-b border-border/40 pb-3">
                <h3 className="text-sm font-bold font-mono text-foreground uppercase">Gemini AI Model Parameters</h3>
                <p className="text-xs text-muted font-mono mt-0.5">Configure autonomous AI settlement decision parameters</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* API Key Input */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-mono text-muted uppercase font-bold block">Gemini Secret API Key</label>
                  <Input 
                    type="password"
                    value={aiConfig.geminiApiKey}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, geminiApiKey: e.target.value }))}
                    className="bg-background border-border/60 text-xs font-mono"
                  />
                </div>

                {/* Model Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-muted uppercase font-bold block">Model Engine</label>
                  <select
                    value={aiConfig.modelSelection}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, modelSelection: e.target.value }))}
                    className="w-full bg-background border border-border/60 rounded-lg p-2.5 text-xs font-mono text-foreground outline-none cursor-pointer"
                  >
                    <option value="gemini-1.5-pro-latest">Google Gemini 1.5 Pro (Recommended)</option>
                    <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Ultra Fast)</option>
                    <option value="gemini-1.0-ultra">Google Gemini 1.0 Ultra</option>
                  </select>
                </div>

                {/* Confidence Threshold */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-mono text-muted uppercase font-bold">Auto Settlement Threshold</label>
                    <span className="text-xs font-mono text-primary font-bold">{aiConfig.confidenceThreshold}%</span>
                  </div>
                  <input 
                    type="range"
                    min="75"
                    max="99"
                    step="1"
                    value={aiConfig.confidenceThreshold}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, confidenceThreshold: parseInt(e.target.value) }))}
                    className="w-full h-1 bg-surface rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                  />
                </div>

                {/* Temperature */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-mono text-muted uppercase font-bold">Temperature (Creativity vs Strictness)</label>
                    <span className="text-xs font-mono text-primary font-bold">{aiConfig.temperature}</span>
                  </div>
                  <input 
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={aiConfig.temperature}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full h-1 bg-surface rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                  />
                </div>

                {/* Max Tokens */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-muted uppercase font-bold block">Max Output Tokens</label>
                  <Input 
                    type="number"
                    value={aiConfig.maxTokens}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 4096 }))}
                    className="bg-background border-border/60 text-xs font-mono"
                  />
                </div>

              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                <Button size="sm" variant="primary" glow onClick={() => showToast('AI Model Configuration Saved!', 'success')} className="text-xs font-mono gap-1.5">
                  <Save className="h-3.5 w-3.5" /> Save Parameters
                </Button>
                <Button size="sm" variant="outline" onClick={() => showToast('Testing API key connection... SUCCESS (118ms)', 'success')} className="text-xs font-mono gap-1.5">
                  <Play className="h-3.5 w-3.5" /> Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SUB-TAB 3: ORACLE RULES MATRIX */}
      {activeSubTab === 'rules' && (
        <div className="space-y-6">
          <Card className="bg-surface/30 border-border/60">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-bold font-mono text-foreground uppercase">Create New Business Rule</h3>
              <form onSubmit={handleCreateRule} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input 
                  placeholder="Rule Name (e.g., High Confidence Auto)"
                  value={newRuleName}
                  onChange={e => setNewRuleName(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
                <Input 
                  placeholder="Condition (e.g., Confidence ≥ 90%)"
                  value={newRuleCondition}
                  onChange={e => setNewRuleCondition(e.target.value)}
                  className="bg-background text-xs font-mono"
                />
                <select
                  value={newRuleAction}
                  onChange={e => setNewRuleAction(e.target.value as any)}
                  className="bg-background border border-border/60 rounded-lg p-2.5 text-xs font-mono text-foreground outline-none cursor-pointer"
                >
                  <option value="Auto Settlement">Auto Settlement</option>
                  <option value="Manual Review">Manual Review</option>
                  <option value="Refund Recommendation">Refund Recommendation</option>
                  <option value="Freeze Escrow">Freeze Escrow</option>
                </select>
                <Button size="sm" variant="primary" glow type="submit" className="text-xs font-mono gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Create Rule
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Rules Table */}
          <div className="border border-border/60 rounded-xl overflow-hidden bg-surface/30">
            <Table>
              <TableHeader className="bg-surface/60">
                <TableRow>
                  <TableHead className="text-xs font-mono">Rule Name</TableHead>
                  <TableHead className="text-xs font-mono">Condition</TableHead>
                  <TableHead className="text-xs font-mono">Action Output</TableHead>
                  <TableHead className="text-xs font-mono">Status</TableHead>
                  <TableHead className="text-xs font-mono">Last Triggered</TableHead>
                  <TableHead className="text-xs font-mono text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {oracleRules.map(rule => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-mono text-xs font-bold text-foreground">{rule.name}</TableCell>
                    <TableCell className="font-mono text-xs text-primary">{rule.condition}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">{rule.action}</Badge>
                    </TableCell>
                    <TableCell>
                      {rule.isEnabled ? <Badge variant="success" className="text-[9px]">ACTIVE</Badge> : <Badge variant="outline" className="text-[9px]">DISABLED</Badge>}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted">{rule.lastTriggered}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => toggleOracleRule(rule.id)} className="h-7 text-[10px] font-mono">
                          {rule.isEnabled ? 'Disable' : 'Enable'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteOracleRule(rule.id)} className="h-7 text-red-400 hover:bg-red-950/20">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: MONACO-STYLE JSON LOGIC EDITOR */}
      {activeSubTab === 'logic_editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <Card className="bg-surface/30 border-border/60">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-xs font-mono text-muted uppercase font-bold">oracle_settle_v4.json (Editable Schema)</span>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[9px]">VALID JSON</Badge>
                </div>

                <div className="relative font-mono text-xs text-foreground bg-black/60 border border-border/60 p-4 rounded-xl h-[380px] overflow-auto">
                  <textarea
                    value={jsonLogicCode}
                    onChange={e => setJsonLogicCode(e.target.value)}
                    className="w-full h-full bg-transparent text-emerald-400 outline-none resize-none font-mono text-xs leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-mono text-muted">Press Deploy to publish staged engine rules to live cluster</span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="primary" glow onClick={deployLogic} className="text-xs font-mono gap-1.5">
                      <Save className="h-3.5 w-3.5" /> Validate & Deploy Logic
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Kill-Switch Box */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border border-red-500/40 bg-red-950/10 p-5 space-y-4">
              <div className="flex items-center gap-3 text-red-400">
                <ShieldAlert className="h-6 w-6" />
                <h4 className="text-sm font-bold font-sans uppercase">Global AI Kill-Switch</h4>
              </div>
              <p className="text-xs text-red-300 font-sans leading-relaxed">
                Instantly halt all autonomous settlement engines and lock oracle data. Requires explicit confirmation.
              </p>

              <Button 
                variant="danger" 
                onClick={() => setIsKillSwitchOpen(true)}
                className="w-full text-xs font-mono uppercase tracking-wider py-2 font-bold"
              >
                {isEmergencyShutdown ? 'SHUTDOWN ACTIVE (RESTORE)' : 'TERMINATE ORACLES'}
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* Global AI Kill-Switch Verification Drawer */}
      <Sheet open={isKillSwitchOpen} onOpenChange={setIsKillSwitchOpen}>
        <SheetContent side="right" className="p-6 bg-background border-l border-border max-w-sm w-full h-full flex flex-col justify-between">
          <form onSubmit={handleKillSwitchSubmit} className="flex flex-col justify-between h-full space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-400 border-b border-red-500/30 pb-3">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-sm font-bold font-sans uppercase">AI Emergency Override</h3>
              </div>
              <p className="text-xs text-red-300 font-sans leading-relaxed">
                WARNING: This action immediately halts all autonomous settlement engines and locks all oracle contracts. 
              </p>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-muted uppercase font-bold">Type 'TERMINATE' to confirm</label>
                <Input 
                  placeholder="e.g. TERMINATE"
                  value={terminateInput}
                  onChange={e => setTerminateInput(e.target.value)}
                  className="border-red-500/40 focus:border-red-500 text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border/40">
              <Button type="button" variant="outline" onClick={() => setIsKillSwitchOpen(false)} className="flex-1 text-xs font-mono">Cancel</Button>
              <Button type="submit" variant="danger" className="flex-1 text-xs font-mono font-bold">Confirm Override</Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

    </div>
  )
}
