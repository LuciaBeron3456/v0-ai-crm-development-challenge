"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  hasNextPage?: boolean
  hasPrevPage?: boolean
  totalItems?: number
  itemsPerPage?: number
  onItemsPerPageChange?: (itemsPerPage: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  hasNextPage = true,
  hasPrevPage = true,
  totalItems = 0,
  itemsPerPage = 20,
  onItemsPerPageChange,
}: PaginationProps) {
  const [clickedPage, setClickedPage] = useState<number | null>(null)

  const handlePageClick = (page: number) => {
    setClickedPage(page)
    onPageChange(page)
    // Reset clicked state after a short delay
    setTimeout(() => setClickedPage(null), 300)
  }
  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  // Calculate the range of items being shown
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Always show pagination footer, even for single page

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Mostrando {startItem}-{endItem} de {totalItems} clientes
            </span>
          </div>
          {onItemsPerPageChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Mostrar:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(parseInt(value))}>
                <SelectTrigger className="w-[70px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={!hasPrevPage || isLoading || currentPage === 1 || totalPages <= 1}
            className={`flex items-center gap-1 transition-all duration-150 ${
              clickedPage === currentPage - 1 ? 'bg-primary text-primary-foreground scale-95' : ''
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex items-center space-x-1">
            {totalPages > 1 ? getVisiblePages().map((page, index) => (
              <div key={index}>
                {page === "..." ? (
                  <span className="px-3 py-1 text-gray-500">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageClick(page as number)}
                    disabled={isLoading}
                    className={`w-8 h-8 p-0 transition-all duration-150 ${
                      clickedPage === page ? 'scale-95 bg-primary text-primary-foreground' : ''
                    }`}
                  >
                    {page}
                  </Button>
                )}
              </div>
            )) : (
              <Button
                variant="default"
                size="sm"
                disabled
                className="w-8 h-8 p-0"
              >
                1
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={!hasNextPage || isLoading || currentPage === totalPages || totalPages <= 1}
            className={`flex items-center gap-1 transition-all duration-150 ${
              clickedPage === currentPage + 1 ? 'bg-primary text-primary-foreground scale-95' : ''
            }`}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

      </div>
    </div>
  )
}
