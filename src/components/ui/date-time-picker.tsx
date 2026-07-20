import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { Button } from './button'
import { cn } from '../../lib/utils'

interface DateTimePickerProps {
  value: string // YYYY-MM-DDTHH:mm or ISO string
  onChange: (value: string) => void
  label?: string
  className?: string
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Parse current value
  const dateValue = value ? new Date(value) : new Date()
  const validDate = isNaN(dateValue.getTime()) ? new Date() : dateValue

  const [currentMonth, setCurrentMonth] = useState(new Date(validDate.getFullYear(), validDate.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<Date>(validDate)

  // Time state (12-hour format)
  const get12Hour = (h: number) => {
    if (h === 0) return 12
    if (h > 12) return h - 12
    return h
  }

  const [hours, setHours] = useState<number>(get12Hour(validDate.getHours()))
  const [minutes, setMinutes] = useState<number>(validDate.getMinutes())
  const [ampm, setAmPm] = useState<'AM' | 'PM'>(validDate.getHours() >= 12 ? 'PM' : 'AM')

  useEffect(() => {
    if (value) {
      const d = new Date(value)
      if (!isNaN(d.getTime())) {
        setSelectedDate(d)
        setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1))
        setHours(get12Hour(d.getHours()))
        setMinutes(d.getMinutes())
        setAmPm(d.getHours() >= 12 ? 'PM' : 'AM')
      }
    }
  }, [value])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Helper to commit datetime back to parent in YYYY-MM-DDTHH:mm format
  const commitDateTime = (newDate: Date, h12: number, min: number, period: 'AM' | 'PM') => {
    let h24 = h12
    if (period === 'PM' && h12 < 12) h24 = h12 + 12
    if (period === 'AM' && h12 === 12) h24 = 0

    const year = newDate.getFullYear()
    const month = String(newDate.getMonth() + 1).padStart(2, '0')
    const day = String(newDate.getDate()).padStart(2, '0')
    const hh = String(h24).padStart(2, '0')
    const mm = String(min).padStart(2, '0')

    const formatted = `${year}-${month}-${day}T${hh}:${mm}`
    onChange(formatted)
  }

  const handleDateClick = (day: number) => {
    const newD = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    setSelectedDate(newD)
    commitDateTime(newD, hours, minutes, ampm)
  }

  const handleTimeChange = (newH: number, newM: number, newAmPm: 'AM' | 'PM') => {
    setHours(newH)
    setMinutes(newM)
    setAmPm(newAmPm)
    commitDateTime(selectedDate, newH, newM, newAmPm)
  }

  // Calendar calculations
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  // Formatting display text
  const formatDisplay = () => {
    if (!value) return 'Select Date & Time'
    const d = selectedDate
    const dateStr = `${monthNames[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`
    return `${dateStr} • ${timeStr}`
  }

  return (
    <div ref={containerRef} className={cn('relative inline-block w-full', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 text-xs font-mono bg-surface/50 border border-border/60 rounded-lg text-foreground hover:border-primary/50 transition-all cursor-pointer outline-none focus:border-primary',
          isOpen && 'border-primary shadow-[0_0_12px_rgba(128,38,255,0.25)]'
        )}
      >
        <div className="flex items-center gap-2 text-foreground/90 font-medium">
          <CalendarIcon className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>{formatDisplay()}</span>
        </div>
        <Clock className="h-3.5 w-3.5 text-muted shrink-0" />
      </button>

      {/* Popover Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 top-full mt-1.5 z-50 w-72 bg-[#120F1D] border border-border/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl space-y-4 select-none"
          >
            {/* Calendar Month Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="text-xs font-bold font-mono text-foreground">
                {monthNames[month]} {year}
              </span>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" type="button" onClick={prevMonth} className="h-6 w-6">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" type="button" onClick={nextMonth} className="h-6 w-6">
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono text-muted font-bold">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-7 w-7" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1
                const isSelected = 
                  selectedDate.getDate() === dayNum &&
                  selectedDate.getMonth() === month &&
                  selectedDate.getFullYear() === year

                const isToday = 
                  new Date().getDate() === dayNum &&
                  new Date().getMonth() === month &&
                  new Date().getFullYear() === year

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => handleDateClick(dayNum)}
                    className={cn(
                      'h-7 w-7 rounded-lg text-xs flex items-center justify-center transition-all cursor-pointer font-medium',
                      isSelected
                        ? 'bg-primary text-background font-bold shadow-[0_0_10px_rgba(128,38,255,0.6)]'
                        : isToday
                        ? 'border border-primary/50 text-primary hover:bg-primary/10'
                        : 'text-foreground/80 hover:bg-surface/60 hover:text-foreground'
                    )}
                  >
                    {dayNum}
                  </button>
                )
              })}
            </div>

            {/* Time Controls (Hours, Minutes, AM/PM) */}
            <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted mr-1" />
                
                {/* Hours Select */}
                <select
                  value={hours}
                  onChange={e => handleTimeChange(Number(e.target.value), minutes, ampm)}
                  className="bg-surface/60 border border-border/60 rounded px-1.5 py-1 text-xs font-mono text-foreground outline-none cursor-pointer"
                >
                  {Array.from({ length: 12 }).map((_, i) => {
                    const h = i + 1
                    return <option key={h} value={h} className="bg-background">{String(h).padStart(2, '0')}</option>
                  })}
                </select>
                
                <span className="text-muted font-bold">:</span>

                {/* Minutes Select */}
                <select
                  value={minutes}
                  onChange={e => handleTimeChange(hours, Number(e.target.value), ampm)}
                  className="bg-surface/60 border border-border/60 rounded px-1.5 py-1 text-xs font-mono text-foreground outline-none cursor-pointer"
                >
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                    <option key={m} value={m} className="bg-background">{String(m).padStart(2, '0')}</option>
                  ))}
                </select>
              </div>

              {/* AM / PM Toggle */}
              <div className="flex border border-border/60 rounded-md overflow-hidden bg-surface/40 p-0.5">
                {(['AM', 'PM'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleTimeChange(hours, minutes, p)}
                    className={cn(
                      'px-2 py-0.5 text-[10px] font-mono rounded font-bold transition-all cursor-pointer',
                      ampm === p ? 'bg-primary text-background' : 'text-muted hover:text-foreground'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Presets & Confirm */}
            <div className="pt-2 border-t border-border/30 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const now = new Date()
                  setSelectedDate(now)
                  setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1))
                  const h12 = get12Hour(now.getHours())
                  const min = Math.floor(now.getMinutes() / 5) * 5
                  const period = now.getHours() >= 12 ? 'PM' : 'AM'
                  setHours(h12)
                  setMinutes(min)
                  setAmPm(period)
                  commitDateTime(now, h12, min, period)
                }}
                className="text-[10px] font-mono text-primary hover:underline cursor-pointer"
              >
                Set to Now
              </button>

              <Button
                size="sm"
                variant="primary"
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-6 px-3 text-[10px] font-mono"
              >
                <Check className="h-3 w-3 mr-1" /> Done
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
