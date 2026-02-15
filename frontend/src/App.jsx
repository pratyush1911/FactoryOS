import "./App.css";
import { useState, useEffect, useRef } from "react";
import Login from "./components/login";

export default function App() {
  /* ---------------- LANDING STATE ---------------- */
  const [entered, setEntered] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [newMachine, setNewMachine] = useState({
    id: "",
    type: "",
    floor: "A",
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // login | register
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [closingAuth, setClosingAuth] = useState(false);
  const [exitingLanding, setExitingLanding] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);

  /* ---------------- DATA ---------------- */
  const MACHINES_DATA = [
    {
      id: "CNC-01",
      type: "CNC Lathe",
      floor: "A",
      status: "running",
      oee: 92,
      temp: 74,
      vib: 12,
    },
    {
      id: "WLD-02",
      type: "Welding Robot",
      floor: "A",
      status: "warning",
      oee: 68,
      temp: 91,
      vib: 38,
    },
    {
      id: "PRS-03",
      type: "Hydraulic Press",
      floor: "A",
      status: "running",
      oee: 88,
      temp: 65,
      vib: 9,
    },
    {
      id: "CNV-04",
      type: "Conveyor Line",
      floor: "B",
      status: "running",
      oee: 95,
      temp: 55,
      vib: 6,
    },
    {
      id: "INJ-05",
      type: "Injection Mold",
      floor: "B",
      status: "down",
      oee: 0,
      temp: 45,
      vib: 2,
    },
  ];

  const initialRisks = [
    {
      id: "INJ-05",
      issue: "Coolant pressure failure",
      risk: 94,
      level: "high",
    },
    { id: "WLD-02", issue: "Bearing wear pattern", risk: 72, level: "high" },
    { id: "GRD-09", issue: "Thermal overload", risk: 65, level: "med" },
  ];

  /* ---------------- STATE ---------------- */
  const [section, setSection] = useState("monitoring");
  const [machines, setMachines] = useState([]);
  const [simOn, setSimOn] = useState(true);
  useEffect(() => {
    fetch("https://factoryos-mxsq.onrender.com/machines", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((m) => ({
          id: m.name,
          type: m.sub,
          floor: "A",
          status: m.status,
          oee: m.uptime || 80,
          temp: 60,
          vib: 10,
        }));

        setMachines(formatted);
      })
      .catch((err) => console.error(err));
  }, []);
  useEffect(() => {
  const handleEsc = (e) => {
    if (e.key === "Escape") {
      setSelectedSensor(null);
    }
  };
  window.addEventListener("keydown", handleEsc);
  return () => window.removeEventListener("keydown", handleEsc);
}, []);


  const [alerts] = useState([
    {
      id: 1,
      text: "INJ-05 Offline — Coolant Pressure Loss",
      level: "critical",
    },
    { id: 2, text: "WLD-02 Vibration High", level: "warning" },
  ]);
  const [risks, setRisks] = useState(initialRisks);
  const [oeeVals, setOeeVals] = useState({ a: 88, p: 92, q: 96 });
  const [analyticsTab, setAnalyticsTab] = useState("trends");
  const [aiInput, setAiInput] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [typing, setTyping] = useState(false);
  const [time, setTime] = useState("");

  const sparkRef = useRef(null);
  const trendRef = useRef(null);

  /* ---------------- CLOCK ---------------- */
  useEffect(() => {
    const i = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-GB", { hour12: false }));
    }, 1000);
    return () => clearInterval(i);
  }, []);

  /* ---------------- SIM ---------------- */
  useEffect(() => {
    if (!simOn) return;
    const i = setInterval(() => {
      setMachines((prev) =>
        prev.map((m) => {
          if (m.status === "down") return m;
          return {
            ...m,
            oee: Math.max(10, Math.min(99, m.oee + (Math.random() - 0.5) * 4)),
            temp: m.temp + (Math.random() - 0.5) * 2,
            vib: m.vib + (Math.random() - 0.5) * 3,
          };
        }),
      );
    }, 2200);
    return () => clearInterval(i);
  }, [simOn]);

  /* ---------------- SPARK ---------------- */
  useEffect(() => {
    if (!sparkRef.current) return;
    const ctx = sparkRef.current.getContext("2d");
    const W = sparkRef.current.offsetWidth;
    const H = 110;
    sparkRef.current.width = W;
    sparkRef.current.height = H;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "#F5A623";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 30; i++) {
      const x = (i / 29) * W;
      const y = H - Math.random() * H;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [machines]);

  /* ---------------- TREND ---------------- */
  useEffect(() => {
    if (!trendRef.current) return;
    if (section !== "analytics") return;
    const ctx = trendRef.current.getContext("2d");
    const W = trendRef.current.offsetWidth;
    const H = 150;
    trendRef.current.width = W;
    trendRef.current.height = H;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "#4FA8F5";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const x = (i / 11) * W;
      const y = H - ((60 + Math.random() * 30) / 100) * H;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [section, analyticsTab]);

  /* ---------------- AI ---------------- */
  const AI_REPLIES = {
    default:
      "Analyzing machine data… INJ-05 is highest risk. Schedule maintenance immediately.",
    downtime: "Primary downtime cause: Mechanical Failure 42%.",
    maintenance: "Priority order: INJ-05 → WLD-02 → GRD-09.",
    oee: "Increase availability to 92% to achieve 85% OEE.",
  };

  async function sendAI() {
    if (!aiInput.trim()) return;

    setTyping(true);
    setAiOutput("");

    try {
      const res = await fetch("https://factoryos-mxsq.onrender.com/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: aiInput }),
      });

      const data = await res.json();
      const text = data.reply;
      let i = 0;
      const interval = setInterval(() => {
        i += 3;
        setAiOutput(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setTyping(false);
        }
      }, 15);
    } catch (err) {
      setAiOutput("AI connection error.");
      setTyping(false);
    }
  }
  async function handleLogin() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "https://factoryos-mxsq.onrender.com/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      setClosingAuth(true);
      setTimeout(() => {
        setIsLoggedIn(true);
      }, 1000);
    } catch (err) {
      setError("Server error");
    }

    setLoading(false);
  }
  async function handleRegister() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "https://factoryos-mxsq.onrender.com/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      alert("Account created successfully!");
      setAuthMode("login");
    } catch (err) {
      setError("Server error");
    }

    setLoading(false);
  }
  // async function handleRegister() {
  //   setLoading(true);
  //   setError("");

  //   try {
  //     const res = await fetch(
  //       "https://factoryos-mxsq.onrender.com/auth/register",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ email, password }),
  //       },
  //     );

  //     const data = await res.json();

  //     if (!res.ok) {
  //       setError(data.message || "Registration failed");
  //       setLoading(false);
  //       return;
  //     }

  //     alert("Account created successfully!");
  //     setAuthMode("login"); // switch back to login mode
  //   } catch (err) {
  //     console.error("REGISTER ERROR:", err);
  //     res.status(500).json({ message: err.message });
  //   }

  //   setLoading(false);
  // }

  /* ---------------- HELPERS ---------------- */
  const online = machines.filter((m) => m.status === "running").length;
  const avgOee = Math.round(
    machines.reduce((s, m) => s + m.oee, 0) / machines.length,
  );
  const oeeCalc = Math.round(
    (oeeVals.a / 100) * (oeeVals.p / 100) * (oeeVals.q / 100) * 100,
  );
  async function registerMachine() {
    if (!newMachine.id || !newMachine.type) return;

    try {
      const res = await fetch("https://factoryos-mxsq.onrender.com/machines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newMachine.id, // map to DB column
          sub: newMachine.type, // map to DB column
          status: "running",
          uptime: 80,
        }),
      });

      const data = await res.json();
      console.log("Inserted:", data);

      // Refresh from backend
      const updated = await fetch(
        "https://factoryos-mxsq.onrender.com/machines",
      );
      const updatedData = await updated.json();
      setMachines(updatedData);

      setNewMachine({ id: "", type: "", floor: "A" });
      setShowRegister(false);
    } catch (err) {
      console.error("Error inserting machine:", err);
    }
  }

  /* ---------------- UI ---------------- */
  return !entered ? (
    /* ---------------- LANDING ---------------- */
    <div className="min-h-screen bg-[#07090A] text-white flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F5A623]/10 via-transparent to-[#4FA8F5]/10" />

      <div className="relative text-center">
        {/* TOP HALF */}
        <div
          className={`transition-all duration-700 ${
            exitingLanding
              ? "opacity-0 -translate-y-20"
              : "opacity-100 translate-y-0"
          }`}
        >
          <div className="text-xs tracking-[0.4em] text-[#F5A623] mb-4">
            AI Powered
          </div>

          <h1 className="text-6xl font-bold leading-tight mb-6">
            FactoryOS <br />
            <span className="text-[#F5A623]">INTELLIGENCE</span>
          </h1>
        </div>

        {/* BOTTOM HALF */}
        <div
          className={`transition-all duration-700 delay-100 ${
            exitingLanding
              ? "opacity-0 translate-y-20"
              : "opacity-100 translate-y-0"
          }`}
        >
          <p className="text-gray-400 mb-10 max-w-xl mx-auto">
            Real-time monitoring · Predictive maintenance · OEE analytics ·
            AI-powered optimization
          </p>

          <button
            onClick={() => {
              setExitingLanding(true);
              setTimeout(() => {
                setEntered(true);
              }, 700);
            }}
            className="px-8 py-3 border border-[#F5A623] text-[#F5A623] hover:bg-[#F5A623] hover:text-black transition-all tracking-widest uppercase"
          >
            Enter Platform →
          </button>
        </div>
      </div>
    </div>
  ) : !isLoggedIn ? (
    <Login
      email={email}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      handleLogin={handleLogin}
      handleRegister={handleRegister}
      authMode={authMode}
      setAuthMode={setAuthMode}
      loading={loading}
      error={error}
      closingAuth={closingAuth}
    />
  ) : (
    /* ---------------- DASHBOARD ---------------- */
    <div className="bg-[#07090A] text-[#BEC4C9] min-h-screen flex">
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#0D0F11] border-r border-[#1F2326] p-6 flex flex-col shadow-xl">
        <div className="text-[#F5A623] text-xs mb-6">● SYSTEM ONLINE</div>

        {[
          "monitoring",
          "downtime",
          "predictive",
          "analytics",
          "ai",
          "products",
          "contact",
        ].map((s) => (
          <div
            key={s}
            onClick={() => setSection(s)}
            className={`px-3 py-2 cursor-pointer capitalize border-l-2
${section === s ? "border-[#F5A623] text-[#F5A623] bg-[#F5A623]/10" : "border-transparent text-gray-500 hover:bg-[#F5A623]/5"}`}
          >
            {s}
          </div>
        ))}
        <div className="mt-auto text-xs text-gray-500 mb-4">{time}</div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
            setEntered(false);
          }}
          className="text-xs text-red-400 hover:text-red-600 transition-all"
        >
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <div className="flex-1 p-8">
        {/* MONITORING */}
        {section === "monitoring" && (
          <>
            <h1 className="text-3xl font-bold mb-6">
              REAL-TIME <span className="text-[#F5A623]">MONITORING</span>
            </h1>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <Kpi label="Online" value={online} />
              <Kpi label="Avg OEE" value={avgOee + "%"} />
              <Kpi label="Alerts" value={alerts.length} />
              <Kpi label="Units" value="1248" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#131618] p-6 border border-[#1F2326]">
                <div className="grid grid-cols-2 gap-3">
                  {machines.map((m) => (
                    <div
                      key={m.id}
                      className="bg-[#181B1D] p-4 border border-[#1F2326] border-l-4 border-[#2DD97B]"
                    >
                      <div className="text-white">{m.id}</div>
                      <div className="text-xs text-gray-500">{m.type}</div>
                      <div className="text-xs">OEE {Math.round(m.oee)}%</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <button
                  onClick={() => setShowRegister(!showRegister)}
                  className="px-4 py-2 border border-[#F5A623] text-[#F5A623] hover:bg-[#F5A623] hover:text-black transition-all duration-700 cursor-pointer"
                >
                  + Register Machine
                </button>
                {showRegister && (
                  <div className="bg-[#131618] border border-[#1F2326] p-6 mb-6 fade-slow mt-4 duration-[1000ms]">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <input
                        placeholder="Machine ID (e.g. CNC-10)"
                        value={newMachine.id}
                        onChange={(e) =>
                          setNewMachine({ ...newMachine, id: e.target.value })
                        }
                        className="bg-[#181B1D] p-2 border border-[#1F2326] text-white"
                      />

                      <input
                        placeholder="Machine Type"
                        value={newMachine.type}
                        onChange={(e) =>
                          setNewMachine({ ...newMachine, type: e.target.value })
                        }
                        className="bg-[#181B1D] p-2 border border-[#1F2326] text-white"
                      />

                      <select
                        value={newMachine.floor}
                        onChange={(e) =>
                          setNewMachine({
                            ...newMachine,
                            floor: e.target.value,
                          })
                        }
                        className="bg-[#181B1D] p-2 border border-[#1F2326] text-white"
                      >
                        <option value="A">Floor A</option>
                        <option value="B">Floor B</option>
                      </select>
                    </div>

                    <button
                      onClick={registerMachine}
                      className="px-6 py-2 border border-[#2DD97B] text-[#2DD97B] transition-all duration-[1000ms] cursor-pointer hover:bg-[#2DD97B] hover:text-black"
                    >
                      Confirm Registration →
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-[#131618] p-6 border border-[#1F2326]">
                <canvas ref={sparkRef} className="w-full h-[110px]" />
              </div>
            </div>
          </>
        )}

        {/* DOWNTIME */}
        {section === "downtime" && (
          <>
            <h1 className="text-3xl font-bold mb-6">DOWNTIME LOG</h1>
            <div className="bg-[#131618] p-6 border border-[#1F2326]">
              <input
                type="range"
                min="50"
                max="100"
                value={oeeVals.a}
                onChange={(e) => setOeeVals({ ...oeeVals, a: +e.target.value })}
              />
              <input
                type="range"
                min="50"
                max="100"
                value={oeeVals.p}
                onChange={(e) => setOeeVals({ ...oeeVals, p: +e.target.value })}
              />
              <input
                type="range"
                min="50"
                max="100"
                value={oeeVals.q}
                onChange={(e) => setOeeVals({ ...oeeVals, q: +e.target.value })}
              />
              <div className="text-4xl text-[#F5A623] mt-4">{oeeCalc}%</div>
            </div>
          </>
        )}

        {/* PREDICTIVE */}
        {section === "predictive" && (
          <>
            <h1 className="text-3xl font-bold mb-6">PREDICTIVE MAINTENANCE</h1>
            {risks.map((r) => (
              <div
                key={r.id}
                className="bg-[#131618] p-4 border border-[#1F2326] mb-3"
              >
                <div className="text-white">{r.id}</div>
                <div className="text-xs text-gray-500">{r.issue}</div>
                <div className="text-sm text-[#F5A623]">{r.risk}% Risk</div>
              </div>
            ))}
            <button
              onClick={() =>
                setRisks(
                  risks.map((r) => ({
                    ...r,
                    risk: r.risk + Math.floor((Math.random() - 0.5) * 10),
                  })),
                )
              }
              className="px-4 py-2 border border-[#F5A623] text-[#F5A623] hover:bg-[#F5A623] hover:text-black transition-all duration-500"
            >
              Recalculate
            </button>
          </>
        )}

        {/* ANALYTICS */}
        {section === "analytics" && (
          <>
            <h1 className="text-3xl font-bold mb-6">ANALYTICS</h1>
            <div className="flex gap-3 mb-4">
              {["trends", "shifts"].map((t) => (
                <div
                  key={t}
                  onClick={() => setAnalyticsTab(t)}
                  className={`px-3 py-1 cursor-pointer border
${analyticsTab === t ? "border-[#F5A623] text-[#F5A623] hover:bg-[#F5A623] hover:text-black transition-all duration-500" : "border-gray-600 text-gray-500 hover:bg-[#F5A623] hover:text-black transition-all duration-500"}`}
                >
                  {t}
                </div>
              ))}
            </div>
            {analyticsTab === "trends" && (
              <div className="bg-[#131618] p-6 border border-[#1F2326] mb-6">
                <canvas ref={trendRef} className="w-full h-[150px]" />
              </div>
            )}
            {analyticsTab === "shifts" && (
              <div className="grid grid-cols-3 gap-4">
                <Kpi label="Shift A" value="82%" />
                <Kpi label="Shift B" value="74%" />
                <Kpi label="Shift C" value="67%" />
              </div>
            )}
          </>
        )}

        {/* AI */}
        {section === "ai" && (
          <>
            <h1 className="text-3xl font-bold mb-6">AI ENGINE</h1>

            <div className="bg-[#131618] p-6 border border-[#1F2326]">
              <input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask something..."
                className="w-full mb-4 bg-[#181B1D] p-2 border border-[#1F2326] text-white"
              />

              <button
                onClick={sendAI}
                className="px-4 py-2 border border-[#F5A623] text-[#F5A623] hover:bg-[#F5A623] hover:text-black transition-all duration-500"
              >
                Analyze
              </button>

              <div className="text-sm min-h-[80px] mt-4 whitespace-pre-wrap">
                {aiOutput}
                {typing && " ▊"}
              </div>
            </div>
          </>
        )}
        {/* PRODUCTS */}
        {/* PRODUCTS */}
        {section === "products" && (
          <>
            <h1 className="text-3xl font-bold mb-6">
              INDUSTRIAL <span className="text-[#F5A623]">SENSORS</span>
            </h1>

            <div
              className={`grid gap-6 transition-all duration-700 ease-in-out
      ${selectedSensor ? "grid-cols-1" : "grid-cols-3"}`}
            >
              {[
                {
                  name: "Vibration Sensor Pro",
                  desc: "Advanced vibration analytics for rotating machinery.",
                  price: "₹4,999",
                  full: "Monitors vibration frequencies to detect imbalance, shaft misalignment, bearing wear, and mechanical looseness before catastrophic failure occurs. Enables predictive maintenance scheduling.",
                },
                {
                  name: "Temperature Sensor X200",
                  desc: "High-accuracy thermal monitoring.",
                  price: "₹2,999",
                  full: "Tracks temperature fluctuations in motors, transformers, and hydraulic systems. Prevents overheating, improves energy efficiency, and reduces unexpected downtime.",
                },
                {
                  name: "Pressure Sensor PX-Industrial",
                  desc: "Hydraulic & pneumatic pressure tracking.",
                  price: "₹5,499",
                  full: "Monitors real-time pressure levels in compressed air and hydraulic lines. Detects drops, spikes, and instability in production systems.",
                },
                {
                  name: "Ultrasonic Leak Detector",
                  desc: "Instant compressed air leak detection.",
                  price: "₹6,999",
                  full: "Detects ultrasonic sound waves produced by air and gas leaks. Reduces energy waste and improves compressor efficiency.",
                },
                {
                  name: "Oil Quality Sensor",
                  desc: "Lubrication health analysis.",
                  price: "₹7,499",
                  full: "Analyzes oil viscosity, contamination, and degradation levels in industrial gearboxes and engines. Extends equipment life cycle.",
                },
                {
                  name: "Current Monitoring Sensor",
                  desc: "Electrical load monitoring.",
                  price: "₹3,499",
                  full: "Tracks current draw to detect overload, imbalance, and motor stress conditions. Enhances power consumption optimization.",
                },
                {
                  name: "Humidity Sensor Industrial",
                  desc: "Moisture and corrosion prevention.",
                  price: "₹1,999",
                  full: "Monitors environmental humidity to prevent corrosion, mold formation, and moisture-related electronic failure.",
                },
                {
                  name: "Proximity Sensor (Inductive)",
                  desc: "Metal object detection for automation.",
                  price: "₹2,499",
                  full: "Detects metallic objects without contact. Used in conveyor lines, robotic arms, and automation positioning systems.",
                },
                {
                  name: "Gas Detection Sensor",
                  desc: "Hazardous gas monitoring.",
                  price: "₹8,999",
                  full: "Detects methane, carbon monoxide, LPG, and other industrial gases. Ensures workplace safety compliance.",
                },
                {
                  name: "Flow Rate Sensor",
                  desc: "Fluid and air flow monitoring.",
                  price: "₹4,299",
                  full: "Measures flow velocity of liquids and gases within pipelines. Prevents bottlenecks and system inefficiency.",
                },
                {
                  name: "Thermal Imaging Sensor",
                  desc: "Infrared heat signature detection.",
                  price: "₹12,999",
                  full: "Uses infrared technology to detect abnormal heat patterns across panels and machinery. Ideal for electrical inspections.",
                },
                {
                  name: "Torque Monitoring Sensor",
                  desc: "Shaft torque measurement.",
                  price: "₹9,499",
                  full: "Measures torque applied on rotating shafts. Prevents overload failure in motors and gear assemblies.",
                },
                {
                  name: "Sound Level Sensor",
                  desc: "Acoustic anomaly detection.",
                  price: "₹3,899",
                  full: "Monitors machine sound patterns to detect early-stage failure symptoms like grinding or friction.",
                },
                {
                  name: "Vibration + Temperature Combo",
                  desc: "Dual predictive analytics sensor.",
                  price: "₹8,499",
                  full: "Combines vibration and thermal data for advanced fault detection with AI-powered insights.",
                },
                {
                  name: "Smart Edge IoT Hub",
                  desc: "Central sensor integration module.",
                  price: "₹14,999",
                  full: "Aggregates multiple sensor data streams and pushes processed insights to FactoryOS dashboard in real time.",
                },
              ].map((item, i) => {
                const isActive = selectedSensor?.name === item.name;

                return (
                  <div
                    key={i}
                    onClick={() =>
                      setSelectedSensor(
                        selectedSensor?.name === item.name ? null : item,
                      )
                    }
                    className={`
              relative cursor-pointer
              transition-all duration-1000 ease-in-out
              border border-[#1F2326]
              ${
                isActive
                  ? "col-span-1 bg-[#131618] p-2 scale-100"
                  : selectedSensor
                    ? "scale-90 opacity-0 h-0 overflow-hidden"
                    : "bg-[#131618] p-6 scale-100"
              }
            `}
                  >
                    <div className="text-white text-xl mb-3">{item.name}</div>

                    {!isActive && (
                      <>
                        <div className="text-gray-500 text-sm mb-4">
                          {item.desc}
                        </div>
                        <div className="text-[#F5A623] font-bold">
                          {item.price}
                        </div>
                      </>
                    )}

                    {isActive && (
                      <div className="animate-fadeIn">
                        <div className="text-[#F5A623] font-bold mb-6">
                          {item.price}
                        </div>

                        {/* IMAGE SPACE */}
                        <div className="w-full h-72 bg-[#0D0F11] border border-[#1F2326] mb-6 flex items-center justify-center text-gray-600">
                          Image Placeholder
                        </div>

                        <p className="text-gray-400 leading-relaxed mb-6">
                          {item.full}
                        </p>

                        <button className="px-6 py-2 border border-[#F5A623] text-[#F5A623] hover:bg-[#F5A623] hover:text-black transition">
                          Purchase →
                        </button>

                        <div className="mt-6 text-gray-500 text-sm">
                          Contact: sales@factoryos.com
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* CONTACT */}
        {section === "contact" && (
          <>
            <h1 className="text-3xl font-bold mb-6">
              CONTACT <span className="text-[#F5A623]">FACTORYOS</span>
            </h1>

            <div className="bg-[#131618] border border-[#1F2326] p-6 space-y-4">
              <div className="text-gray-300">📧 support@factoryos.com</div>
              <div className="text-gray-300">📞 +91 98765 43210</div>
              <div className="text-gray-500 text-sm">
                For enterprise partnerships and bulk hardware orders.
              </div>
            </div>
            <div className="bg-[#131618] border border-[#1F2326] p-6 mt-4 space-y-4">
              <div className="text-gray-300">📧 pratyush120@gmail.com</div>
              <div className="text-gray-300">📞 +91 9369724348</div>
              <div className="text-gray-500 text-sm">
                for technical inquiries, API access, or collaboration opportunities.
              </div>
            </div>
            <div className="bg-[#131618] border border-[#1F2326] p-6 mt-4 space-y-4">
              <div className="text-gray-300">📧 abhinay88@gmail.com</div>
              <div className="text-gray-300">📞 +91 9238792733</div>
              <div className="text-gray-500 text-sm">
                For feedback, custom solutions, or just to say hi!
              </div>
            </div>
            
          </>
        )}
      </div>
    </div>
  );

  function Kpi({ label, value }) {
    return (
      <div className="bg-[#131618] border border-[#1F2326] p-4">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-3xl text-[#F5A623]">{value}</div>
      </div>
    );
  }
}
