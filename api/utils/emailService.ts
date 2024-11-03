import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordResetEmail = async (email: string, temporaryPassword: string) => {
    const mailOptions = {
      from: `"Uygulamanızın Adı" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Geçici Şifreniz',
      text: `Şifreniz sıfırlanmıştır. Geçici şifreniz: ${temporaryPassword}. Lütfen giriş yaptıktan sonra şifrenizi değiştirin.`,
      html: `
        <p>Şifreniz sıfırlanmıştır.</p>
        <p>Geçici şifreniz: <strong>${temporaryPassword}</strong></p>
        <p>Lütfen giriş yaptıktan sonra şifrenizi değiştirin.</p>
      `,
    };
  
    await transporter.sendMail(mailOptions);
};
