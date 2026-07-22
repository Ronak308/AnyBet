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
  Sparkles,
  Dumbbell,
  Dices,
  Mic,
  GraduationCap,
  Target,
  TrendingUp,
  CloudRain,
  Tv,
  Brain,
  Handshake,
  Briefcase,
  Users,
  LayoutGrid,
  List,
  Eye,
  Search
} from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
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

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ChallengeCategory | null>(null)

  // Form State
  const [name, setName] = useState<ChallengeCategoryType | string>('Sports')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [icon, setIcon] = useState('Trophy')
  const [isEnabled, setIsEnabled] = useState(true)

  const presetColors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#EF4444', '#84CC16', '#38BDF8', '#E11D48', '#A855F7', '#F97316', '#64748B', '#14B8A6', '#8026FF']
  const presetIcons = ['Trophy', 'Gamepad2', 'Dumbbell', 'Dices', 'Mic', 'GraduationCap', 'Target', 'TrendingUp', 'CloudRain', 'Tv', 'Brain', 'Handshake', 'Briefcase', 'Users', 'Sparkles', 'Activity', 'Layers']

  const getLucideIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trophy': return Trophy
      case 'Gamepad2': return Gamepad2
      case 'Dumbbell': return Dumbbell
      case 'Dices': return Dices
      case 'Mic': return Mic
      case 'GraduationCap': return GraduationCap
      case 'Target': return Target
      case 'TrendingUp': return TrendingUp
      case 'CloudRain': return CloudRain
      case 'Tv': return Tv
      case 'Brain': return Brain
      case 'Handshake': return Handshake
      case 'Briefcase': return Briefcase
      case 'Users': return Users
      case 'Sparkles': return Sparkles
      case 'Activity': return Activity
      case 'Cpu': return Cpu
      default: return Layers
    }
  }

  // Filtered categories
  const filteredCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return categories
    const q = searchQuery.toLowerCase().trim()
    return categories.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.description.toLowerCase().includes(q)
    )
  }, [categories, searchQuery])

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

  const handleDeleteFromSheet = () => {
    if (!editingCategory) return
    if (confirm(`Are you sure you want to delete category "${editingCategory.name}"?`)) {
      deleteCategory(editingCategory.id)
      setIsSheetOpen(false)
    }
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
      showToastNotice(`Updated category "${name}"`, 'success')
    } else {
      createCategory({
        name,
        description,
        color,
        icon,
        isEnabled,
        displayOrder: categories.length + 1
      })
      showToastNotice(`Created new category "${name}"`, 'success')
    }

    setIsSheetOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 font-sans">

      {/* Control Bar: Search, View Switcher & Add Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface/20 p-3 rounded-2xl border border-border/40">
        
        {/* Search & Counter */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
            <Input
              placeholder="Search category name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 bg-surface/50 text-xs font-mono"
            />
          </div>
          <Badge variant="pro" className="font-mono text-[10px] shrink-0">
            {filteredCategories.length} / {categories.length} Categories
          </Badge>
        </div>

        {/* View Switcher & Action Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center bg-surface/40 border border-border/60 rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-muted hover:text-foreground'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-muted hover:text-foreground'
              }`}
              title="Table List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Button
            variant="primary"
            glow
            onClick={handleOpenCreate}
            className="gap-2 text-xs font-mono shrink-0 h-9"
          >
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </div>
      </div>

      {/* ─── FORMAT VIEW 1: GRID CARDS ─── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat, idx) => {
            const IconComp = getLucideIcon(cat.icon)
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card className="bg-surface/30 border-border/60 hover:border-primary/40 transition-all flex flex-col justify-between h-full group">
                  <CardContent className="p-5 space-y-4">

                    {/* Header Row: Icon, Name, Reorder Buttons */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-3 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner shrink-0"
                          style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                        >
                          <IconComp className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-base font-sans text-foreground flex items-center gap-2">
                            {cat.name}
                          </h4>
                          <span className="text-[10px] font-mono text-muted">{cat.challengeCount} Active Wagers</span>
                        </div>
                      </div>

                      {/* Reorder Up / Down Controls */}
                      <div className="flex flex-col gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          disabled={idx === 0}
                          onClick={() => reorderCategory(cat.id, 'up')}
                          className="p-1 text-muted hover:text-foreground disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          disabled={idx === filteredCategories.length - 1}
                          onClick={() => reorderCategory(cat.id, 'down')}
                          className="p-1 text-muted hover:text-foreground disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs font-sans text-muted leading-relaxed min-h-[38px] line-clamp-2">
                      {cat.description}
                    </p>

                    {/* Footer Controls: Status Toggle & Sheet Drawer trigger */}
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

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(cat)}
                          className="h-7 text-[11px] font-mono gap-1 border-primary/30 text-primary hover:bg-primary/10"
                        >
                          <Edit3 className="h-3 w-3" /> View / Edit Sheet
                        </Button>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ─── FORMAT VIEW 2: TABLE LISTING ─── */}
      {viewMode === 'table' && (
        <Card className="border border-border/60 overflow-hidden bg-surface/20">
          <Table>
            <TableHeader className="bg-surface/60">
              <TableRow>
                <TableHead className="text-xs font-mono w-12">#</TableHead>
                <TableHead className="text-xs font-mono">Category</TableHead>
                <TableHead className="text-xs font-mono">Description</TableHead>
                <TableHead className="text-xs font-mono">Active Wagers</TableHead>
                <TableHead className="text-xs font-mono">Status</TableHead>
                <TableHead className="text-xs font-mono text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((cat, idx) => {
                const IconComp = getLucideIcon(cat.icon)
                return (
                  <TableRow key={cat.id} className="hover:bg-surface/30 transition-colors">
                    <TableCell className="font-mono text-xs text-muted font-bold">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-xl flex items-center justify-center border border-white/10 shrink-0"
                          style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                        >
                          <IconComp className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-xs text-foreground">{cat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted max-w-sm truncate font-sans">
                      {cat.description}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-primary font-bold">
                      {cat.challengeCount} Wagers
                    </TableCell>
                    <TableCell>
                      <button onClick={() => toggleCategoryStatus(cat.id)} className="cursor-pointer">
                        {cat.isEnabled ? (
                          <Badge variant="success" className="text-[9px]">ACTIVE</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] text-muted border-muted">DISABLED</Badge>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(cat)}
                          className="h-7 text-[11px] font-mono gap-1 border-primary/30 text-primary hover:bg-primary/10"
                        >
                          <Eye className="h-3 w-3" /> Inspect Sheet
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
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* ─── SLIDE-OVER SHEET DRAWER (VIEW, EDIT & DELETE) ─── */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl bg-background border-l border-border p-6 overflow-y-auto font-sans">
          <div className="flex flex-col gap-6">
            
            {/* Sheet Header */}
            <div className="border-b border-border/40 pb-4 pr-8">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="pro" className="font-mono text-[10px]">ANYBET CATEGORY SPEC</Badge>
                {isEnabled ? <Badge variant="success" className="text-[9px]">ACTIVE</Badge> : <Badge variant="outline" className="text-[9px]">DISABLED</Badge>}
              </div>
              <h3 className="text-lg font-bold text-foreground">
                {editingCategory ? `Category Specs: ${editingCategory.name}` : 'Create New Category'}
              </h3>
              <p className="text-xs text-muted mt-0.5">Customize category icon, theme color, description, and visibility settings.</p>
            </div>

            {/* Preview Spec Card */}
            {editingCategory && (
              <div className="p-4 bg-surface/30 border border-border/60 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const PreviewIcon = getLucideIcon(icon)
                    return (
                      <div 
                        className="p-3 rounded-2xl flex items-center justify-center border border-white/10"
                        style={{ backgroundColor: `${color}25`, color }}
                      >
                        <PreviewIcon className="h-6 w-6" />
                      </div>
                    )
                  })()}
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{name || 'Category Name'}</h4>
                    <span className="text-[10px] font-mono text-muted">{editingCategory.challengeCount} Active Wagers Pool</span>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: color }} title="Selected Color" />
              </div>
            )}

            {/* Edit / Create Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1">Category Name</label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Esports, Fitness"
                  required
                  className="bg-surface/40 text-xs font-mono text-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1">Overview Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Short overview of what wagers fall into this category..."
                  rows={3}
                  className="w-full bg-surface/40 border border-border rounded-lg p-2.5 text-xs font-sans text-foreground outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1.5">Theme Color Palette</label>
                <div className="flex items-center gap-2 flex-wrap bg-surface/20 p-2.5 rounded-xl border border-border/40">
                  {presetColors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-7 w-7 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                        color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1.5">Icon Picker</label>
                <div className="grid grid-cols-6 gap-2 bg-surface/20 p-2.5 rounded-xl border border-border/40 max-h-36 overflow-y-auto">
                  {presetIcons.map(iconName => {
                    const Comp = getLucideIcon(iconName)
                    const isSelected = icon === iconName
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setIcon(iconName)}
                        className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-primary bg-primary/20 text-primary shadow-md scale-105' 
                            : 'border-border/60 bg-surface/40 text-muted hover:text-foreground'
                        }`}
                        title={iconName}
                      >
                        <Comp className="h-4 w-4" />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-surface/30 rounded-xl border border-border/40">
                <span className="text-xs font-mono text-foreground">Visible on Portal & Mobile App</span>
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={e => setIsEnabled(e.target.checked)}
                  className="rounded border-border accent-primary h-4 w-4 cursor-pointer"
                />
              </div>

              {/* Action Buttons: Save, Cancel & Delete Sheet Action */}
              <div className="pt-4 flex flex-col gap-2 border-t border-border/40">
                <div className="flex items-center justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsSheetOpen(false)} className="text-xs font-mono">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" glow className="text-xs font-mono flex-1">
                    {editingCategory ? 'Save Changes' : 'Create Category'}
                  </Button>
                </div>

                {editingCategory && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDeleteFromSheet}
                    className="w-full text-xs font-mono text-red-400 border-red-500/30 hover:bg-red-500/10 gap-1.5 mt-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete Category
                  </Button>
                )}
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

    </div>
  )
}
