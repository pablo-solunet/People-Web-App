import { projectId, datasetId, table_users, auth } from "@/lib/bigQueryConfig"

export async function updateUserPass(
  userId: string,
  password: string,
) {
  try {
    const query = `
      UPDATE \`${projectId}.${datasetId}.${table_users}\`
      SET password = "${password}"
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

    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}
