import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  React.useEffect(() => {
    if (faqToEdit) {
      setNewCategory(faqToEdit.category)
      setNewQuestion(faqToEdit.question)
      setNewAnswer(faqToEdit.answer)
    } else {
      setNewCategory('General')
      setNewQuestion('')
      setNewAnswer('')
    }
    setFieldErrors({})
  }, [faqToEdit])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const finalQuestion = newQuestion.trim()
    const finalAnswer = newAnswer.trim()
    const errors: Record<string, string> = {}

    if (!finalQuestion) {
      errors.question = 'Question is required.'
    } else if (finalQuestion.length < 10) {
      errors.question = 'Question must be at least 10 characters.'
    } else if (finalQuestion.length > 120) {
      errors.question = 'Question must not exceed 120 characters.'
    } else if (!/[a-zA-Z0-9]/.test(finalQuestion)) {
      errors.question = 'Question must contain letters or numbers.'
    } else if (!/^[a-zA-Z0-9\s\-\?\.,'"`!#@%&*()_/+]+$/.test(finalQuestion)) {
      errors.question = 'Question can only contain letters, numbers, spaces, and basic punctuation.'
    }

    if (!finalAnswer) {
      errors.answer = 'Answer is required.'
    } else if (finalAnswer.length < 2) {
      errors.answer = 'Answer must be at least 2 characters.'
    } else if (finalAnswer.length > 1000) {
      errors.answer = 'Answer must not exceed 1000 characters.'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    if (isEditing && faqToEdit && handleEditFaq) {
      handleEditFaq(faqToEdit.id, newCategory, finalQuestion, finalAnswer)
    } else {
      handleAddFaq(newCategory, finalQuestion, finalAnswer)
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
            <textarea
              placeholder="e.g. How can I withdraw coins back to cash?"
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value)}
              rows={3}
              className="p-3 rounded-lg text-xs bg-card border border-border text-foreground focus:outline-none focus:border-primary/50 placeholder-muted/50 font-sans resize-none"
              maxLength={120}
            />
            {fieldErrors.question && (
              <span className="text-[10px] text-red-500 dark:text-red-400 font-mono mt-0.5">{fieldErrors.question}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase text-muted tracking-wider font-bold">Answer <span className="text-red-400 ml-0.5">*</span></label>
            <textarea
              placeholder="Enter complete troubleshooting or informational response..."
              value={newAnswer}
              onChange={e => setNewAnswer(e.target.value)}
              rows={6}
              className="p-3 rounded-lg text-xs bg-card border border-border text-foreground focus:outline-none focus:border-primary/50 placeholder-muted/50 font-sans resize-none"
              maxLength={1000}
            />
            {fieldErrors.answer && (
              <span className="text-[10px] text-red-500 dark:text-red-400 font-mono mt-0.5">{fieldErrors.answer}</span>
            )}
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
