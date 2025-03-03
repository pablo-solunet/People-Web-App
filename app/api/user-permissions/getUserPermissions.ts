import { projectId, datasetId, tableId, auth } from "@/lib/bigQueryConfig"
import { GoogleAuth } from 'google-auth-library';

export async function getUserPermissions(userId: string) {
  try {
    const query = `
      SELECT user_permission_id, user_id, permission_id, resource, action
      FROM \`${projectId}.${datasetId}.${tableId}\`
      WHERE user_id = "${userId}"
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
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error('Query errors occurred: ' + JSON.stringify(data.errors));
    }

    const userPermissions = data.rows
      ? data.rows.map((row: any) => ({
          user_permission_id: row.f[0].v,
          user_id: row.f[1].v,
          permission_id: row.f[2].v,
          resource: row.f[3].v,
          action: row.f[4].v,
        }))
      : [];

    return { success: true, userPermissions };
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    throw error;
  }
}
