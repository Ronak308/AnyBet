import React, { useState } from 'react'
import { Plus, Trash2, MoreHorizontal, Edit3, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { AddFaq } from './components/AddFaq'

export interface FAQItem {
  id: string
  question: string
  answer: string
  category: 'General' | 'Wallets & Coins' | 'Challenges Rules' | 'Security'
}

interface FAQManagerProps {
  faqs: FAQItem[]
  handleAddFaq: (category: FAQItem['category'], question: string, answer: string) => void
  handleEditFaq: (id: string, category: FAQItem['category'], question: string, answer: string) => void
  handleDeleteFaq: (id: string) => void
}

export const FAQManager: React.FC<FAQManagerProps> = ({
  faqs,
  handleAddFaq,
  handleEditFaq,
  handleDeleteFaq
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddingFaq, setIsAddingFaq] = useState(false)
  const [faqToEdit, setFaqToEdit] = useState<FAQItem | null>(null)

  const openAddSheet = () => {
    setFaqToEdit(null)
    setIsAddingFaq(true)
  }

  const openEditSheet = (faq: FAQItem) => {
    setFaqToEdit(faq)
    setIsAddingFaq(true)
  }

  const filteredFaqs = faqs.filter(f => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true
    return (
      f.question.toLowerCase().includes(query) ||
      f.answer.toLowerCase().includes(query) ||
      (f.category && f.category.toLowerCase().includes(query))
    )
  })

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Control Bar: Search & Action */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-1">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted/80 pointer-events-none" />
          <Input
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs font-sans bg-card border border-border focus-visible:ring-primary/30"
          />
        </div>
        <Button
          onClick={openAddSheet}
          className="h-9 px-4 text-xs font-mono gap-1.5 rounded-lg w-full md:w-auto shrink-0"
        >
          <Plus className="h-4 w-4" /> Add FAQ Article
        </Button>
      </div>

      <Sheet open={isAddingFaq} onOpenChange={(open) => { if (!open) setIsAddingFaq(false) }}>
        <SheetContent side="right" hideClose className="w-full sm:max-w-2xl bg-background border-l border-border p-0 overflow-hidden">
          <AddFaq
            faqToEdit={faqToEdit}
            handleAddFaq={handleAddFaq}
            handleEditFaq={handleEditFaq}
            onClose={() => setIsAddingFaq(false)}
          />
        </SheetContent>
      </Sheet>

      {/* FAQs Table */}
      <div className="border border-muted/30 rounded-xl overflow-hidden bg-surface/30 w-full overflow-x-auto">
        <Table>
          <TableHeader className="bg-surface/75 border-b border-muted/30">
            <TableRow className="border-b border-muted/30 hover:bg-transparent h-14">
              <TableHead className="text-xs font-mono h-14 pl-4">Question</TableHead>
              <TableHead className="text-xs font-mono h-14">Answer</TableHead>
              <TableHead className="text-xs font-mono h-14 pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFaqs.map(f => (
              <TableRow key={f.id} className="border-b border-muted/20 hover:bg-surface/40">
                <TableCell className="py-3 pl-4 align-top text-xs font-bold text-foreground max-w-[320px]">
                  <span className="block truncate">{f.question}</span>
                </TableCell>
                <TableCell className="py-3 align-top text-xs text-muted max-w-[520px]">
                  <p className="line-clamp-2 whitespace-pre-line">{f.answer}</p>
                </TableCell>
                <TableCell className="py-3 pr-4 align-top text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted hover:text-foreground hover:bg-surface/60 rounded-lg cursor-pointer flex items-center justify-center"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 bg-[#120F1D] border-border/80 p-1.5 shadow-2xl">
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-surface/80 cursor-pointer rounded-md p-2"
                          onClick={() => openEditSheet(f)}
                        >
                          <Edit3 className="h-3.5 w-3.5 text-muted" />
                          Edit FAQ
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-400 focus:bg-red-950/20 focus:text-red-300 flex items-center gap-2 text-xs font-mono cursor-pointer rounded-md p-2"
                          onClick={() => handleDeleteFaq(f.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                          Delete FAQ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredFaqs.length === 0 && (
              <TableRow className="border-b border-muted/20 hover:bg-transparent">
                <TableCell colSpan={3} className="py-10 text-center font-mono text-xs text-muted uppercase">
                  No FAQ articles match search
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
