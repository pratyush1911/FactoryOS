const pool = require("../db");

exports.handleAI = async (req, res) => {
  const prompt = req.body?.prompt;

  if (!prompt) {
    return res.status(400).json({ reply: "No prompt provided." });
  }

  if (!prompt) {
    return res.status(400).json({ reply: "No prompt provided." });
  }

  const lower = prompt.toLowerCase();

  try {
    const result = await pool.query("SELECT * FROM machines");
    const machines = result.rows;

    if (machines.length === 0) {
      return res.json({
        reply: "No machines registered in the system yet.",
      });
    }

    const running = machines.filter((m) => m.status === "running").length;

    const avgUptime = Math.round(
      machines.reduce((sum, m) => sum + (m.uptime || 0), 0) / machines.length,
    );

    const lowestMachine = machines.reduce((prev, current) =>
      (current.uptime || 0) < (prev.uptime || 0) ? current : prev,
    );

    let reply = "";

    // -------- STATUS QUERY --------
    if (lower.includes("status")) {
      reply = `${running} machines are currently running. ${
        machines.length - running
      } machines are not operational.`;
    }
    // -------- UPTIME / OEE --------
    else if (
      lower.includes("uptime") ||
      lower.includes("oee") ||
      lower.includes("efficiency")
    ) {
      reply = `Average machine uptime is ${avgUptime}%. Improving availability by 5% would significantly increase overall OEE.`;
    }
    // -------- MAINTENANCE / RISK --------
    else if (lower.match(/maint|repair|service|risk|failure/)) {
      reply = `Machine ${lowestMachine.name} has the lowest uptime (${lowestMachine.uptime}%). Preventive maintenance recommended immediately.`;
    }
    // -------- DEFAULT ANALYSIS --------
    else {
      reply = `Factory analysis complete. ${running} units active. Average uptime is ${avgUptime}%. System operating within optimal parameters.`;
    }

    res.json({ reply });
  } catch (err) {
    console.error("AI Controller Error:", err);
    res.status(500).json({ reply: "AI engine error." });
  }
};
