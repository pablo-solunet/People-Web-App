import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';
import path from 'path';

const projectId = 'data-warehouse-311917';
const datasetId = 'z_people';
const tableId = 'permissions';

const bigquery = new BigQuery({
  keyFilename: path.join(process.cwd(), 'credencialesbq.json'),
});

export async function GET() {
  try {
    const query = `
      SELECT permission_id, resource, action, description
      FROM \`${projectId}.${datasetId}.${tableId}\`
    `;

    const [rows] = await bigquery.query({ query });

    const permissions = rows.map((row: any) => ({
      permission_id: row.permission_id,
      resource: row.resource,
      action: row.action,
      description: row.description,
    }));

    return NextResponse.json({ success: true, permissions });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error fetching permissions' }, { status: 500 });
  }
}

