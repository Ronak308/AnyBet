import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Layers } from 'lucide-react'
import type { SupportCategory } from '../SupportCategories'

interface AddCategoryProps {
  categoryToEdit?: SupportCategory | null
  handleAddCategory: (name: string, description: string, sla: string, priority: string) => void
  handleEditCategory?: (id: string, name: string, description: string, sla: string, priority: string) => void
  onClose: () => void
}

export const AddCategory: React.FC<AddCategoryProps> = ({
  categoryToEdit,
  handleAddCategory,
  handleEditCategory,
  onClose
}) => {
  const getPriorityFromSla = (sla: string): string => {
    switch (sla) {
      case '1 Hour':
      case '2 Hours':
      case '4 Hours':
        return 'High'
      case '8 Hours':
      case '12 Hours':
        return 'Medium'
      case '24 Hours':
        return 'Low'
      default:
        return 'Medium'
    }
  }

  const [newCatName, setNewCatName] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')
  const [newCatSla, setNewCatSla] = useState('4 Hours')
  const [newCatPriority, setNewCatPriority] = useState('High')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (categoryToEdit) {
      setNewCatName(categoryToEdit.name)
      setNewCatDesc(categoryToEdit.description)
      setNewCatSla(categoryToEdit.sla)
      setNewCatPriority(getPriorityFromSla(categoryToEdit.sla))
    } else {
      setNewCatName('')
      setNewCatDesc('')
      setNewCatSla('4 Hours')
      setNewCatPriority('High')
    }
    setFieldErrors({})
  }, [categoryToEdit])

  const handleSlaChange = (value: string) => {
    setNewCatSla(value)
    setNewCatPriority(getPriorityFromSla(value))
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const finalName = newCatName.trim()
    const finalDesc = newCatDesc.trim()
    const errors: Record<string, string> = {}

    if (!finalName) {
      errors.name = 'Category Name is required.'
    } else if (finalName.length < 2) {
      errors.name = 'Category Name must be at least 2 characters.'
    } else if (finalName.length > 50) {
      errors.name = 'Category Name must not exceed 50 characters.'
    } else if (!/^[a-zA-Z0-9\s\-&_]+$/.test(finalName)) {
      errors.name = 'Category Name can only contain letters, numbers, spaces, ampersands, hyphens, and underscores.'
    }

    if (!finalDesc) {
      errors.description = 'Description is required.'
    } else if (finalDesc.length < 10) {
      errors.description = 'Description must be at least 10 characters.'
    } else if (finalDesc.length > 500) {
      errors.description = 'Description must not exceed 500 characters.'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    if (categoryToEdit && handleEditCategory) {
      handleEditCategory(categoryToEdit.id, finalName, finalDesc, newCatSla, newCatPriority)
    } else {
      handleAddCategory(finalName, finalDesc, newCatSla, newCatPriority)
    }
    setNewCatName('')
    setNewCatDesc('')
    setNewCatSla('4 Hours')
    setNewCatPriority('High')
    onClose()
  }

  return (
    <Card className="h-full flex flex-col justify-between bg-card border-none select-none font-sans shadow-none p-6 overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="border-b border-border/40 pb-4 mb-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-foreground font-sans uppercase tracking-wider">
                  {categoryToEdit ? 'Edit Category' : 'Add Category'}
                </h2>
              </div>
              <p className="text-[10px] text-muted font-mono uppercase tracking-widest mt-1">
                {categoryToEdit ? 'Modify ticketing classification details' : 'Create new ticketing classification & SLA'}
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

        {/* Form Fields */}
        <form id="add-category-form" onSubmit={onSubmit} className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1 scrollbar-thin">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase text-muted tracking-wider font-bold">Category Name <span className="text-red-400 ml-0.5">*</span></label>
            <Input
              type="text"
              placeholder="e.g. API Integration"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              className="h-9 text-xs bg-card border border-border focus-visible:ring-primary/30"
              maxLength={50}
            />
            {fieldErrors.name && (
              <span className="text-[10px] text-red-500 dark:text-red-400 font-mono mt-0.5">{fieldErrors.name}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase text-muted tracking-wider">Target Resolution</label>
            <select
              value={newCatSla}
              onChange={e => handleSlaChange(e.target.value)}
              className="h-9 px-3 rounded-lg text-xs font-mono bg-card border border-border text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="1 Hour">1 Hour (High Priority)</option>
              <option value="2 Hours">2 Hours (High Priority)</option>
              <option value="4 Hours">4 Hours (High Priority)</option>
              <option value="8 Hours">8 Hours (Medium Priority)</option>
              <option value="12 Hours">12 Hours (Medium Priority)</option>
              <option value="24 Hours">24 Hours (Low Priority)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase text-muted tracking-wider font-bold">Description <span className="text-red-400 ml-0.5">*</span></label>
            <textarea
              placeholder="Describe what kind of issues fall under this category..."
              value={newCatDesc}
              onChange={e => setNewCatDesc(e.target.value)}
              rows={4}
              className="p-3 rounded-lg text-xs bg-card border border-border text-foreground focus:outline-none focus:border-primary/50 placeholder-muted/50 font-sans resize-none"
              maxLength={500}
            />
            {fieldErrors.description && (
              <span className="text-[10px] text-red-500 dark:text-red-400 font-mono mt-0.5">{fieldErrors.description}</span>
            )}
          </div>
        </form>
      </div>

      {/* Actions */}
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
          form="add-category-form"
          className="h-9 px-4 text-xs font-mono"
        >
          {categoryToEdit ? 'Save Changes' : 'Create Category'}
        </Button>
      </div>
    </Card>
  )
}
