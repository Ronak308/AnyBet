import React, { useState, useEffect } from 'react'
import type { Ticket } from '../SupportTickets'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Send, CreditCard, UserCheck, ShieldAlert, Bug, Layers, User } from 'lucide-react'
import { db } from '@/firebase/firebase'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'

interface TicketDetailsProps {
  ticket: Ticket
  replyText: string
  setReplyText: (val: string) => void
  isSending: boolean
  cannedReply: string
  setCannedReply: (val: string) => void
  cannedResponses: { label: string; value: string }[]
  handleSendReply: (e: React.FormEvent) => void
  handleSelectCanned: (val: string) => void
  onClose: () => void
  onStatusChange: (status: Ticket['status']) => void
}

interface ResolvedUser {
  name: string
  username: string
  avatar: string
  walletBalance: number
  activeBets: number
}

export const TicketDetails: React.FC<TicketDetailsProps> = ({
  ticket,
  replyText,
  setReplyText,
  isSending,
  cannedReply,
  cannedResponses,
  handleSendReply,
  handleSelectCanned,
  onClose,
  onStatusChange
}) => {
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [resolvedUser, setResolvedUser] = useState<ResolvedUser | null>(null)

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        let userData: any = null

        // 1. Try resolving via ticket.userId if present
        if (ticket.userId) {
          const userSnap = await getDoc(doc(db, 'users', ticket.userId))
          if (userSnap.exists()) {
            userData = userSnap.data()
          }
        }

        // 2. Fallback: try resolving via ticket.user?.username
        if (!userData && ticket.user?.username) {
          const q = query(collection(db, 'users'), where('username', '==', ticket.user.username))
          const snapshot = await getDocs(q)
          if (!snapshot.empty) {
            userData = snapshot.docs[0].data()
          }
        }

        if (userData) {
          setResolvedUser({
            name: userData.name || userData.username || 'User',
            username: userData.username || 'unknown',
            avatar: userData.avatar || '',
            walletBalance: userData.walletBalance !== undefined ? userData.walletBalance : (userData.coins || 0),
            activeBets: userData.activeBets || 0
          })
          setUserAvatar(userData.avatar || null)
        } else {
          setResolvedUser(null)
          setUserAvatar(null)
        }
      } catch (err) {
        console.error("Error fetching user details from firestore:", err)
        setResolvedUser(null)
        setUserAvatar(null)
      }
    }

    fetchUserDetails()
  }, [ticket.userId, ticket.user?.username])

  const getCategoryIcon = (category: Ticket['category']) => {
    switch (category) {
      case 'Payment':
        return <CreditCard className="h-3.5 w-3.5" />
      case 'Account':
        return <UserCheck className="h-3.5 w-3.5" />
      case 'Bet Dispute':
        return <ShieldAlert className="h-3.5 w-3.5" />
      case 'System Bug':
        return <Bug className="h-3.5 w-3.5" />
      default:
        return <Layers className="h-3.5 w-3.5" />
    }
  }

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500/10 border-red-500/30 text-red-400'
      case 'Medium':
        return 'bg-orange-500/10 border-orange-500/30 text-orange-400'
      case 'Low':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400'
      default:
        return 'bg-muted/10 border-muted/30 text-muted'
    }
  }

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
      case 'In Progress':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400'
      case 'Open':
        return 'bg-orange-500/10 border-orange-500/30 text-orange-400'
      default:
        return 'bg-muted/10 border-muted/30 text-muted'
    }
  }

  return (
    <Card className="h-full flex flex-col justify-between bg-card border-none select-none font-sans shadow-none p-6 overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Sheet Header */}
        <div className="border-b border-border/40 pb-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground font-sans uppercase tracking-wider">
                  Ticket Details
                </h2>
                <span className="font-mono text-xs font-bold text-muted">{ticket.id}</span>
              </div>
              <p className="text-[10px] text-muted font-mono uppercase tracking-widest mt-1">
                Conversation History & Technical Logs
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-muted hover:text-foreground p-1.5 transition-colors rounded-md hover:bg-border/30 shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Ticket Metadata Bar (Subject, Category, Priority, Status) */}
        <div className="bg-surface/30 border border-muted/20 rounded-xl p-4 flex flex-col gap-3 mb-4 text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Subject</span>
            <span className="text-foreground font-bold font-sans text-sm">{ticket.subject}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-muted/15">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-mono text-muted uppercase tracking-wider">Category</span>
              <div className="flex items-center gap-1 text-foreground font-medium">
                {getCategoryIcon(ticket.category)}
                <span>{ticket.category}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 items-center">
              <span className="text-[9px] font-mono text-muted uppercase tracking-wider">Priority</span>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority}
              </span>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <span className="text-[9px] font-mono text-muted uppercase tracking-wider">Status</span>
              <select
                value={ticket.status}
                onChange={(e) => onStatusChange(e.target.value as Ticket['status'])}
                className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border bg-surface/80 hover:bg-surface outline-none cursor-pointer uppercase ${getStatusColor(ticket.status)}`}
              >
                <option value="Open" className="bg-background text-orange-400">OPEN</option>
                <option value="In Progress" className="bg-background text-blue-400">IN PROGRESS</option>
                <option value="Resolved" className="bg-background text-emerald-400">RESOLVED</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Technical Log Context Card */}
        <div className="bg-surface/50 border border-muted/20 rounded-xl p-4 flex flex-col gap-3 mb-4 text-xs">
          <span className="text-[10px] font-mono text-muted uppercase tracking-widest">User Log Details</span>
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-border/40">
            <div className="h-8 w-8 rounded-full border border-primary/20 bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden text-primary font-bold text-[10px]">
              {userAvatar ? (
                userAvatar.startsWith('http') || userAvatar.startsWith('/') ? (
                  <img src={userAvatar} alt={resolvedUser?.name || ticket.user?.name || 'User'} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs">{userAvatar}</span>
                )
              ) : (
                <User className="h-3.5 w-3.5" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-foreground">{resolvedUser?.name || ticket.user?.name || 'Anonymous User'}</span>
              <span className="text-[10px] text-muted font-mono">@{resolvedUser?.username || ticket.user?.username || 'anonymous'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="flex justify-between items-center">
              <span className="text-muted flex items-center gap-1.5 font-mono text-[10px]">
                <CreditCard className="h-3.5 w-3.5 text-muted/70" /> WALLET
              </span>
              <span className="text-foreground font-mono text-[11px] font-bold">
                {resolvedUser?.walletBalance !== undefined 
                  ? resolvedUser.walletBalance.toLocaleString() 
                  : (ticket.user?.walletBalance !== undefined ? ticket.user.walletBalance.toLocaleString() : '0')} Coins
              </span>
            </div>
            <div className="flex justify-between items-center border-l border-border/40 pl-4">
              <span className="text-muted flex items-center gap-1.5 font-mono text-[10px]">
                <Layers className="h-3.5 w-3.5 text-muted/70" /> ACTIVE BETS
              </span>
              <span className="text-foreground font-mono text-[11px] font-bold">
                {resolvedUser?.activeBets !== undefined 
                  ? resolvedUser.activeBets 
                  : (ticket.user?.activeBets !== undefined ? ticket.user.activeBets : '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Conversation Trail Section */}
        <span className="text-[10px] font-mono text-muted uppercase tracking-widest mb-2 block">
          Conversation Log
        </span>
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 scrollbar-thin mb-4 border border-muted/20 bg-surface/10 rounded-xl p-3">
          {ticket.messages.map((msg) => {
            const isAgent = msg.sender === 'support'
            return (
              <div key={msg.id} className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] text-muted font-mono">{msg.senderName}</span>
                  <span className="text-[8px] text-muted/60 font-mono">• {msg.timestamp}</span>
                </div>
                <div
                  className={`p-2.5 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                    isAgent
                      ? 'bg-primary/20 border border-primary/30 text-foreground rounded-tr-none'
                      : 'bg-surface border border-muted/20 text-foreground rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Support Composer Form */}
      <div className="border-t border-border/40 pt-4 bg-card">
        <form onSubmit={handleSendReply} className="flex flex-col gap-2">
          {/* Canned replies selector */}
          <div className="flex items-center gap-1.5">
            <select
              value={cannedReply}
              onChange={e => handleSelectCanned(e.target.value)}
              className="flex-1 h-8 rounded-lg text-[10px] font-mono bg-surface border border-muted/20 text-foreground focus:outline-none px-2"
            >
              {cannedResponses.map((cr, idx) => (
                <option key={idx} value={cr.value}>{cr.label}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              placeholder="Type support reply or solution..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              className="w-full p-2.5 text-xs bg-surface border border-muted/30 rounded-xl focus:outline-none focus:border-primary/50 text-foreground font-sans placeholder-muted/60 resize-none pr-12"
            />
            <div className="absolute bottom-2.5 right-2.5">
              <Button
                type="submit"
                disabled={isSending || !replyText.trim()}
                variant="primary"
                className="h-7 w-7 p-0 rounded-lg flex items-center justify-center shrink-0"
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Card>
  )
}
