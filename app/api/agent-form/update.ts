import { projectId, datasetId, tableId, auth } from "@/lib/bigQueryConfig"

export async function updateAgentFormData(data: any) {
  try {
    // Extraer variables relevantes del objeto recibido
    const { isLote, lote_id, id_reg, estado, area, legajo, observaciones } = data;

    // parametrizar estos valores para evitar inyección SQL.
    const query = `
      UPDATE \`${projectId}.${datasetId}.${tableId}\`
      SET 
        estado = "${estado}",
        area = "${area}",
        legajo = CASE
          WHEN "${legajo}" IS NOT NULL AND "${legajo}" != '' AND "${legajo}" != 'undefined' 
            THEN "${legajo}"
            ELSE legajo
        END,
        observaciones = CASE
          WHEN observaciones IS NOT NULL AND observaciones != '' AND "${observaciones}" IS NOT NULL AND "${observaciones}" != '' AND "${observaciones}" != 'undefined' 
            THEN CONCAT("${observaciones}", '; ', observaciones)
          WHEN observaciones IS NULL OR observaciones = '' OR observaciones = 'undefined'
            THEN "${observaciones}"
          ELSE observaciones
        END
      WHERE id_reg = "${id_reg}"
    `;


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
