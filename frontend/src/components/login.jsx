import { useEffect, useState } from "react";

export default function Login({
  email,
  password,
  setEmail,
  setPassword,
  handleLogin,
  handleRegister,
  authMode,
  setAuthMode,
  loading,
  error,
  closingAuth,
}) {
  const [showPass, setShowPass] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#07090A] flex items-center justify-center relative overflow-hidden text-white">
      <div className="absolute w-[500px] h-[500px] bg-[#F5A623]/20 rounded-full blur-[120px] animate-pulse -top-32 -left-32" />
      <div className="absolute w-[400px] h-[400px] bg-[#4FA8F5]/20 rounded-full blur-[120px] animate-pulse -bottom-32 -right-32" />

      <div
        className={`relative z-10 w-[400px] p-8 rounded-2xl backdrop-blur-xl bg-[#131618]/80 border border-[#1F2326] shadow-2xl transition-all duration-700 ${
          loaded && !closingAuth
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-12 scale-95"
        }`}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            FactoryOS{" "}
            <span className="text-[#F5A623]">
              {authMode === "login" ? "LOGIN" : "SIGN UP"}
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Secure access to factory intelligence
          </p>
        </div>

        <div className="space-y-5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@factoryos.com"
            className="w-full px-4 py-2 bg-[#181B1D] border border-[#1F2326] rounded-lg focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]"
          />

          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2 bg-[#181B1D] border border-[#1F2326] rounded-lg focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]"
            />
            <span
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-3 text-xs text-gray-400 cursor-pointer hover:text-[#F5A623]"
            >
              {showPass ? "Hide" : "Show"}
            </span>
          </div>

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <button
            onClick={authMode === "login" ? handleLogin : handleRegister}
            disabled={loading}
            className="w-full py-2 border border-[#F5A623] text-[#F5A623] hover:bg-[#F5A623] hover:text-black transition-all duration-300 font-semibold tracking-widest"
          >
            {loading
              ? "Processing..."
              : authMode === "login"
                ? "LOGIN →"
                : "CREATE ACCOUNT →"}
          </button>
        </div>

        <div className="text-center mt-6 text-sm text-gray-400">
          {authMode === "login" ? (
            <>
              Don’t have an account?{" "}
              <span
                onClick={() => setAuthMode("register")}
                className="text-[#F5A623] cursor-pointer hover:underline"
              >
                Sign Up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                onClick={() => setAuthMode("login")}
                className="text-[#F5A623] cursor-pointer hover:underline"
              >
                Login
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
