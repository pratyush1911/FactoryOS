const express = require("express");
const router = express.Router();
const controller = require("../controllers/machineController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/", controller.getMachines);
router.post("/", controller.createMachine);
router.patch("/:id", controller.updateMachine);
router.delete("/:id", controller.deleteMachine);

module.exports = router;
