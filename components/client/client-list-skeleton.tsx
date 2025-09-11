"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface ClientListSkeletonProps {
  rows?: number
}

export function ClientListSkeleton({ rows = 20 }: ClientListSkeletonProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Prioridad</TableHead>
            <TableHead>Última Interacción</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 bg-gray-300" />
                  <Skeleton className="h-3 w-24 bg-gray-300" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full bg-gray-300" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-12 rounded-full bg-gray-300" />
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20 bg-gray-300" />
                  <Skeleton className="h-3 w-12 bg-gray-300" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded bg-gray-300" />
                  <Skeleton className="h-8 w-8 rounded bg-gray-300" />
                  <Skeleton className="h-8 w-8 rounded bg-gray-300" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
