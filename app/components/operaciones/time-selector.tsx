"use client"
import { TIME_SLOTS } from "@/lib/time-slots"

interface TimeSelectorProps {
  value: string
  onChange: (value: string) => void
  id: string
  disabled?: boolean
  includesFranco?: boolean
}

export function TimeSelector({ value, onChange, id, disabled = false, includesFranco = false }: TimeSelectorProps) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-blue-200 dark:border-blue-800"
      >
        {includesFranco && <option value="Franco">Franco</option>}
        {TIME_SLOTS.map((slot) => (
          <option key={slot} value={slot}>
            {slot}
          </option>
        ))}
      </select>
    </div>
  )
}
