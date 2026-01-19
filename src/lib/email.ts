import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendLoginCode(email: string, code: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@linkd.app',
    to: email,
    subject: 'Tu código de acceso a LINKD',
    text: `Tu código de acceso es: ${code}\n\nEste código expira en 10 minutos.`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 8px;
              padding: 30px;
              border: 1px solid #e0e0e0;
            }
            .logo {
              text-align: center;
              margin-bottom: 20px;
            }
            .code-box {
              background-color: #fff;
              border: 2px solid #007bff;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #007bff;
              margin: 20px 0;
            }
            .warning {
              color: #666;
              font-size: 14px;
              text-align: center;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1 style="color: #007bff; margin: 0;">LINKD</h1>
            </div>
            <h2 style="text-align: center; color: #333;">Código de Acceso</h2>
            <p style="text-align: center;">Has solicitado acceso al panel administrativo de LINKD.</p>
            <div class="code-box">${code}</div>
            <p class="warning">⏱️ Este código expira en 10 minutos.</p>
            <p style="text-align: center; margin-top: 20px;">Si no solicitaste este código, puedes ignorar este mensaje.</p>
            <div class="footer">
              <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Login code sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Optional: Verify SMTP connection
export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP connection error:', error);
    return false;
  }
}
