const nodemailer = require("nodemailer");

exports.sendEmails = async (req, res, io) => {
    const { email, appPassword, hrEmails, subject, body, template, cc, bcc } = req.body;

    // Files (multiple attachments)
    const files = req.files?.files || [];

    if (!email || !appPassword || !hrEmails || !subject || !body) {
        return res.status(400).json({ error: "All fields are required" });
    }
    
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // Required for Gmail
        auth: {
            user: email,
            pass: appPassword
        },
        pool: true,              // Enable connection pooling
        maxConnections: 3,       // Stable for Gmail (avoid high)
        maxMessages: 30,         // Prevent Gmail rate blocking
        rateDelta: 2000,         // Time window (2 seconds)
        rateLimit: 1             // 1 email per 2 seconds
    });

    // Clean HR emails
    const recipients = [...new Set(
        hrEmails
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean)
    )];

    let successCount = 0;
    let failedRecipients = [];

    for (const recipient of recipients) {
        const mailOptions = {
            from: email,
            to: recipient,
            cc: cc || "",
            bcc: bcc || "",
            subject,
            html: body,
            attachments: files.map((f) => ({
                filename: f.originalname,
                content: f.buffer,
            })),
        };

        try {
            await transporter.sendMail(mailOptions);

            successCount++;
            io.emit("emailLog", {
                recipient,
                status: "Sent ✓",
                templateUsed: template,
                time: new Date()
            });
        } catch (error) {
            failedRecipients.push(recipient);

            io.emit("emailLog", {
                recipient,
                status: "Failed ✗",
                error: error.message,
                time: new Date()
            });
        }

        // Gmail safe delay
        await new Promise((resolve) => setTimeout(resolve, 1200));
    }

    res.status(200).json({
        success: true,
        template,
        message: `Emails sent: ${successCount}, Failed: ${failedRecipients.length}`,
        successCount,
        failedRecipients,
    });
};
