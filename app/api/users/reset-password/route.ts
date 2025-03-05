import { NextResponse } from "next/server"
import {updateUserPass} from "./updatePass"

export async function PUT(request: Request) {
  try {
    const { userId, newPassword } = await request.json()
    const result = await updateUserPass(userId, newPassword);

    console.log(`Contraseña actualizada para el usuario ${userId}`)

    return NextResponse.json({ success: true, message: "Contraseña actualizada exitosamente" })
  } catch (error) {
    console.error("Error al actualizar la contraseña:", error)
    return NextResponse.json({ success: false, error: "Error al actualizar la contraseña" }, { status: 500 })
  }
}

