"use client"

import { useRouter, usePathname } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SortOption = "price_asc" | "price_desc"

interface CatalogSortDropdownProps {
  currentSort: SortOption
}

const sortOptions = [
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
]

export function CatalogSortDropdown({ currentSort }: CatalogSortDropdownProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleSortChange = (value: string) => {
    const url = `${pathname}?sort=${value}`
    router.push(url)
  }

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="sort-select" className="text-sm font-medium text-foreground">
        Ordenar por
      </label>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger id="sort-select" className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
