import { BigQuery } from '@google-cloud/bigquery';
import { NextResponse } from 'next/server';
import path from 'path';

const bigquery = new BigQuery({
  keyFilename: path.join(process.cwd(), 'credencialesbq.json'),
});

export async function GET() {
  try {
    const query = `
      SELECT user_permission_id, user_id, permission_id, resource, action, permission_description
      FROM \`data-warehouse-311917.z_people.user_permissions_view\`
      LIMIT 100
    `;

    const [rows] = await bigquery.query({ query });

    console.log('Datos obtenidos de BigQuery:', rows);

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('Error fetching data from BigQuery:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error fetching data' }, { status: 500 });
  }
}

