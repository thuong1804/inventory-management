import { format, parseISO, isValid } from 'date-fns'

/**
 * Format numbers as Vietnamese Dong (VND)
 * Example: 250,000,000 VND
 */
export function formatVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0 VND'
  }
  const formatted = new Intl.NumberFormat('en-US').format(Math.round(amount))
  return `${formatted} VND`
}

/**
 * Format plain numbers with commas
 * Example: 1,250
 */
export function formatNumber(val: number): string {
  if (isNaN(val) || val === null || val === undefined) {
    return '0'
  }
  return new Intl.NumberFormat('en-US').format(val)
}

/**
 * Format date string into readable DD/MM/YYYY
 */
export function formatDate(dateStr: string | Date | undefined): string {
  if (!dateStr) return '-'
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    if (!isValid(d)) {
      return dateStr.toString()
    }
    return format(d, 'dd/MM/yyyy')
  } catch {
    return String(dateStr)
  }
}

/**
 * Format date for datetime-local or input[type="date"] (YYYY-MM-DD)
 */
export function toInputDate(dateStr?: string | Date): string {
  const d = dateStr ? (typeof dateStr === 'string' ? new Date(dateStr) : dateStr) : new Date()
  if (isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
  if (isNaN(value)) return '0%'
  return `${value.toFixed(1)}%`
}
