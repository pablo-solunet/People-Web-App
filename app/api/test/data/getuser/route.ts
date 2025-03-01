import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';
import path from 'path';

const projectId = 'data-warehouse-311917';
const datasetId = 'z_people';
const tableId = 'users';

const bigquery = new BigQuery({
  keyFilename: path.join(process.cwd(), 'credencialesbq.json'),
});

export async function GET() {
  try {
    const query = `
      SELECT user_id, email, username, legajo, is_active, created_at, updated_at
      FROM \`${projectId}.${datasetId}.${tableId}\`
      ORDER BY created_at DESC
      LIMIT 100
    `;

    const [rows] = await bigquery.query({ query });

    const users = rows.map((row: any) => ({
      user_id: row.user_id,
      email: row.email,
      username: row.username,
      legajo: row.legajo,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error fetching users' },
      { status: 500 }
    );
  }
}

