const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/", aiController.handleAI);
router.post("/", authenticate, aiController.handleAI);

module.exports = router;
