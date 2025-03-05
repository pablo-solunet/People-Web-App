import nodemailer from "nodemailer"
import { google } from "googleapis"

// Configuración de OAuth2
const OAuth2 = google.auth.OAuth2

// Interfaz para las opciones de correo
export interface EmailOptions {
  to: string
  subject: string
  html: string
}

// Clase para el servicio de correo electrónico
export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = null as any // Se inicializará en el método init
  }

  // Inicializar el transporter con OAuth2
  async init() {
    try {
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
      this.transporter = nodemailer.createTransport({
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

      return this.transporter
    } catch (error) {
      console.error("Error al inicializar el servicio de correo:", error)
      throw error
    }
  }

  // Método para enviar correos
  async sendEmail(options: EmailOptions) {
    try {
      if (!this.transporter) {
        await this.init()
      }

      const mailOptions = {
        from: `"${process.env.GMAIL_FROM_NAME}" <${process.env.GMAIL_USER}>`,
        ...options,
      }

      const info = await this.transporter.sendMail(mailOptions)
      console.log("Correo enviado:", info.messageId)
      return info
    } catch (error) {
      console.error("Error al enviar el correo:", error)
      throw error
    }
  }
}

// Exportar una instancia única del servicio
export const emailService = new EmailService()

