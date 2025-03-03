import { projectId, datasetId, tableId, auth } from "@/lib/bigQueryConfig"

export async function deleteAgentFormData(id: string) {
  try {
    const query = `
      DELETE FROM \`${projectId}.${datasetId}.${tableId}\`
      WHERE id_reg = @id
    `;

    const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/queries`;

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken.token}`,
    };

    const requestBody = {
      query: query,
      useLegacySql: false,
      queryParameters: [
        {
          name: 'id',
          parameterType: { type: 'STRING' },
          parameterValue: { value: id },
        },
      ],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Error al eliminar el registro');
    }

    return { success: true, message: 'Datos del formulario de agente eliminados exitosamente', data };
  } catch (error) {
    console.error('Error deleting agent form data:', error);
    throw error;
  }
}
