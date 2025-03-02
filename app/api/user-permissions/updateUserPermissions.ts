import { GoogleAuth } from 'google-auth-library';

// Se leen las configuraciones desde las variables de entorno
const projectId = process.env.BIGQUERY_PROJECT_ID;
if (!projectId) {
  throw new Error('BIGQUERY_PROJECT_ID no está definido en las variables de entorno.');
}

const datasetId = process.env.BIGQUERY_DATASET_ID || 'z_people';
const tableId = process.env.BIGQUERY_TABLE_ID || 'user_permissions';

const credentials = process.env.BIGQUERY_CREDENTIALS
  ? JSON.parse(process.env.BIGQUERY_CREDENTIALS)
  : null;
if (!credentials) {
  throw new Error('BIGQUERY_CREDENTIALS no está definido en las variables de entorno.');
}

const auth = new GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/bigquery'],
});

export async function updateUserPermissions(
  userId: string,
  permissionsToAdd: any[],
  permissionsToRemove: any[]
) {
  try {
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    console.log("Permissions to ADD", permissionsToAdd);

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken.token}`,
    };

    const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/queries`;

    // Eliminar permisos
    if (permissionsToRemove && permissionsToRemove.length > 0) {
      const deleteQuery = `
        DELETE FROM \`${projectId}.${datasetId}.${tableId}\`
        WHERE user_id = @userId
        AND user_permission_id IN UNNEST(@permissionIds)
      `;

      const deleteRequestBody = {
        query: deleteQuery,
        useLegacySql: false,
        parameterMode: 'NAMED',
        queryParameters: [
          { name: 'userId', parameterType: { type: 'STRING' }, parameterValue: { value: userId } },
          {
            name: 'permissionIds',
            parameterType: { type: 'ARRAY', arrayType: { type: 'STRING' } },
            parameterValue: { arrayValues: permissionsToRemove.map(p => ({ value: p.user_permission_id })) },
          },
        ],
      };

      const deleteResponse = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(deleteRequestBody),
      });

      const deleteData = await deleteResponse.json();

      if (deleteData.errors) {
        throw new Error('Delete query errors occurred: ' + JSON.stringify(deleteData.errors));
      }
    }

    // Agregar permisos
    if (permissionsToAdd && permissionsToAdd.length > 0) {
      const insertQuery = `
        INSERT INTO \`${projectId}.${datasetId}.${tableId}\`
        (user_permission_id, user_id, permission_id, resource, action)
        VALUES
        ${permissionsToAdd
          .map(
            (_, index) =>
              `(@user_permission_id${index}, @userId${index}, @permission_id${index}, @resource${index}, @action${index})`
          )
          .join(',')}
      `;

      // console.log("----------- insertQuery:", insertQuery);

      const insertQueryParameters = permissionsToAdd.flatMap((p, index) => [
        { name: `user_permission_id${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.user_permission_id } },
        { name: `userId${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: userId } },
        { name: `permission_id${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.permission_id } },
        { name: `resource${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.resource } },
        { name: `action${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.action } },
      ]);

      // console.log("----------- insertQueryParameters:", insertQueryParameters);

      const insertRequestBody = {
        query: insertQuery,
        useLegacySql: false,
        parameterMode: 'NAMED',
        queryParameters: insertQueryParameters,
      };

      const insertResponse = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(insertRequestBody),
      });

      const insertData = await insertResponse.json();

      if (insertData.errors) {
        throw new Error('Insert query errors occurred: ' + JSON.stringify(insertData.errors));
      }
    }

    return {
      success: true,
      message: 'User permissions updated successfully',
      addedCount: permissionsToAdd ? permissionsToAdd.length : 0,
      removedCount: permissionsToRemove ? permissionsToRemove.length : 0,
    };
  } catch (error) {
    console.error('Error updating user permissions:', error);
    throw error;
  }
}
