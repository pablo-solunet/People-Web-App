/**
 * Formatea una fecha o timestamp de BigQuery a un formato legible
 * @param dateTimeStr - La fecha o timestamp a formatear
 * @param locale - El locale a usar para el formateo (por defecto es-ES)
 * @returns La fecha formateada como string
 */
export function formatDateTime(dateTimeStr: string | number | null | undefined, locale = "es-ES"): string {
    try {
      // Si es null o undefined, devolver un string vacío
      if (dateTimeStr === null || dateTimeStr === undefined) {
        return ""
      }
  
      // Opciones de formato para toLocaleString
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
  
      // Si es una cadena de fecha/hora de BigQuery (formato ISO con T)
      if (typeof dateTimeStr === "string" && dateTimeStr.includes("T")) {
        const date = new Date(dateTimeStr)
        if (!isNaN(date.getTime())) {
          return date.toLocaleString(locale, options)
        }
      }
  
      // Si es una cadena de fecha/hora sin T pero con guiones (como "2025-03-31 17:08:55")
      if (typeof dateTimeStr === "string" && dateTimeStr.includes("-")) {
        // Asegurarse de que la fecha esté en formato ISO para que JavaScript la interprete correctamente
        const isoDate = dateTimeStr.replace(" ", "T")
        const date = new Date(isoDate)
        if (!isNaN(date.getTime())) {
          return date.toLocaleString(locale, options)
        }
      }
  
      // Si es un número (timestamp en segundos o milisegundos)
      if (typeof dateTimeStr === "number" || !isNaN(Number(dateTimeStr))) {
        const timestamp = typeof dateTimeStr === "number" ? dateTimeStr : Number(dateTimeStr)
        // Si el timestamp parece estar en segundos (menos de 13 dígitos), convertirlo a milisegundos
        const date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp)
        if (!isNaN(date.getTime())) {
          return date.toLocaleString(locale, options)
        }
      }
  
      // Si no se puede formatear, devolver el valor original como string
      return String(dateTimeStr)
    } catch (error) {
      console.error("Error formatting date:", error, "Value:", dateTimeStr)
      return String(dateTimeStr)
    }
  }
  
  /**
   * Formatea una fecha de BigQuery a un formato legible (sin hora)
   * @param dateStr - La fecha a formatear
   * @param locale - El locale a usar para el formateo (por defecto es-ES)
   * @returns La fecha formateada como string
   */
  export function formatDate(dateStr: string | number | null | undefined, locale = "es-ES"): string {
    try {
      // Si es null o undefined, devolver un string vacío
      if (dateStr === null || dateStr === undefined) {
        return ""
      }
  
      // Opciones de formato para toLocaleDateString
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
  
      // Si es una cadena de fecha (como "2025-04-03")
      if (typeof dateStr === "string" && dateStr.includes("-")) {
        const date = new Date(dateStr)
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString(locale, options)
        }
      }
  
      // Si es un número (timestamp)
      if (typeof dateStr === "number" || !isNaN(Number(dateStr))) {
        const timestamp = typeof dateStr === "number" ? dateStr : Number(dateStr)
        // Si el timestamp parece estar en segundos, convertirlo a milisegundos
        const date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp)
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString(locale, options)
        }
      }
  
      // Si no se puede formatear, devolver el valor original como string
      return String(dateStr)
    } catch (error) {
      console.error("Error formatting date:", error, "Value:", dateStr)
      return String(dateStr)
    }
  }
  
  /**
   * Determina si una fecha es válida
   * @param date - La fecha a validar
   * @returns true si la fecha es válida, false en caso contrario
   */
  export function isValidDate(date: Date): boolean {
    return !isNaN(date.getTime())
  }
  