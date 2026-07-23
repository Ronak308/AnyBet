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
  Search,
  MoreVertical,
  Power,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Sheet, SheetContent } from '../../components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '../../components/ui/dropdown-menu'
import { useChallenges } from '../../context/ChallengesContext'
import type { ChallengeCategory, ChallengeCategoryType } from '../../context/ChallengesContext'

export const CategoriesModule: React.FC = () => {
  const {
    categories,
    challenges,
    setSelectedChallenge,
    createCategory,
    updateCategory,
    toggleCategoryStatus,
    deleteCategory,
    reorderCategory,
    showToastNotice
  } = useChallenges()

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

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

  // Category matcher helper
  const isWagerInCategory = (catNameRaw: string, wagerCatRaw?: string) => {
    const catName = (catNameRaw || '').toLowerCase().trim()
    const wagerCat = (wagerCatRaw || '').toLowerCase().trim()
    if (!catName || !wagerCat) return false
    
    if (catName === wagerCat) return true
    if (catName.includes('sport') && (wagerCat.includes('sport') || wagerCat.includes('athletic') || wagerCat.includes('league'))) return true
    if ((catName.includes('game') || catName.includes('esport') || catName.includes('performance')) && (wagerCat.includes('game') || wagerCat.includes('esport') || wagerCat.includes('perform'))) return true
    if ((catName.includes('fit') || catName.includes('physic')) && (wagerCat.includes('fit') || wagerCat.includes('physic') || wagerCat.includes('workout') || wagerCat.includes('step') || wagerCat.includes('marathon'))) return true
    if (catName.includes('predict') && (wagerCat.includes('predict') || wagerCat.includes('market') || wagerCat.includes('crypto'))) return true
    if (catName.includes('card') && (wagerCat.includes('card') || wagerCat.includes('board') || wagerCat.includes('poker') || wagerCat.includes('chess'))) return true
    if (catName.includes('entertain') && (wagerCat.includes('entertain') || wagerCat.includes('movie') || wagerCat.includes('show') || wagerCat.includes('oscar'))) return true
    if (catName.includes('educat') && (wagerCat.includes('educat') || wagerCat.includes('study') || wagerCat.includes('exam') || wagerCat.includes('cert'))) return true
    if (catName.includes('tennis') && wagerCat.includes('tennis')) return true
    if (catName.includes('golf') && wagerCat.includes('golf')) return true
    if (catName.includes('weather') && wagerCat.includes('weather')) return true
    if (catName.includes('tv') && wagerCat.includes('tv')) return true
    if (catName.includes('trivia') && wagerCat.includes('trivia')) return true
    if (catName.includes('friend') && (wagerCat.includes('friend') || wagerCat.includes('p2p') || wagerCat.includes('1v1'))) return true
    if (catName.includes('workplace') && (wagerCat.includes('workplace') || wagerCat.includes('office') || wagerCat.includes('company'))) return true
    if (catName.includes('community') && (wagerCat.includes('community') || wagerCat.includes('local') || wagerCat.includes('charity'))) return true
    if (catName.includes('custom') && wagerCat.includes('custom')) return true

    return false
  }

  // Calculate dynamic real active wagers count per category
  const categoriesWithCounts = React.useMemo(() => {
    return categories.map(cat => {
      const activeWagersInCat = challenges.filter(c => isWagerInCategory(cat.name, c.category))
      return {
        ...cat,
        challengeCount: activeWagersInCat.length
      }
    })
  }, [categories, challenges])

  // Filtered categories by search & status
  const filteredCategories = React.useMemo(() => {
    return categoriesWithCounts.filter(c => {
      if (statusFilter === 'active' && !c.isEnabled) return false
      if (statusFilter === 'disabled' && c.isEnabled) return false
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim()
        const matchName = c.name.toLowerCase().includes(q)
        const matchDesc = c.description.toLowerCase().includes(q)
        if (!matchName && !matchDesc) return false
      }
      return true
    })
  }, [categoriesWithCounts, statusFilter, searchQuery])

  // Paginated list
  const totalPages = Math.ceil(filteredCategories.length / pageSize) || 1
  const paginatedCategories = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredCategories.slice(start, start + pageSize)
  }, [filteredCategories, currentPage, pageSize])

  // Real active wagers list for selected category in inspect sheet
  const activeWagersForCategory = React.useMemo(() => {
    if (!editingCategory) return []
    return challenges.filter(c => isWagerInCategory(editingCategory.name, c.category))
  }, [editingCategory, challenges])

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

      {/* Control Bar: Search, Status Filter, View Switcher & Add Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface/20 p-3 rounded-2xl border border-border/40">
        
        {/* Search & Counter */}
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
            <Input
              placeholder="Search category name..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-9 bg-surface/50 text-xs font-mono"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-surface/40 border border-border/60 rounded-xl px-2.5 py-1.5 text-xs font-mono">
            <Filter className="h-3.5 w-3.5 text-muted" />
            <span className="text-muted text-[10px] uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
              className="bg-transparent text-foreground outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#120F1D] text-foreground">All Statuses</option>
              <option value="active" className="bg-[#120F1D] text-emerald-400">Active Only</option>
              <option value="disabled" className="bg-[#120F1D] text-muted">Disabled Only</option>
            </select>
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
          {paginatedCategories.map((cat, idx) => {
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted hover:text-foreground hover:bg-surface/60 rounded-lg cursor-pointer"
                              title="Category Actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-[#120F1D] border-border/80 p-1.5 shadow-2xl">
                            <DropdownMenuItem
                              onClick={() => handleOpenEdit(cat)}
                              className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-primary/15 hover:text-primary cursor-pointer rounded-md p-2"
                            >
                              <Edit3 className="h-3.5 w-3.5 text-primary" /> View / Edit Specs
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => toggleCategoryStatus(cat.id)}
                              className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-surface/80 cursor-pointer rounded-md p-2"
                            >
                              <Power className="h-3.5 w-3.5 text-muted" /> {cat.isEnabled ? 'Disable Category' : 'Enable Category'}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-1 bg-border/50" />

                            <DropdownMenuItem
                              onClick={() => deleteCategory(cat.id)}
                              className="flex items-center gap-2 text-xs font-mono text-red-400 hover:bg-red-500/15 cursor-pointer rounded-md p-2"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-400" /> Delete Category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
              {paginatedCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted font-mono text-xs">
                    No categories found matching your search and filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCategories.map((cat, idx) => {
                  const IconComp = getLucideIcon(cat.icon)
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1
                  return (
                    <TableRow key={cat.id} className="hover:bg-surface/30 transition-colors">
                      <TableCell className="font-mono text-xs text-muted font-bold">{globalIdx}</TableCell>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted hover:text-foreground hover:bg-surface/60 rounded-lg cursor-pointer"
                              title="Category Actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-[#120F1D] border-border/80 p-1.5 shadow-2xl">
                            <DropdownMenuItem
                              onClick={() => handleOpenEdit(cat)}
                              className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-primary/15 hover:text-primary cursor-pointer rounded-md p-2"
                            >
                              <Edit3 className="h-3.5 w-3.5 text-primary" /> View / Edit Specs
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => toggleCategoryStatus(cat.id)}
                              className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-surface/80 cursor-pointer rounded-md p-2"
                            >
                              <Power className="h-3.5 w-3.5 text-muted" /> {cat.isEnabled ? 'Disable Category' : 'Enable Category'}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-1 bg-border/50" />

                            <DropdownMenuItem
                              onClick={() => deleteCategory(cat.id)}
                              className="flex items-center gap-2 text-xs font-mono text-red-400 hover:bg-red-500/15 cursor-pointer rounded-md p-2"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-400" /> Delete Category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* ─── PAGINATION FOOTER CONTROL ─── */}
      <div className="p-4 bg-surface/20 border border-border/50 rounded-2xl flex items-center justify-between text-xs font-mono">
        <span className="text-muted">
          Showing {filteredCategories.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredCategories.length)} of {filteredCategories.length} categories
        </span>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            className="h-8 w-8 cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-foreground font-bold px-2">{currentPage} / {totalPages}</span>
          <Button
            size="icon"
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            className="h-8 w-8 cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

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
              <div className="pt-4 border-t border-border/40 flex items-center justify-between gap-3">
                {editingCategory ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleDeleteFromSheet}
                    className="h-8 text-xs font-mono text-red-400 border-red-500/30 hover:bg-red-500/10 gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsSheetOpen(false)}
                    className="h-8 text-xs font-mono px-4 text-muted hover:text-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    glow
                    className="h-8 text-xs font-mono px-5 gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {editingCategory ? 'Save Changes' : 'Create Category'}
                  </Button>
                </div>
              </div>
            </form>

            {/* Real Active Wagers List Section */}
            {editingCategory && (
              <div className="pt-4 border-t border-border/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-mono text-foreground uppercase tracking-wide flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-primary" />
                    Real Active Wagers ({activeWagersForCategory.length})
                  </h4>
                  <Badge variant="pro" className="text-[9px]">LIVE DATA</Badge>
                </div>

                {activeWagersForCategory.length === 0 ? (
                  <div className="p-4 bg-surface/20 border border-border/40 rounded-xl text-center text-xs font-mono text-muted">
                    No active wagers created in this category yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {activeWagersForCategory.map(wager => (
                      <div key={wager.id} className="p-3 bg-surface/30 border border-border/50 rounded-xl flex items-center justify-between gap-3 hover:border-primary/40 transition-all">
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-primary font-bold">{wager.id}</span>
                            <Badge variant={wager.status === 'Live' ? 'success' : wager.status === 'Disputed' ? 'danger' : 'pro'} className="text-[8px] py-0 px-1">
                              {wager.status}
                            </Badge>
                          </div>
                          <span className="text-xs font-bold text-foreground truncate">{wager.title}</span>
                          <span className="text-[10px] font-mono text-muted">
                            Stake: {wager.stakeAmount} Coins • Pool: {wager.prizePool} Coins • {wager.participantsCount} Users
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsSheetOpen(false)
                            setSelectedChallenge(wager)
                          }}
                          className="h-7 text-[10px] font-mono border-primary/40 text-primary hover:bg-primary/10 shrink-0 gap-1"
                        >
                          <Eye className="h-3 w-3" /> Inspect Wager
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

    </div>
  )
}
