import { BigQuery } from '@google-cloud/bigquery';
import { NextResponse } from 'next/server';
import path from 'path';

const bigquery = new BigQuery({
  keyFilename: path.join(process.cwd(), 'credencialesbq.json'),
});

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const userQuery = `
      SELECT user_id
      FROM \`data-warehouse-311917.z_people.users\`
      WHERE username = "${username}" AND password = "${password}"
    `;

    const [userRows] = await bigquery.query({ query: userQuery });

    if (userRows.length > 0) {
      const userId = userRows[0].user_id;

      const permissionsQuery = `
        SELECT resource, concat(resource,'-',action) as action
        FROM \`data-warehouse-311917.z_people.user_permissions\`
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

