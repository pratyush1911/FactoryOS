async function handleRegister() {
  setLoading(true);
  setError("");

  try {
    const res = await fetch("https://factoryos-mxsq.onrender.com/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Registration failed");
      setLoading(false);
      return;
    }

    alert("Account created. You can login now.");
    setAuthMode("login");
  } catch (err) {
    setError("Server error");
  }

  setLoading(false);
}
