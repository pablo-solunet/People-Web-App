import { NextRequest, NextResponse } from 'next/server';
import { insertAgentFormData } from './insert';
import { getAgentFormData } from './get';
import { updateAgentFormData } from './update';
import { deleteAgentFormData } from './delete';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const data = await getAgentFormData(id);
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { registrosToInsert } = body;

    const result = await insertAgentFormData(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Obtener la IP del cliente desde los headers
    const forwardedFor = request.headers.get("x-forwarded-for")
    const clientIP = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown"

    // obtener la IP real
    const realIP = request.headers.get("x-real-ip") || clientIP

    // Añadir la IP al objeto body que se pasa a la función de actualización
    const dataWithIP = {
      ...body,
      approvedFromIP: realIP,
    }

    console.log('---------- Data Received:', body);
    //GENERAMOS los resultados ya con el Body incluido
    const result = await updateAgentFormData(dataWithIP)

    return NextResponse.json({
      ...result,
      data: {
        ...result.data,
        approvedFromIP: realIP,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    const result = await deleteAgentFormData(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in DELETE handler:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


