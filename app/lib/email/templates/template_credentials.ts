export interface CredentialsTemplateProps {
  email: string
  username: string
  password: string
}

export function getCredentialsEmailTemplate({ email, username, password }: CredentialsTemplateProps): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #3b82f6; text-align: center;">Bienvenido a People App</h2>
      <p>Hola,</p>
      <p>Tu cuenta ha sido creada exitosamente. Aquí están tus credenciales de acceso:</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Usuario:</strong> ${username || email}</p>
        <p><strong>Contraseña:</strong> ${password}</p>
      </div>
      <p><a href="https://people-web-app.vercel.app">Haz Clic Aquie para ingresar</a></p>
      <div>
      </div>
      <p>Saludos,<br>People Team</p>
    </div>
  `
}

