import { type NextRequest, NextResponse } from "next/server"
import { auth, bigquery, projectId, datasetId, table_agent_form } from "@/lib/bigQueryConfig"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const count = Number.parseInt(searchParams.get("count") || "1", 10)

    const queryForLastId = `
      SELECT requisition_id
      FROM \`${projectId}.${datasetId}.${table_agent_form}\`
      ORDER BY CAST(REGEXP_EXTRACT(requisition_id, r'RQ-0*([0-9]+)') AS INT64) DESC
      LIMIT 1
    `

    const client = await auth.getClient()
    const accessToken = await client.getAccessToken()

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken.token}`,
    }

    const requestBody = {
      query: queryForLastId,
      useLegacySql: false,
    }

    const response = await fetch(
      `https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/queries`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      },
    )

    const result = await response.json()

    // Extraer el número del último ID o comenzar desde 1
    let lastNumber = 0

    if (result && result.rows && result.rows.length > 0) {
      const lastRequisitionId = result.rows[0].f[0].v
      const match = lastRequisitionId.match(/RQ-(\d+)/)
      if (match && match[1]) {
        lastNumber = Number.parseInt(match[1], 10)
      }
    }

    // Generar los nuevos IDs secuenciales
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const loteId = `LOT-${Date.now()}-${Math.floor(Math.random() * 1000)}-${year}${month}${day}`

    const ids = Array.from({ length: count }, (_, index) => ({
      id_reg: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lote_id: loteId,
      requisition_id: `RQ-${String(lastNumber + 1 + index).padStart(5, "0")}`
    }))

    return NextResponse.json({
      success: true,
      ids,
    })
  } catch (error) {
    console.error("Error al generar secuencia:", error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

