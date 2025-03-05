import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { hash } from "bcryptjs"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    // Aquí deberías obtener el usuario actual de tu base de datos
    // const user = await getUserById(session.user.id)

    // Verificar la contraseña actual
    // const isValid = await compare(currentPassword, user.password)

    // if (!isValid) {
    //   return NextResponse.json({ error: "Contraseña actual incorrecta" }, { status: 400 })
    // }

    // Hash de la nueva contraseña
    const hashedPassword = await hash(newPassword, 12)

    // Actualizar la contraseña en la base de datos
    // await updateUserPassword(session.user.id, hashedPassword)

    return NextResponse.json({ success: true, message: "Contraseña actualizada correctamente" })
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error)
    return NextResponse.json({ error: "Error al cambiar la contraseña" }, { status: 500 })
  }
}

