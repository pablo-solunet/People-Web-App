import { GoogleAuth } from 'google-auth-library';

// Leer configuraciones desde variables de entorno
const projectId = process.env.BIGQUERY_PROJECT_ID;
if (!projectId) {
  throw new Error('BIGQUERY_PROJECT_ID no está definido en las variables de entorno.');
}

const datasetId = process.env.BIGQUERY_DATASET_ID || 'z_people';
const tableId = process.env.BIGQUERY_TABLE_ID || 'agent_form_data';

const credentials = process.env.BIGQUERY_CREDENTIALS
  ? JSON.parse(process.env.BIGQUERY_CREDENTIALS)
  : null;
if (!credentials) {
  throw new Error('BIGQUERY_CREDENTIALS no está definido en las variables de entorno.');
}

const auth = new GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/bigquery'],
});

export async function insertAgentFormData(data: any[]) {
  try {
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken.token}`,
    };

    // console.log("DATOS RECIBIDOS");
    // console.log(data);

    const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/queries`;

    if (data && data.length > 0) {
      // Construir la consulta de inserción usando parámetros nombrados
      const query = `
          INSERT INTO \`${projectId}.${datasetId}.${tableId}\`
          (
            id_reg, lote_id, requisition_id, created_by, pais, fechaIngreso, cliente, canal,
            compania, horarioIn, horarioOut, job_title, jobDescription, puesto,
            observaciones, estado, cargaHoraria,
            lunes_in, lunes_out, martes_in, martes_out, miercoles_in, miercoles_out,
            jueves_in, jueves_out, viernes_in, viernes_out, sabado_in, sabado_out,
            domingo_in, domingo_out,
            area
          )
          VALUES
            ${data.map((_, index) =>
              `(@id_reg${index}, @lote_id${index}, @requisition_id${index}, @created_by${index}, @pais${index},
                @fechaIngreso${index}, @cliente${index}, @canal${index}, @compania${index}, @horarioIn${index}, @horarioOut${index},
                @job_title${index}, @jobDescription${index}, @puesto${index}, @observaciones${index}, @estado${index}, @cargaHoraria${index},
                @lunes_in${index}, @lunes_out${index}, @martes_in${index}, @martes_out${index}, @miercoles_in${index}, @miercoles_out${index},
                @jueves_in${index}, @jueves_out${index}, @viernes_in${index}, @viernes_out${index}, @sabado_in${index}, @sabado_out${index},
                @domingo_in${index}, @domingo_out${index},
                @area${index})`
            ).join(',')}
      `;

      const insertQueryParameters = data.flatMap((p, index) => [
        { name: `id_reg${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.id_reg } },
        { name: `lote_id${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.lote_id } },
        { name: `requisition_id${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.requisition_id } },
        { name: `created_by${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.created_by } },
        { name: `pais${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.pais } },
        { name: `fechaIngreso${index}`, parameterType: { type: 'DATE' }, parameterValue: { value: p.fechaIngreso } },
        { name: `cliente${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.cliente } },
        { name: `canal${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.canal } },
        { name: `compania${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.compania } },
        { name: `horarioIn${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.horarioIn } },
        { name: `horarioOut${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.horarioOut } },
        { name: `job_title${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.job_title } },
        { name: `jobDescription${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.jobDescription } },
        { name: `puesto${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.puesto } },
        { name: `observaciones${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.observaciones } },
        { name: `estado${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.estado } },
        { name: `cargaHoraria${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.cargaHoraria } },
        { name: `lunes_in${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.lunes_in } },
        { name: `lunes_out${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.lunes_out } },
        { name: `martes_in${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.martes_in } },
        { name: `martes_out${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.martes_out } },
        { name: `miercoles_in${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.miercoles_in } },
        { name: `miercoles_out${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.miercoles_out } },
        { name: `jueves_in${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.jueves_in } },
        { name: `jueves_out${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.jueves_out } },
        { name: `viernes_in${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.viernes_in } },
        { name: `viernes_out${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.viernes_out } },
        { name: `sabado_in${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.sabado_in } },
        { name: `sabado_out${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.sabado_out } },
        { name: `domingo_in${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.domingo_in } },
        { name: `domingo_out${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.domingo_out } },
        { name: `area${index}`, parameterType: { type: 'STRING' }, parameterValue: { value: p.area } },
      ]);

      const requestBody = {
        query: query,
        useLegacySql: false,
        parameterMode: 'NAMED',
        queryParameters: insertQueryParameters,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      
      return { success: true, message: 'Solicitud Creada Exitosamente', data: responseData };
    }
  } catch (error) {
    console.error('Error Insertando Datos:', error);
    throw error;
  }
}
