import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';
import path from 'path';

const projectId = 'data-warehouse-311917';
const datasetId = 'z_people';
const tableId = 'user_permissions';

const bigquery = new BigQuery({
  keyFilename: path.join(process.cwd(), 'credencialesbq.json'),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const query = `
      SELECT user_permission_id, user_id, permission_id, resource, action
      FROM \`${projectId}.${datasetId}.${tableId}\`
      WHERE user_id = "${userId}"
    `;

    const [rows] = await bigquery.query({query});

    const userPermissions = rows.map((row: any) => ({
      user_permission_id: row.user_permission_id,
      user_id: row.user_id,
      permission_id: row.permission_id,
      resource: row.resource,
      action: row.action,
    }));

    console.log('-----------------------------------------');
    console.log('userPermissions:', userPermissions);

    return NextResponse.json({ success: true, userPermissions });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error fetching user permissions' }, { status: 500 });
  }
}

