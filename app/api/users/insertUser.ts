import { BigQuery } from '@google-cloud/bigquery';
import { GoogleAuth } from 'google-auth-library';

// Configuración mediante variables de entorno
const projectId = process.env.BIGQUERY_PROJECT_ID;
if (!projectId) {
  throw new Error('BIGQUERY_PROJECT_ID no está definido en las variables de entorno.');
}

const datasetId = process.env.BIGQUERY_DATASET_ID || 'z_people';
// Para la tabla de usuarios puedes usar una variable específica o el valor por defecto
const tableId = process.env.BIGQUERY_USERS_TABLE_ID || 'users';

const credentials = process.env.BIGQUERY_CREDENTIALS
  ? JSON.parse(process.env.BIGQUERY_CREDENTIALS)
  : null;
if (!credentials) {
  throw new Error('BIGQUERY_CREDENTIALS no está definido en las variables de entorno.');
}

// Configuración de autenticación y cliente de BigQuery usando las credenciales
const auth = new GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/bigquery'],
});

const bigquery = new BigQuery({
  projectId,
  credentials,
});

// Función para generar username a partir del email
function generateUsername(email: string): string {
  return email.split('@')[0];
}

// Función para obtener el ID de empleado y legajo desde Odoo
async function getEmployeeId(email: string): Promise<{ employeeId: string | null; legajo: string | null }> {
  // Se utiliza el projectId obtenido de la variable de entorno
  const query = `
    SELECT id, global_file
    FROM \`${projectId}.Odoo.tbl_Employees\`
    WHERE work_email = "${email}"
    LIMIT 1
  `;

  const [rows] = await bigquery.query({ query });

  if (rows.length > 0) {
    return { employeeId: rows[0].id, legajo: rows[0].global_file };
  }

  return { employeeId: null, legajo: null };
}

// Función para verificar si ya existe el usuario en la tabla de usuarios
async function checkExistingUser(email: string): Promise<boolean> {
  const query = `
    SELECT COUNT(*) as count
    FROM \`${projectId}.${datasetId}.${tableId}\`
    WHERE email = "${email}"
  `;

  const [rows] = await bigquery.query({ query });
  return rows[0].count > 0;
}

// Función para insertar un nuevo usuario
export async function insertUser(email: string, password: string) {
  try {
    // Verificar si el usuario ya existe
    const userExists = await checkExistingUser(email);
    if (userExists) {
      throw new Error('User with this email already exists');
    }

    // Verificar si existe el empleado en Odoo
    const { employeeId, legajo } = await getEmployeeId(email);
    if (!employeeId) {
      throw new Error('No matching employee found in Odoo');
    }

    // Generar el username a partir del email
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
