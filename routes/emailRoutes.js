const express = require("express");
const multer = require("multer");
const { sendEmails } = require("../controllers/emailController");

const upload = multer({ storage: multer.memoryStorage() }); // Store file in memory

module.exports = (io) => {
    const router = express.Router();
    router.post("/send", upload.single("file"), (req, res) => sendEmails(req, res, io));
    return router;
};
