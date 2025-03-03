import { projectId, datasetId, tableId, auth } from "@/lib/bigQueryConfig"

export async function getAgentFormData(id?: string | null) {
  try {
    let query: string;
    interface QueryParameter {
      name: string;
      parameterType: { type: string };
      parameterValue: { value: string };
    }
    let queryParameters: QueryParameter[] = [];
    

    if (id) {
      query = `
        SELECT * FROM \`${projectId}.${datasetId}.${tableId}\`
        WHERE id = @id
      `;
      queryParameters.push({
        name: 'id',
        parameterType: { type: 'STRING' },
        parameterValue: { value: id },
      });
    } else {
      query = `
        SELECT * FROM \`${projectId}.${datasetId}.${tableId}\`
      `;
    }

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
      parameterMode: 'NAMED',
      queryParameters: queryParameters,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });
    
    const data = await response.json();

    return { success: true, data: data.rows };
  } catch (error) {
    console.error('Error getting agent form data:', error);
    throw error;
  }
}
