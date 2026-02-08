"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { CalendarDays } from 'lucide-react'

interface YearSelectorProps {
  selectedYear: number
  onYearChange: (year: number) => void
  availableYears?: number[]
}

export function YearSelector({ 
  selectedYear, 
  onYearChange, 
  availableYears 
}: YearSelectorProps) {
  const currentYear = new Date().getFullYear()
  
  // Gerar lista de anos disponíveis (atual até 5 anos atrás)
  const years = availableYears || Array.from(
    { length: 6 }, 
    (_, i) => currentYear - i
  )

  return (
    <div className="flex items-center gap-2">
      <CalendarDays className="h-5 w-5 text-muted-foreground" />
      <Select 
        value={selectedYear.toString()} 
        onValueChange={(value) => onYearChange(parseInt(value))}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
              {year === currentYear && " (Atual)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
