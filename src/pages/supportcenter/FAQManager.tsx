import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, MoreHorizontal, Edit3, Search, ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { AddFaq } from './components/AddFaq'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { FaqDetails } from './components/FaqDetails'

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
  isLoading?: boolean
}

export const FAQManager: React.FC<FAQManagerProps> = ({
  faqs,
  handleAddFaq,
  handleEditFaq,
  handleDeleteFaq,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddingFaq, setIsAddingFaq] = useState(false)
  const [faqToEdit, setFaqToEdit] = useState<FAQItem | null>(null)
  const [faqToDelete, setFaqToDelete] = useState<FAQItem | null>(null)
  const [selectedFaq, setSelectedFaq] = useState<FAQItem | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const filteredFaqs = faqs.filter(f => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true
    return (
      f.question.toLowerCase().includes(query) ||
      f.answer.toLowerCase().includes(query) ||
      (f.category && f.category.toLowerCase().includes(query))
    )
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredFaqs.length / pageSize))
  const paginatedFaqs = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredFaqs.slice(start, start + pageSize)
  }, [filteredFaqs, currentPage])

  const openAddSheet = () => {
    setFaqToEdit(null)
    setIsAddingFaq(true)
  }

  const openEditSheet = (faq: FAQItem) => {
    setFaqToEdit(faq)
    setIsAddingFaq(true)
  }

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

      <Sheet open={selectedFaq !== null} onOpenChange={(open) => { if (!open) setSelectedFaq(null) }}>
        <SheetContent side="right" hideClose className="w-full sm:max-w-2xl bg-background border-l border-border p-0 overflow-hidden">
          {selectedFaq && (
            <FaqDetails
              faq={selectedFaq}
              onClose={() => setSelectedFaq(null)}
              onEdit={() => {
                const faq = selectedFaq
                setSelectedFaq(null)
                setFaqToEdit(faq)
                setIsAddingFaq(true)
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* FAQs Table */}
      <div className="flex flex-col w-full">
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10 text-muted font-mono text-xs">
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
              ) : filteredFaqs.length === 0 ? (
                <TableRow className="border-b border-muted/20 hover:bg-transparent">
                  <TableCell colSpan={3} className="py-10 text-center font-mono text-xs text-muted uppercase">
                    No FAQ articles match search
                  </TableCell>
                </TableRow>
              ) : (
                paginatedFaqs.map(f => {
                  const isSelected = selectedFaq?.id === f.id
                  return (
                    <TableRow
                      key={f.id}
                      onClick={() => setSelectedFaq(f)}
                      className={`cursor-pointer border-b border-muted/20 hover:bg-surface/40 transition-colors ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
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
                                onClick={() => setSelectedFaq(f)}
                              >
                                <FileText className="h-3.5 w-3.5 text-muted" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-surface/80 cursor-pointer rounded-md p-2"
                                onClick={() => openEditSheet(f)}
                              >
                                <Edit3 className="h-3.5 w-3.5 text-muted" />
                                Edit FAQ
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-400 focus:bg-red-950/20 focus:text-red-300 flex items-center gap-2 text-xs font-mono cursor-pointer rounded-md p-2"
                                onClick={() => setFaqToDelete(f)}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                Delete FAQ
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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
            Showing {filteredFaqs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            {' '}to {Math.min(currentPage * pageSize, filteredFaqs.length)} of {filteredFaqs.length} FAQs
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

      <ConfirmationModal
        isOpen={faqToDelete !== null}
        onClose={() => setFaqToDelete(null)}
        onConfirm={() => {
          if (faqToDelete) {
            handleDeleteFaq(faqToDelete.id)
            setFaqToDelete(null)
          }
        }}
        title="Delete FAQ Article"
        description={
          <p>
            Are you sure you want to delete this FAQ article?
            This action cannot be undone.
          </p>
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}
