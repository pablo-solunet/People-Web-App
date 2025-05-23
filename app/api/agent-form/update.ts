import { projectId, datasetId, table_agent_form, auth } from "@/lib/bigQueryConfig"

export async function updateAgentFormData(data: any) {
  try {
    // Extraer variables relevantes del objeto recibido
    const { isLote, lote_id, id_reg, estado, area, legajo, documento, observaciones, approvedFromIP, log_track, append_log } = data;

    // parametrizar estos valores para evitar inyección SQL.
    const query = `
      UPDATE \`${projectId}.${datasetId}.${table_agent_form}\`
      SET 
        estado = "${estado}",
        area = "${area}",

        legajo = CASE
          WHEN "${legajo}" IS NOT NULL AND "${legajo}" != '' AND "${legajo}" != 'undefined' 
            THEN "${legajo}"
            ELSE legajo
        END,

        documento = CASE
          WHEN "${documento}" IS NOT NULL AND "${documento}" != '' AND "${documento}" != 'undefined' 
            THEN "${documento}"
            ELSE legajo
        END,

        observaciones = CASE
          WHEN "${observaciones}" IS NOT NULL AND "${observaciones}" != '' AND "${observaciones}" != 'undefined'
            THEN CASE 
                  WHEN observaciones IS NOT NULL AND observaciones != '' 
                    THEN CONCAT(observaciones, '; ', "${observaciones}")
                  ELSE "${observaciones}"
                END
          ELSE observaciones
        END,

        log_track = CASE
          WHEN ${log_track ? `"${log_track}"` : null} IS NOT NULL
            THEN CASE
                  WHEN log_track IS NOT NULL AND log_track != '' AND ${append_log ? "TRUE" : "FALSE"}
                    THEN CONCAT(log_track, ' | ', ${log_track ? `"${log_track}"` : null})
                  ELSE ${log_track ? `"${log_track}"` : null}
                END
            ELSE log_track
          END,

        approvedFromIP=${approvedFromIP ? `"${approvedFromIP}"` : null}

      WHERE id_reg = "${id_reg}"
    `;

    console.log("Query:", query)


    const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/queries`;
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken.token}`,
    };

    // se mantiene este bloque
    const requestBody = {
      query: query,
      useLegacySql: false,
      parameterMode: 'NAMED',
      queryParameters: [
        { name: 'id', parameterType: { type: 'STRING' }, parameterValue: { value: data.id } },
        { name: 'pais', parameterType: { type: 'STRING' }, parameterValue: { value: data.pais } },
        { name: 'fechaIngreso', parameterType: { type: 'DATE' }, parameterValue: { value: data.fechaIngreso } },
        { name: 'cliente', parameterType: { type: 'STRING' }, parameterValue: { value: data.cliente } },
        { name: 'canal', parameterType: { type: 'STRING' }, parameterValue: { value: data.canal } },
        { name: 'estado', parameterType: { type: 'STRING' }, parameterValue: { value: data.estado } },
        { name: 'area', parameterType: { type: 'STRING' }, parameterValue: { value: data.area } },
        { name: 'horarioEntrada', parameterType: { type: 'STRING' }, parameterValue: { value: data.horarioEntrada } },
        { name: 'cargaHoraria', parameterType: { type: 'STRING' }, parameterValue: { value: data.cargaHoraria } },
        { name: 'diasLibres', parameterType: { type: 'STRING' }, parameterValue: { value: data.diasLibres } },
        { name: 'horaSalida', parameterType: { type: 'STRING' }, parameterValue: { value: data.horaSalida } },
        { name: 'job_title', parameterType: { type: 'STRING' }, parameterValue: { value: data.job_title } },
        { name: 'observaciones', parameterType: { type: 'STRING' }, parameterValue: { value: data.observaciones } },
        { name: 'approvedFromIP', parameterType: { type: 'STRING' }, parameterValue: { value: data.approvedFromIP } },
        { name: "log_track", parameterType: { type: "STRING" }, parameterValue: { value: data.log_track } },
      ],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();

    return { success: true, message: 'Agent form data updated successfully', data: responseData };
  } catch (error) {
    console.error('Error updating agent form data:', error);
    throw error;
  }
}
