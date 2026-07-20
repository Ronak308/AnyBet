import React, { useState, useMemo } from 'react'
import { 
  Coins, 
  Plus, 
  Minus, 
  Lock, 
  Unlock, 
  RotateCcw, 
  History, 
  Search, 
  Edit2, 
  Trash2, 
  MoreVertical,
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
import { useWallet } from '../../context/WalletContext'
import type { UserWallet, CoinPackage } from '../../context/WalletContext'

export const WalletsModule: React.FC<{
  onInspectWallet: (wallet: UserWallet) => void
}> = ({ onInspectWallet }) => {
  const {
    wallets,
    coinPackages,
    creditCoins,
    debitCoins,
    freezeWallet,
    unfreezeWallet,
    resetWallet,
    createCoinPackage,
    updateCoinPackage,
    deleteCoinPackage,
    toggleCoinPackage,
    totalCoinsIssued,
    coinsInCirculation,
    coinsLockedInBets
  } = useWallet()

  // Custom Toast helper
  const showNotice = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }))
    }
  }

  // Wallet Table States & Pagination
  const [walletSearch, setWalletSearch] = useState('')
  const [walletStatusFilter, setWalletStatusFilter] = useState<'all' | 'Active' | 'Frozen'>('all')
  const [walletPage, setWalletPage] = useState(1)
  const walletPageSize = 8

  // Coin Adjustment Modal
  const [coinActionModal, setCoinActionModal] = useState<{ isOpen: boolean; mode: 'add' | 'deduct'; wallet: UserWallet | null }>({
    isOpen: false,
    mode: 'add',
    wallet: null
  })
  const [coinAmountInput, setCoinAmountInput] = useState('')
  const [coinReasonInput, setCoinReasonInput] = useState('')

  // Coin Package Form State
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false)
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null)
  const [pkgName, setPkgName] = useState('')
  const [pkgCoins, setPkgCoins] = useState('')
  const [pkgBonus, setPkgBonus] = useState('')
  const [pkgPrice, setPkgPrice] = useState('')
  const [pkgTag, setPkgTag] = useState('')

  // Filtering & Pagination
  const filteredWallets = useMemo(() => {
    return wallets.filter(w => {
      const matchesSearch = w.username.toLowerCase().includes(walletSearch.toLowerCase()) || w.userId.toLowerCase().includes(walletSearch.toLowerCase())
      const matchesStatus = walletStatusFilter === 'all' || w.status === walletStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [wallets, walletSearch, walletStatusFilter])

  const totalWalletPages = Math.max(1, Math.ceil(filteredWallets.length / walletPageSize))
  const paginatedWallets = useMemo(() => {
    const start = (walletPage - 1) * walletPageSize
    return filteredWallets.slice(start, start + walletPageSize)
  }, [filteredWallets, walletPage, walletPageSize])

  // Handlers
  const handleExecuteCoinAdjustment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!coinActionModal.wallet) return
    const amt = parseInt(coinAmountInput, 10)
    if (isNaN(amt) || amt <= 0) {
      showNotice('Please enter a valid coin amount greater than 0', 'warning')
      return
    }

    const reason = coinReasonInput.trim() || (coinActionModal.mode === 'add' ? 'Admin Deposit' : 'Admin Deduction')

    if (coinActionModal.mode === 'add') {
      creditCoins(coinActionModal.wallet.userId, amt, 'Deposit', reason)
      showNotice(`Successfully credited +${amt.toLocaleString()} BET to ${coinActionModal.wallet.username}`, 'success')
    } else {
      const ok = debitCoins(coinActionModal.wallet.userId, amt, 'Withdrawal', reason)
      if (!ok) {
        showNotice(`Failed: ${coinActionModal.wallet.username} has insufficient balance or wallet is frozen.`, 'warning')
        return
      }
      showNotice(`Deducted -${amt.toLocaleString()} BET from ${coinActionModal.wallet.username}`, 'success')
    }

    setCoinActionModal({ isOpen: false, mode: 'add', wallet: null })
    setCoinAmountInput('')
    setCoinReasonInput('')
  }

  const handleOpenPkgModal = (pkg?: CoinPackage) => {
    if (pkg) {
      setEditingPkgId(pkg.id)
      setPkgName(pkg.name)
      setPkgCoins(pkg.coins.toString())
      setPkgBonus(pkg.bonusCoins.toString())
      setPkgPrice(pkg.priceUsd.toString())
      setPkgTag(pkg.tag || '')
    } else {
      setEditingPkgId(null)
      setPkgName('')
      setPkgCoins('1000')
      setPkgBonus('100')
      setPkgPrice('9.99')
      setPkgTag('')
    }
    setIsPkgModalOpen(true)
  }

  const handleSavePkg = (e: React.FormEvent) => {
    e.preventDefault()
    const coins = parseInt(pkgCoins, 10) || 0
    const bonus = parseInt(pkgBonus, 10) || 0
    const price = parseFloat(pkgPrice) || 0

    if (editingPkgId) {
      updateCoinPackage(editingPkgId, {
        name: pkgName,
        coins,
        bonusCoins: bonus,
        priceUsd: price,
        tag: pkgTag.trim() || undefined
      })
      showNotice(`Package "${pkgName}" updated successfully.`, 'success')
    } else {
      createCoinPackage({
        name: pkgName,
        coins,
        bonusCoins: bonus,
        priceUsd: price,
        tag: pkgTag.trim() || undefined,
        isEnabled: true
      })
      showNotice(`Created new coin package "${pkgName}".`, 'success')
    }

    setIsPkgModalOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Metric Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-surface/30 border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-muted uppercase">Total System Supply</span>
              <p className="text-2xl font-bold font-mono text-primary mt-1">{totalCoinsIssued.toLocaleString()} BET</p>
            </div>
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary">
              <Coins className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-muted uppercase">Coins in Circulation</span>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{coinsInCirculation.toLocaleString()} BET</p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Unlock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface/30 border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-muted uppercase">Locked in Escrow</span>
              <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{coinsLockedInBets.toLocaleString()} BET</p>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Lock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coin Store Packages Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold font-sans text-foreground">Virtual Coin Store Packages</h3>
            <p className="text-xs text-muted font-sans">Manage in-app coin bundles available for player purchases.</p>
          </div>
          <Button size="sm" variant="primary" glow onClick={() => handleOpenPkgModal()} className="gap-1.5 text-xs font-mono">
            <Plus className="h-3.5 w-3.5" /> Add Package
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coinPackages.map(pkg => (
            <Card key={pkg.id} className={`bg-surface/30 border-border/60 relative overflow-hidden transition-all ${!pkg.isEnabled ? 'opacity-50' : ''}`}>
              {pkg.tag && (
                <span className="absolute top-2 right-2 px-2 py-0.5 text-[9px] font-bold font-mono bg-primary/20 text-primary border border-primary/30 rounded uppercase">
                  {pkg.tag}
                </span>
              )}
              <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
                <div>
                  <h4 className="font-bold text-sm text-foreground">{pkg.name}</h4>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-bold font-mono text-primary">{pkg.coins.toLocaleString()}</span>
                    <span className="text-xs font-mono text-muted">BET</span>
                    {pkg.bonusCoins > 0 && (
                      <span className="text-xs font-mono text-emerald-400 font-bold ml-1">+{pkg.bonusCoins} Bonus</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-sm font-bold font-mono text-foreground">${pkg.priceUsd.toFixed(2)}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleCoinPackage(pkg.id)}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded cursor-pointer border ${pkg.isEnabled ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-surface text-muted border-border'}`}
                    >
                      {pkg.isEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                    <button onClick={() => handleOpenPkgModal(pkg)} className="p-1 text-muted hover:text-foreground cursor-pointer">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteCoinPackage(pkg.id)} className="p-1 text-muted hover:text-red-400 cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* User Wallets Datatable */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
            <Input
              placeholder="Search user or wallet ID..."
              value={walletSearch}
              onChange={e => setWalletSearch(e.target.value)}
              className="pl-9 h-9 text-xs font-mono bg-surface/40 border-border/60"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-surface/40 border border-border/60 rounded-lg px-2.5 py-1 text-xs font-mono">
            <span className="text-muted text-[10px] uppercase">Status:</span>
            <select
              value={walletStatusFilter}
              onChange={e => setWalletStatusFilter(e.target.value as any)}
              className="bg-transparent text-foreground outline-none cursor-pointer font-bold"
            >
              <option value="all" className="bg-background text-foreground">All Wallets</option>
              <option value="Active" className="bg-background text-foreground">Active</option>
              <option value="Frozen" className="bg-background text-foreground">Frozen</option>
            </select>
          </div>
        </div>

        <div className="border border-border/60 rounded-xl overflow-hidden bg-surface/20">
          <Table>
            <TableHeader className="bg-surface/60">
              <TableRow>
                <TableHead className="text-xs font-mono">User</TableHead>
                <TableHead className="text-xs font-mono">Total Balance</TableHead>
                <TableHead className="text-xs font-mono">Locked Stake</TableHead>
                <TableHead className="text-xs font-mono">Available Balance</TableHead>
                <TableHead className="text-xs font-mono">Status</TableHead>
                <TableHead className="text-xs font-mono">Last Activity</TableHead>
                <TableHead className="text-xs font-mono text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedWallets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted font-mono text-xs">
                    No user wallets match your filter.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedWallets.map(w => (
                  <TableRow key={w.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-foreground">{w.username}</span>
                        <span className="font-mono text-[10px] text-muted">{w.userId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-primary">{w.totalBalance.toLocaleString()} BET</TableCell>
                    <TableCell className="font-mono text-xs text-amber-400">{w.lockedBalance.toLocaleString()} BET</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-emerald-400">{(w.totalBalance - w.lockedBalance).toLocaleString()} BET</TableCell>
                    <TableCell>
                      {w.status === 'Active' ? (
                        <Badge variant="success">ACTIVE</Badge>
                      ) : (
                        <Badge variant="danger">FROZEN</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted">{w.lastActivity}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted hover:text-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-[#120F1D] border-border/80 p-1.5 shadow-2xl">
                          <DropdownMenuItem onClick={() => setCoinActionModal({ isOpen: true, mode: 'add', wallet: w })} className="gap-2 text-xs font-mono text-emerald-400 hover:bg-emerald-500/15">
                            <Plus className="h-3.5 w-3.5" /> Credit Coins
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setCoinActionModal({ isOpen: true, mode: 'deduct', wallet: w })} className="gap-2 text-xs font-mono text-amber-400 hover:bg-amber-500/15">
                            <Minus className="h-3.5 w-3.5" /> Deduct Coins
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onInspectWallet(w)} className="gap-2 text-xs font-mono text-foreground hover:bg-surface/80">
                            <History className="h-3.5 w-3.5 text-muted" /> Audit History
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1 bg-border/50" />
                          {w.status === 'Active' ? (
                            <DropdownMenuItem onClick={() => freezeWallet(w.id)} className="gap-2 text-xs font-mono text-red-400 hover:bg-red-500/15">
                              <Lock className="h-3.5 w-3.5" /> Freeze Wallet
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => unfreezeWallet(w.id)} className="gap-2 text-xs font-mono text-emerald-400 hover:bg-emerald-500/15">
                              <Unlock className="h-3.5 w-3.5" /> Unfreeze Wallet
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => resetWallet(w.id)} className="gap-2 text-xs font-mono text-muted hover:text-foreground">
                            <RotateCcw className="h-3.5 w-3.5" /> Reset Balance
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="p-4 border-t border-border/50 bg-surface/30 flex items-center justify-between text-xs font-mono">
            <span className="text-muted">Page {walletPage} of {totalWalletPages}</span>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" disabled={walletPage === 1} onClick={() => setWalletPage(p => Math.max(1, p - 1))} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" disabled={walletPage === totalWalletPages} onClick={() => setWalletPage(p => Math.min(totalWalletPages, p + 1))} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CREDIT / DEDUCT COIN MODAL */}
      <Sheet open={coinActionModal.isOpen} onOpenChange={open => !open && setCoinActionModal({ isOpen: false, mode: 'add', wallet: null })}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-background border-l border-border p-6 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div className="border-b border-border/40 pb-4 pr-8">
              <h3 className="text-lg font-bold font-sans text-foreground">
                {coinActionModal.mode === 'add' ? 'Credit Coins to User' : 'Deduct Coins from User'}
              </h3>
              <p className="text-xs text-muted font-sans mt-0.5">
                Target User: <span className="text-primary font-bold">{coinActionModal.wallet?.username}</span> ({coinActionModal.wallet?.userId})
              </p>
            </div>

            <form onSubmit={handleExecuteCoinAdjustment} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1">Coin Amount ($BET)</label>
                <Input
                  type="number"
                  placeholder="e.g. 500"
                  value={coinAmountInput}
                  onChange={e => setCoinAmountInput(e.target.value)}
                  className="bg-surface/40 text-xs font-mono text-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1">Reason / Description</label>
                <Input
                  placeholder="e.g. VIP Bonus or Administrative Correction"
                  value={coinReasonInput}
                  onChange={e => setCoinReasonInput(e.target.value)}
                  className="bg-surface/40 text-xs font-mono text-foreground"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border/40">
                <Button type="button" variant="ghost" onClick={() => setCoinActionModal({ isOpen: false, mode: 'add', wallet: null })} className="text-xs font-mono">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" glow className="text-xs font-mono">
                  {coinActionModal.mode === 'add' ? 'Credit Balance' : 'Deduct Balance'}
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* COIN PACKAGE FORM SHEET */}
      <Sheet open={isPkgModalOpen} onOpenChange={setIsPkgModalOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-background border-l border-border p-6 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div className="border-b border-border/40 pb-4 pr-8">
              <h3 className="text-lg font-bold font-sans text-foreground">
                {editingPkgId ? 'Edit Coin Package' : 'Create Coin Package'}
              </h3>
              <p className="text-xs text-muted font-sans mt-0.5">Configure in-store virtual coin pricing and bonuses.</p>
            </div>

            <form onSubmit={handleSavePkg} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1">Package Name</label>
                <Input
                  placeholder="e.g. Champion Pack"
                  value={pkgName}
                  onChange={e => setPkgName(e.target.value)}
                  className="bg-surface/40 text-xs font-mono text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Base Coins ($BET)</label>
                  <Input
                    type="number"
                    value={pkgCoins}
                    onChange={e => setPkgCoins(e.target.value)}
                    className="bg-surface/40 text-xs font-mono text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Bonus Coins ($BET)</label>
                  <Input
                    type="number"
                    value={pkgBonus}
                    onChange={e => setPkgBonus(e.target.value)}
                    className="bg-surface/40 text-xs font-mono text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Price (USD $)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={pkgPrice}
                    onChange={e => setPkgPrice(e.target.value)}
                    className="bg-surface/40 text-xs font-mono text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Badge Tag (Optional)</label>
                  <Input
                    placeholder="e.g. MOST POPULAR"
                    value={pkgTag}
                    onChange={e => setPkgTag(e.target.value)}
                    className="bg-surface/40 text-xs font-mono text-foreground"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border/40">
                <Button type="button" variant="ghost" onClick={() => setIsPkgModalOpen(false)} className="text-xs font-mono">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" glow className="text-xs font-mono">
                  Save Package
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
