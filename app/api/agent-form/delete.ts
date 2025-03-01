import { GoogleAuth } from 'google-auth-library';
import path from 'path';

const projectId = 'data-warehouse-311917';
const datasetId = 'z_people';
const tableId = 'agent_form_data';

const auth = new GoogleAuth({
  keyFilename: path.join(process.cwd(), 'credencialesbq.json'),
  scopes: ['https://www.googleapis.com/auth/bigquery'],
});

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
      throw new Error(data.error.message || 'Failed to delete record');
    }

    return { success: true, message: 'Agent form data deleted successfully', data };
  } catch (error) {
    console.error('Error deleting agent form data:', error);
    throw error;
  }
}