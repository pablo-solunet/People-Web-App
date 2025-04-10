import type { OperacionesData } from "@/hooks/use-operaciones"
import { gapOperacionesEdit } from "@/lib/appConfig"

// Función para calcular días antes del Ingreso
export const canEditRecord = (fechaIngreso: string): boolean => {
  const today = new Date()
  const fecha = new Date(fechaIngreso)
  const diffDays = (fecha.getTime() - today.getTime()) / (1000 * 3600 * 24)
  return diffDays >= Number(gapOperacionesEdit)
}

// Función para obtener la fecha mínima permitida
export const getMinimumDate = (diasParaEditar: number) => {
  const today = new Date()
  const minDate = new Date(today)
  minDate.setDate(today.getDate() + Number(diasParaEditar))
  return minDate.toISOString().split("T")[0]
}

// Función para calcular horas de trabajo
export const calculateWorkHours = (startTime: string, endTime: string): number => {
  if (startTime === "Franco" || endTime === "Franco") return 0

  // Convertir los horarios a minutos para facilitar el cálculo
  const getMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }

  const startMinutes = getMinutes(startTime)
  const endMinutes = getMinutes(endTime)

  // Si la hora de fin es menor que la de inicio, asumimos que cruza la medianoche
  let diffMinutes = endMinutes - startMinutes
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60 // Añadir un día completo en minutos
  }

  // Convertir minutos a horas con un decimal
  return Math.round(diffMinutes / 6) / 10 // Redondear a 1 decimal
}

// Función para actualizar la carga horaria
export const updateCargaHoraria = (record: OperacionesData): string => {
  const days = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]
  let totalHours = 0

  days.forEach((day) => {
    const startTime = record[`${day}_in` as keyof OperacionesData] as string
    const endTime = record[`${day}_out` as keyof OperacionesData] as string

    if (startTime && endTime && startTime !== "Franco") {
      totalHours += calculateWorkHours(startTime, endTime)
    }
  })

  return totalHours.toFixed(1)
}

// Función para obtener la clase de estilo del badge de estado
export const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "Pendiente":
      return "bg-status-pendiente dark:bg-status-pendienteDark text-gray-800 dark:text-gray-100"
    case "EnBusqueda":
      return "bg-status-enBusqueda dark:bg-status-enBusquedaDark text-gray-800 dark:text-gray-100"
    case "Finalizado":
      return "bg-status-finalizado dark:bg-status-finalizadoDark text-gray-800 dark:text-gray-100"
    case "Rechazado":
      return "bg-status-rechazado dark:bg-status-rechazadoDark text-gray-800 dark:text-gray-100"
    default:
      return "bg-gray-200 dark:bg-gray-700"
  }
}
