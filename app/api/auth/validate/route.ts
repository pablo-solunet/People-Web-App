import { NextResponse } from "next/server"
import { BigQuery } from "@google-cloud/bigquery"

// Load credentials from environment variable
const credentials = process.env.BIGQUERY_CREDENTIALS ? JSON.parse(process.env.BIGQUERY_CREDENTIALS) : null

if (!credentials) {
  throw new Error("BIGQUERY_CREDENTIALS is not defined in environment variables.")
}

const projectId = process.env.BIGQUERY_PROJECT_ID
if (!projectId) {
  throw new Error("BIGQUERY_PROJECT_ID is not defined in environment variables.")
}

const bigquery = new BigQuery({
  projectId,
  credentials,
})

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    // Validate the token (this is a simplified example, you should use a proper token validation method)
    const tokenQuery = `
      SELECT user_id, username
      FROM \`${projectId}.z_people.users\`
      WHERE token = "${token}"
    `

    const [tokenRows] = await bigquery.query({ query: tokenQuery })

    if (tokenRows.length > 0) {
      const userId = tokenRows[0].user_id
      const username = tokenRows[0].username

      const permissionsQuery = `
        SELECT resource, CONCAT(resource, '-', action) as action
        FROM \`${projectId}.z_people.user_permissions\`
        WHERE user_id = "${userId}"
        GROUP BY 1, 2
      `

      const [permissionsRows] = await bigquery.query({ query: permissionsQuery })

      const permissions = Array.from(new Set(permissionsRows.map((row: any) => row.resource)))
      const actions = Array.from(new Set(permissionsRows.map((row: any) => row.action)))

      return NextResponse.json({ success: true, userId, username, permissions, actions })
    } else {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
  } catch (error) {
    console.error("Error during token validation:", error)
    return NextResponse.json({ error: "Token validation failed" }, { status: 500 })
  }
}

