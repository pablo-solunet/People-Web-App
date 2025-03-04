import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { google } from "googleapis"

// Configuración de OAuth2
const OAuth2 = google.auth.OAuth2

export async function POST(request: Request) {
  try {
    const { email, username, password } = await request.json()

    // Crear un cliente OAuth2
    const oauth2Client = new OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground", // URL de redirección
    )

    // Configurar el token de actualización
    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    })

    // Obtener un token de acceso
    const accessToken = await new Promise<string>((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          console.error("Error al obtener el token de acceso:", err)
          reject("Error al obtener el token de acceso")
        }
        resolve(token || "")
      })
    })

    // Configurar el transporter de nodemailer con OAuth2
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken,
      },
    })

    // Configurar el contenido del correo
    const mailOptions = {
      from: `"${process.env.GMAIL_FROM_NAME}" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Tus credenciales de acceso a People App",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #3b82f6; text-align: center;">Bienvenido a People App</h2>
          <p>Hola,</p>
          <p>Tu cuenta ha sido creada exitosamente. Aquí están tus credenciales de acceso:</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Usuario:</strong> ${username || email}</p>
            <p><strong>Contraseña:</strong> ${password}</p>
          </div>
          <p>Te recomendamos cambiar tu contraseña después de iniciar sesión por primera vez.</p>
          <p>Saludos,<br>People Team</p>
        </div>
      `,
    }

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions)
    console.log("Correo enviado:", info.messageId)

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

