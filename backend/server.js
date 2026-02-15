require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const aiRoutes = require("./routes/ai");
const authRoutes = require("./routes/auth");
const machineRoutes = require("./routes/machines");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/ai", aiRoutes);
app.use("/auth", authRoutes);
app.use("/machines", machineRoutes);

app.use(morgan("dev"));

pool
  .connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

app.get("/", (req, res) => {
  res.send("FactoryOS PostgreSQL API Running 🚀");
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date(),
      database: "connected",
    });
  } catch (err) {
    res.status(500).json({
      status: "unhealthy",
      error: err.message,
    });
  }
});

app.get("/machines", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM machines ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/machines", async (req, res) => {
  const { name, sub, status, uptime } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO machines (name, sub, status, uptime)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, sub, status || "running", uptime || 80],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/machines/:id", async (req, res) => {
  const { status, uptime } = req.body;
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE machines
       SET status = COALESCE($1, status),
           uptime = COALESCE($2, uptime)
       WHERE id = $3
       RETURNING *`,
      [status, uptime, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Machine not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/machines/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM machines WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Machine not found" });
    }

    res.json({ message: "Machine deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/analytics/avg-uptime", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT ROUND(AVG(uptime),2) AS avg_uptime FROM machines",
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/analytics/status-count", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT status, COUNT(*) FROM machines GROUP BY status",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/ai", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ reply: "No prompt provided." });
  }

  const lower = prompt.toLowerCase();

  try {
    const result = await pool.query("SELECT * FROM machines");
    const machines = result.rows;

    const running = machines.filter((m) => m.status === "running").length;

    const avgUptime =
      machines.length > 0
        ? Math.round(
            machines.reduce((sum, m) => sum + m.uptime, 0) / machines.length,
          )
        : 0;

    let reply = "";

    if (lower.includes("status")) {
      reply = `${running} machines are currently running. ${
        machines.length - running
      } are not operational.`;
    } else if (lower.includes("uptime") || lower.includes("oee")) {
      reply = `Average machine uptime is ${avgUptime}%. Improving availability by 5% would push your OEE significantly higher.`;
    } else if (lower.includes("risk") || lower.includes("maintenance")) {
      reply = `Based on uptime data, the lowest-performing machine should be inspected first. Preventive maintenance recommended.`;
    } else {
      reply = `Factory analysis complete. ${running} units active. System operating within optimal parameters.`;
    }

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ reply: "AI engine error." });
  }
});

const PORT = process.env.PORT || 5000;
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
