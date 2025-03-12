import { GoogleAuth } from "google-auth-library"
import { BigQuery } from "@google-cloud/bigquery"

// Se leen las configuraciones desde variables de entorno
const projectId = process.env.BIGQUERY_PROJECT_ID
if (!projectId) {
  throw new Error("BIGQUERY_PROJECT_ID no está definido en las variables de entorno.")
}

const datasetId = process.env.BIGQUERY_DATASET_ID || "People"

const table_agent_form = process.env.BIGQUERY_TABLE_AGENT_FORM || "agent_form_data"
const table_staff_form_data = process.env.BIGQUERY_TABLE_STAFF_FORM || "staff_form_data"
const table_users = process.env.BIGQUERY_TABLE_USER || "users"
const table_permissions = process.env.BIGQUERY_TABLE_PERMISSIONS || "permissions"
const table_user_permissions = process.env.BIGQUERY_TABLE_USER_PERMISSIONS || "user_permissions"

const credentials = process.env.BIGQUERY_CREDENTIALS ? JSON.parse(process.env.BIGQUERY_CREDENTIALS) : null
if (!credentials) {
  throw new Error("BIGQUERY_CREDENTIALS no está definido en las variables de entorno.")
}

// Configuración de autenticación usando las credenciales obtenidas
const auth = new GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/bigquery"],
})

// Configuración de BigQuery
const bigquery = new BigQuery({
  projectId,
  credentials,
})

export { projectId, datasetId, auth, bigquery, table_agent_form, table_staff_form_data, table_users, table_permissions, table_user_permissions}

