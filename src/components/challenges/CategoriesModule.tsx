import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Layers, 
  Trophy, 
  Activity, 
  TrendingUp, 
  Gamepad2, 
  Sparkles, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown
} from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Sheet, SheetContent } from '../ui/sheet'
import { useChallenges } from '../../context/ChallengesContext'
import type { ChallengeCategory } from '../../context/ChallengesContext'

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

  // Sheet state for Create / Edit
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ChallengeCategory | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [icon, setIcon] = useState('Trophy')
  const [isEnabled, setIsEnabled] = useState(true)

  const PRESET_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1', '#EF4444', '#14B8A6']
  const PRESET_ICONS = ['Trophy', 'Activity', 'TrendingUp', 'Gamepad2', 'Sparkles', 'Layers', 'Shield', 'Flame']

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trophy': return <Trophy className="h-5 w-5" />
      case 'Activity': return <Activity className="h-5 w-5" />
      case 'TrendingUp': return <TrendingUp className="h-5 w-5" />
      case 'Gamepad2': return <Gamepad2 className="h-5 w-5" />
      case 'Sparkles': return <Sparkles className="h-5 w-5" />
      default: return <Layers className="h-5 w-5" />
    }
  }

  const handleOpenCreate = () => {
    setEditingCategory(null)
    setName('')
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
    if (!name.trim()) {
      showToastNotice('Category name is required', 'warning')
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <Card className={`bg-surface/30 border transition-all duration-200 hover:border-primary/50 relative overflow-hidden ${
              cat.isEnabled ? 'border-border/60' : 'border-border/30 opacity-60'
            }`}>
              
              {/* Color Accent Bar */}
              <div className="h-1.5 w-full" style={{ backgroundColor: cat.color }} />

              <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2.5 rounded-xl border border-white/10 flex items-center justify-center"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      {renderIcon(cat.icon)}
                    </div>
                    <div>
                      <h4 className="text-base font-bold font-sans text-foreground">{cat.name}</h4>
                      <span className="text-[10px] font-mono text-muted uppercase">Order #{cat.displayOrder}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {cat.isEnabled ? (
                      <Badge variant="success" className="text-[9px]">ACTIVE</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] text-muted">DISABLED</Badge>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted font-sans leading-relaxed min-h-[36px]">
                  {cat.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-border/40">
                  <span className="text-xs font-mono text-primary font-semibold">
                    {cat.challengeCount} Active Challenges
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => reorderCategory(cat.id, 'up')}
                      disabled={index === 0}
                      title="Move Up"
                      className="h-7 w-7 text-muted hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => reorderCategory(cat.id, 'down')}
                      disabled={index === categories.length - 1}
                      title="Move Down"
                      className="h-7 w-7 text-muted hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleCategoryStatus(cat.id)}
                      title={cat.isEnabled ? 'Disable Category' : 'Enable Category'}
                      className="h-7 w-7 text-muted hover:text-primary"
                    >
                      {cat.isEnabled ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpenEdit(cat)}
                      title="Edit Category"
                      className="h-7 w-7 text-muted hover:text-foreground"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteCategory(cat.id)}
                      title="Delete Category"
                      className="h-7 w-7 text-muted hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* CREATE / EDIT CATEGORY SHEET */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-background border-l border-border p-6 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-bold font-sans text-foreground">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <p className="text-xs text-muted font-sans mt-0.5">Configure display name, color theme, icon, and visibility.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1">Category Name</label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Sports or Physical"
                  required
                  className="bg-surface/40 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief summary of wagers under this category..."
                  rows={3}
                  className="w-full bg-surface/40 border border-border rounded-md p-2 text-xs font-sans text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1.5">Color Theme</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-7 w-7 rounded-full border-2 transition-all cursor-pointer ${
                        color === c ? 'border-white scale-110 shadow-glow' : 'border-transparent opacity-80'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1.5">Icon</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_ICONS.map(i => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIcon(i)}
                      className={`p-2 rounded-lg border text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                        icon === i ? 'bg-primary/20 border-primary text-primary font-bold' : 'bg-surface/40 border-border/50 text-muted'
                      }`}
                    >
                      {renderIcon(i)}
                      <span>{i}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-surface/30 border border-border/50 rounded-xl">
                <span className="text-xs font-mono text-foreground">Enabled / Visible Status</span>
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={e => setIsEnabled(e.target.checked)}
                  className="h-4 w-4 rounded accent-primary cursor-pointer"
                />
              </div>

              <div className="pt-4">
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
