import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  ChevronUp, 
  ChevronDown,
  Layers,
  Trophy,
  Activity,
  Cpu,
  Gamepad2,
  Sparkles
} from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Sheet, SheetContent } from '../../components/ui/sheet'
import { useChallenges } from '../../context/ChallengesContext'
import type { ChallengeCategory, ChallengeCategoryType } from '../../context/ChallengesContext'

export const CategoriesModule: React.FC = () => {
  const {
    categories,
    createCategory,
    updateCategory,
    toggleCategoryStatus,
    deleteCategory,
    reorderCategory,
    showToastNotice
  } = useChallenges()

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ChallengeCategory | null>(null)

  // Form State
  const [name, setName] = useState<ChallengeCategoryType | string>('Sports')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [icon, setIcon] = useState('Trophy')
  const [isEnabled, setIsEnabled] = useState(true)

  const presetColors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#EF4444']
  const presetIcons = ['Trophy', 'Activity', 'Cpu', 'Gamepad2', 'Sparkles', 'Layers']

  const getLucideIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trophy': return Trophy
      case 'Activity': return Activity
      case 'Cpu': return Cpu
      case 'Gamepad2': return Gamepad2
      case 'Sparkles': return Sparkles
      default: return Layers
    }
  }

  const handleOpenCreate = () => {
    setEditingCategory(null)
    setName('Sports')
    setDescription('')
    setColor('#3B82F6')
    setIcon('Trophy')
    setIsEnabled(true)
    setIsSheetOpen(true)
  }

  const handleOpenEdit = (cat: ChallengeCategory) => {
    setEditingCategory(cat)
    setName(cat.name)
    setDescription(cat.description)
    setColor(cat.color)
    setIcon(cat.icon)
    setIsEnabled(cat.isEnabled)
    setIsSheetOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      showToastNotice('Description is required', 'warning')
      return
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name,
        description,
        color,
        icon,
        isEnabled
      })
    } else {
      createCategory({
        name,
        description,
        color,
        icon,
        isEnabled,
        displayOrder: categories.length + 1
      })
    }

    setIsSheetOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Control Bar */}
      <div className="flex items-center justify-end gap-4">
        <Button
          variant="primary"
          glow
          onClick={handleOpenCreate}
          className="gap-2 text-xs font-mono shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, idx) => {
          const IconComp = getLucideIcon(cat.icon)
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="bg-surface/30 border-border/60 hover:border-primary/40 transition-all flex flex-col justify-between h-full">
                <CardContent className="p-5 space-y-4">

                  {/* Header Row: Icon, Name, Reorder Buttons */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2.5 rounded-xl flex items-center justify-center border border-white/10"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        <IconComp className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base font-sans text-foreground">{cat.name}</h4>
                        <span className="text-[10px] font-mono text-muted">{cat.challengeCount} Active Wagers</span>
                      </div>
                    </div>

                    {/* Reorder Up / Down Controls */}
                    <div className="flex flex-col gap-0.5">
                      <button 
                        disabled={idx === 0}
                        onClick={() => reorderCategory(cat.id, 'up')}
                        className="p-1 text-muted hover:text-foreground disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        disabled={idx === categories.length - 1}
                        onClick={() => reorderCategory(cat.id, 'down')}
                        className="p-1 text-muted hover:text-foreground disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs font-sans text-muted leading-relaxed min-h-[36px]">
                    {cat.description}
                  </p>

                  {/* Footer Controls: Status Toggle & Edit/Delete */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/40">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted uppercase">Status:</span>
                      <button
                        onClick={() => toggleCategoryStatus(cat.id)}
                        className="cursor-pointer"
                      >
                        {cat.isEnabled ? (
                          <Badge variant="success" className="text-[9px]">ACTIVE</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] text-muted border-muted">DISABLED</Badge>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenEdit(cat)}
                        className="h-7 w-7 text-muted hover:text-primary"
                        title="Edit Category"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteCategory(cat.id)}
                        className="h-7 w-7 text-muted hover:text-red-400"
                        title="Delete Category"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* CREATE / EDIT CATEGORY SHEET */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-background border-l border-border p-6 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-bold font-sans text-foreground">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <p className="text-xs text-muted font-sans mt-0.5">Customize category icon, theme color, and visibility settings.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1">Category Name</label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Esports, Fitness"
                  required
                  className="bg-surface/40 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Short overview of what wagers fall into this category..."
                  rows={3}
                  className="w-full bg-surface/40 border border-border rounded-md p-2 text-xs font-sans text-foreground outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1.5">Theme Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {presetColors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-7 w-7 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                        color === c ? 'border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1.5">Icon Selection</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {presetIcons.map(iconName => {
                    const Comp = getLucideIcon(iconName)
                    const isSelected = icon === iconName
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setIcon(iconName)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-primary bg-primary/20 text-primary' 
                            : 'border-border/60 bg-surface/40 text-muted hover:text-foreground'
                        }`}
                      >
                        <Comp className="h-4 w-4" />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-mono text-muted">Enable on Portal</span>
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={e => setIsEnabled(e.target.checked)}
                  className="rounded border-border accent-primary h-4 w-4 cursor-pointer"
                />
              </div>

              <div className="pt-4 flex items-center gap-3">
                <Button type="submit" variant="primary" glow className="w-full text-xs font-mono">
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

    </div>
  )
}
