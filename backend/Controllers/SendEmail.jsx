const nodemailer = require('nodemailer');

const SendEmail = async (req, res) => {
    const { firstName, lastName, email, phone, portfolio, message } = req.body;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user:  process.env.Email, 
            pass: process.env.APP_PASSWORD 
        }
    });

    try {
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
            `,
        };

        let info = await transporter.sendMail(mailOptions);

        console.log("Message sent: %s", info.messageId);

        res.status(200).json({
            message: "Email sent successfully!",
        });

    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: "Failed to send email.", error: error.message });
    }
};

module.exports = SendEmail;
