import { BigQuery } from '@google-cloud/bigquery';

const projectId = process.env.BIGQUERY_PROJECT_ID;
if (!projectId) {
  throw new Error('BIGQUERY_PROJECT_ID no está definido en las variables de entorno.');
}

const datasetId = process.env.BIGQUERY_DATASET_ID || 'z_people';
const tableId = process.env.BIGQUERY_USERS_TABLE_ID || 'users';

const credentials = process.env.BIGQUERY_CREDENTIALS
  ? JSON.parse(process.env.BIGQUERY_CREDENTIALS)
  : null;
if (!credentials) {
  throw new Error('BIGQUERY_CREDENTIALS no está definido en las variables de entorno.');
}

const bigquery = new BigQuery({
  projectId,
  credentials,
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
