import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import path from 'path';

const projectId = 'data-warehouse-311917';
const datasetId = 'z_people';
const tableId = 'formData';

const auth = new GoogleAuth({
  keyFilename: path.join(process.cwd(), 'credencialesbq.json'),
  scopes: ['https://www.googleapis.com/auth/bigquery'],
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, lotId, requisitionId, country, channel } = body;
    
    console.log('Received data:', body);

    const query = `
      INSERT INTO \`${projectId}.${datasetId}.${tableId}\`
      (id, lotId, requisitionId, country, channel)
      VALUES
      (@id, @lotId, @requisitionId, @country, @channel)
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
      parameterMode: 'NAMED',
      queryParameters: [
        { name: 'id', parameterType: { type: 'STRING' }, parameterValue: { value: id } },
        { name: 'lotId', parameterType: { type: 'STRING' }, parameterValue: { value: lotId } },
        { name: 'requisitionId', parameterType: { type: 'STRING' }, parameterValue: { value: requisitionId } },
        { name: 'country', parameterType: { type: 'STRING' }, parameterValue: { value: country } },
        { name: 'channel', parameterType: { type: 'STRING' }, parameterValue: { value: channel } },
      ],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('Query response:', data);

    if (data.errors) {
      throw new Error('Query errors occurred: ' + JSON.stringify(data.errors));
    }

    return NextResponse.json({ success: true, message: 'Data inserted successfully' });
  } catch (error) {
    console.error('Error inserting data:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: 'Error inserting data', 
        message: error.message,
        stack: error.stack
      }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

