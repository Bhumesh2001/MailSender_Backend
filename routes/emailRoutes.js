const express = require("express");
const multer = require("multer");
const { sendEmails } = require("../controllers/emailController");

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
}).fields([
    { name: "hrFile", maxCount: 1 },
    { name: "files", maxCount: 10 },
    { name: "image", maxCount: 1 }
]);

module.exports = (io) => {
    const router = express.Router();

    // Remove .single("file") — use upload directly
    router.post("/send", upload, (req, res) => sendEmails(req, res, io));

    return router;
};
