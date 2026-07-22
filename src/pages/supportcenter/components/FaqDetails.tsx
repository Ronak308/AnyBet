import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, HelpCircle, FileText, Edit3 } from 'lucide-react'
import type { FAQItem } from '../FAQManager'

interface FaqDetailsProps {
  faq: FAQItem
  onClose: () => void
  onEdit: () => void
}

export const FaqDetails: React.FC<FaqDetailsProps> = ({
  faq,
  onClose,
  onEdit
}) => {
  return (
    <Card className="h-full flex flex-col justify-between bg-card border-none select-none font-sans shadow-none p-6 overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="border-b border-border/40 pb-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-foreground font-sans uppercase tracking-wider">
                  FAQ Article Details
                </h2>
              </div>
              <p className="text-[10px] text-muted font-mono uppercase tracking-widest mt-1">
                Help center content view & management
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

        {/* Details Wrapper */}
        <div className="flex flex-col gap-5 overflow-y-auto pr-1 flex-1 scrollbar-thin">

          {/* Question Section */}
          <div className="flex flex-col gap-1.5 bg-surface/20 border border-muted/15 rounded-xl p-4">
            <label className="text-[10px] font-mono uppercase text-muted tracking-wider font-bold flex items-center gap-1.5">
              <HelpCircle className="h-3 w-3 text-primary" /> Question
            </label>
            <h3 className="text-sm font-bold text-foreground font-sans leading-relaxed">
              {faq.question}
            </h3>
          </div>

          {/* Answer Section */}
          <div className="flex flex-col gap-1.5 bg-surface/20 border border-muted/15 rounded-xl p-4 flex-1 min-h-[150px]">
            <label className="text-[10px] font-mono uppercase text-muted tracking-wider font-bold flex items-center gap-1.5 border-b border-muted/10 pb-2 mb-1">
              <FileText className="h-3 w-3 text-primary" /> Answer Content
            </label>
            <div className="text-xs text-muted font-sans leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[300px] scrollbar-thin pr-1">
              {faq.answer}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-border/40 pt-4 flex items-center justify-end gap-2 bg-card">
        <Button
          type="button"
          variant="ghost"
          className="h-9 px-4 text-xs font-mono text-muted hover:text-foreground"
          onClick={onClose}
        >
          Close View
        </Button>
        <Button
          type="button"
          variant="primary"
          className="h-9 px-4 text-xs font-mono gap-1.5"
          onClick={onEdit}
        >
          <Edit3 className="h-3.5 w-3.5" /> Edit Article
        </Button>
      </div>
    </Card>
  )
}
