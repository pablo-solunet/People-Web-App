/**
 * Servicio para manejar las operaciones de la API de formularios de agentes
 */

// Función para obtener todos los registros
export async function fetchAgentFormData() {
  try {
    const response = await fetch("/api/agent-form")
    if (!response.ok) {
      throw new Error("Error al obtener los datos")
    }
    return await response.json()
  } catch (error) {
    console.error("Error en fetchAgentFormData:", error)
    throw error
  }
}

// Función para actualizar un registro desde operaciones
export async function updateAgentForm(id_reg: string, data: any) {
  try {
    // Añadir el flag para identificar que es una actualización de operaciones
    const payload = {
      ...data,
      id_reg,
      updateType: "operaciones",
    }

    const response = await fetch("/api/agent-form", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error("Error al actualizar el registro")
    }

    return await response.json()
  } catch (error) {
    console.error("Error en updateAgentForm:", error)
    throw error
  }
}

// Función para eliminar un registro
export async function deleteAgentForm(id_reg: string) {
  try {
    const response = await fetch(`/api/agent-form?id=${id_reg}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      throw new Error("Error al eliminar el registro")
    }

    return await response.json()
  } catch (error) {
    console.error("Error en deleteAgentForm:", error)
    throw error
  }
}

// Función para enviar un registro a Training
export async function sendToTraining(id_reg: string, username: string) {
  try {
    const currentTimestamp = new Date().toLocaleString()
    const userDisplayName = username || "Operaciones"

    // Esta función NO debe usar el flag updateType, ya que necesita actualizar estado y área
    const payload = {
      id_reg,
      estado: "Pendiente",
      area: "Training",
      log_track: `Enviado a Training por ${userDisplayName} at ${currentTimestamp}`,
      append_log: true,
    }

    const response = await fetch("/api/agent-form", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error("Error al enviar el registro a Training")
    }

    return await response.json()
  } catch (error) {
    console.error("Error en sendToTraining:", error)
    throw error
  }
}
