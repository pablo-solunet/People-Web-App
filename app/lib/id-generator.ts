// Función para generar IDs únicos desde el servidor
export async function generateIdsFromServer(count = 1) {
  try {
    const response = await fetch(`/api/sequence?count=${count}`)

    if (!response.ok) {
      throw new Error("Error al obtener IDs secuenciales del servidor")
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || "Error desconocido al generar IDs")
    }

    return data.ids
  } catch (error) {
    console.error("Error al generar IDs:", error)
    // Fallback a generación local en caso de error (solo para no interrumpir la experiencia)
    return generateFallbackIds(count)
  }
}

// Función de respaldo para generar IDs localmente (solo en caso de error de red)
function generateFallbackIds(count: number) {
  console.warn("Usando generación de IDs de respaldo. Los IDs podrían no ser secuenciales.")

  const date = new Date()
  const timestamp = date.getTime()
  const loteId = `LOT-FALLBACK-${timestamp}`

  return Array.from({ length: count }, (_, index) => ({
    id_reg: `${timestamp + index}-${Math.random().toString(36).substr(2, 9)}`,
    lote_id: loteId,
    requisition_id: `RQ-TEMP-${timestamp + index}`,
  }))
}

// Mantener la función original para compatibilidad, pero ahora llama a la versión del servidor
export function generateIds(count: number) {
  console.warn("Usando función legacy generateIds(). Considere migrar a generateIdsFromServer() para IDs secuenciales.")
  return generateFallbackIds(count)
}

