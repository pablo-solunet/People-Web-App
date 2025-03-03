import { projectId, datasetId, tableId, auth } from "@/lib/bigQueryConfig"

export async function deleteUser(userId: string) {
  try {
    const query = `
      DELETE FROM \`${projectId}.${datasetId}.${tableId}\`
      WHERE user_id = @userId
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
      parameterMode: 'NAMED',
      queryParameters: [
        { name: 'userId', parameterType: { type: 'STRING' }, parameterValue: { value: userId } },
      ],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
