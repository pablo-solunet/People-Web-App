import { bigquery, projectId, datasetId, table_users, table_user_permissions } from "@/lib/bigQueryConfig"
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // evitar inyección SQL.
    const userQuery = `
      SELECT user_id
      FROM \`${projectId}.${datasetId}.${table_users}\`
      WHERE username = "${username}" AND password = "${password}"
    `;

    const [userRows] = await bigquery.query({ query: userQuery });

    if (userRows.length > 0) {
      const userId = userRows[0].user_id;

      // Generar un token
      // const token = crypto.randomBytes(64).toString("hex")

      // Guardar el token en la base de datos
      // const updateTokenQuery = `
      //   UPDATE \`${projectId}.z_people.users\`
      //   SET token = "${token}"
      //   WHERE user_id = "${userId}"
      // `
      // await bigquery.query({ query: updateTokenQuery })

      const permissionsQuery = `
        SELECT resource, CONCAT(resource, '-', action) as action
        FROM \`${projectId}.${datasetId}.${table_user_permissions}\`
        WHERE user_id = "${userId}"
        GROUP BY 1, 2
      `;

      const [permissionsRows] = await bigquery.query({ query: permissionsQuery });
      const permissions = Array.from(new Set(permissionsRows.map((row: any) => row.resource)));
      const actions = Array.from(new Set(permissionsRows.map((row: any) => row.action)));

      // return NextResponse.json({ success: true, userId, username, permissions, actions, token })
      return NextResponse.json({ success: true, userId, username, permissions, actions })
      } else {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }
  } catch (error) {
    console.error('Error during authentication:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}