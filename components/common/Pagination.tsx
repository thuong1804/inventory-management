'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalItems <= pageSize) return null

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border/60 px-4 py-3 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        Hiển thị <span className="font-medium text-foreground">{startItem}</span> -{' '}
        <span className="font-medium text-foreground">{endItem}</span> trên tổng số{' '}
        <span className="font-medium text-foreground">{totalItems}</span> mục
      </p>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 px-2.5 text-xs"
        >
          <ChevronLeftIcon className="mr-1 size-3.5" />
          Trước
        </Button>

        <span className="px-2 text-xs font-medium text-muted-foreground">
          Trang {currentPage} / {Math.max(1, totalPages)}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 px-2.5 text-xs"
        >
          Sau
          <ChevronRightIcon className="ml-1 size-3.5" />
        </Button>
      </div>
    </div>
  )
}
