import { NextResponse } from 'next/server';
import { getUsers } from './getUsers';
import { insertUser } from './insertUser';
import { updateUser } from './updateUser';
import { deleteUser } from './deleteUser';

export async function GET() {
  try {
    const result = await getUsers();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error fetching users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, legajo } = body;
    const result = await insertUser(email, password);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error creating user' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { user_id, ...userData } = body;
    const result = await updateUser(user_id, userData);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in PUT /api/users:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error updating user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    const result = await deleteUser(userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in DELETE /api/users:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error deleting user' }, { status: 500 });
  }
}

