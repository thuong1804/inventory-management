'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  subtext?: string
  icon: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'info' | 'primary'
  trend?: {
    value: string
    isPositive: boolean
  }
}

const variantStyles = {
  default: 'text-foreground bg-card',
  primary: 'text-foreground bg-card border-l-4 border-l-primary',
  success: 'text-foreground bg-card border-l-4 border-l-emerald-500',
  warning: 'text-foreground bg-card border-l-4 border-l-amber-500',
  info: 'text-foreground bg-card border-l-4 border-l-blue-500',
}

const iconStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
}

export function StatCard({
  title,
  value,
  subtext,
  icon,
  variant = 'default',
  trend,
}: StatCardProps) {
  return (
    <Card className={cn('relative overflow-hidden transition-all duration-200 hover:shadow-md border-border/80', variantStyles[variant])}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <div className={cn('flex size-9 items-center justify-center rounded-lg', iconStyles[variant])}>
            {icon}
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
            {value}
          </h3>
          {(subtext || trend) && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              {trend && (
                <span
                  className={cn(
                    'font-medium',
                    trend.isPositive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  )}
                >
                  {trend.isPositive ? '↑' : '↓'} {trend.value}
                </span>
              )}
              {subtext && <span>{subtext}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
