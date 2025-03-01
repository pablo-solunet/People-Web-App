import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import path from 'path';

const projectId = 'data-warehouse-311917';
const datasetId = 'z_people';
const tableId = 'FormData';

const auth = new GoogleAuth({
  keyFilename: path.join(process.cwd(), 'credencialesbq.json'),
  scopes: ['https://www.googleapis.com/auth/bigquery'],
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, lotId, requisitionId, channel } = body;
    
    const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/jobs`;
    
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken.token}`,
    };

    const query = `
      UPDATE \`${projectId}.${datasetId}.${tableId}\`
      SET lotId = @lotId, requisitionId = @requisitionId, channel = @channel
      WHERE id = @id
    `;

    const requestBody = {
      configuration: {
        query: {
          query: query,
          useLegacySql: false,
          queryParameters: [
            { name: 'lotId', parameterType: { type: 'STRING' }, parameterValue: { value: lotId } },
            { name: 'requisitionId', parameterType: { type: 'STRING' }, parameterValue: { value: requisitionId } },
            { name: 'channel', parameterType: { type: 'STRING' }, parameterValue: { value: channel } },
            { name: 'id', parameterType: { type: 'STRING' }, parameterValue: { value: id } },
          ],
        },
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (response.status !== 200) {
      throw new Error(`Error executing query: ${data.error?.message || 'Unknown error'}`);
    }

    return NextResponse.json({ success: true, message: 'Data updated successfully' });
  } catch (error) {
    console.error('Error updating data:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error updating data' }, { status: 500 });
  }
}

