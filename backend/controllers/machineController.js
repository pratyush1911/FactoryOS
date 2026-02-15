const pool = require("../db");

/* ================= GET ALL ================= */
exports.getMachines = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM machines ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= CREATE ================= */
exports.createMachine = async (req, res) => {
  const { name, sub, status, uptime } = req.body;

  if (!name || !sub) {
    return res.status(400).json({ error: "Name and sub are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO machines (name, sub, status, uptime)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [name, sub, status || "running", uptime || 80],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= UPDATE ================= */
exports.updateMachine = async (req, res) => {
  const { id } = req.params;
  const { status, uptime } = req.body;

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
};

/* ================= DELETE ================= */
exports.deleteMachine = async (req, res) => {
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
};
