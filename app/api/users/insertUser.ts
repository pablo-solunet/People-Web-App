import { BigQuery } from '@google-cloud/bigquery';
import { GoogleAuth } from 'google-auth-library';
import path from 'path';

const projectId = 'data-warehouse-311917';
const datasetId = 'z_people';
const tableId = 'users';

const auth = new GoogleAuth({
  keyFilename: path.join(process.cwd(), 'credencialesbq.json'),
  scopes: ['https://www.googleapis.com/auth/bigquery'],
});

const bigquery = new BigQuery({
  keyFilename: path.join(process.cwd(), 'credencialesbq.json'),
});

function generateUsername(email: string): string {
  return email.split('@')[0];
}

async function getEmployeeId(email: string): Promise<{ employeeId: string | null; legajo: string | null }> {
  const query = `
    SELECT id, global_file
    FROM \`data-warehouse-311917.Odoo.tbl_Employees\`
    WHERE work_email = "${email}"
    LIMIT 1
  `;

  const [rows] = await bigquery.query({ query });

  if (rows.length > 0) {
    return { employeeId: rows[0].id, legajo: rows[0].global_file };
  }

  return { employeeId: null, legajo: null };
}

async function checkExistingUser(email: string): Promise<boolean> {
  const query = `
    SELECT COUNT(*) as count
    FROM \`${projectId}.${datasetId}.${tableId}\`
    WHERE email = "${email}"
  `;

  const [rows] = await bigquery.query({ query });

  return rows[0].count > 0;
}

export async function insertUser(email: string, password: string) {
  try {
    // Check if user already exists in the users table
    const userExists = await checkExistingUser(email);
    if (userExists) {
      throw new Error('User with this email already exists');
    }

    // Check if employee exists in Odoo
    const { employeeId, legajo } = await getEmployeeId(email);
    if (!employeeId) {
      throw new Error('No matching employee found in Odoo');
    }

    // Generate username from email
    const username = generateUsername(email);

    const query = `
      INSERT INTO \`${projectId}.${datasetId}.${tableId}\`
      (user_id, email, username, password, legajo)
      VALUES(@user_id, @email, @username, @password, @legajo)
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
        { name: 'user_id', parameterType: { type: 'STRING' }, parameterValue: { value: employeeId } },
        { name: 'email', parameterType: { type: 'STRING' }, parameterValue: { value: email } },
        { name: 'username', parameterType: { type: 'STRING' }, parameterValue: { value: username } },
        { name: 'password', parameterType: { type: 'STRING' }, parameterValue: { value: password } },
        { name: 'legajo', parameterType: { type: 'STRING' }, parameterValue: { value: legajo } },
      ],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    return { success: true, message: 'User created successfully' };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

