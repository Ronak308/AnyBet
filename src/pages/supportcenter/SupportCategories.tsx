import React, { useState } from 'react'
import { Plus, MoreHorizontal, Trash2, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    routing: string
    status: 'Active' | 'Inactive'
    iconName: 'Payment' | 'Account' | 'Bet Dispute' | 'System Bug' | 'Other'
}

interface SupportCategoriesProps {
    categories: SupportCategory[]
    handleAddCategory: (name: string, description: string, sla: string, routing: string) => void
    handleEditCategory: (id: string, name: string, description: string, sla: string, routing: string) => void
    handleDeleteCategory: (id: string, name: string) => void
    handleToggleCategoryStatus: (id: string) => void
}

export const SupportCategories: React.FC<SupportCategoriesProps> = ({
    categories,
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleToggleCategoryStatus
}) => {
    const [isAddingCat, setIsAddingCat] = useState(false)
    const [categoryToEdit, setCategoryToEdit] = useState<SupportCategory | null>(null)
    const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null)

    const isSheetOpen = isAddingCat || categoryToEdit !== null
    const closeSheet = () => {
        setIsAddingCat(false)
        setCategoryToEdit(null)
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-mono text-muted uppercase">Ticketing Classifications & SLAs</span>
                <Button
                    onClick={() => setIsAddingCat(true)}
                    className="h-9 px-4 text-xs font-mono gap-1.5 rounded-lg"
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

            <div className="border border-muted/30 rounded-xl overflow-hidden bg-surface/30 w-full overflow-x-auto">
                <Table>
                    <TableHeader className="bg-surface/75 border-b border-muted/30">
                        <TableRow className="border-b border-muted/30 hover:bg-transparent h-14">
                            <TableHead className="text-xs font-mono h-14 pl-4">Category Name</TableHead>
                            <TableHead className="text-xs font-mono h-14">Description</TableHead>
                            <TableHead className="text-xs font-mono h-14 text-center">Target Resolution</TableHead>
                            <TableHead className="text-xs font-mono h-14 text-center">Status</TableHead>
                            <TableHead className="text-xs font-mono h-14 pr-4 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map(c => (
                            <TableRow key={c.id} className="border-b border-muted/20 hover:bg-surface/40">
                                <TableCell className="py-3 pl-4">
                                    <span className="text-xs font-bold font-sans text-foreground">{c.name}</span>
                                </TableCell>
                                <TableCell className="py-3 text-xs text-muted max-w-sm font-sans truncate">{c.description}</TableCell>
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
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
