import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

const FROM = {
  email: process.env.SENDGRID_FROM_EMAIL as string,
  name: 'FocusDay',
};

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await sgMail.send({
    to,
    from: FROM,
    subject: `¡Bienvenido a FocusDay, ${name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #F0E9E1; border-radius: 12px;">
        <h1 style="font-size: 28px; color: #1A1A1A; margin-bottom: 4px;">
          <span style="font-weight: 800;">Focus</span>Day
        </h1>
        <p style="color: #6B6060; font-size: 13px; margin-top: 0;">Disciplina que se mide.</p>

        <hr style="border: none; border-top: 1px solid #C9BFB7; margin: 24px 0;" />

        <h2 style="color: #1A1A1A; font-size: 20px;">¡Hola, ${name}! 👋</h2>
        <p style="color: #1A1A1A; font-size: 15px; line-height: 1.6;">
          Tu cuenta ha sido creada exitosamente. A partir de hoy puedes empezar a registrar tus hábitos y medir tu disciplina día a día.
        </p>

        <div style="background: #8B1A1A; border-radius: 8px; padding: 16px 24px; margin: 24px 0; text-align: center;">
          <p style="color: #FFFFFF; font-size: 14px; font-weight: 700; margin: 0; letter-spacing: 1px;">
            LA DISCIPLINA ES LA BASE DEL ÉXITO
          </p>
        </div>

        <p style="color: #6B6060; font-size: 13px; line-height: 1.6;">
          Crea tus primeras tareas, marca tu progreso diario y observa cómo tu porcentaje de disciplina crece con el tiempo.
        </p>

        <hr style="border: none; border-top: 1px solid #C9BFB7; margin: 24px 0;" />

        <p style="color: #A09090; font-size: 12px; text-align: center; margin: 0;">
          FocusDay — Este correo fue enviado a ${to}
        </p>
      </div>
    `,
  });
}
