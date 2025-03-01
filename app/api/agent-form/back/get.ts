import { GoogleAuth } from 'google-auth-library';
import path from 'path';

const projectId = 'data-warehouse-311917';
const datasetId = 'z_people';
const tableId = 'agent_form_data';

const auth = new GoogleAuth({
  keyFilename: path.join(process.cwd(), 'credencialesbq.json'),
  scopes: ['https://www.googleapis.com/auth/bigquery'],
});

export async function getAgentFormData(id?: string | null) {
  try {
    let query;
    let queryParameters = [];

    if (id) {
      query = `
        SELECT * FROM \`${projectId}.${datasetId}.${tableId}\`
        WHERE id = @id
      `;
      queryParameters.push({ name: 'id', parameterType: { type: 'STRING' }, parameterValue: { value: id } });
    } else {
      query = `
        SELECT * FROM \`${projectId}.${datasetId}.${tableId}\`
      `;
    }

    console.log("------- query : ", query)

    const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/queries`;

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken.token}`,
    };

    // const requestBody = {
    //   query: query,
    //   useLegacySql: false,
    //   parameterMode: 'NAMED',
    //   queryParameters: queryParameters,
    // };
    const requestBody = {
      query: query,
      useLegacySql: false,
    };

    // const response = await fetch(url, {
    //   method: 'POST',
    //   headers,
    //   body: JSON.stringify(requestBody),
    // });
    
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

