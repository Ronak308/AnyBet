import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  HelpCircle,
  LayoutDashboard,
  Users,
  Shield,
  Sword,
  Award,
  Coins,
  Cpu,
  MessageSquare,
  Settings,
  ChevronRight,
  ChevronDown,
  Info,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BookOpen
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { SmoothInput } from '../components/ui/skiper106'

interface HelpPageProps {
  navigate: (tab: string) => void
}

interface FAQItem {
  question: string
  answer: string
  keywords: string[]
}

interface DocSection {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  tabRoute?: string
  detailedGuide: string
  faqs: FAQItem[]
}

export const HelpPage: React.FC<HelpPageProps> = ({ navigate }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSectionId, setActiveSectionId] = useState('overview')
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null)

  const docSections: DocSection[] = useMemo(() => [
    {
      id: 'overview',
      title: 'Platform Overview',
      description: 'Understand AnyBet ecosystem flow, database synchronization, and administrative lifecycle.',
      icon: BookOpen,
      color: 'text-primary',
      detailedGuide: 'AnyBet is an advanced peer-to-peer prediction and challenge platform. Admins oversee the ecosystem through this dashboard, checking live metrics, managing dispute resolutions, adjusting wallet balances, configuring AI nodes, and altering platform parameters. All platform views update in real-time, pulling directly from Firestore collections and integrating with third-party Web APIs.',
      faqs: [
        {
          question: 'What is the standard lifecycle of a challenge?',
          answer: 'A user creates a challenge with rules, categories, and stake amounts. Other users join the pool. The challenge goes "Live". Upon completion, outcomes are resolved either by automated API feeds, the Gemini AI Oracle, or participant consensus. If a conflict occurs, it enters a "Disputed" status for administrative arbitration.',
          keywords: ['lifecycle', 'challenge', 'process', 'flow', 'dispute']
        },
        {
          question: 'Are operations synchronized in real-time?',
          answer: 'Yes. AnyBet uses Firebase Firestore reactive subscriptions (onSnapshot listeners). Any changes made in the dashboard or by mobile app users immediately update in real-time across all connected admin screens.',
          keywords: ['real-time', 'firestore', 'sync', 'database']
        }
      ]
    },
    {
      id: 'dashboard',
      title: 'Dashboard & Operations',
      description: 'Analyze platform growth charts, active participants, and AI settlement efficiency.',
      icon: LayoutDashboard,
      color: 'text-purple-400',
      tabRoute: 'dashboard',
      detailedGuide: 'The primary operations console features real-time charts (payout volumes, transaction counts) and interactive AI node indicators. Administrators can monitor active nodes, calibrate clusters, and view streaming feeds of live events being settled.',
      faqs: [
        {
          question: "How do I read the 'AI Oracle Nodes' status indicator map?",
          answer: 'The status grid shows real-time health of active AI nodes. Green represents an active node synced with the network. Yellow/Orange implies a node is idling or undergoing calibration. Red means a node is offline or experiencing network latency.',
          keywords: ['nodes', 'status', 'grid', 'calibration', 'health']
        },
        {
          question: 'What does clicking "Run Calibration Suite" do?',
          answer: 'It triggers a ping diagnostic routine across all virtual nodes, verifying response latency and resetting any nodes stuck in idle states back to online status.',
          keywords: ['calibration', 'run', 'fix', 'nodes', 'latency']
        }
      ]
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Edit profiles, credit coin balances, and review suspension flags.',
      icon: Users,
      color: 'text-blue-400',
      tabRoute: 'users',
      detailedGuide: 'The User Management module lists all registered platform accounts. From here, you can examine detailed portfolios, edit user attributes, manually add or subtract coins, adjust verification badges, or permanently remove accounts.',
      faqs: [
        {
          question: "How do I adjust a user's coin balance?",
          answer: "Open the Users tab, locate the desired user, click edit to trigger the User Drawer. Under the 'Adjust Coins' field, type the positive or negative amount to update the wallet, then press 'Save Changes'.",
          keywords: ['coins', 'balance', 'adjust', 'add', 'wallet']
        },
        {
          question: 'Does deleting a user clear their login details?',
          answer: 'Yes. Deleting a user in the Users page triggers a Cloud Function that deletes the user record in Firestore and invokes the Firebase Admin Auth SDK to remove their authentication credentials permanently.',
          keywords: ['delete', 'remove', 'user', 'auth', 'credentials']
        }
      ]
    },
    {
      id: 'roles',
      title: 'Roles & Permissions',
      description: 'Manage administrator capabilities and edit role access overrides.',
      icon: Shield,
      color: 'text-emerald-400',
      tabRoute: 'roles-permissions',
      detailedGuide: 'Configure permission grids for roles like Admins, Moderators, Support Agents, and Oracle Operators. Permissions cover platform config editing, dispute settlement, user account deletion, and financial audits.',
      faqs: [
        {
          question: 'Can I assign multiple roles to a user?',
          answer: 'Currently, users hold a single primary role (e.g. Admin, Moderator) which determines their set of access bits. You can toggle roles for any user inside their edit drawer.',
          keywords: ['roles', 'permissions', 'assign', 'multiple']
        },
        {
          question: 'Do permission changes apply instantly?',
          answer: 'Yes. Since role configurations are retrieved in real-time, any changes made to a role permission matrix will be applied across all active operator sessions on their next interface interaction.',
          keywords: ['real-time', 'security', 'permissions', 'apply']
        }
      ]
    },
    {
      id: 'challenges',
      title: 'Challenges & Categories',
      description: 'Settle disputed stakes, cancel active wagers, and create category labels.',
      icon: Sword,
      color: 'text-rose-400',
      tabRoute: 'challenges-all',
      detailedGuide: 'View ongoing, completed, and disputed challenges. Admins can manage betting categories (e.g. adding icons/colors), check analytics dashboards, and arbitrate participant conflicts.',
      faqs: [
        {
          question: 'How do I resolve a challenge dispute?',
          answer: 'Go to Challenges -> Disputes or click the dispute notification. Inspect evidence details and chat transcripts. Choose to either award the pool to a participant (YES/NO outcome) or click "Refund Stake" to return all locked coins back to the players.',
          keywords: ['dispute', 'resolve', 'winner', 'evidence', 'refund']
        },
        {
          question: 'What is the difference between a category being disabled vs. deleted?',
          answer: 'Disabling a category hides it from users creating new challenges on the mobile client, but leaves historical challenge logs intact. Deleting a category removes it from the database.',
          keywords: ['category', 'disable', 'delete', 'hide']
        }
      ]
    },
    {
      id: 'leaderboards',
      title: 'Leaderboards & Reputation',
      description: 'Audit win streaks, rank configurations, and trust factor multipliers.',
      icon: Award,
      color: 'text-amber-400',
      tabRoute: 'leaderboards',
      detailedGuide: 'Tracks top performers on the platform. Reputation metrics evaluate trust factors. High win percentages and zero dispute histories boost reputation, while frequent disputes lower it.',
      faqs: [
        {
          question: 'How does user Reputation affect gameplay?',
          answer: 'Users with high reputation scores receive coin purchase bonuses, platform fee discounts, and priority dispute settlement. Users with low reputation face stricter maximum stake limits.',
          keywords: ['reputation', 'score', 'trust', 'fees', 'limits']
        },
        {
          question: 'Can admins manually override user reputation?',
          answer: 'Yes, inside the User portfolio view, reputation points can be manually credited or deducted in cases of bad behavior or exceptional community service.',
          keywords: ['override', 'reputation', 'change', 'points']
        }
      ]
    },
    {
      id: 'financials',
      title: 'Financials & Treasury',
      description: 'Approve cashout requests, audit escrows, and inspect transaction ledgers.',
      icon: Coins,
      color: 'text-cyan-400',
      tabRoute: 'financials-wallet',
      detailedGuide: 'The financial center handles depositing packages, cashout approvals, and platform treasury vaults. Admins can audit ledger histories, review locked escrow balances, and track fees.',
      faqs: [
        {
          question: 'Where do platform challenge fees accumulate?',
          answer: 'A pre-configured percentage (e.g., 5%) of every resolved challenge prize pool is automatically deducted and deposited into the Platform Treasury vault.',
          keywords: ['treasury', 'vault', 'fees', 'accumulate', 'payout']
        },
        {
          question: 'How do I approve or deny withdrawal/cashout requests?',
          answer: 'Navigate to Financials -> Payment Management. View the pending withdrawals list, review details (user history, requested sum), and click either "Approve" (funds are marked settled) or "Deny" (coins are returned to user wallet).',
          keywords: ['withdrawal', 'cashout', 'approve', 'deny', 'payments']
        }
      ]
    },
    {
      id: 'oracle',
      title: 'AI Oracle Control',
      description: 'Manage Gemini models, override thresholds, and monitor feed pings.',
      icon: Cpu,
      color: 'text-indigo-400',
      tabRoute: 'ai-oracle-control',
      detailedGuide: 'Controls the AI arbitration engine. Manage automated settlement settings, API key parameters, and minimum confidence scores. Check latencies of references like Binance and CoinGecko.',
      faqs: [
        {
          question: 'What is the "Confidence Score Threshold"?',
          answer: 'It is the minimum percentage (e.g. 95%) calculated by the Gemini AI evaluator required to trigger an automatic payout. Any AI resolution below this threshold remains in the settlement queue for manual approval.',
          keywords: ['confidence', 'threshold', 'oracle', 'payout', 'auto-settle']
        },
        {
          question: 'How do I change the Gemini API Key?',
          answer: 'Go to AI Oracle -> Configuration, input your new Gemini API key in the credentials field, and click Save. The system will test connection parameters to verify validity.',
          keywords: ['gemini', 'key', 'api', 'credentials', 'config']
        }
      ]
    },
    {
      id: 'support',
      title: 'Support Center',
      description: 'Assign help tickets, reply to inquiries, and update customer FAQs.',
      icon: MessageSquare,
      color: 'text-teal-400',
      tabRoute: 'support-tickets',
      detailedGuide: 'Allows managing incoming customer support tickets. Filter by open/closed, change ticket statuses, reply directly to inquiries, and publish new articles to the customer-facing FAQ base.',
      faqs: [
        {
          question: 'How do I assign support tickets?',
          answer: 'Select a ticket, open the details pane, click the assignee selector, choose an agent, and click Update. The agent receives a real-time notification on their panel.',
          keywords: ['ticket', 'assign', 'moderator', 'agent', 'support']
        }
      ]
    },
    {
      id: 'settings',
      title: 'Platform Settings',
      description: 'Toggle maintenance modes, edit fee percentages, and set stake ranges.',
      icon: Settings,
      color: 'text-slate-400',
      tabRoute: 'settings',
      detailedGuide: 'Contains the core configuration constants of the platform. Modify challenge fee percentages, wager limits, coin-to-USD exchange ratios, maintenance switches, and security parameters.',
      faqs: [
        {
          question: 'What does "Platform Maintenance Mode" restrict?',
          answer: 'Enabling Maintenance Mode prevents standard users from accessing their wallets, creating challenges, or joining pools on the mobile app. The admin operations dashboard remains fully accessible.',
          keywords: ['maintenance', 'lockdown', 'limits', 'offline']
        },
        {
          question: 'How do I adjust global wager limits?',
          answer: 'Under Settings, update the values for "Minimum Stake Limit" and "Maximum Stake Limit" in the input fields and click Save. Limits apply instantly to all new wagers.',
          keywords: ['stake', 'limit', 'minimum', 'maximum', 'wager']
        }
      ]
    }
  ], [])

  // Filter sections and FAQs based on search query
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return { type: 'sections', data: docSections }
    }

    const query = searchQuery.toLowerCase().trim()
    const matchedFaqs: Array<{ faq: FAQItem; section: DocSection }> = []

    docSections.forEach((section) => {
      section.faqs.forEach((faq) => {
        const matchesQuestion = faq.question.toLowerCase().includes(query)
        const matchesAnswer = faq.answer.toLowerCase().includes(query)
        const matchesKeywords = faq.keywords.some((kw) => kw.includes(query))
        
        if (matchesQuestion || matchesAnswer || matchesKeywords) {
          matchedFaqs.push({ faq, section })
        }
      })
    })

    return { type: 'faqs', data: matchedFaqs }
  }, [searchQuery, docSections])

  const activeSection = useMemo(() => {
    return docSections.find((s) => s.id === activeSectionId) || docSections[0]
  }, [activeSectionId, docSections])

  return (
    <div className="min-h-screen bg-background p-6 font-sans text-foreground select-none">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <HelpCircle className="h-8 w-8 text-primary filter drop-shadow-[0_0_8px_rgba(179,102,255,0.5)]" />
            <span>Admin Help & Documentation</span>
          </h1>
          <p className="text-sm text-muted mt-1.5">
            Understand views, handle disputes, adjust platform fees, and configure nodes.
          </p>
        </div>

        {/* Search Box */}
        <div className="w-full md:w-80">
          <div className="relative">
            <SmoothInput
              placeholder="Search help, questions, keys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Panel grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Navigation Links / Search results indicator */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <Card className="p-4 border border-border bg-card/45 backdrop-blur-md">
            <div className="text-xs font-mono font-bold tracking-wider text-muted uppercase mb-3 px-2 flex items-center justify-between">
              <span>Dashboard Modules</span>
              {searchQuery && (
                <span className="text-[10px] text-primary lowercase font-normal">
                  filtering active
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              {docSections.map((section) => {
                const Icon = section.icon
                const isActive = activeSectionId === section.id && !searchQuery

                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setSearchQuery('')
                      setActiveSectionId(section.id)
                      setExpandedFaqIndex(null)
                    }}
                    className={`flex items-center justify-between w-full text-left p-3 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-primary/10 text-primary border-primary/35 shadow-glow'
                        : 'border-transparent text-nav-text hover:bg-surface/50 hover:border-border/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4.5 w-4.5 shrink-0 ${section.color}`} />
                      <span>{section.title}</span>
                    </div>
                    <ChevronRight className={`h-4.5 w-4.5 transition-transform duration-200 ${isActive ? 'rotate-90 text-primary' : 'opacity-40'}`} />
                  </button>
                )
              })}
            </div>
          </Card>

          {/* Quick Stats Helper */}
          <Card className="p-4 border border-border bg-card/45 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles className="h-4.5 w-4.5 text-secondary animate-pulse" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                Platform Tip
              </h4>
            </div>
            <p className="text-xs leading-relaxed text-muted font-sans">
              To resolve disputes fairly, compare user-submitted images or GPS logs against reference charts under the AI Oracle Settlement center.
            </p>
          </Card>
        </div>

        {/* Right Side: Dynamic Content Panel */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {filteredResults.type === 'faqs' ? (
              // Search view matches
              <motion.div
                key="search-results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Info className="h-4.5 w-4.5 text-primary" />
                  <span className="text-sm font-semibold text-muted">
                    Found {(filteredResults.data as any[]).length} question matching "{searchQuery}"
                  </span>
                </div>

                {(filteredResults.data as any[]).length === 0 ? (
                  <Card className="p-12 text-center border border-dashed border-border/70">
                    <AlertTriangle className="h-10 w-10 text-muted mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-foreground">No matches found</h3>
                    <p className="text-xs text-muted max-w-sm mx-auto mt-2 leading-relaxed">
                      We couldn't find any documentation answering your query. Try searching for broader terms like "oracle", "dispute", "wallet", or "fee".
                    </p>
                  </Card>
                ) : (
                  (filteredResults.data as any[]).map(({ faq, section }, index) => (
                    <Card
                      key={index}
                      className="border border-border bg-card/45 hover:border-primary/25 transition-colors"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-mono bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full">
                            {section.title}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-foreground">{faq.question}</h4>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs leading-relaxed text-muted">{faq.answer}</p>
                        {section.tabRoute && (
                          <button
                            onClick={() => navigate(section.tabRoute!)}
                            className="mt-3.5 inline-flex items-center gap-1 text-[11px] font-mono text-primary hover:text-primary-hover font-semibold transition-colors cursor-pointer"
                          >
                            <span>Go to Tab Settings</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </motion.div>
            ) : (
              // Tab detailed view
              <motion.div
                key={activeSection.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6"
              >
                {/* Visual Architecture Map Layer (Only on overview) */}
                {activeSection.id === 'overview' && (
                  <Card className="border border-border bg-card/45 overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-base font-extrabold flex items-center gap-2">
                        <Info className="h-4.5 w-4.5 text-primary" />
                        <span>System Architecture & Operations Flow</span>
                      </CardTitle>
                      <CardDescription className="text-xs text-muted">
                        An overview of how wagers, players, wallets, and the Oracle coordinate.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-6 bg-background/50 border-t border-border">
                      <svg viewBox="0 0 720 180" className="w-full h-auto text-muted max-w-2xl font-mono text-[10px] font-bold">
                        {/* Define arrows */}
                        <defs>
                          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                          </marker>
                        </defs>

                        {/* Nodes */}
                        {/* Users */}
                        <rect x="10" y="55" width="110" height="70" rx="10" className="fill-blue-500/10 stroke-blue-500/40 stroke-2" />
                        <text x="65" y="85" textAnchor="middle" className="fill-foreground font-semibold text-xs font-sans">User Client</text>
                        <text x="65" y="105" textAnchor="middle" className="fill-blue-400 font-mono text-[9px]">Stakes Wagers</text>

                        {/* Challenges */}
                        <rect x="180" y="55" width="110" height="70" rx="10" className="fill-rose-500/10 stroke-rose-500/40 stroke-2" />
                        <text x="235" y="85" textAnchor="middle" className="fill-foreground font-semibold text-xs font-sans">Challenges</text>
                        <text x="235" y="105" textAnchor="middle" className="fill-rose-400 font-mono text-[9px]">Wager Pools</text>

                        {/* Oracle */}
                        <rect x="360" y="15" width="130" height="65" rx="10" className="fill-indigo-500/10 stroke-indigo-500/40 stroke-2" />
                        <text x="425" y="42" textAnchor="middle" className="fill-foreground font-semibold text-xs font-sans">AI Oracle Node</text>
                        <text x="425" y="60" textAnchor="middle" className="fill-indigo-400 font-mono text-[9px]">Auto-Settlement</text>

                        {/* Disputes */}
                        <rect x="360" y="100" width="130" height="65" rx="10" className="fill-amber-500/10 stroke-amber-500/40 stroke-2" />
                        <text x="425" y="127" textAnchor="middle" className="fill-foreground font-semibold text-xs font-sans">Admin Desk</text>
                        <text x="425" y="145" textAnchor="middle" className="fill-amber-400 font-mono text-[9px]">Manual Overrides</text>

                        {/* Treasury */}
                        <rect x="580" y="55" width="110" height="70" rx="10" className="fill-cyan-500/10 stroke-cyan-500/40 stroke-2" />
                        <text x="635" y="85" textAnchor="middle" className="fill-foreground font-semibold text-xs font-sans">Platform Treasury</text>
                        <text x="635" y="105" textAnchor="middle" className="fill-cyan-400 font-mono text-[9px]">Vault & Fees</text>

                        {/* Connections */}
                        <path d="M 120 90 L 175 90" className="stroke-muted/40 stroke-2 fill-none" markerEnd="url(#arrow)" />
                        <path d="M 290 80 L 350 50" className="stroke-muted/40 stroke-2 fill-none" markerEnd="url(#arrow)" />
                        <path d="M 290 100 L 350 130" className="stroke-muted/40 stroke-2 fill-none" markerEnd="url(#arrow)" />
                        
                        <path d="M 490 50 L 575 80" className="stroke-muted/40 stroke-2 fill-none" markerEnd="url(#arrow)" />
                        <path d="M 490 130 L 575 100" className="stroke-muted/40 stroke-2 fill-none" markerEnd="url(#arrow)" />
                      </svg>
                    </CardContent>
                  </Card>
                )}

                {/* Section Overview Card */}
                <Card className="border border-border bg-card/45 backdrop-blur-md">
                  <CardHeader className="pb-3 border-b border-border/40">
                    <div className="flex items-center gap-3">
                      <activeSection.icon className={`h-6.5 w-6.5 shrink-0 ${activeSection.color}`} />
                      <div>
                        <CardTitle className="text-lg font-bold">{activeSection.title}</CardTitle>
                        <CardDescription className="text-xs text-muted mt-0.5">{activeSection.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 font-sans text-xs leading-relaxed text-muted">
                    {activeSection.detailedGuide}
                    
                    {activeSection.tabRoute && (
                      <div className="mt-4">
                        <button
                          onClick={() => navigate(activeSection.tabRoute!)}
                          className="px-4 py-2 rounded-lg border border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 transition-colors font-mono text-xs font-semibold flex items-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Jump to {activeSection.title} view</span>
                        </button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* FAQ List Accordion */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-mono font-bold tracking-wider text-muted uppercase px-1">
                    Administrative FAQs
                  </h3>

                  {activeSection.faqs.map((faq, index) => {
                    const isExpanded = expandedFaqIndex === index

                    return (
                      <Card
                        key={index}
                        className="border border-border bg-card/45 overflow-hidden transition-all duration-200"
                      >
                        <button
                          onClick={() => setExpandedFaqIndex(isExpanded ? null : index)}
                          className="flex items-center justify-between w-full p-4 text-left font-semibold text-sm cursor-pointer select-none"
                        >
                          <span className="text-foreground pr-4">{faq.question}</span>
                          <ChevronDown className={`h-4.5 w-4.5 shrink-0 text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180 text-primary' : ''}`} />
                        </button>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 pt-0 text-xs leading-relaxed text-muted border-t border-border/30 bg-background/20 font-sans">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
