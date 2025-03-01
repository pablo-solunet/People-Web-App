import { BigQuery } from '@google-cloud/bigquery';
import path from 'path';

const projectId = 'data-warehouse-311917';
const datasetId = 'z_people';
const tableId = 'users';

const bigquery = new BigQuery({
  keyFilename: path.join(process.cwd(), 'credencialesbq.json'),
});

export async function getUsers() {
  try {
    const query = `
      SELECT user_id, email, username, legajo, created_at, updated_at, is_active
      FROM \`${projectId}.${datasetId}.${tableId}\`
    `;

    const [rows] = await bigquery.query({ query });

    const users = rows.map((row: any) => ({
      user_id: row.user_id,
      email: row.email,
      username: row.username,
      legajo: row.legajo,
      created_at: row.created_at,
      updated_at: row.updated_at,
      is_active: row.is_active,
    }));

    return { success: true, users };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

