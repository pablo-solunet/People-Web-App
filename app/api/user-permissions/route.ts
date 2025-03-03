import { NextResponse } from 'next/server';
import { getUserPermissions } from './getUserPermissions';
import { updateUserPermissions } from './updateUserPermissions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const result = await getUserPermissions(userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/user-permissions:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error fetching user permissions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, permissionsToAdd, permissionsToRemove } = body;
    
    if (!userId || (!permissionsToAdd && !permissionsToRemove)) {
      return NextResponse.json({ error: 'Invalid input or no permissions to update' }, { status: 400 });
    }

    const result = await updateUserPermissions(userId, permissionsToAdd, permissionsToRemove);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in POST /api/user-permissions:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error updating user permissions' }, { status: 500 });
  }
}

