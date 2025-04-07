const nodemailer = require("nodemailer");

exports.sendEmails = async (req, res, io) => {
    const { email, appPassword, hrEmails, subject, body } = req.body;
    const file = req.file;

    if (!email || !appPassword || !hrEmails || !subject || !body) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Create a fast email transporter
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: { user: email, pass: appPassword },
        pool: true,  // Enables connection pooling
        maxConnections: 5, // Increase simultaneous connections
        maxMessages: Infinity // Allow unlimited messages per connection
    });

    // Remove duplicate emails
    const recipients = [...new Set(hrEmails.split(",").map((e) => e.trim()))];

    let successCount = 0;
    let failedRecipients = [];

    // Send all emails in parallel using Promise.all
    const sendEmailPromises = recipients.map(async (recipient) => {
        const mailOptions = {
            from: email,
            to: recipient,
            subject,
            text: body,
            attachments: file ? [{ filename: file.originalname, content: file.buffer }] : [],
        };

        try {
            await transporter.sendMail(mailOptions);
            successCount++;
            io.emit("emailLog", { recipient, status: "Sent ✅", time: new Date() });
        } catch (error) {
            failedRecipients.push(recipient);
            io.emit("emailLog", { recipient, status: "Failed ❌", time: new Date() });
        }
    });

    // Wait for all emails to be sent
    await Promise.all(sendEmailPromises);

    res.status(200).json({
        success: true,
        message: `Emails sent successfully to ${successCount} recipients.`,
        failedRecipients,
    });
};
