// app/lib/email/templates/template_reset-password.ts
export interface ResetPasswordTemplateProps {
  email: string
  username: string
  newPassword: string
}

export function getResetPasswordEmailTemplate({ email, username, newPassword }: ResetPasswordTemplateProps): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #3b82f6; text-align: center;">Restablecimiento de Contraseña</h2>
      <p>Hola ${username},</p>
      <p>Tu contraseña ha sido restablecida exitosamente. A continuación, encontrarás tus credenciales actualizadas:</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Usuario:</strong> ${username}</p>
        <p><strong>Nueva Contraseña:</strong> ${newPassword}</p>
      </div>
      // <p>Por razones de seguridad, te recomendamos cambiar esta contraseña después de iniciar sesión.</p>
      <p>Si no solicitaste este cambio, por favor contacta al administrador del sistema inmediatamente.</p>
      <p>Saludos,<br>People Team</p>
    </div>
  `
}

