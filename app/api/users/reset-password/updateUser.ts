import { projectId, datasetId, table_users, auth } from "@/lib/bigQueryConfig"

export async function updateUser(
  userId: string,
  body: { username: string; legajo: string; is_active: boolean }
) {
  try {
    const { username, legajo, is_active } = body;

    const query = `
      UPDATE \`${projectId}.${datasetId}.${table_users}\`
      SET username = "${username}", legajo = "${legajo}", is_active = ${is_active}, updated_at = CURRENT_TIMESTAMP()
      WHERE user_id = '${userId}'
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

    return { success: true, message: 'User updated successfully' };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}
