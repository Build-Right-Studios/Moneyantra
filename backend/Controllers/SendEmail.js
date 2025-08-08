const nodemailer = require('nodemailer');
const axios = require('axios');

const SendEmail = async (req, res) => {
    const { firstName, lastName, email, phone, portfolio, message, recaptchaToken } = req.body;

    try {
        // 1️⃣ Verify reCAPTCHA token with Google
        const recaptchaResponse = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
        );

        if (!recaptchaResponse.data.success || recaptchaResponse.data.score < 0.5) {
            return res.status(400).json({ message: "reCAPTCHA verification failed. Are you a bot?" });
        }

        // 2️⃣ Create transporter
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.Email,
                pass: process.env.APP_PASSWORD
            }
        });

        // 3️⃣ Mail options
        let mailOptions = {
            from: `"MoneyAntra Consultation" <${email}>`,
            to: process.env.Email,
            subject: "New Consultation Request from MoneyAntra Website",
            html: `
                <p>Hello Moneyantra,</p>
                <p>You have received a new consultation request from your website.</p>
                <h3>Client Details:</h3>
                <ul>
                    <li><strong>Name:</strong> ${firstName} ${lastName}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Phone:</strong> ${phone}</li>
                    <li><strong>Investment Portfolio Size:</strong> ${portfolio}</li>
                </ul>
                <h3>Message:</h3>
                <p>${message}</p>
                <br>
                <p>Please follow up with the client as soon as possible.</p>
            `
        };

        // 4️⃣ Send Email
        let info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);

        res.status(200).json({ message: "Email sent successfully!" });

    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: "Failed to send email.", error: error.message });
    }
};

module.exports = SendEmail;
