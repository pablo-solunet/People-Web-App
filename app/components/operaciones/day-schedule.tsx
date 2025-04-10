"use client"
import { Label } from "@/components/ui/label"
import { TimeSelector } from "./time-selector"

interface DayScheduleProps {
  day: string
  dayLabel: string
  inValue: string
  outValue: string
  onInChange: (value: string) => void
  onOutChange: (value: string) => void
  disabled?: boolean
}

export function DaySchedule({
  day,
  dayLabel,
  inValue,
  outValue,
  onInChange,
  onOutChange,
  disabled = false,
}: DayScheduleProps) {
  return (
    <div className="space-y-2">
      <Label>{dayLabel}</Label>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor={`${day}_in`} className="text-xs">
            Entrada
          </Label>
          <TimeSelector id={`${day}_in`} value={inValue} onChange={onInChange} includesFranco={true} />
        </div>
        <div>
          <Label htmlFor={`${day}_out`} className="text-xs">
            Salida
          </Label>
          <TimeSelector
            id={`${day}_out`}
            value={outValue}
            onChange={onOutChange}
            disabled={disabled || inValue === "Franco"}
            includesFranco={true}
          />
        </div>
      </div>
    </div>
  )
}
