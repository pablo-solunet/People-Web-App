import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';

// Se leen las configuraciones desde variables de entorno
const projectId = process.env.BIGQUERY_PROJECT_ID;
if (!projectId) {
  throw new Error('BIGQUERY_PROJECT_ID no está definido en las variables de entorno.');
}

const datasetId = process.env.BIGQUERY_DATASET_ID || 'z_people';
const tableId = process.env.BIGQUERY_TABLE_ID || 'permissions';

const credentials = process.env.BIGQUERY_CREDENTIALS
  ? JSON.parse(process.env.BIGQUERY_CREDENTIALS)
  : null;
if (!credentials) {
  throw new Error('BIGQUERY_CREDENTIALS no está definido en las variables de entorno.');
}

// Configuración de BigQuery usando las credenciales proporcionadas
const bigquery = new BigQuery({
  projectId,
  credentials,
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching permissions' },
      { status: 500 }
    );
  }
}
