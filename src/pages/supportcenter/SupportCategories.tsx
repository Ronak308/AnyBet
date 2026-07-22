import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, MoreHorizontal, Trash2, Edit3, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { AddCategory } from './components/AddCategory'

export interface SupportCategory {
    id: string
    name: string
    description: string
    sla: string
    priority: string
    status: 'Active' | 'Inactive'
}

interface SupportCategoriesProps {
    categories: SupportCategory[]
    handleAddCategory: (name: string, description: string, sla: string, priority: string) => void
    handleEditCategory: (id: string, name: string, description: string, sla: string, priority: string) => void
    handleDeleteCategory: (id: string, name: string) => void
    handleToggleCategoryStatus: (id: string) => void
    isLoading?: boolean
}

export const SupportCategories: React.FC<SupportCategoriesProps> = ({
    categories,
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleToggleCategoryStatus,
    isLoading = false
}) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [isAddingCat, setIsAddingCat] = useState(false)
    const [categoryToEdit, setCategoryToEdit] = useState<SupportCategory | null>(null)
    const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null)

    const isSheetOpen = isAddingCat || categoryToEdit !== null
    const closeSheet = () => {
        setIsAddingCat(false)
        setCategoryToEdit(null)
    }

    const filteredCategories = categories.filter(c => {
        const query = searchQuery.toLowerCase().trim()
        if (!query) return true
        return (
            c.name.toLowerCase().includes(query) ||
            c.description.toLowerCase().includes(query) ||
            c.sla.toLowerCase().includes(query) ||
            (c.priority && c.priority.toLowerCase().includes(query))
        )
    })

    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

    const totalPages = Math.max(1, Math.ceil(filteredCategories.length / pageSize))
    const paginatedCategories = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return filteredCategories.slice(start, start + pageSize)
    }, [filteredCategories, currentPage])

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Control Bar: Search & Action */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-1">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted/80 pointer-events-none" />
                    <Input
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-xs font-sans bg-card border border-border focus-visible:ring-primary/30"
                    />
                </div>
                <Button
                    onClick={() => setIsAddingCat(true)}
                    className="h-9 px-4 text-xs font-mono gap-1.5 rounded-lg w-full md:w-auto shrink-0"
                >
                    <Plus className="h-4 w-4" /> Add Category
                </Button>
            </div>

            {/* Add/Edit Category Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={(open) => { if (!open) closeSheet() }}>
                <SheetContent side="right" hideClose className="w-full sm:max-w-2xl bg-background border-l border-border p-0 overflow-hidden">
                    <AddCategory
                        categoryToEdit={categoryToEdit}
                        handleAddCategory={handleAddCategory}
                        handleEditCategory={handleEditCategory}
                        onClose={closeSheet}
                    />
                </SheetContent>
            </Sheet>

            {/* Confirmation Modal for deletion */}
            <ConfirmationModal
                isOpen={categoryToDelete !== null}
                onClose={() => setCategoryToDelete(null)}
                onConfirm={() => {
                    if (categoryToDelete) {
                        handleDeleteCategory(categoryToDelete.id, categoryToDelete.name)
                        setCategoryToDelete(null)
                    }
                }}
                title="Delete Category"
                description={
                    <p>
                        Are you sure you want to delete the category <span className="font-bold text-foreground">"{categoryToDelete?.name}"</span>?
                        This action cannot be undone.
                    </p>
                }
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />

            <div className="flex flex-col w-full">
                <div className="border border-muted/30 rounded-xl overflow-hidden bg-surface/30 w-full overflow-x-auto">
                <Table>
                    <TableHeader className="bg-surface/75 border-b border-muted/30">
                        <TableRow className="border-b border-muted/30 hover:bg-transparent h-14">
                            <TableHead className="text-xs font-mono h-14 pl-4">Category Name</TableHead>
                            <TableHead className="text-xs font-mono h-14">Description</TableHead>
                            <TableHead className="text-xs font-mono h-14 text-center">Priority</TableHead>
                            <TableHead className="text-xs font-mono h-14 text-center">Target Resolution</TableHead>
                            <TableHead className="text-xs font-mono h-14 text-center">Status</TableHead>
                            <TableHead className="text-xs font-mono h-14 pr-4 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted font-mono text-xs">
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
                        ) : filteredCategories.length === 0 ? (
                            <TableRow className="border-b border-muted/20 hover:bg-transparent">
                                <TableCell colSpan={6} className="py-10 text-center font-mono text-xs text-muted uppercase">
                                    No categories match search
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedCategories.map(c => (
                                <TableRow key={c.id} className="border-b border-muted/20 hover:bg-surface/40">
                                    <TableCell className="py-3 pl-4">
                                        <span className="text-xs font-bold font-sans text-foreground">{c.name}</span>
                                    </TableCell>
                                    <TableCell className="py-3 text-xs text-muted max-w-sm font-sans truncate">{c.description}</TableCell>
                                    <TableCell className="py-3 text-center">
                                        <span className={`inline-block px-2.5 py-0.5 text-[9px] font-mono font-extrabold uppercase rounded-md border ${
                                            c.priority === 'High' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                            c.priority === 'Medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                                            'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                        }`}>
                                            {c.priority || 'Medium'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-3 text-center text-xs font-mono font-bold text-primary">{c.sla}</TableCell>
                                    <TableCell className="py-3 text-center">
                                        <button
                                            onClick={() => handleToggleCategoryStatus(c.id)}
                                            className={`inline-block px-2.5 py-0.5 text-[9px] font-mono font-extrabold uppercase rounded-md border cursor-pointer transition-all ${c.status === 'Active'
                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                                : 'bg-muted/10 border-muted/30 text-muted hover:bg-muted/20'
                                                }`}
                                        >
                                            {c.status}
                                        </button>
                                    </TableCell>
                                    <TableCell className="py-3 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
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
                                                <DropdownMenuContent align="end" className="w-48 bg-[#120F1D] border-border/80 p-1.5 shadow-2xl">
                                                    <DropdownMenuItem
                                                        className="flex items-center gap-2 text-xs font-mono text-foreground hover:bg-surface/80 cursor-pointer rounded-md p-2"
                                                        onClick={() => setCategoryToEdit(c)}
                                                    >
                                                        <Edit3 className="h-3.5 w-3.5 text-muted" />
                                                        Edit Category
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-400 focus:bg-red-950/20 focus:text-red-300 flex items-center gap-2 text-xs font-mono cursor-pointer rounded-md p-2"
                                                        onClick={() => setCategoryToDelete({ id: c.id, name: c.name })}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                                        Delete Category
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 bg-card flex items-center justify-between text-xs font-mono">
                <span className="text-muted">
                    Showing {filteredCategories.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
                    {' '}to {Math.min(currentPage * pageSize, filteredCategories.length)} of {filteredCategories.length} Categories
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
        </div>
    )
}
