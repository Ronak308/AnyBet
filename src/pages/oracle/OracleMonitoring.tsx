import React, { useState, useMemo } from 'react'
import { 
  FileText, 
  Activity, 
  History, 
  Search, 
  Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { useOracle } from '../../context/OracleContext'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const latencyHealthData = [
  { time: '10:00', gemini: 118, sportsApi: 95, ocr: 280 },
  { time: '10:30', gemini: 124, sportsApi: 102, ocr: 260 },
  { time: '11:00', gemini: 112, sportsApi: 88, ocr: 295 },
  { time: '11:30', gemini: 140, sportsApi: 110, ocr: 310 },
  { time: '12:00', gemini: 118, sportsApi: 95, ocr: 280 }
]

export const OracleMonitoring: React.FC = () => {
  const { 
    aiLogs, 
    nodes, 
    versionHistory, 
    rollbackVersion, 
    exportLogsCSV, 
    exportLogsJSON, 
    showToast 
  } = useOracle()

  const [activeSubTab, setActiveSubTab] = useState<'logs' | 'health' | 'history'>('logs')
  const [logSearch, setLogSearch] = useState('')
  const [providerFilter, setProviderFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredLogs = useMemo(() => {
    return aiLogs.filter(log => {
      const matchesSearch = 
        log.challengeId.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.provider.toLowerCase().includes(logSearch.toLowerCase())
      const matchesProvider = providerFilter === 'all' || log.provider === providerFilter
      const matchesStatus = statusFilter === 'all' || log.status === statusFilter
      return matchesSearch && matchesProvider && matchesStatus
    })
  }, [aiLogs, logSearch, providerFilter, statusFilter])

  return (
    <div className="flex flex-col gap-6 w-full font-sans select-none pb-12">
      
      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-2 overflow-x-auto">
        {[
          { id: 'logs', label: 'AI System Logs', icon: FileText },
          { id: 'health', label: 'Service Health Monitor', icon: Activity },
          { id: 'history', label: 'Deployment Version History', icon: History }
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

      {/* SUB-TAB 1: AI SYSTEM LOGS */}
      {activeSubTab === 'logs' && (
        <div className="space-y-6">
          
          {/* Filters & Export Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-surface/30 p-4 rounded-xl border border-border/60">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <Input 
                placeholder="Search Log by Challenge ID or Provider..." 
                value={logSearch}
                onChange={e => setLogSearch(e.target.value)}
                className="pl-9 bg-background border-border/60 text-xs font-mono"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={providerFilter}
                onChange={e => setProviderFilter(e.target.value)}
                className="bg-background border border-border/60 rounded-lg px-2.5 py-1.5 text-xs font-mono text-foreground outline-none cursor-pointer"
              >
                <option value="all">All Providers</option>
                <option value="Gemini 1.5 Pro">Gemini 1.5 Pro</option>
                <option value="Sports API v4">Sports API v4</option>
                <option value="Vision OCR">Vision OCR</option>
                <option value="Chainlink Feed">Chainlink Feed</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-background border border-border/60 rounded-lg px-2.5 py-1.5 text-xs font-mono text-foreground outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="WARNING">WARNING</option>
                <option value="ERROR">ERROR</option>
              </select>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={exportLogsCSV} className="text-xs font-mono gap-1.5">
                  <Download className="h-3.5 w-3.5" /> CSV
                </Button>
                <Button size="sm" variant="outline" onClick={exportLogsJSON} className="text-xs font-mono gap-1.5">
                  <Download className="h-3.5 w-3.5" /> JSON
                </Button>
              </div>
            </div>
          </div>

          {/* AI Logs Data Table */}
          <div className="border border-border/60 rounded-xl overflow-hidden bg-surface/30">
            <Table>
              <TableHeader className="bg-surface/60">
                <TableRow>
                  <TableHead className="text-xs font-mono">Timestamp</TableHead>
                  <TableHead className="text-xs font-mono">Challenge ID</TableHead>
                  <TableHead className="text-xs font-mono">Provider</TableHead>
                  <TableHead className="text-xs font-mono">Tokens Used</TableHead>
                  <TableHead className="text-xs font-mono">Latency</TableHead>
                  <TableHead className="text-xs font-mono">Confidence</TableHead>
                  <TableHead className="text-xs font-mono">Status</TableHead>
                  <TableHead className="text-xs font-mono">Details / Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs text-muted whitespace-nowrap">{log.timestamp}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-primary">{log.challengeId}</TableCell>
                    <TableCell className="font-mono text-xs text-foreground">{log.provider}</TableCell>
                    <TableCell className="font-mono text-xs text-muted">{log.tokensUsed.toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-xs text-cyan-400">{log.latencyMs} ms</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-emerald-400">{log.confidence}%</TableCell>
                    <TableCell>
                      {log.status === 'SUCCESS' ? (
                        <Badge variant="success" className="text-[9px]">SUCCESS</Badge>
                      ) : (
                        <Badge variant="warning" className="text-[9px]">WARNING</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted max-w-[240px] truncate">{log.errorMessage || 'Clean payload resolution'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SERVICE HEALTH MONITOR */}
      {activeSubTab === 'health' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodes.map(n => (
              <Card key={n.id} className="bg-surface/30 border-border/60">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-foreground">{n.name}</span>
                    <Badge variant="success" className="text-[9px]">HEALTHY</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center p-2 bg-black/40 rounded-lg text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-muted block">Uptime</span>
                      <span className="text-emerald-400 font-bold">{n.uptime}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted block">Latency</span>
                      <span className="text-cyan-400 font-bold">{n.latencyMs}ms</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted block">Errors</span>
                      <span className="text-foreground font-bold">{n.errorRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Latency Recharts Line Chart */}
          <Card className="bg-surface/30 border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase text-foreground">Service Latency Telemetry (ms)</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={latencyHealthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D243F" />
                  <XAxis dataKey="time" stroke="#71717A" fontSize={10} fontFamily="monospace" />
                  <YAxis stroke="#71717A" fontSize={10} fontFamily="monospace" />
                  <Tooltip contentStyle={{ backgroundColor: '#151221', borderColor: '#2D243F', fontSize: '11px', fontFamily: 'monospace' }} />
                  <Line type="monotone" dataKey="gemini" stroke="#8026FF" strokeWidth={2} name="Gemini 1.5 Pro" />
                  <Line type="monotone" dataKey="sportsApi" stroke="#10B981" strokeWidth={2} name="Sports API" />
                  <Line type="monotone" dataKey="ocr" stroke="#00E0FF" strokeWidth={2} name="Vision OCR" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SUB-TAB 3: DEPLOYMENT VERSION HISTORY */}
      {activeSubTab === 'history' && (
        <div className="space-y-6">
          <div className="border border-border/60 rounded-xl overflow-hidden bg-surface/30">
            <Table>
              <TableHeader className="bg-surface/60">
                <TableRow>
                  <TableHead className="text-xs font-mono">Engine Version</TableHead>
                  <TableHead className="text-xs font-mono">Description / Changelog</TableHead>
                  <TableHead className="text-xs font-mono">Operator</TableHead>
                  <TableHead className="text-xs font-mono">Date & Time</TableHead>
                  <TableHead className="text-xs font-mono">Commit Hash</TableHead>
                  <TableHead className="text-xs font-mono">Status</TableHead>
                  <TableHead className="text-xs font-mono text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versionHistory.map(v => (
                  <TableRow key={v.version}>
                    <TableCell className="font-mono text-xs font-bold text-primary">{v.version}</TableCell>
                    <TableCell className="font-mono text-xs text-foreground max-w-[280px] truncate">{v.description}</TableCell>
                    <TableCell className="font-mono text-xs text-muted">{v.operator}</TableCell>
                    <TableCell className="font-mono text-xs text-muted whitespace-nowrap">{v.date}</TableCell>
                    <TableCell className="font-mono text-xs text-cyan-400">#{v.commitHash}</TableCell>
                    <TableCell>
                      {v.status === 'Deployed' ? (
                        <Badge variant="success" className="text-[9px]">DEPLOYED</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px]">{v.status}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => showToast(`Diff: 0 breaking changes vs ${v.version}`, 'info')} className="h-7 text-[10px] font-mono">
                          View Changes
                        </Button>
                        {v.status !== 'Deployed' && (
                          <Button size="sm" variant="ghost" onClick={() => rollbackVersion(v.version)} className="h-7 text-[10px] font-mono text-amber-400 hover:bg-amber-950/20">
                            Rollback
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

    </div>
  )
}
