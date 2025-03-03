import { GoogleAuth } from "google-auth-library"
import { BigQuery } from "@google-cloud/bigquery"

// Se leen las configuraciones desde variables de entorno
const projectId = process.env.BIGQUERY_PROJECT_ID
if (!projectId) {
  throw new Error("BIGQUERY_PROJECT_ID no está definido en las variables de entorno.")
}

const datasetId = process.env.BIGQUERY_DATASET_ID || "z_people"
const tableId = process.env.BIGQUERY_TABLE_ID || "agent_form_data"

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

export { projectId, datasetId, tableId, auth, bigquery }

