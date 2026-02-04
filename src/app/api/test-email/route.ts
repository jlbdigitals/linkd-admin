import { NextResponse } from 'next/server';
import { sendEmail, verifyEmailConnection } from '@/lib/email';

export async function GET() {
  try {
    // Primero verificamos la conexión SMTP
    const isConnected = await verifyEmailConnection();

    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: 'No se pudo conectar al servidor SMTP' },
        { status: 500 }
      );
    }

    // Enviamos un correo de prueba
    const result = await sendEmail({
      to: 'contacto@linkd.cl', // Envía a tu propio correo
      subject: '✅ Prueba de envío desde LINKD App',
      text: 'Este es un correo de prueba para verificar que la configuración de Google Workspace funciona correctamente.',
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
              .success {
                background-color: #d4edda;
                border: 2px solid #28a745;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
              }
              .success h2 {
                color: #28a745;
                margin: 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 style="color: #007bff; text-align: center;">LINKD</h1>
              <div class="success">
                <h2>✅ ¡Configuración exitosa!</h2>
              </div>
              <p>Este es un correo de prueba para confirmar que tu aplicación LINKD puede enviar correos correctamente usando Google Workspace.</p>
              <p><strong>Detalles de la configuración:</strong></p>
              <ul>
                <li>Servidor SMTP: smtp.gmail.com</li>
                <li>Puerto: 465 (SSL/TLS)</li>
                <li>Correo: contacto@linkd.cl</li>
              </ul>
              <p style="margin-top: 30px; color: #666; font-size: 14px; text-align: center;">
                Si recibiste este correo, significa que todo está funcionando perfectamente. 🎉
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Correo de prueba enviado exitosamente. Revisa tu bandeja de entrada en contacto@linkd.cl',
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error en test-email:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
