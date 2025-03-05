import { NextResponse } from "next/server"
import { emailService } from "@/lib/email/email-service"
import { getCredentialsEmailTemplate, getResetPasswordEmailTemplate } from "@/lib/email/templates"

export async function POST(request: Request) {
  try { 
    const { email, username, password, type = "credentials" } = await request.json()

    let htmlContent: string
    let subject: string

    // Seleccionar la plantilla según el tipo de correo
    if (type === "reset-password") {
      htmlContent = getResetPasswordEmailTemplate({
        email,
        username: username,
        newPassword: password,
      })
      subject = "Restablecimiento de contraseña - People App"
    } else {
      // Por defecto, usar la plantilla de credenciales
      htmlContent = getCredentialsEmailTemplate({
        email,
        username: username,
        password,
      })
      subject = "Tus credenciales de acceso a People App"
    }

    // Enviar el correo
    const info = await emailService.sendEmail({
      to: email,
      subject,
      html: htmlContent,
    })

    return NextResponse.json({
      success: true,
      message: "Correo enviado exitosamente",
      messageId: info.messageId,
    })
  } catch (error) {
    console.error("Error al enviar el correo:", error)
    return NextResponse.json({ success: false, error: "Error al enviar el correo" }, { status: 500 })
  }
}

