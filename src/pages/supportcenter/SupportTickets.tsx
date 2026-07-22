import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  HelpCircle,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  X,
  Bug,
  CreditCard,
  UserCheck,
  ShieldAlert,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { collection, getDocs, doc, query, where, updateDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import { DisputeResolution } from './DisputeResulation'
import type { Dispute as BetDispute } from './DisputeResulation'
import { FAQManager } from './FAQManager'
import type { FAQItem } from './FAQManager'
import { SupportCategories } from './SupportCategories'
import type { SupportCategory } from './SupportCategories'
import { TicketDetails } from './components/TicketDetails'

export interface Message {
  id: string
  sender: 'user' | 'support'
  senderName: string
  content: string
  timestamp: string
}

export interface Ticket {
  id: string
  user: {
    name: string
    username: string
    avatar: string
    walletBalance: number
    activeBets: number
    browser: string
    ip: string
  }
  subject: string
  description: string
  category: 'Payment' | 'Account' | 'Bet Dispute' | 'System Bug'
  priority: 'Low' | 'Medium' | 'High'
  status: 'Open' | 'In Progress' | 'Resolved'
  date: string
  messages: Message[]
}

const initialTickets: Ticket[] = []


const initialDisputes: BetDispute[] = [
  {
    id: 'DSP-9821',
    challengeTitle: 'Lakers vs Celtics Match Winner',
    creator: { username: 'lakers_fan_99', avatar: '🏀' },
    opponent: { username: 'boston_pride', avatar: '☘️' },
    stake: 500,
    oracleEvidence: 'Official NBA score API shows Lakers won 102 - 98.',
    confidenceScore: 98,
    status: 'Pending Review'
  },
  {
    id: 'DSP-4412',
    challengeTitle: 'First Player to Score 30 Points',
    creator: { username: 'king_james', avatar: '👑' },
    opponent: { username: 'curry_chef', avatar: '👨‍🍳' },
    stake: 1200,
    oracleEvidence: 'Curry reached 30 points at Q3 4:12, LeBron finished with 28.',
    confidenceScore: 92,
    status: 'Pending Review'
  },
  {
    id: 'DSP-3109',
    challengeTitle: 'Champions League Final Winner',
    creator: { username: 'madrid_madness', avatar: '🇪🇸' },
    opponent: { username: 'dortmund_yellow', avatar: '🇩🇪' },
    stake: 2500,
    oracleEvidence: 'Real Madrid won the match 2 - 0 in regular time.',
    confidenceScore: 100,
    status: 'Resolved',
    winnerSelected: 'madrid_madness'
  }
]

interface RefundRequest {
  id: string
  username: string
  avatar: string
  reason: string
  amountCoins: number
  amountUsd: number
  date: string
  status: 'Pending' | 'Approved' | 'Declined'
}

const initialRefunds: RefundRequest[] = [
  {
    id: 'REF-8021',
    username: 'alex_grid',
    avatar: '🔋',
    reason: 'Stripe transaction went through but credit was not added to coin wallet.',
    amountCoins: 1000,
    amountUsd: 10.00,
    date: '2026-07-20 02:44 PM',
    status: 'Pending'
  },
  {
    id: 'REF-3342',
    username: 'sarah_coins',
    avatar: '🦄',
    reason: 'Accidentally double purchased the Premium Coin Pack due to page latency.',
    amountCoins: 5000,
    amountUsd: 45.00,
    date: '2026-07-19 11:15 AM',
    status: 'Pending'
  },
  {
    id: 'REF-1090',
    username: 'john_doe',
    avatar: '💼',
    reason: 'Canceled P2P challenge but stake escrow was not refunded back to balance.',
    amountCoins: 300,
    amountUsd: 3.00,
    date: '2026-07-18 09:30 AM',
    status: 'Approved'
  }
]

const initialCategories: SupportCategory[] = [
  {
    id: 'cat_1',
    name: 'Payment',
    description: 'Issues related to coin purchases, deposits, balance credits, or payment gateways.',
    sla: '2 Hours',
    priority: 'High',
    status: 'Active'
  },
  {
    id: 'cat_2',
    name: 'Account',
    description: 'Registration, profile updates, credential resets, and identity verification queries.',
    sla: '8 Hours',
    priority: 'Medium',
    status: 'Active'
  },
  {
    id: 'cat_3',
    name: 'Bet Dispute',
    description: 'Peer-to-peer stake escrow conflicts, outcome validation, and oracle arbitration.',
    sla: '4 Hours',
    priority: 'High',
    status: 'Active'
  },
  {
    id: 'cat_4',
    name: 'System Bug',
    description: 'Technical errors, latency issues, malfunction of UI elements, or reward logic failures.',
    sla: '12 Hours',
    priority: 'Medium',
    status: 'Active'
  }
]

export const SupportCenterPage: React.FC<{ activeTab?: string; navigate?: (tab: string) => void }> = ({ activeTab = 'support-tickets' }) => {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(true)

  // Fetch support tickets from Firestore on load
  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true)
      try {
        const supportCol = collection(db, 'support_tickets')
        const snapshot = await getDocs(supportCol)
        const dbTickets: Ticket[] = []
        snapshot.forEach(doc => {
          const data = doc.data()
          dbTickets.push({
            id: data.id || doc.id,
            user: data.user,
            subject: data.subject,
            description: data.description,
            category: data.category,
            priority: data.priority,
            status: data.status,
            date: data.date,
            messages: data.messages || []
          } as Ticket)
        })

        if (dbTickets.length > 0) {
          setTickets(prev => {
            const merged = [...prev]
            dbTickets.forEach(dt => {
              const idx = merged.findIndex(t => t.id === dt.id)
              if (idx > -1) {
                merged[idx] = dt
              } else {
                merged.unshift(dt)
              }
            })
            return merged
          })
        }
      } catch (err) {
        console.error("Error fetching support tickets from firestore:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTickets()
  }, [])

  // Fetch/Seed support categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true)
      try {
        // Clean up old mock document IDs if present in firestore
        const oldIds = ['cat_1', 'cat_2', 'cat_3', 'cat_4']
        for (const oldId of oldIds) {
          try {
            await deleteDoc(doc(db, 'support_categories', oldId))
          } catch (e) {
            // Ignore if not present or permission denied
          }
        }

        const categoriesCol = collection(db, 'support_categories')
        const snapshot = await getDocs(categoriesCol)

        if (snapshot.empty) {
          // Seed the 4 default categories with auto-generated IDs
          const seededCats: SupportCategory[] = []
          for (const cat of initialCategories) {
            const docRef = doc(collection(db, 'support_categories'))
            const seedCat = { ...cat, id: docRef.id }
            await setDoc(docRef, seedCat)
            seededCats.push(seedCat)
          }
          setCategories(seededCats)
        } else {
          const dbCategories: SupportCategory[] = []
          snapshot.forEach(doc => {
            dbCategories.push(doc.data() as SupportCategory)
          })
          dbCategories.sort((a, b) => a.id.localeCompare(b.id))
          setCategories(dbCategories)
        }
      } catch (err) {
        console.error("Error fetching/seeding support categories:", err)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // Fetch FAQs from Firestore
  useEffect(() => {
    const fetchFaqs = async () => {
      setIsLoadingFaqs(true)
      try {
        const faqsCol = collection(db, 'support_faqs')
        const snapshot = await getDocs(faqsCol)
        const dbFaqs: FAQItem[] = []

        snapshot.forEach(faqDoc => {
          const data = faqDoc.data()
          dbFaqs.push({
            id: data.id || faqDoc.id,
            question: data.question,
            answer: data.answer,
            category: 'General'
          } as FAQItem)
        })

        dbFaqs.sort((a, b) => a.id.localeCompare(b.id))
        setFaqs(dbFaqs)
      } catch (err) {
        console.error("Error fetching FAQs from firestore:", err)
      } finally {
        setIsLoadingFaqs(false)
      }
    }

    fetchFaqs()
  }, [])

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'In Progress' | 'Resolved'>('All')
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'Low' | 'Medium' | 'High'>('All')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')

  // Support Response State
  const [replyText, setReplyText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [cannedReply, setCannedReply] = useState('')

  // Statistics
  const totalCount = tickets.length
  const openCount = tickets.filter(t => t.status === 'Open').length
  const progressCount = tickets.filter(t => t.status === 'In Progress').length
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, priorityFilter, categoryFilter])

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'All' || priorityFilter !== 'All' || categoryFilter !== 'All'

  // Sub-tabs State
  const [disputes, setDisputes] = useState<BetDispute[]>(initialDisputes)
  const [refunds, setRefunds] = useState<RefundRequest[]>(initialRefunds)
  const [faqs, setFaqs] = useState<FAQItem[]>([])

  // Categories state
  const [categories, setCategories] = useState<SupportCategory[]>([])

  const handleAddCategory = async (name: string, description: string, sla: string, priority: string) => {
    try {
      const docRef = doc(collection(db, 'support_categories'))
      const newCategoryItem: SupportCategory = {
        id: docRef.id,
        name,
        description,
        sla,
        priority,
        status: 'Active'
      }

      await setDoc(docRef, newCategoryItem)
      setCategories(prev => [...prev, newCategoryItem])

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: `Category "${name}" added successfully.`,
          type: 'success'
        }
      }))
    } catch (err) {
      console.error("Error adding category to Firestore:", err)
    }
  }

  const handleDeleteCategory = async (catId: string, name: string) => {
    try {
      await deleteDoc(doc(db, 'support_categories', catId))
      setCategories(prev => prev.filter(c => c.id !== catId))
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: `Category "${name}" deleted.`,
          type: 'info'
        }
      }))
    } catch (err) {
      console.error("Error deleting category from Firestore:", err)
    }
  }

  const handleToggleCategoryStatus = async (catId: string) => {
    const category = categories.find(c => c.id === catId)
    if (!category) return

    const nextStatus = category.status === 'Active' ? 'Inactive' : 'Active'
    try {
      await updateDoc(doc(db, 'support_categories', catId), {
        status: nextStatus
      })

      setCategories(prev => prev.map(c => {
        if (c.id === catId) {
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: {
              message: `Category "${c.name}" status set to ${nextStatus}.`,
              type: 'info'
            }
          }))
          return { ...c, status: nextStatus }
        }
        return c
      }))
    } catch (err) {
      console.error("Error toggling category status in Firestore:", err)
    }
  }

  const handleEditCategory = async (id: string, name: string, description: string, sla: string, priority: string) => {
    try {
      const categoryRef = doc(db, 'support_categories', id)
      await updateDoc(categoryRef, {
        name,
        description,
        sla,
        priority
      })

      setCategories(prev => prev.map(c => {
        if (c.id === id) {
          return { ...c, name, description, sla, priority }
        }
        return c
      }))

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: `Category "${name}" updated successfully.`,
          type: 'success'
        }
      }))
    } catch (err) {
      console.error("Error editing category in Firestore:", err)
    }
  }

  // Action handlers
  const handleResolveDispute = (disputeId: string, winner: string) => {
    setDisputes(prev => prev.map(d => {
      if (d.id === disputeId) {
        return { ...d, status: 'Resolved', winnerSelected: winner }
      }
      return d
    }))
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: {
        message: `Dispute ${disputeId} resolved. Stakes settled to @${winner}.`,
        type: 'success'
      }
    }))
  }

  const handleRefundStake = (disputeId: string) => {
    setDisputes(prev => prev.map(d => {
      if (d.id === disputeId) {
        return { ...d, status: 'Resolved', winnerSelected: 'Refunded' }
      }
      return d
    }))
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: {
        message: `Dispute ${disputeId} stakes refunded to both users.`,
        type: 'success'
      }
    }))
  }

  const handleApproveRefund = (refundId: string) => {
    setRefunds(prev => prev.map(r => {
      if (r.id === refundId) {
        return { ...r, status: 'Approved' }
      }
      return r
    }))
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: {
        message: `Refund ${refundId} has been approved.`,
        type: 'success'
      }
    }))
  }

  const handleDeclineRefund = (refundId: string) => {
    setRefunds(prev => prev.map(r => {
      if (r.id === refundId) {
        return { ...r, status: 'Declined' }
      }
      return r
    }))
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: {
        message: `Refund ${refundId} declined.`,
        type: 'warning'
      }
    }))
  }

  const handleAddFaq = async (category: FAQItem['category'], question: string, answer: string) => {
    try {
      const docRef = doc(collection(db, 'support_faqs'))
      const item: FAQItem = {
        id: docRef.id,
        question,
        answer,
        category
      }

      await setDoc(docRef, {
        id: item.id,
        question: item.question,
        answer: item.answer
      })
      setFaqs(prev => [...prev, item])
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: `FAQ added successfully.`,
          type: 'success'
        }
      }))
    } catch (err) {
      console.error("Error adding FAQ to Firestore:", err)
    }
  }

  const handleEditFaq = async (faqId: string, category: FAQItem['category'], question: string, answer: string) => {
    try {
      await updateDoc(doc(db, 'support_faqs', faqId), {
        id: faqId,
        question,
        answer
      })

      setFaqs(prev => prev.map(f => {
        if (f.id === faqId) {
          return { ...f, category, question, answer }
        }
        return f
      }))

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: `FAQ updated successfully.`,
          type: 'success'
        }
      }))
    } catch (err) {
      console.error("Error updating FAQ in Firestore:", err)
    }
  }

  const handleDeleteFaq = async (faqId: string) => {
    try {
      await deleteDoc(doc(db, 'support_faqs', faqId))
      setFaqs(prev => prev.filter(f => f.id !== faqId))
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: `FAQ deleted.`,
          type: 'info'
        }
      }))
    } catch (err) {
      console.error("Error deleting FAQ from Firestore:", err)
    }
  }

  // Canned Responses list
  const cannedResponses = [
    { label: 'Select canned response...', value: '' },
    { label: 'Acknowledge payment issue', value: 'We have received your payment query. Our financial gateway logs are being reviewed, and your coin balance will be updated shortly.' },
    { label: 'Request screenshot', value: 'Could you please upload a screenshot of your transaction receipt or error message so we can look into this faster?' },
    { label: 'Streak correction notice', value: 'We have updated your reward streak details manually. Please check your page to see if the bonus is claimable.' },
    { label: 'Resolved closing text', value: 'This ticket has been marked resolved. If you have any further questions or run into issues, please open a new ticket.' }
  ]

  // Filtered Tickets list
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'All' || ticket.priority === priorityFilter
    const matchesCategory = categoryFilter === 'All' || ticket.category === categoryFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize))

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, totalPages))
  }, [totalPages])

  const paginatedTickets = filteredTickets.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Handle Send Reply
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket || !replyText.trim()) return

    setIsSending(true)

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: 'support',
      senderName: 'Support Agent (AnyBet)',
      content: replyText,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }

    // Persist to Firestore if it exists
    const persistReply = async () => {
      try {
        const supportCol = collection(db, 'support_tickets')
        const q = query(supportCol, where('id', '==', selectedTicket.id))
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
          const docId = snapshot.docs[0].id
          const docRef = doc(db, 'support_tickets', docId)
          const currentMsgs = snapshot.docs[0].data().messages || []
          const nextStatus = selectedTicket.status === 'Open'
            ? 'In Progress'
            : selectedTicket.status === 'In Progress'
              ? 'Resolved'
              : selectedTicket.status
          await updateDoc(docRef, {
            messages: [...currentMsgs, newMsg],
            status: nextStatus
          })
        }
      } catch (err) {
        console.error("Failed to update ticket in Firestore:", err)
      }
    }

    persistReply()

    setTimeout(() => {
      const updatedTickets = tickets.map(t => {
        if (t.id === selectedTicket.id) {
          const nextStatus = t.status === 'Open'
            ? 'In Progress' as const
            : t.status === 'In Progress'
              ? 'Resolved' as const
              : t.status
          return {
            ...t,
            messages: [...t.messages, newMsg],
            status: nextStatus
          }
        }
        return t
      })

      setTickets(updatedTickets)
      setSelectedTicket(prev => {
        if (!prev) return null
        const nextStatus = prev.status === 'Open'
          ? 'In Progress' as const
          : prev.status === 'In Progress'
            ? 'Resolved' as const
            : prev.status
        return {
          ...prev,
          messages: [...prev.messages, newMsg],
          status: nextStatus
        }
      })

      setReplyText('')
      setCannedReply('')
      setIsSending(false)

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Reply sent successfully.', type: 'success' }
      }))
    }, 450)
  }


  // Handle Canned Reply Selection
  const handleSelectCanned = (val: string) => {
    setCannedReply(val)
    if (val) {
      setReplyText(prev => prev ? `${prev}\n\n${val}` : val)
    }
  }

  const getPriorityColor = (p: 'Low' | 'Medium' | 'High') => {
    switch (p) {
      case 'High': return 'bg-red-500/10 border-red-500/30 text-red-400'
      case 'Medium': return 'bg-amber-500/10 border-amber-500/30 text-amber-400'
      case 'Low': return 'bg-blue-500/10 border-blue-500/30 text-blue-400'
    }
  }

  const getStatusColor = (s: 'Open' | 'In Progress' | 'Resolved') => {
    switch (s) {
      case 'Open': return 'bg-orange-500/10 border-orange-500/30 text-orange-400'
      case 'In Progress': return 'bg-purple-500/10 border-purple-500/30 text-purple-400'
      case 'Resolved': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
    }
  }

  const getCategoryIcon = (cat: 'Payment' | 'Account' | 'Bet Dispute' | 'System Bug') => {
    switch (cat) {
      case 'Payment': return <CreditCard className="h-3.5 w-3.5" />
      case 'Account': return <UserCheck className="h-3.5 w-3.5" />
      case 'Bet Dispute': return <ShieldAlert className="h-3.5 w-3.5" />
      case 'System Bug': return <Bug className="h-3.5 w-3.5" />
    }
  }

  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'support-disputes':
        return {
          title: 'Disputes Arbitration Hub',
          desc: 'Audit peer-to-peer bet outcome conflicts with AI oracle verification',
          icon: <ShieldAlert className="h-6 w-6 text-primary" />
        }
      case 'support-refunds':
        return {
          title: 'Refunds & Escalations Queue',
          desc: 'Review and process failed coin purchases or transaction refund requests',
          icon: <Wallet className="h-6 w-6 text-primary" />
        }
      case 'support-faq':
        return {
          title: 'FAQ Manager',
          desc: 'Create, update, and categorize public guides and automated help articles',
          icon: <HelpCircle className="h-6 w-6 text-primary" />
        }
      case 'support-categories':
        return {
          title: 'Support Categories',
          desc: 'Manage support ticketing classifications, response SLAs, and routing rules',
          icon: <Layers className="h-6 w-6 text-primary" />
        }
      default:
        return {
          title: 'Support Desk Center',
          desc: 'Manage, audit, and resolve user-submitted support inquiries',
          icon: <MessageSquare className="h-6 w-6 text-primary" />
        }
    }
  }

  const renderAnalyticsGrid = () => {
    if (activeTab === 'support-categories' || activeTab === 'support-faq') {
      return null
    }

    if (activeTab === 'support-disputes') {
      const pendingD = disputes.filter(d => d.status === 'Pending Review').length
      const resolvedD = disputes.filter(d => d.status === 'Resolved').length
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel border border-muted/30 rounded-xl p-4 bg-surface/30 flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-muted uppercase tracking-wider block">Total Disputes</span>
              <span className="text-lg font-bold text-foreground font-mono">{disputes.length}</span>
            </div>
          </div>
          <div className="glass-panel border border-muted/30 rounded-xl p-4 bg-surface/30 flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 rounded-lg text-orange-400">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-muted uppercase tracking-wider block">Pending Review</span>
              <span className="text-lg font-bold text-foreground font-mono">{pendingD}</span>
            </div>
          </div>
          <div className="glass-panel border border-muted/30 rounded-xl p-4 bg-surface/30 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-muted uppercase tracking-wider block">Resolved</span>
              <span className="text-lg font-bold text-foreground font-mono">{resolvedD}</span>
            </div>
          </div>
          <div className="glass-panel border border-muted/30 rounded-xl p-4 bg-surface/30 flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-400">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-muted uppercase tracking-wider block">Avg Confidence</span>
              <span className="text-lg font-bold text-foreground font-mono">96%</span>
            </div>
          </div>
        </div>
      )
    }

    if (activeTab === 'support-refunds') {
      const pendingR = refunds.filter(r => r.status === 'Pending').length
      const approvedR = refunds.filter(r => r.status === 'Approved').length
      const declinedR = refunds.filter(r => r.status === 'Declined').length
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel border border-muted/30 rounded-xl p-4 bg-surface/30 flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-muted uppercase tracking-wider block">Total Requests</span>
              <span className="text-lg font-bold text-foreground font-mono">{refunds.length}</span>
            </div>
          </div>
          <div className="glass-panel border border-muted/30 rounded-xl p-4 bg-surface/30 flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 rounded-lg text-orange-400">
              <Clock className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-muted uppercase tracking-wider block">Pending Approval</span>
              <span className="text-lg font-bold text-foreground font-mono">{pendingR}</span>
            </div>
          </div>
          <div className="glass-panel border border-muted/30 rounded-xl p-4 bg-surface/30 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-muted uppercase tracking-wider block">Approved Refunds</span>
              <span className="text-lg font-bold text-foreground font-mono">{approvedR}</span>
            </div>
          </div>
          <div className="glass-panel border border-muted/30 rounded-xl p-4 bg-surface/30 flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 rounded-lg text-red-400">
              <X className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-muted uppercase tracking-wider block">Declined Requests</span>
              <span className="text-lg font-bold text-foreground font-mono">{declinedR}</span>
            </div>
          </div>
        </div>
      )
    }

    // Default Support Tickets view
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total tickets */}
        <div className="glass-panel border border-muted/30 rounded-xl p-4 bg-surface/30 flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-muted uppercase tracking-wider block">Total Inquiries</span>
            <span className="text-lg font-bold text-foreground font-mono">{totalCount}</span>
          </div>
        </div>

        {/* Open tickets */}
        <div className="glass-panel border border-muted/30 rounded-xl p-4 bg-surface/30 flex items-center gap-3">
          <div className="p-2.5 bg-orange-500/10 rounded-lg text-orange-400">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-muted uppercase tracking-wider block">Open State</span>
            <span className="text-lg font-bold text-foreground font-mono">{openCount}</span>
          </div>
        </div>

        {/* In progress */}
        <div className="glass-panel border border-muted/30 rounded-xl p-4 bg-surface/30 flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-muted uppercase tracking-wider block">In Progress</span>
            <span className="text-lg font-bold text-foreground font-mono">{progressCount}</span>
          </div>
        </div>

        {/* Resolved */}
        <div className="glass-panel border border-muted/30 rounded-xl p-4 bg-surface/30 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-muted uppercase tracking-wider block">Resolved</span>
            <span className="text-lg font-bold text-foreground font-mono">{resolvedCount}</span>
          </div>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'support-disputes':
        return (
          <DisputeResolution
            disputes={disputes}
            handleResolveDispute={handleResolveDispute}
            handleRefundStake={handleRefundStake}
          />
        )
      case 'support-refunds':
        return renderRefundsContent()
      case 'support-faq':
        return (
          <FAQManager
            faqs={faqs}
            handleAddFaq={handleAddFaq}
            handleEditFaq={handleEditFaq}
            handleDeleteFaq={handleDeleteFaq}
            isLoading={isLoadingFaqs}
          />
        )
      case 'support-categories':
        return (
          <SupportCategories
            categories={categories}
            handleAddCategory={handleAddCategory}
            handleEditCategory={handleEditCategory}
            handleDeleteCategory={handleDeleteCategory}
            handleToggleCategoryStatus={handleToggleCategoryStatus}
            isLoading={isLoadingCategories}
          />
        )
      default:
        return renderTicketsContent()
    }
  }

  const renderRefundsContent = () => {
    return (
      <div className="border border-muted/30 rounded-xl overflow-hidden bg-surface/30 w-full overflow-x-auto">
        <Table>
          <TableHeader className="bg-surface/75 border-b border-muted/30">
            <TableRow className="border-b border-muted/30 hover:bg-transparent h-14">
              <TableHead className="text-xs font-mono h-14 pl-4">Request ID</TableHead>
              <TableHead className="text-xs font-mono h-14">User</TableHead>
              <TableHead className="text-xs font-mono h-14">Refund Request Reason</TableHead>
              <TableHead className="text-xs font-mono h-14 text-center">Coins Amount</TableHead>
              <TableHead className="text-xs font-mono h-14 text-center">USD Value</TableHead>
              <TableHead className="text-xs font-mono h-14">Date Submitted</TableHead>
              <TableHead className="text-xs font-mono h-14 text-center">Status</TableHead>
              <TableHead className="text-xs font-mono h-14 pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {refunds.map(r => (
              <TableRow key={r.id} className="border-b border-muted/20 hover:bg-surface/40">
                <TableCell className="py-3 pl-4 font-mono text-xs font-bold text-foreground">{r.id}</TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base shrink-0">{r.avatar}</span>
                    <span className="text-xs font-bold font-mono text-foreground">@{r.username}</span>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-xs max-w-sm text-muted font-sans truncate">{r.reason}</TableCell>
                <TableCell className="py-3 text-center text-xs font-mono font-bold text-primary">{r.amountCoins.toLocaleString()} Coins</TableCell>
                <TableCell className="py-3 text-center text-xs font-mono text-muted">${r.amountUsd.toFixed(2)}</TableCell>
                <TableCell className="py-3 text-xs font-mono text-muted">{r.date}</TableCell>
                <TableCell className="py-3 text-center">
                  <span className={`inline-block px-2 py-0.5 text-[9px] font-mono font-extrabold uppercase rounded-md border ${r.status === 'Approved'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : r.status === 'Declined'
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                    }`}>
                    {r.status}
                  </span>
                </TableCell>
                <TableCell className="py-3 pr-4 text-right">
                  {r.status === 'Pending' ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2.5 text-[10px] font-mono hover:bg-emerald-950/20 hover:text-emerald-400 border border-muted/30"
                        onClick={() => handleApproveRefund(r.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2.5 text-[10px] font-mono text-muted hover:text-red-400"
                        onClick={() => handleDeclineRefund(r.id)}
                      >
                        Decline
                      </Button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-muted">Completed</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }



  const renderTicketsContent = () => {
    return (
      <div className="flex flex-col gap-4 w-full">

        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input
              type="text"
              placeholder="Search ticket ID, user, or topic..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-card border border-border focus-visible:ring-primary/30"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-2">
            {/* Status Selector */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="h-9 px-3 rounded-lg text-xs font-mono bg-card border border-border text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            {/* Priority Selector */}
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value as any)}
              className="h-9 px-3 rounded-lg text-xs font-mono bg-card border border-border text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            {/* Category Selector */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="h-9 px-3 rounded-lg text-xs font-mono bg-card border border-border text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            {/* Clear Filters Action */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('All')
                  setPriorityFilter('All')
                  setCategoryFilter('All')
                }}
                className="h-9 px-3 text-xs font-mono gap-1 text-muted hover:text-foreground shrink-0 border border-dashed border-border"
              >
                <X className="h-3.5 w-3.5" /> Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Table & Footer Wrapper */}
        <div className="flex flex-col w-full">
          {/* Tickets List Table Container */}
          <div className="border border-muted/30 rounded-xl overflow-hidden bg-surface/30 overflow-x-auto w-full">
          <Table>
            <TableHeader className="bg-surface/75 border-b border-muted/30">
              <TableRow className="border-b border-muted/30 hover:bg-transparent h-14">
                <TableHead className="text-xs font-mono h-14 pl-4">Ticket ID</TableHead>
                <TableHead className="text-xs font-mono h-14">User Details</TableHead>
                <TableHead className="text-xs font-mono h-14">Inquiry Details</TableHead>
                <TableHead className="text-xs font-mono h-14">Category</TableHead>
                <TableHead className="text-xs font-mono h-14 text-center">Priority</TableHead>
                <TableHead className="text-xs font-mono h-14 text-center">Status</TableHead>
                <TableHead className="text-xs font-mono h-14 pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted font-mono text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <motion.div
                        className="h-5 w-5 rounded-full border-2 border-border border-t-primary"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                      Loading data...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-xs font-mono text-muted uppercase">
                    No support tickets match filters
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTickets.map(ticket => {
                  const isSelected = selectedTicket?.id === ticket.id
                  return (
                    <TableRow
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`cursor-pointer transition-colors border-b border-muted/20 hover:bg-surface/40 ${isSelected ? 'bg-primary/5' : ''
                        }`}
                    >
                      {/* Ticket ID */}
                      <TableCell className="py-3 pl-4 font-mono text-xs font-bold text-foreground">
                        {ticket.id}
                      </TableCell>

                      {/* User */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-surface border border-muted/45 flex items-center justify-center text-xs font-bold text-primary font-sans shrink-0">
                            {ticket.user.avatar}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-foreground block font-sans leading-none">{ticket.user.name}</span>
                            <span className="text-[10px] text-muted font-mono block mt-0.5">@{ticket.user.username}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Subject */}
                      <TableCell className="py-3 max-w-xs">
                        <span className="text-xs font-bold text-foreground block truncate">{ticket.subject}</span>
                        <span className="text-[10px] text-muted font-mono block truncate mt-0.5">{ticket.date}</span>
                      </TableCell>

                      {/* Category */}
                      <TableCell className="py-3 text-xs font-mono">
                        <div className="flex items-center gap-1.5 text-muted/90">
                          {getCategoryIcon(ticket.category)}
                          <span>{ticket.category}</span>
                        </div>
                      </TableCell>

                      {/* Priority */}
                      <TableCell className="py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-mono font-extrabold uppercase rounded-md border ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-mono font-extrabold uppercase rounded-md border ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          onClick={() => setSelectedTicket(ticket)}
                          variant="ghost"
                          className="h-7 px-2.5 text-[10px] font-mono gap-1 rounded-lg"
                        >
                          MANAGE <ArrowRight className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-card flex items-center justify-between text-xs font-mono">
          <span className="text-muted">
            Showing {filteredTickets.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            {' '}to {Math.min(currentPage * pageSize, filteredTickets.length)} of {filteredTickets.length} Tickets
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-xs font-mono"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-foreground font-bold">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-xs font-mono"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        </div>
      </div>
    )
  }



  const headerInfo = getHeaderInfo()

  return (
    <div className="p-6 flex flex-col gap-6 w-full font-sans">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <h2 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
          {headerInfo.icon} {headerInfo.title}
        </h2>
        <p className="text-xs text-muted font-mono mt-0.5 uppercase tracking-wider">
          {headerInfo.desc}
        </p>
      </div>

      {/* Analytics Overview Grid */}
      {renderAnalyticsGrid()}

      {/* Main Support Grid (Split panel layout) */}
      {renderTabContent()}

      {/* Ticket Details Sheet */}
      <Sheet
        open={!!selectedTicket}
        onOpenChange={(open) => {
          if (!open) setSelectedTicket(null)
        }}
      >
        <SheetContent side="right" hideClose className="w-full sm:max-w-2xl bg-background border-l border-border p-0 overflow-hidden">
          {selectedTicket && (
            <TicketDetails
              ticket={selectedTicket}
              replyText={replyText}
              setReplyText={setReplyText}
              isSending={isSending}
              cannedReply={cannedReply}
              setCannedReply={setCannedReply}
              cannedResponses={cannedResponses}
              handleSendReply={handleSendReply}
              handleSelectCanned={handleSelectCanned}
              onClose={() => setSelectedTicket(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
