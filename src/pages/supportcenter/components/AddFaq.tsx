import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, HelpCircle } from 'lucide-react'
import type { FAQItem } from '../FAQManager'

interface AddFaqProps {
  faqToEdit?: FAQItem | null
  handleAddFaq: (category: FAQItem['category'], question: string, answer: string) => void
  handleEditFaq?: (id: string, category: FAQItem['category'], question: string, answer: string) => void
  onClose: () => void
}

export const AddFaq: React.FC<AddFaqProps> = ({
  faqToEdit,
  handleAddFaq,
  handleEditFaq,
  onClose
}) => {
  const isEditing = faqToEdit !== null && faqToEdit !== undefined
  const [newCategory, setNewCategory] = useState<FAQItem['category']>(faqToEdit?.category ?? 'General')
  const [newQuestion, setNewQuestion] = useState(faqToEdit?.question ?? '')
  const [newAnswer, setNewAnswer] = useState(faqToEdit?.answer ?? '')

  React.useEffect(() => {
    if (faqToEdit) {
      setNewCategory(faqToEdit.category)
      setNewQuestion(faqToEdit.question)
      setNewAnswer(faqToEdit.answer)
      return
    }

    setNewCategory('General')
    setNewQuestion('')
    setNewAnswer('')
  }, [faqToEdit])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim() || !newAnswer.trim()) return

    if (isEditing && faqToEdit && handleEditFaq) {
      handleEditFaq(faqToEdit.id, newCategory, newQuestion, newAnswer)
    } else {
      handleAddFaq(newCategory, newQuestion, newAnswer)
    }

    setNewCategory('General')
    setNewQuestion('')
    setNewAnswer('')
    onClose()
  }

  return (
    <Card className="h-full flex flex-col justify-between bg-card border-none select-none font-sans shadow-none p-6 overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="border-b border-border/40 pb-4 mb-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-foreground font-sans uppercase tracking-wider">
                  {isEditing ? 'Edit FAQ Article' : 'Add FAQ Article'}
                </h2>
              </div>
              <p className="text-[10px] text-muted font-mono uppercase tracking-widest mt-1">
                {isEditing ? 'Update the selected help center article' : 'Create a new help center article for the FAQ manager'}
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

        <form id="add-faq-form" onSubmit={onSubmit} className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1 scrollbar-thin">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase text-muted tracking-wider font-bold">Question <span className="text-red-400 ml-0.5">*</span></label>
            <Input
              type="text"
              placeholder="e.g. How can I withdraw coins back to cash?"
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value)}
              className="h-9 text-xs bg-card border border-border focus-visible:ring-primary/30"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase text-muted tracking-wider font-bold">Answer <span className="text-red-400 ml-0.5">*</span></label>
            <textarea
              placeholder="Enter complete troubleshooting or informational response..."
              value={newAnswer}
              onChange={e => setNewAnswer(e.target.value)}
              rows={6}
              className="p-3 rounded-lg text-xs bg-card border border-border text-foreground focus:outline-none focus:border-primary/50 placeholder-muted/50 font-sans resize-none"
              required
            />
          </div>
        </form>
      </div>

      <div className="border-t border-border/40 pt-4 flex items-center justify-end gap-2 bg-card">
        <Button
          type="button"
          variant="ghost"
          className="h-9 px-4 text-xs font-mono text-muted hover:text-foreground"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="add-faq-form"
          className="h-9 px-4 text-xs font-mono"
        >
          {isEditing ? 'Save Changes' : 'Publish FAQ'}
        </Button>
      </div>
    </Card>
  )
}
