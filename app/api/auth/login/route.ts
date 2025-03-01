import { BigQuery } from '@google-cloud/bigquery';
import { NextResponse } from 'next/server';

// Carga las credenciales desde la variable de entorno (almacena el JSON como string)
const credentials = process.env.BIGQUERY_CREDENTIALS
  ? JSON.parse(process.env.BIGQUERY_CREDENTIALS)
  : null;

if (!credentials) {
  throw new Error('BIGQUERY_CREDENTIALS no está definida en las variables de entorno.');
}

const projectId = process.env.BIGQUERY_PROJECT_ID;
if (!projectId) {
  throw new Error('BIGQUERY_PROJECT_ID no está definida en las variables de entorno.');
}

const bigquery = new BigQuery({
  projectId,
  credentials,
});

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Nota: considera usar consultas parametrizadas para evitar inyección SQL.
    const userQuery = `
      SELECT user_id
      FROM \`${projectId}.z_people.users\`
      WHERE username = "${username}" AND password = "${password}"
    `;

    const [userRows] = await bigquery.query({ query: userQuery });

    if (userRows.length > 0) {
      const userId = userRows[0].user_id;

      const permissionsQuery = `
        SELECT resource, CONCAT(resource, '-', action) as action
        FROM \`${projectId}.z_people.user_permissions\`
        WHERE user_id = "${userId}"
        GROUP BY 1, 2
      `;

      console.log(permissionsQuery);

      const [permissionsRows] = await bigquery.query({ query: permissionsQuery });
      
      const permissions = Array.from(new Set(permissionsRows.map((row: any) => row.resource)));
      const actions = Array.from(new Set(permissionsRows.map((row: any) => row.action)));

      console.log('Permissions:', permissions);
      console.log('Actions:', actions);

      return NextResponse.json({ success: true, userId, username, permissions, actions });
    } else {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error during authentication:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}