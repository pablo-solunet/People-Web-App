import { bigquery, projectId, datasetId, tableId } from "@/lib/bigQueryConfig"
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const query = `
      SELECT permission_id, resource, action, description
      FROM \`${projectId}.${datasetId}.${tableId}\`
    `;

    const [rows] = await bigquery.query({ query });

    const permissions = rows.map((row: any) => ({
      permission_id: row.permission_id,
      resource: row.resource,
      action: row.action,
      description: row.description,
    }));

    return NextResponse.json({ success: true, permissions });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching permissions' },
      { status: 500 }
    );
  }
}
