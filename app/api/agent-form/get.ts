import { GoogleAuth } from 'google-auth-library';

// Se leen las configuraciones desde las variables de entorno
const projectId = process.env.BIGQUERY_PROJECT_ID;
if (!projectId) {
  throw new Error('BIGQUERY_PROJECT_ID no está definido en las variables de entorno.');
}

const datasetId = process.env.BIGQUERY_DATASET_ID || 'z_people';
const tableId = process.env.BIGQUERY_TABLE_ID || 'agent_form_data';

const credentials = process.env.BIGQUERY_CREDENTIALS
  ? JSON.parse(process.env.BIGQUERY_CREDENTIALS)
  : null;
if (!credentials) {
  throw new Error('BIGQUERY_CREDENTIALS no está definido en las variables de entorno.');
}

// Configuramos GoogleAuth usando las credenciales proporcionadas
const auth = new GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/bigquery'],
});

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

    // console.log("------- query:", query);

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

    // console.log("------- data:", JSON.stringify(data));

    return { success: true, data: data.rows };
  } catch (error) {
    console.error('Error getting agent form data:', error);
    throw error;
  }
}
