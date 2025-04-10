import { projectId, datasetId, table_agent_form, auth } from "@/lib/bigQueryConfig"

export async function updateOperacionesData(data: any) {
  try {
    // Extraer variables relevantes del objeto recibido
    const {
      id_reg,
      pais,
      fechaIngreso,
      cliente,
      canal,
      observaciones,
      horarioIn,
      horarioOut,
      cargaHoraria,
      requiereEmailCorpo,
      lunes_in,
      lunes_out,
      martes_in,
      martes_out,
      miercoles_in,
      miercoles_out,
      jueves_in,
      jueves_out,
      viernes_in,
      viernes_out,
      sabado_in,
      sabado_out,
      domingo_in,
      domingo_out,
      approvedFromIP,
      estado,
      area,
      log_track
    } = data

    // Construir la consulta SQL para actualizar solo los campos de operaciones
    // Mantenemos estado y area como están en la base de datos
    const query = `
      UPDATE \`${projectId}.${datasetId}.${table_agent_form}\`
      SET 
        estado = "${estado}",
        area = "${area}",
        pais = "${pais}",
        fechaIngreso = "${fechaIngreso}",
        cliente = "${cliente}",
        canal = "${canal}",
        observaciones = "${observaciones}",
        horarioIn = "${horarioIn}",
        horarioOut = "${horarioOut}",
        cargaHoraria = "${cargaHoraria}",
        requiereEmailCorpo = "${requiereEmailCorpo}",
        lunes_in = "${lunes_in}",
        lunes_out = "${lunes_out}",
        martes_in = "${martes_in}",
        martes_out = "${martes_out}",
        miercoles_in = "${miercoles_in}",
        miercoles_out = "${miercoles_out}",
        jueves_in = "${jueves_in}",
        jueves_out = "${jueves_out}",
        viernes_in = "${viernes_in}",
        viernes_out = "${viernes_out}",
        sabado_in = "${sabado_in}",
        sabado_out = "${sabado_out}",
        domingo_in = "${domingo_in}",
        domingo_out = "${domingo_out}",
        approvedFromIP = "${approvedFromIP}",
        log_track = "${log_track}"
      WHERE id_reg = "${id_reg}"
    `

    console.log("Operaciones Update Query:", query)

    const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/queries`
    const client = await auth.getClient()
    const accessToken = await client.getAccessToken()

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken.token}`,
    }

    const requestBody = {
      query: query,
      useLegacySql: false,
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    })

    const responseData = await response.json()

    return {
      success: true,
      message: "Operaciones data updated successfully",
      data: responseData,
      estado: estado,
      area: area,
    }
  } catch (error) {
    console.error("Error updating operaciones data:", error)
    throw error
  }
}
