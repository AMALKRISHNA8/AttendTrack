import { useState } from "react";
import type { User } from "../../types";
import { loginUser, registerUser } from "../../services/storage";

interface AuthViewProps {
  onAuthSuccess: (user: User) => void;
  showToast: (message: string, type?: "success" | "info" | "error") => void;
}

export function AuthView({ onAuthSuccess, showToast }: AuthViewProps) {
  const [mode, setMode] = useState<"login" | "register">("login");

  // Form Fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSwitchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setError(null);
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (mode === "login") {
      if (!trimmedUsername || !trimmedPassword) {
        setError("Please enter both username and password.");
        return;
      }

      const res = loginUser(trimmedUsername, trimmedPassword);
      if (!res.success || !res.user) {
        setError(res.error || "Invalid username or password.");
        return;
      }

      showToast(`Welcome back, ${res.user.name}!`, "success");
      onAuthSuccess(res.user);
    } else {
      // Register Mode
      if (!trimmedUsername) {
        setError("Please choose a username.");
        return;
      }
      if (trimmedUsername.length < 3) {
        setError("Username must be at least 3 characters.");
        return;
      }
      if (!trimmedPassword) {
        setError("Please enter a password.");
        return;
      }
      if (trimmedPassword.length < 4) {
        setError("Password must be at least 4 characters.");
        return;
      }
      if (trimmedPassword !== confirmPassword.trim()) {
        setError("Passwords do not match.");
        return;
      }

      const res = registerUser(trimmedUsername, trimmedPassword, name.trim());
      if (!res.success || !res.user) {
        setError(res.error || "Could not register user.");
        return;
      }

      showToast(`Account created! Welcome, ${res.user.name}!`, "success");
      onAuthSuccess(res.user);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-brand-header">
        <div className="brand-logo-icon auth-logo">✓</div>
        <h1 className="auth-brand-title">AttendTrack</h1>
        <p className="auth-brand-subtitle">Personal attendance tracking made simple</p>
      </div>

      <div className="card auth-card">
        {/* Switcher Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => handleSwitchMode("login")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => handleSwitchMode("register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error-box" role="alert">
              <span className="auth-error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {mode === "register" && (
            <div className="form-group">
              <label htmlFor="authName" className="form-label">
                Full Name (Optional)
              </label>
              <input
                id="authName"
                type="text"
                className="input-field"
                placeholder="e.g. Alex Johnson"
                value={name}
                maxLength={50}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="authUsername" className="form-label">
              Username <span className="required-star">*</span>
            </label>
            <input
              id="authUsername"
              type="text"
              className="input-field"
              placeholder="e.g. alex24"
              value={username}
              autoFocus
              maxLength={40}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError(null);
              }}
            />
          </div>

          <div className="form-group">
            <div className="space-between">
              <label htmlFor="authPassword" className="form-label">
                Password <span className="required-star">*</span>
              </label>
              <button
                type="button"
                className="toggle-pwd-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="authPassword"
              type={showPassword ? "text" : "password"}
              className="input-field"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
            />
          </div>

          {mode === "register" && (
            <div className="form-group">
              <label htmlFor="authConfirmPassword" className="form-label">
                Confirm Password <span className="required-star">*</span>
              </label>
              <input
                id="authConfirmPassword"
                type={showPassword ? "text" : "password"}
                className="input-field"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full btn-lg auth-submit-btn">
            {mode === "login" ? "Sign In →" : "Create Account →"}
          </button>
        </form>

        <div className="auth-footer">
          {mode === "login" ? (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                className="auth-link"
                onClick={() => handleSwitchMode("register")}
              >
                Create one now
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="auth-link"
                onClick={() => handleSwitchMode("login")}
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthView;
