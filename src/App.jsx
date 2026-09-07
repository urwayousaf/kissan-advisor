import { useEffect, useRef, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api";
const AI_URL = "http://127.0.0.1:8000";

/* =========================================================
   HELPERS
========================================================= */

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDiseaseName(name) {
  if (!name) return "Unknown";

  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ");
}

function getWeatherDescription(code) {
  const weatherMap = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Light rain showers",
    81: "Moderate rain showers",
    82: "Heavy rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail",
  };

  return weatherMap[code] || "Unknown weather";
}

function getSprayAlert(weather) {
  if (!weather) {
    return {
      type: "info",
      title: "Weather data unavailable",
      message:
        "Use your location to check current weather before spraying.",
    };
  }

  const rain =
    Number(weather.precipitation || 0);

  const rainProbability =
    Number(weather.precipitationProbability || 0);

  const wind =
    Number(weather.windSpeed || 0);

  if (
    rain > 0.1 ||
    rainProbability >= 60
  ) {
    return {
      type: "danger",
      title: "Avoid spraying now",
      message:
        "Rain is possible or currently occurring. Agricultural spray may be affected by rainfall. Check again when conditions improve.",
    };
  }

  if (wind >= 25) {
    return {
      type: "warning",
      title: "Strong wind detected",
      message:
        "Wind conditions may increase spray drift. Consider waiting for calmer conditions and follow the product label.",
    };
  }

  return {
    type: "success",
    title: "Weather looks suitable",
    message:
      "Current conditions do not show a major rain or strong-wind warning. Still follow the pesticide label and Agriculture Officer advice.",
  };
}

/* =========================================================
   WHEAT DISEASE ADVISORY
========================================================= */

function getDiseaseAdvice(disease) {
  switch (disease) {
    case "BrownRust":
      return {
        symptoms:
          "Brown or orange-brown rust pustules may appear on wheat leaves.",
        treatment:
          "Monitor the crop closely and consult an Agriculture Officer for appropriate locally approved treatment.",
        pesticide:
          "Use only a locally registered fungicide recommended for wheat by an Agriculture Officer or according to the product label.",
        prevention:
          "Use suitable resistant varieties where available, monitor the field regularly and maintain good crop management.",
        weather:
          "Avoid spraying during rain or strong wind. Check local weather conditions before applying any agricultural product.",
      };

    case "YellowRust":
      return {
        symptoms:
          "Yellow to yellow-orange rust pustules may develop in lines on wheat leaves.",
        treatment:
          "Monitor the crop regularly and seek Agriculture Officer guidance for timely management.",
        pesticide:
          "Use only a locally registered fungicide approved for wheat and follow the product label and expert recommendation.",
        prevention:
          "Use resistant varieties where available, monitor fields early and follow recommended crop management practices.",
        weather:
          "Avoid spraying during rain or strong wind. Check local weather conditions before application.",
      };

    case "Septoria":
      return {
        symptoms:
          "Septoria can cause leaf lesions, spotting and gradual yellowing or drying of wheat leaves.",
        treatment:
          "Monitor disease development and consult an Agriculture Officer for appropriate management based on crop stage and local conditions.",
        pesticide:
          "Use only locally registered wheat fungicide products when recommended by an agricultural expert and follow the label.",
        prevention:
          "Maintain good field hygiene, monitor lower leaves and follow recommended wheat crop management practices.",
        weather:
          "Wet conditions can favor fungal disease development. Check weather conditions before any spray application.",
      };

    case "Mildew":
      return {
        symptoms:
          "A white or gray powdery growth may appear on affected wheat leaves.",
        treatment:
          "Improve crop monitoring and consult an Agriculture Officer for the appropriate management strategy.",
        pesticide:
          "Use only a locally registered product recommended for wheat mildew and follow the product label.",
        prevention:
          "Avoid excessive crop density where possible, maintain good field management and use resistant varieties where available.",
        weather:
          "Avoid spraying during rain or strong wind and check local weather conditions first.",
      };

    case "Healthy":
      return {
        symptoms:
          "The AI model did not detect one of the trained wheat diseases in the uploaded image.",
        treatment:
          "No disease-specific treatment is recommended from this AI result. Continue regular crop monitoring.",
        pesticide:
          "Do not apply pesticide unnecessarily. Use agricultural products only when there is a confirmed need and expert recommendation.",
        prevention:
          "Continue regular field inspection and follow recommended wheat crop management practices.",
        weather:
          "Continue monitoring local weather conditions before agricultural spray applications.",
      };

    default:
      return {
        symptoms:
          "The AI result could not be matched with a specific advisory.",
        treatment:
          "Please consult an Agriculture Officer for verification.",
        pesticide:
          "Do not apply any pesticide based only on an uncertain AI result.",
        prevention:
          "Continue monitoring the crop and seek expert guidance.",
        weather:
          "Check local weather conditions before any agricultural spray.",
      };
  }
}

/* =========================================================
   FARMER AUTH
========================================================= */

function Auth({
  farmerMode,
  setFarmerMode,
  formData,
  setFormData,
  handleAuth,
  loading,
  error,
  setError,
  setPage,
}) {
  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">🌱</div>

        <div className="auth-title">
          <span className="small-label">KISSAN ADVISOR</span>

          <h2>
            {farmerMode === "login"
              ? "Welcome Back"
              : "Create Farmer Account"}
          </h2>

          <p>
            {farmerMode === "login"
              ? "Login to continue to your farming dashboard."
              : "Create your account and start checking your crops."}
          </p>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleAuth} autoComplete="on">

          {farmerMode === "register" && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Muhammad Ali"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="e.g. farmer@gmail.com"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              autoComplete={
                farmerMode === "register"
                  ? "new-password"
                  : "current-password"
              }
              minLength="6"
              required
            />

            <small className="input-help">
              Minimum 6 characters
            </small>
          </div>

          <button
            type="submit"
            className="primary-btn full-width"
            disabled={loading}
          >
            {loading
              ? "⏳ Please wait..."
              : farmerMode === "login"
              ? "🔐 Login to Account"
              : "🌱 Create Account"}
          </button>
        </form>

        <div className="auth-switch">

          {farmerMode === "login" ? (
            <>
              <span>Don't have an account?</span>

              <button
                type="button"
                onClick={() => {
                  setFarmerMode("register");
                  setError("");

                  setFormData({
                    name: "",
                    email: formData.email,
                    password: "",
                  });
                }}
              >
                Register
              </button>
            </>
          ) : (
            <>
              <span>Already have an account?</span>

              <button
                type="button"
                onClick={() => {
                  setFarmerMode("login");
                  setError("");

                  setFormData({
                    name: "",
                    email: formData.email,
                    password: "",
                  });
                }}
              >
                Login
              </button>
            </>
          )}

        </div>

        <button
          type="button"
          className="back-btn"
          onClick={() => {
            setError("");
            setPage("home");
          }}
        >
          ← Back to Home
        </button>

      </div>
    </div>
  );
}

/* =========================================================
   STAFF LOGIN
========================================================= */

function StaffLogin({
  staffRole,
  setPage,
  onLogin,
}) {
  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = staffRole === "admin";

  const roleName = isAdmin
    ? "Admin"
    : "Agriculture Officer";

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (mode === "register") {
        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (cleanName.length < 2) {
          throw new Error("Please enter your full name.");
        }

        if (password.length < 6) {
          throw new Error(
            "Password must be at least 6 characters."
          );
        }

        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        const endpoint = isAdmin
          ? "/auth/admin-register"
          : "/auth/officer-register";

        const response = await fetch(
          `${API_URL}${endpoint}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: cleanName,
              email: cleanEmail,
              password,
            }),
          }
        );

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          throw new Error(
            data.message || "Registration failed."
          );
        }

        if (!data.token || !data.user) {
          throw new Error(
            "Account created, but login session could not be created."
          );
        }

        onLogin(data.token, data.user);
        return;
      }

      const endpoint = isAdmin
        ? "/auth/admin-login"
        : "/auth/officer-login";

      const response = await fetch(
        `${API_URL}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed."
        );
      }

      if (
        isAdmin &&
        data.user?.role !== "admin"
      ) {
        throw new Error(
          "This account does not have Admin access."
        );
      }

      if (
        !isAdmin &&
        data.user?.role !== "officer"
      ) {
        throw new Error(
          "This account does not have Officer access."
        );
      }

      if (!data.token || !data.user) {
        throw new Error(
          "Login response is incomplete."
        );
      }

      onLogin(data.token, data.user);

    } catch (err) {
      setError(
        err.message ||
        "Unable to complete request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          {isAdmin ? "⚙️" : "👨‍🌾"}
        </div>

        <div className="auth-title">

          <span className="small-label">
            KISSAN ADVISOR
          </span>

          <h2>
            {mode === "login"
              ? `${roleName} Login`
              : `Create ${roleName} Account`}
          </h2>

          <p>
            {mode === "login"
              ? isAdmin
                ? "Login to monitor and manage the complete system."
                : "Login to review farmer crop disease cases."
              : isAdmin
                ? "Create an administrator account for system management."
                : "Create your Agriculture Officer account to review farmer cases."}
          </p>

        </div>

        <div className="auth-switch">

          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => switchMode("login")}
          >
            🔐 Login
          </button>

          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => switchMode("register")}
          >
            📝 Register
          </button>

        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="on">

          {mode === "register" && (
            <div className="form-group">

              <label htmlFor="staff-name">
                Full Name
              </label>

              <input
                id="staff-name"
                name="name"
                type="text"
                placeholder={
                  isAdmin
                    ? "e.g. System Administrator"
                    : "e.g. Muhammad Ali"
                }
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                autoComplete="name"
                required
              />

            </div>
          )}

          <div className="form-group">

            <label htmlFor="staff-email">
              Email Address
            </label>

            <input
              id="staff-email"
              name="email"
              type="email"
              placeholder={
                isAdmin
                  ? "admin@gmail.com"
                  : "officer@gmail.com"
              }
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              autoComplete="email"
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="staff-password">
              Password
            </label>

            <input
              id="staff-password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete={
                mode === "register"
                  ? "new-password"
                  : "current-password"
              }
              minLength="6"
              required
            />

            <small className="input-help">
              Minimum 6 characters
            </small>

          </div>

          {mode === "register" && (
            <div className="form-group">

              <label htmlFor="staff-confirm-password">
                Confirm Password
              </label>

              <input
                id="staff-confirm-password"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                autoComplete="new-password"
                minLength="6"
                required
              />

            </div>
          )}

          <button
            type="submit"
            className="primary-btn full-width"
            disabled={loading}
          >
            {loading
              ? "⏳ Please wait..."
              : mode === "login"
              ? isAdmin
                ? "⚙️ Login as Admin"
                : "👨‍🌾 Login as Officer"
              : isAdmin
              ? "⚙️ Create Admin Account"
              : "👨‍🌾 Create Officer Account"}
          </button>

        </form>

        <div className="auth-switch">

          {mode === "login" ? (
            <>
              <span>
                Don't have an account?
              </span>

              <button
                type="button"
                onClick={() =>
                  switchMode("register")
                }
              >
                Register
              </button>
            </>
          ) : (
            <>
              <span>
                Already have an account?
              </span>

              <button
                type="button"
                onClick={() =>
                  switchMode("login")
                }
              >
                Login
              </button>
            </>
          )}

        </div>

        <button
          type="button"
          className="back-btn"
          onClick={() => {
            setError("");
            setMode("login");
            setPage("home");
          }}
        >
          ← Back to Home
        </button>

      </div>
    </div>
  );
}

/* =========================================================
   HOME
========================================================= */

function Home({
  setPage,
  setFarmerMode,
}) {
  const openFarmerLogin = () => {
    setFarmerMode("login");
    setPage("auth");
  };

  const openRegister = () => {
    setFarmerMode("register");
    setPage("auth");
  };

  return (
    <div className="app">

      <nav className="navbar">

        <div
          className="logo"
          onClick={() => setPage("home")}
        >
          <span className="logo-icon">🌱</span>
          Kissan Advisor
        </div>

        <div className="nav-links">

          <button
            type="button"
            className="nav-btn active"
            onClick={() => setPage("home")}
          >
            Home
          </button>

          <button
            type="button"
            className="nav-btn"
            onClick={openFarmerLogin}
          >
            Farmer Login
          </button>

          <button
            type="button"
            className="register-nav"
            onClick={openRegister}
          >
            Register
          </button>

          <button
            type="button"
            className="officer-nav"
            onClick={() =>
              setPage("officer-login")
            }
          >
            Officer Panel
          </button>

          <button
            type="button"
            className="nav-btn"
            onClick={() =>
              setPage("admin-login")
            }
          >
            Admin
          </button>

        </div>
      </nav>

      <section className="hero">

        <div className="hero-content">

          <div className="hero-badge">
            🇵🇰 Pakistan's Smart Farming Assistant
          </div>

          <h1>
            Smart Crop Disease
            <br />
            <span>Detection & Advisory</span>
          </h1>

          <p>
            Upload a crop leaf image and get AI-based disease
            detection with expert agricultural advice.
          </p>

          <div className="hero-buttons">

            <button
              type="button"
              className="primary-btn"
              onClick={openFarmerLogin}
            >
              Start as Farmer
              <span>→</span>
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() =>
                setPage("officer-login")
              }
            >
              Agriculture Officer
            </button>

          </div>

          <div className="trust-row">
            <span>✓ AI Disease Detection</span>
            <span>✓ Expert Verification</span>
            <span>✓ Urdu & Pashto Voice</span>
          </div>

        </div>

        <div className="hero-card">

          <div className="hero-card-top">
            <span className="live-dot"></span>
            Smart Crop Analysis
          </div>

          <div className="hero-card-icon">
            🌿
          </div>

          <h3>
            Healthy Farming Starts Here
          </h3>

          <p>
            Detect crop diseases early and get reliable
            agricultural guidance.
          </p>

          <div className="mini-stats">

            <div>
              <strong>AI</strong>
              <span>Detection</span>
            </div>

            <div>
              <strong>2+</strong>
              <span>Languages</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>Access</span>
            </div>

          </div>

        </div>

      </section>

      <section className="features">

        <div className="section-heading">

          <span>HOW IT WORKS</span>

          <h2>
            Everything a Farmer Needs
          </h2>

          <p>
            Simple technology designed for real farmers.
          </p>

        </div>

        <div className="feature-grid">

          <div className="feature-card">
            <div className="feature-icon">📷</div>

            <h3>Upload Crop Image</h3>

            <p>
              Take a clear picture of the affected crop leaf
              and upload it.
            </p>

            <div className="feature-number">
              01
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤖</div>

            <h3>AI Disease Detection</h3>

            <p>
              AI analyzes the image and identifies the
              possible wheat disease.
            </p>

            <div className="feature-number">
              02
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👨‍🌾</div>

            <h3>Expert Verification</h3>

            <p>
              Agriculture officers review the result and
              provide expert advice.
            </p>

            <div className="feature-number">
              03
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔊</div>

            <h3>Voice Guidance</h3>

            <p>
              Listen to disease and treatment information
              in your preferred language.
            </p>

            <div className="feature-number">
              04
            </div>
          </div>

        </div>

      </section>

      <footer>

        <div className="footer-logo">
          🌱 Kissan Advisor
        </div>

        <p>
          Smart Farming Technology for Pakistan
        </p>

        <span>
          © 2026 Kissan Advisor
        </span>

      </footer>

    </div>
  );
}

/* =========================================================
   WEATHER SECTION
========================================================= */

function WeatherSection({
  weather,
  locationName,
  weatherLoading,
  locationLoading,
  weatherError,
  getLocationWeather,
}) {
  const sprayAlert = getSprayAlert(weather);

  return (
    <section className="weather-section">

      <div className="section-header">

        <div>

          <p className="small-label">
            SMART WEATHER
          </p>

          <h2>
            🌦️ Weather & Spray Alert
          </h2>

          <p>
            Check your local weather before applying
            agricultural spray.
          </p>

        </div>

        <button
          type="button"
          className="secondary-btn"
          onClick={getLocationWeather}
          disabled={weatherLoading || locationLoading}
        >
          {locationLoading || weatherLoading
            ? "📍 Detecting..."
            : "📍 Use My Location"}
        </button>

      </div>

      {weatherError && (
        <div className="error-message">
          ⚠️ {weatherError}
        </div>
      )}

      {weather ? (

        <div className="weather-dashboard">

          <div className="weather-main-card">

            <div className="weather-location">
              📍 {locationName || "Your Location"}
            </div>

            <div className="weather-temperature">
              {Math.round(weather.temperature)}°C
            </div>

            <h3>
              {getWeatherDescription(weather.weatherCode)}
            </h3>

            <p>
              Current local weather conditions
            </p>

          </div>

          <div className="weather-stats">

            <div className="weather-stat-card">
              <span>💧</span>
              <small>Humidity</small>
              <strong>
                {weather.humidity}%
              </strong>
            </div>

            <div className="weather-stat-card">
              <span>💨</span>
              <small>Wind</small>
              <strong>
                {weather.windSpeed} km/h
              </strong>
            </div>

            <div className="weather-stat-card">
              <span>🌧️</span>
              <small>Rain Probability</small>
              <strong>
                {weather.precipitationProbability}%
              </strong>
            </div>

            <div className="weather-stat-card">
              <span>☔</span>
              <small>Precipitation</small>
              <strong>
                {weather.precipitation} mm
              </strong>
            </div>

          </div>

          <div
            className={`spray-alert ${sprayAlert.type}`}
          >

            <div className="spray-alert-icon">
              {sprayAlert.type === "success"
                ? "✅"
                : sprayAlert.type === "warning"
                ? "⚠️"
                : sprayAlert.type === "danger"
                ? "🚫"
                : "ℹ️"}
            </div>

            <div>
              <small>
                SPRAY ALERT
              </small>

              <h3>
                {sprayAlert.title}
              </h3>

              <p>
                {sprayAlert.message}
              </p>
            </div>

          </div>

        </div>

      ) : (

        <div className="empty-state">

          <div>📍</div>

          <h3>
            Location weather not loaded
          </h3>

          <p>
            Click "Use My Location" to get local
            weather and spray conditions.
          </p>

        </div>

      )}

    </section>
  );
}

/* =========================================================
   VOICE ASSISTANT
========================================================= */

function VoiceAssistant({
  voiceLanguage,
  setVoiceLanguage,
  startVoiceInput,
  stopVoiceInput,
  isListening,
  voiceTranscript,
  voiceAnswer,
  speakAdvice,
}) {
  const supported =
    typeof window !== "undefined" &&
    !!(
      window.SpeechRecognition ||
      window.webkitSpeechRecognition
    );

  return (
    <section className="voice-assistant-section">

      <div className="section-header">

        <div>

          <p className="small-label">
            VOICE ASSISTANT
          </p>

          <h2>
            🎙️ Ask Kissan Advisor
          </h2>

          <p>
            Speak your farming question and get a voice
            response based on your crop analysis.
          </p>

        </div>

      </div>

      <div className="voice-assistant-card">

        <div className="voice-assistant-icon">
          {isListening ? "🎙️" : "🔊"}
        </div>

        <div className="voice-assistant-content">

          <h3>
            {isListening
              ? "Listening..."
              : "Voice Farming Assistant"}
          </h3>

          <p>
            {supported
              ? "Ask about disease, treatment, prevention or weather."
              : "Voice recognition is not supported in this browser."}
          </p>

          <div className="voice-assistant-controls">

            <select
              value={voiceLanguage}
              onChange={(e) =>
                setVoiceLanguage(e.target.value)
              }
            >

              <option value="ur-PK">
                اردو
              </option>

              <option value="ps-PK">
                پښتو
              </option>

              <option value="en-US">
                English
              </option>

            </select>

            {!isListening ? (

              <button
                type="button"
                className="primary-btn"
                onClick={startVoiceInput}
                disabled={!supported}
              >
                🎙️ Ask by Voice
              </button>

            ) : (

              <button
                type="button"
                className="secondary-btn"
                onClick={stopVoiceInput}
              >
                ⏹️ Stop Listening
              </button>

            )}

          </div>

          {voiceTranscript && (

            <div className="voice-message-box">

              <small>
                YOU SAID
              </small>

              <p>
                {voiceTranscript}
              </p>

            </div>

          )}

          {voiceAnswer && (

            <div className="voice-message-box">

              <small>
                KISSAN ADVISOR
              </small>

              <p>
                {voiceAnswer}
              </p>

              <button
                type="button"
                className="secondary-btn"
                onClick={() =>
                  speakAdvice(voiceAnswer)
                }
              >
                🔊 Listen Again
              </button>

            </div>

          )}

        </div>

      </div>

    </section>
  );
}

/* =========================================================
   FARMER DASHBOARD
========================================================= */

function Dashboard({
  farmer,
  cases,
  selectedFile,
  selectedImage,
  isAnalyzing,
  showResult,
  analysisResult,
  error,
  voiceLanguage,
  setVoiceLanguage,
  fileInputRef,
  handleImageChange,
  handleAnalyze,
  loadFarmerCases,
  speakAdvice,
  logout,
  shareCase,

  weather,
  locationName,
  weatherLoading,
  locationLoading,
  weatherError,
  getLocationWeather,

  startVoiceInput,
  stopVoiceInput,
  isListening,
  voiceTranscript,
  voiceAnswer,
}) {
  const [selectedHistoryCase, setSelectedHistoryCase] =
    useState(null);

  const pendingCases = cases.filter(
    (item) => item.status === "Pending"
  ).length;

  const verifiedCases = cases.filter(
    (item) => item.status === "Verified"
  ).length;

  const latestCase =
    cases.length > 0 ? cases[0] : null;

  const currentResult =
    analysisResult ||
    (showResult && latestCase
      ? {
          crop: latestCase.crop,
          disease: latestCase.disease,
          confidence: latestCase.confidence,
          status: "success",
        }
      : null);

  const diseaseName =
    formatDiseaseName(currentResult?.disease);

  const advisory =
    getDiseaseAdvice(currentResult?.disease);

  const voiceText = currentResult
    ? currentResult.disease === "Healthy"
      ? `The AI analysis indicates that your wheat crop appears healthy with ${currentResult.confidence} percent confidence. Continue regular crop monitoring and follow recommended farming practices.`
      : `The AI analysis indicates possible ${diseaseName} in your wheat crop with ${currentResult.confidence} percent confidence. Please follow the recommended precautions and consult an Agriculture Officer before applying any pesticide.`
    : "";

  return (
    <div className="dashboard-page">

      <nav className="dashboard-nav">

        <div className="logo">
          <span className="logo-icon">🌱</span>
          Kissan Advisor
        </div>

        <div className="user-area">

          <span>
            Welcome, <strong>{farmer?.name}</strong>
          </span>

          <button
            type="button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </nav>

      <main className="dashboard-container">

        <div className="dashboard-heading">

          <div>

            <p className="small-label">
              FARMER DASHBOARD
            </p>

            <h1>
              Assalam-o-Alaikum, {farmer?.name} 👋
            </h1>

            <p>
              Upload your wheat crop image to detect possible
              diseases and get agricultural guidance.
            </p>

          </div>

        </div>

        <div className="stats-grid">

          <div className="stat-card">
            <span>📋</span>

            <div>
              <small>Total Cases</small>
              <h3>{cases.length}</h3>
            </div>
          </div>

          <div className="stat-card">
            <span>⏳</span>

            <div>
              <small>Pending</small>
              <h3>{pendingCases}</h3>
            </div>
          </div>

          <div className="stat-card">
            <span>✅</span>

            <div>
              <small>Verified</small>
              <h3>{verifiedCases}</h3>
            </div>
          </div>

        </div>

        <div className="quick-feature-grid">

          <div className="info-feature-card">

            <div className="info-feature-icon">
              🌦️
            </div>

            <div>
              <h3>Weather & Spray Alert</h3>

              <p>
                Real local weather conditions and spray
                recommendations.
              </p>
            </div>

          </div>

          <div className="info-feature-card">

            <div className="info-feature-icon">
              📍
            </div>

            <div>
              <h3>Location Advisory</h3>

              <p>
                Use your location to get area-specific
                weather information.
              </p>
            </div>

          </div>

          <div className="info-feature-card">

            <div className="info-feature-icon">
              🎙️
            </div>

            <div>
              <h3>Voice Assistant</h3>

              <p>
                Ask farming questions using Urdu, Pashto
                or English voice.
              </p>
            </div>

          </div>

        </div>

        <WeatherSection
          weather={weather}
          locationName={locationName}
          weatherLoading={weatherLoading}
          locationLoading={locationLoading}
          weatherError={weatherError}
          getLocationWeather={getLocationWeather}
        />

        <section className="upload-section">

          <div className="section-header">

            <div>

              <p className="small-label">
                AI ANALYSIS
              </p>

              <h2>
                🌾 Check Your Wheat Crop
              </h2>

              <p>
                Upload a clear picture of the affected wheat leaf.
              </p>

            </div>

          </div>

          <div className="upload-box">

            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Selected crop"
                className="preview-image"
              />
            ) : (
              <div className="upload-icon">
                📷
              </div>
            )}

            <h3>
              {selectedFile
                ? selectedFile.name
                : "Upload Wheat Crop Image"}
            </h3>

            <p>
              JPG, PNG or JPEG image
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleImageChange}
              hidden
            />

            <button
              type="button"
              className="secondary-btn"
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              📁 Choose Image
            </button>

            {selectedFile && (
              <button
                type="button"
                className="primary-btn analyze-btn"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing
                  ? "🤖 AI Analyzing..."
                  : "🤖 Analyze Wheat Crop"}
              </button>
            )}

          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {showResult && currentResult && (

            <div className="result-card">

              <div className="result-header">

                <div>

                  <span className="success-badge">
                    ✓ AI Analysis Complete
                  </span>

                  <h2>
                    🌾 {currentResult.crop || "Wheat"}
                  </h2>

                </div>

                <div className="confidence">
                  <strong>
                    {currentResult.confidence}%
                  </strong>

                  <span>
                    Confidence
                  </span>
                </div>

              </div>

              <div className="disease-result">

                <small>
                  DETECTED DISEASE
                </small>

                <h3>
                  {diseaseName}
                </h3>

                <p>
                  {advisory.symptoms}
                </p>

              </div>

              <div className="advisory-grid">

                <div className="advisory-card">

                  <div className="advisory-icon">
                    💊
                  </div>

                  <div>
                    <small>TREATMENT</small>

                    <h3>
                      Recommended Treatment
                    </h3>

                    <p>
                      {advisory.treatment}
                    </p>
                  </div>

                </div>

                <div className="advisory-card">

                  <div className="advisory-icon">
                    🧪
                  </div>

                  <div>
                    <small>PESTICIDE</small>

                    <h3>
                      Pesticide Guidance
                    </h3>

                    <p>
                      {advisory.pesticide}
                    </p>
                  </div>

                </div>

                <div className="advisory-card">

                  <div className="advisory-icon">
                    🛡️
                  </div>

                  <div>
                    <small>PREVENTION</small>

                    <h3>
                      Prevention Tips
                    </h3>

                    <p>
                      {advisory.prevention}
                    </p>
                  </div>

                </div>

                <div className="advisory-card">

                  <div className="advisory-icon">
                    🌦️
                  </div>

                  <div>
                    <small>WEATHER ALERT</small>

                    <h3>
                      Spray Condition
                    </h3>

                    <p>
                      {weather
                        ? getSprayAlert(weather).message
                        : advisory.weather}
                    </p>
                  </div>

                </div>

              </div>

              <div className="location-box">

                <div>

                  <small>📍 LOCATION</small>

                  <strong>
                    {locationName ||
                      "Local agricultural advisory"}
                  </strong>

                  <p>
                    {weather
                      ? "Weather information is being used for local spray-condition guidance."
                      : "Use your location to load local weather and spray conditions."}
                  </p>

                </div>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={getLocationWeather}
                  disabled={locationLoading}
                >
                  {locationLoading
                    ? "📍 Detecting..."
                    : "📍 Use My Location"}
                </button>

              </div>

              <div className="voice-controls">

                <select
                  value={voiceLanguage}
                  onChange={(e) =>
                    setVoiceLanguage(e.target.value)
                  }
                >

                  <option value="ur-PK">
                    اردو Voice
                  </option>

                  <option value="ps-PK">
                    پښتو Voice
                  </option>

                  <option value="en-US">
                    English Voice
                  </option>

                </select>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() =>
                    speakAdvice(voiceText)
                  }
                >
                  🔊 Listen to AI Result
                </button>

              </div>

              {latestCase && (

                <div className="share-case-box">

                  <div>

                    <small>
                      AGRICULTURE OFFICER
                    </small>

                    <h3>
                      Want expert verification?
                    </h3>

                    <p>
                      Share this AI case with an Agriculture
                      Officer for professional review.
                    </p>

                  </div>

                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() =>
                      shareCase(latestCase._id)
                    }
                  >
                    👨‍🌾 Share With Officer
                  </button>

                </div>

              )}

            </div>

          )}

        </section>

        <VoiceAssistant
          voiceLanguage={voiceLanguage}
          setVoiceLanguage={setVoiceLanguage}
          startVoiceInput={startVoiceInput}
          stopVoiceInput={stopVoiceInput}
          isListening={isListening}
          voiceTranscript={voiceTranscript}
          voiceAnswer={voiceAnswer}
          speakAdvice={speakAdvice}
        />

        {latestCase?.advice && (

          <section className="officer-response-section">

            <div className="section-header">

              <div>

                <p className="small-label">
                  EXPERT RESPONSE
                </p>

                <h2>
                  👨‍🌾 Agriculture Officer Advice
                </h2>

                <p>
                  Professional guidance received for your case.
                </p>

              </div>

            </div>

            <div className="officer-response-card">

              <div className="response-icon">
                ✅
              </div>

              <div>

                <h3>
                  Verified Agricultural Advice
                </h3>

                <p>
                  {latestCase.advice}
                </p>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() =>
                    speakAdvice(latestCase.advice)
                  }
                >
                  🔊 Listen to Officer Advice
                </button>

              </div>

            </div>

          </section>

        )}

        <section className="cases-section">

          <div className="section-header">

            <div>

              <p className="small-label">
                HISTORY
              </p>

              <h2>
                📋 My Case History
              </h2>

              <p>
                Your previous crop disease cases.
              </p>

            </div>

            <button
              type="button"
              className="secondary-btn"
              onClick={loadFarmerCases}
            >
              🔄 Refresh
            </button>

          </div>

          {cases.length === 0 ? (

            <div className="empty-state">

              <div>🌱</div>

              <h3>
                No cases yet
              </h3>

              <p>
                Upload your first wheat crop image to create
                a disease case.
              </p>

            </div>

          ) : (

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>
                    <th>Case ID</th>
                    <th>Crop</th>
                    <th>Disease</th>
                    <th>Confidence</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {cases.map((item) => (

                    <tr key={item._id}>

                      <td>
                        <strong>
                          {item.caseId}
                        </strong>
                      </td>

                      <td>
                        {item.crop}
                      </td>

                      <td>
                        {formatDiseaseName(item.disease)}
                      </td>

                      <td>
                        {item.confidence}%
                      </td>

                      <td>

                        <span
                          className={`status ${
                            item.status === "Verified"
                              ? "verified"
                              : "pending"
                          }`}
                        >
                          {item.status}
                        </span>

                      </td>

                      <td>
                        {formatDate(item.createdAt)}
                      </td>

                      <td>

                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() =>
                            setSelectedHistoryCase(item)
                          }
                        >
                          View
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {selectedHistoryCase && (

          <section className="case-detail-card">

            <div className="section-header">

              <div>

                <p className="small-label">
                  CASE DETAILS
                </p>

                <h2>
                  📄 {selectedHistoryCase.caseId}
                </h2>

              </div>

              <button
                type="button"
                className="secondary-btn"
                onClick={() =>
                  setSelectedHistoryCase(null)
                }
              >
                ✕ Close
              </button>

            </div>

            {selectedHistoryCase.image && (

              <img
                src={selectedHistoryCase.image}
                alt="Case crop"
                className="case-detail-image"
              />

            )}

            <div className="detail-grid">

              <div>
                <small>Crop</small>

                <strong>
                  {selectedHistoryCase.crop}
                </strong>
              </div>

              <div>
                <small>Disease</small>

                <strong>
                  {formatDiseaseName(
                    selectedHistoryCase.disease
                  )}
                </strong>
              </div>

              <div>
                <small>Confidence</small>

                <strong>
                  {selectedHistoryCase.confidence}%
                </strong>
              </div>

              <div>
                <small>Status</small>

                <strong>
                  {selectedHistoryCase.status}
                </strong>
              </div>

            </div>

            {selectedHistoryCase.advice && (

              <div className="advice-box">

                <strong>
                  👨‍🌾 Agriculture Officer Advice
                </strong>

                <p>
                  {selectedHistoryCase.advice}
                </p>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() =>
                    speakAdvice(
                      selectedHistoryCase.advice
                    )
                  }
                >
                  🔊 Read Advice
                </button>

              </div>

            )}

          </section>

        )}

      </main>

    </div>
  );
}

/* =========================================================
   OFFICER DASHBOARD
========================================================= */

function OfficerDashboard({
  cases,
  selectedCase,
  setSelectedCase,
  advice,
  setAdvice,
  loadOfficerCases,
  verifyCase,
  sendAdvice,
  speakAdvice,
  setPage,
  correctDiagnosis,
  setCorrectDiagnosis,
  logout,
}) {
  const [filter, setFilter] = useState("All");

  const filteredCases = cases.filter((item) => {
    if (filter === "All") return true;
    return item.status === filter;
  });

  const pendingCases = cases.filter(
    (item) => item.status === "Pending"
  );

  const verifiedCases = cases.filter(
    (item) => item.status === "Verified"
  );

  return (
    <div className="dashboard-page">

      <nav className="dashboard-nav">

        <div className="logo">
          <span className="logo-icon">🌱</span>
          Kissan Advisor
        </div>

        <div className="user-area">

          <button
            type="button"
            onClick={() => setPage("home")}
          >
            ← Home
          </button>

          <button
            type="button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </nav>

      <main className="dashboard-container">

        <div className="dashboard-heading">

          <div>

            <p className="small-label">
              AGRICULTURE OFFICER PANEL
            </p>

            <h1>
              Disease Case Management 👨‍🌾
            </h1>

            <p>
              Review AI results and provide expert
              agricultural advice.
            </p>

          </div>

          <button
            type="button"
            className="secondary-btn"
            onClick={loadOfficerCases}
          >
            🔄 Refresh Cases
          </button>

        </div>

        <div className="stats-grid">

          <div className="stat-card">

            <span>📋</span>

            <div>
              <small>Total Cases</small>
              <h3>{cases.length}</h3>
            </div>

          </div>

          <div className="stat-card">

            <span>⏳</span>

            <div>
              <small>Pending Review</small>

              <h3>
                {pendingCases.length}
              </h3>
            </div>

          </div>

          <div className="stat-card">

            <span>✅</span>

            <div>
              <small>Verified Cases</small>

              <h3>
                {verifiedCases.length}
              </h3>
            </div>

          </div>

        </div>

        <section className="cases-section">

          <div className="section-header">

            <div>

              <p className="small-label">
                CASE MANAGEMENT
              </p>

              <h2>
                📋 Farmer Cases
              </h2>

              <p>
                Select a case to review.
              </p>

            </div>

          </div>

          <div className="case-filters">

            <button
              type="button"
              className={
                filter === "All"
                  ? "filter-btn active"
                  : "filter-btn"
              }
              onClick={() => setFilter("All")}
            >
              All ({cases.length})
            </button>

            <button
              type="button"
              className={
                filter === "Pending"
                  ? "filter-btn active"
                  : "filter-btn"
              }
              onClick={() => setFilter("Pending")}
            >
              Pending ({pendingCases.length})
            </button>

            <button
              type="button"
              className={
                filter === "Verified"
                  ? "filter-btn active"
                  : "filter-btn"
              }
              onClick={() => setFilter("Verified")}
            >
              Verified ({verifiedCases.length})
            </button>

          </div>

          {filteredCases.length === 0 ? (

            <div className="empty-state">

              <div>📭</div>

              <h3>
                No cases available
              </h3>

              <p>
                Farmer cases will appear here.
              </p>

            </div>

          ) : (

            <div className="officer-layout">

              <div className="case-list">

                {filteredCases.map((item) => (

                  <div
                    key={item._id}
                    className={`case-item ${
                      selectedCase?._id === item._id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedCase(item)
                    }
                  >

                    <div>

                      <strong>
                        {item.caseId}
                      </strong>

                      <p>
                        {item.farmerName}
                      </p>

                      <small>
                        {item.crop} •{" "}
                        {formatDiseaseName(item.disease)}
                      </small>

                    </div>

                    <span
                      className={`status ${
                        item.status === "Verified"
                          ? "verified"
                          : "pending"
                      }`}
                    >
                      {item.status}
                    </span>

                  </div>

                ))}

              </div>

              <div className="review-panel">

                {!selectedCase ? (

                  <div className="empty-state">

                    <div>👈</div>

                    <h3>
                      Select a case
                    </h3>

                    <p>
                      Choose a farmer case from the list
                      to review it.
                    </p>

                  </div>

                ) : (

                  <>

                    <div className="review-header">

                      <div>

                        <small>
                          Case ID
                        </small>

                        <h2>
                          {selectedCase.caseId}
                        </h2>

                      </div>

                      <span
                        className={`status ${
                          selectedCase.status === "Verified"
                            ? "verified"
                            : "pending"
                        }`}
                      >
                        {selectedCase.status}
                      </span>

                    </div>

                    {selectedCase.image && (

                      <img
                        src={selectedCase.image}
                        alt="Crop"
                        className="case-image"
                      />

                    )}

                    <div className="review-info">

                      <div>
                        <small>Farmer</small>

                        <strong>
                          {selectedCase.farmerName}
                        </strong>
                      </div>

                      <div>
                        <small>Crop</small>

                        <strong>
                          {selectedCase.crop}
                        </strong>
                      </div>

                      <div>
                        <small>AI Disease</small>

                        <strong>
                          {formatDiseaseName(
                            selectedCase.disease
                          )}
                        </strong>
                      </div>

                      <div>
                        <small>Confidence</small>

                        <strong>
                          {selectedCase.confidence}%
                        </strong>
                      </div>

                    </div>

                    <div className="expert-review-box">

                      <div className="expert-review-title">

                        <span>🤖</span>

                        <div>

                          <small>
                            AI DIAGNOSIS
                          </small>

                          <h3>
                            {formatDiseaseName(
                              selectedCase.disease
                            )}
                          </h3>

                        </div>

                      </div>

                      <p>
                        Review the AI result before providing
                        final agricultural guidance.
                      </p>

                    </div>

                    <div className="review-form">

                      <label>
                        Expert / Corrected Diagnosis
                      </label>

                      <input
                        type="text"
                        placeholder="e.g. Yellow Rust"
                        value={
                          correctDiagnosis ||
                          formatDiseaseName(
                            selectedCase.disease
                          ) ||
                          ""
                        }
                        onChange={(e) =>
                          setCorrectDiagnosis(
                            e.target.value
                          )
                        }
                      />

                    </div>

                    <div className="review-actions">

                      {selectedCase.status === "Pending" && (

                        <button
                          type="button"
                          className="primary-btn"
                          onClick={() =>
                            verifyCase(selectedCase._id)
                          }
                        >
                          ✅ Verify Case
                        </button>

                      )}

                      <textarea
                        placeholder="Write treatment/advisory for the farmer..."
                        value={advice}
                        onChange={(e) =>
                          setAdvice(e.target.value)
                        }
                        rows="5"
                      />

                      <button
                        type="button"
                        className="primary-btn"
                        onClick={sendAdvice}
                      >
                        💬 Send Advice to Farmer
                      </button>

                      {selectedCase.advice && (

                        <div className="advice-box">

                          <strong>
                            Officer Advice:
                          </strong>

                          <p>
                            {selectedCase.advice}
                          </p>

                          <button
                            type="button"
                            className="secondary-btn"
                            onClick={() =>
                              speakAdvice(
                                selectedCase.advice
                              )
                            }
                          >
                            🔊 Read Advice
                          </button>

                        </div>

                      )}

                    </div>

                  </>

                )}

              </div>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard({
  cases,
  setPage,
  logout,
}) {
  const verifiedCases = cases.filter(
    (item) => item.status === "Verified"
  ).length;

  const pendingCases = cases.filter(
    (item) => item.status === "Pending"
  ).length;

  const cropCount = new Set(
    cases
      .map((item) => item.crop)
      .filter(Boolean)
  ).size;

  const diseaseCount = new Set(
    cases
      .map((item) => item.disease)
      .filter(Boolean)
  ).size;

  return (
    <div className="dashboard-page">

      <nav className="dashboard-nav">

        <div className="logo">
          <span className="logo-icon">🌱</span>
          Kissan Advisor
        </div>

        <div className="user-area">

          <button
            type="button"
            onClick={() => setPage("home")}
          >
            ← Home
          </button>

          <button
            type="button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </nav>

      <main className="dashboard-container">

        <div className="dashboard-heading">

          <div>

            <p className="small-label">
              ADMIN PANEL
            </p>

            <h1>
              System Management ⚙️
            </h1>

            <p>
              Monitor farmers, disease cases and agricultural
              advisory data.
            </p>

          </div>

        </div>

        <div className="stats-grid">

          <div className="stat-card">

            <span>👨‍🌾</span>

            <div>
              <small>Farm Cases</small>
              <h3>{cases.length}</h3>
            </div>

          </div>

          <div className="stat-card">

            <span>⏳</span>

            <div>
              <small>Pending Cases</small>
              <h3>{pendingCases}</h3>
            </div>

          </div>

          <div className="stat-card">

            <span>✅</span>

            <div>
              <small>Verified Cases</small>
              <h3>{verifiedCases}</h3>
            </div>

          </div>

        </div>

        <div className="admin-grid">

          <div className="admin-card">

            <div className="admin-card-icon">
              👨‍🌾
            </div>

            <h3>
              Farmers
            </h3>

            <p>
              Registered farmers can upload wheat crop disease
              cases and receive agricultural guidance.
            </p>

            <strong>
              Farmer Management
            </strong>

          </div>

          <div className="admin-card">

            <div className="admin-card-icon">
              👨‍💼
            </div>

            <h3>
              Agriculture Officers
            </h3>

            <p>
              Officers review AI diagnoses and provide expert
              verification and advice.
            </p>

            <strong>
              Officer Management
            </strong>

          </div>

          <div className="admin-card">

            <div className="admin-card-icon">
              🌾
            </div>

            <h3>
              Crop Database
            </h3>

            <p>
              The current AI model is trained specifically
              for wheat disease detection.
            </p>

            <strong>
              {cropCount} detected crop types
            </strong>

          </div>

          <div className="admin-card">

            <div className="admin-card-icon">
              🦠
            </div>

            <h3>
              Disease Database
            </h3>

            <p>
              Current AI model supports Brown Rust, Yellow Rust,
              Septoria, Mildew and Healthy wheat classes.
            </p>

            <strong>
              {diseaseCount} detected diseases
            </strong>

          </div>

          <div className="admin-card">

            <div className="admin-card-icon">
              🧪
            </div>

            <h3>
              Treatment & Pesticides
            </h3>

            <p>
              Manage treatment guidance and locally relevant
              pesticide recommendations.
            </p>

            <strong>
              Advisory Management
            </strong>

          </div>

          <div className="admin-card">

            <div className="admin-card-icon">
              📊
            </div>

            <h3>
              Case Monitoring
            </h3>

            <p>
              Monitor pending, verified and completed farmer
              disease cases.
            </p>

            <strong>
              System Monitoring
            </strong>

          </div>

        </div>

        <section className="cases-section">

          <div className="section-header">

            <div>

              <p className="small-label">
                RECENT CASES
              </p>

              <h2>
                📋 Case Monitoring
              </h2>

              <p>
                Latest disease cases in the system.
              </p>

            </div>

          </div>

          {cases.length === 0 ? (

            <div className="empty-state">

              <div>📭</div>

              <h3>
                No cases yet
              </h3>

              <p>
                System cases will appear here.
              </p>

            </div>

          ) : (

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>
                    <th>Case ID</th>
                    <th>Farmer</th>
                    <th>Crop</th>
                    <th>Disease</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>

                </thead>

                <tbody>

                  {cases
                    .slice(0, 10)
                    .map((item) => (

                      <tr key={item._id}>

                        <td>
                          <strong>
                            {item.caseId}
                          </strong>
                        </td>

                        <td>
                          {item.farmerName || "Farmer"}
                        </td>

                        <td>
                          {item.crop}
                        </td>

                        <td>
                          {formatDiseaseName(item.disease)}
                        </td>

                        <td>

                          <span
                            className={`status ${
                              item.status === "Verified"
                                ? "verified"
                                : "pending"
                            }`}
                          >
                            {item.status}
                          </span>

                        </td>

                        <td>
                          {formatDate(item.createdAt)}
                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

function App() {

  const [page, setPage] = useState(() => {
    try {
      const storedStaff = JSON.parse(
        localStorage.getItem("ka_staff_user")
      );

      if (storedStaff?.role === "admin") {
        return "admin";
      }

      if (storedStaff?.role === "officer") {
        return "officer";
      }

      const storedFarmer = JSON.parse(
        localStorage.getItem("ka_user")
      );

      if (storedFarmer?.role === "farmer") {
        return "dashboard";
      }

    } catch {
      // Ignore invalid localStorage
    }

    return "home";
  });

  /* =======================================================
     FARMER SESSION
  ======================================================= */

  const [farmerMode, setFarmerMode] =
    useState("login");

  const [farmer, setFarmer] =
    useState(() => {
      try {
        return (
          JSON.parse(
            localStorage.getItem("ka_user")
          ) || null
        );
      } catch {
        return null;
      }
    });

  const [token, setToken] =
    useState(
      localStorage.getItem("ka_token") || ""
    );

  /* =======================================================
     STAFF SESSION
  ======================================================= */

  const [staffUser, setStaffUser] =
    useState(() => {
      try {
        return (
          JSON.parse(
            localStorage.getItem(
              "ka_staff_user"
            )
          ) || null
        );
      } catch {
        return null;
      }
    });

  const [staffToken, setStaffToken] =
    useState(
      localStorage.getItem(
        "ka_staff_token"
      ) || ""
    );

  /* =======================================================
     FORM
  ======================================================= */

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      password: "",
    });

  /* =======================================================
     IMAGE / AI
  ======================================================= */

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [selectedImage, setSelectedImage] =
    useState("");

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [showResult, setShowResult] =
    useState(false);

  const [analysisResult, setAnalysisResult] =
    useState(null);

  /* =======================================================
     CASES
  ======================================================= */

  const [cases, setCases] =
    useState([]);

  const [selectedCase, setSelectedCase] =
    useState(null);

  const [advice, setAdvice] =
    useState("");

  const [correctDiagnosis, setCorrectDiagnosis] =
    useState("");

  /* =======================================================
     OTHER STATES
  ======================================================= */

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [voiceLanguage, setVoiceLanguage] =
    useState("ur-PK");

  /* =======================================================
     WEATHER / LOCATION STATES
  ======================================================= */

  const [weather, setWeather] =
    useState(null);

  const [locationName, setLocationName] =
    useState("");

  const [weatherLoading, setWeatherLoading] =
    useState(false);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [weatherError, setWeatherError] =
    useState("");

  /* =======================================================
     VOICE ASSISTANT STATES
  ======================================================= */

  const [isListening, setIsListening] =
    useState(false);

  const [voiceTranscript, setVoiceTranscript] =
    useState("");

  const [voiceAnswer, setVoiceAnswer] =
    useState("");

  const recognitionRef =
    useRef(null);

  const fileInputRef =
    useRef(null);

  /* =========================================================
     API REQUEST
  ========================================================= */

  const apiRequest = async (
    url,
    options = {},
    authToken = token
  ) => {

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (authToken) {
      headers.Authorization =
        `Bearer ${authToken}`;
    }

    const response = await fetch(
      `${API_URL}${url}`,
      {
        ...options,
        headers,
      }
    );

    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
        "Something went wrong."
      );
    }

    return data;
  };

  /* =========================================================
     LOAD FARMER CASES
  ========================================================= */

  const loadFarmerCases = async () => {

    if (!token) {
      return;
    }

    try {

      const data =
        await apiRequest("/cases/my");

      const caseList =
        Array.isArray(data)
          ? data
          : data.cases || [];

      setCases(caseList);

    } catch (err) {

      console.error(
        "Farmer cases error:",
        err
      );

    }
  };

  /* =========================================================
     LOAD OFFICER / ADMIN CASES
  ========================================================= */

  const loadOfficerCases = async () => {

    if (!staffToken) {
      setCases([]);
      return;
    }

    try {

      const data =
        await apiRequest(
          "/cases",
          {},
          staffToken
        );

      const caseList =
        Array.isArray(data)
          ? data
          : data.cases || [];

      setCases(caseList);

    } catch (err) {

      console.error(
        "Officer/Admin cases error:",
        err
      );

      setCases([]);
    }
  };

  /* =========================================================
     AUTO LOAD FARMER CASES
  ========================================================= */

  useEffect(() => {

    if (
      farmer &&
      token &&
      farmer.role === "farmer"
    ) {
      loadFarmerCases();
    }

  }, [farmer, token]);

  /* =========================================================
     AUTO LOAD STAFF CASES
  ========================================================= */

  useEffect(() => {

    if (
      staffUser &&
      staffToken &&
      (
        staffUser.role === "officer" ||
        staffUser.role === "admin"
      )
    ) {
      loadOfficerCases();
    }

  }, [staffUser, staffToken]);

  /* =========================================================
     CLEANUP VOICE
  ========================================================= */

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore cleanup errors
        }
      }

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /* =========================================================
     STAFF LOGIN
  ========================================================= */

  const handleStaffLogin =
    (newToken, user) => {

      if (!newToken || !user) {
        return;
      }

      localStorage.setItem(
        "ka_staff_token",
        newToken
      );

      localStorage.setItem(
        "ka_staff_user",
        JSON.stringify(user)
      );

      setStaffToken(newToken);
      setStaffUser(user);

      setCases([]);
      setSelectedCase(null);
      setAdvice("");
      setCorrectDiagnosis("");

      if (user.role === "admin") {
        setPage("admin");
      } else {
        setPage("officer");
      }
    };

  /* =========================================================
     FARMER AUTH
  ========================================================= */

  const handleAuth =
    async (e) => {

      e.preventDefault();

      setLoading(true);
      setError("");

      const cleanName =
        formData.name.trim();

      const cleanEmail =
        formData.email
          .trim()
          .toLowerCase();

      const cleanPassword =
        formData.password;

      if (
        farmerMode === "register" &&
        cleanName.length < 2
      ) {

        setError(
          "Please enter your full name."
        );

        setLoading(false);
        return;
      }

      if (cleanPassword.length < 6) {

        setError(
          "Password must be at least 6 characters."
        );

        setLoading(false);
        return;
      }

      try {

        const endpoint =
          farmerMode === "register"
            ? "/auth/register"
            : "/auth/login";

        const body =
          farmerMode === "register"
            ? {
                name: cleanName,
                email: cleanEmail,
                password: cleanPassword,
              }
            : {
                email: cleanEmail,
                password: cleanPassword,
              };

        const data =
          await apiRequest(
            endpoint,
            {
              method: "POST",
              body: JSON.stringify(body),
            }
          );

        localStorage.setItem(
          "ka_token",
          data.token
        );

        localStorage.setItem(
          "ka_user",
          JSON.stringify(data.user)
        );

        setToken(data.token);
        setFarmer(data.user);

        setFormData({
          name: "",
          email: "",
          password: "",
        });

        setError("");
        setPage("dashboard");

      } catch (err) {

        setError(
          err.message ||
          "Unable to complete request."
        );

      } finally {

        setLoading(false);

      }
    };

  /* =========================================================
     FARMER LOGOUT
  ========================================================= */

  const logout = () => {

    localStorage.removeItem("ka_token");
    localStorage.removeItem("ka_user");

    setToken("");
    setFarmer(null);

    setCases([]);
    setSelectedCase(null);
    setAdvice("");
    setCorrectDiagnosis("");

    setSelectedFile(null);
    setSelectedImage("");
    setShowResult(false);
    setAnalysisResult(null);

    setWeather(null);
    setLocationName("");
    setVoiceTranscript("");
    setVoiceAnswer("");

    setPage("home");
  };

  /* =========================================================
     STAFF LOGOUT
  ========================================================= */

  const staffLogout = () => {

    localStorage.removeItem(
      "ka_staff_token"
    );

    localStorage.removeItem(
      "ka_staff_user"
    );

    setStaffToken("");
    setStaffUser(null);

    setCases([]);
    setSelectedCase(null);
    setAdvice("");
    setCorrectDiagnosis("");

    setPage("home");
  };

  /* =========================================================
     FILE TO BASE64
  ========================================================= */

  const fileToBase64 = (file) => {

    return new Promise(
      (resolve, reject) => {

        const reader =
          new FileReader();

        reader.readAsDataURL(file);

        reader.onload =
          () => resolve(
            reader.result
          );

        reader.onerror =
          reject;
      }
    );
  };

  /* =========================================================
     IMAGE CHANGE
  ========================================================= */

  const handleImageChange =
    (e) => {

      const file =
        e.target.files?.[0];

      if (!file) {
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (
        !allowedTypes.includes(
          file.type
        )
      ) {

        setError(
          "Please select a JPG, PNG or WEBP image."
        );

        return;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {

        setError(
          "Image size must be less than 5MB."
        );

        return;
      }

      setSelectedFile(file);

      const imageUrl =
        URL.createObjectURL(file);

      setSelectedImage(imageUrl);

      setShowResult(false);
      setAnalysisResult(null);
      setError("");
    };

  /* =========================================================
     REAL AI ANALYSIS
  ========================================================= */

  const handleAnalyze =
    async () => {

      if (!selectedFile) {

        setError(
          "Please select a crop image first."
        );

        return;
      }

      if (!token) {

        setError(
          "Please login as a farmer first."
        );

        return;
      }

      setIsAnalyzing(true);
      setError("");
      setShowResult(false);
      setAnalysisResult(null);

      try {

        /* =====================================================
           STEP 1
           SEND IMAGE TO PYTHON AI SERVICE
        ===================================================== */

        const formDataAI =
          new FormData();

        formDataAI.append(
          "file",
          selectedFile
        );

        const aiResponse =
          await fetch(
            `${AI_URL}/predict`,
            {
              method: "POST",
              body: formDataAI,
            }
          );

        let aiData = {};

        try {
          aiData =
            await aiResponse.json();
        } catch {
          aiData = {};
        }

        if (!aiResponse.ok) {

          throw new Error(
            aiData.detail ||
            aiData.message ||
            "AI service could not analyze the image."
          );
        }

        if (
          aiData.status !== "success" ||
          !aiData.disease
        ) {

          throw new Error(
            "AI service returned an invalid result."
          );
        }

        console.log(
          "REAL AI RESULT:",
          aiData
        );

        /* =====================================================
           STEP 2
           SAVE AI CASE TO NODE/MONGODB
        ===================================================== */

        const imageBase64 =
          await fileToBase64(
            selectedFile
          );

        const caseResponse =
          await apiRequest(
            "/cases",
            {
              method: "POST",

              body: JSON.stringify({
                crop:
                  aiData.crop ||
                  "Wheat",

                disease:
                  aiData.disease,

                confidence:
                  aiData.confidence,

                image:
                  imageBase64,
              }),
            }
          );

        /* =====================================================
           STEP 3
           SHOW REAL RESULT
        ===================================================== */

        const realResult = {
          crop:
            aiData.crop ||
            "Wheat",

          disease:
            aiData.disease,

          confidence:
            aiData.confidence,

          status:
            "success",
        };

        setAnalysisResult(
          realResult
        );

        setShowResult(true);

        /* =====================================================
           STEP 4
           UPDATE CASE HISTORY
        ===================================================== */

        if (caseResponse?.case) {

          setCases(
            (previous) => [
              caseResponse.case,
              ...previous,
            ]
          );

        } else {

          await loadFarmerCases();

        }

      } catch (err) {

        console.error(
          "AI ANALYSIS ERROR:",
          err
        );

        let message =
          err.message ||
          "Unable to analyze image.";

        if (
          message.includes(
            "Failed to fetch"
          )
        ) {

          message =
            "AI service is not reachable. Make sure the Python AI server is running on http://127.0.0.1:8000";
        }

        setError(message);

      } finally {

        setIsAnalyzing(false);

      }
    };

  /* =========================================================
     SHARE CASE
  ========================================================= */

  const shareCase =
    async (caseId) => {

      if (!caseId) {

        alert(
          "Please create a case first."
        );

        return;
      }

      try {

        /*
          The officer dashboard already reads cases from
          the backend. Therefore this action refreshes the
          case and confirms that it is available for officer
          review.
        */

        await loadFarmerCases();

        alert(
          "✅ Case is available for Agriculture Officer review."
        );

      } catch (err) {

        alert(
          err.message ||
          "Unable to share case."
        );
      }
    };

  /* =========================================================
     VERIFY CASE
  ========================================================= */

  const verifyCase =
    async (caseId) => {

      if (!staffToken) {

        alert(
          "Staff session expired. Please login again."
        );

        return;
      }

      try {

        const data =
          await apiRequest(
            `/cases/${caseId}/verify`,
            {
              method: "PUT",
            },
            staffToken
          );

        setCases(
          (previous) =>
            previous.map(
              (item) =>
                item._id === caseId
                  ? data.case
                  : item
            )
        );

        setSelectedCase(
          data.case
        );

      } catch (err) {

        alert(
          err.message
        );
      }
    };

  /* =========================================================
     SEND ADVICE
  ========================================================= */

  const sendAdvice =
    async () => {

      if (
        !selectedCase ||
        !advice.trim()
      ) {

        alert(
          "Please write advice first."
        );

        return;
      }

      if (!staffToken) {

        alert(
          "Staff session expired. Please login again."
        );

        return;
      }

      try {

        const data =
          await apiRequest(
            `/cases/${selectedCase._id}/advice`,
            {
              method: "PUT",

              body: JSON.stringify({
                advice:
                  advice.trim(),
              }),
            },
            staffToken
          );

        setCases(
          (previous) =>
            previous.map(
              (item) =>
                item._id ===
                selectedCase._id
                  ? data.case
                  : item
            )
        );

        setSelectedCase(
          data.case
        );

        setAdvice("");

        alert(
          "Advice sent successfully 🌱"
        );

      } catch (err) {

        alert(
          err.message
        );
      }
    };

  /* =========================================================
     TEXT TO SPEECH
  ========================================================= */

  const speakAdvice =
    (text) => {

      if (
        !window.speechSynthesis
      ) {

        alert(
          "Voice is not supported in this browser."
        );

        return;
      }

      if (!text) {
        return;
      }

      window.speechSynthesis.cancel();

      const speech =
        new SpeechSynthesisUtterance(
          text
        );

      speech.lang =
        voiceLanguage;

      speech.rate = 0.9;
      speech.pitch = 1;

      window.speechSynthesis.speak(
        speech
      );
    };

  /* =========================================================
     WEATHER + LOCATION
  ========================================================= */

  const getLocationWeather =
    () => {

      if (
        !navigator.geolocation
      ) {

        setWeatherError(
          "Location services are not supported by this browser."
        );

        return;
      }

      setLocationLoading(true);
      setWeatherLoading(true);
      setWeatherError("");

      navigator.geolocation.getCurrentPosition(
        async (position) => {

          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          try {

            /*
              Open-Meteo provides weather without requiring
              an API key.
            */

            const weatherUrl =
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=precipitation_probability&forecast_days=1&timezone=auto`;

            const weatherResponse =
              await fetch(
                weatherUrl
              );

            if (!weatherResponse.ok) {
              throw new Error(
                "Unable to load weather information."
              );
            }

            const weatherData =
              await weatherResponse.json();

            const current =
              weatherData.current || {};

            const hourly =
              weatherData.hourly || {};

            const currentHour =
              new Date(current.time);

            let precipitationProbability =
              0;

            if (
              Array.isArray(
                hourly.time
              ) &&
              Array.isArray(
                hourly.precipitation_probability
              )
            ) {

              const index =
                hourly.time.findIndex(
                  (time) =>
                    new Date(time).getHours() ===
                    currentHour.getHours()
                );

              if (index >= 0) {

                precipitationProbability =
                  Number(
                    hourly
                      .precipitation_probability[
                      index
                    ] || 0
                  );

              }
            }

            setWeather({
              temperature:
                Number(
                  current.temperature_2m ||
                  0
                ),

              humidity:
                Number(
                  current.relative_humidity_2m ||
                  0
                ),

              precipitation:
                Number(
                  current.precipitation ||
                  0
                ),

              weatherCode:
                Number(
                  current.weather_code ??
                  0
                ),

              windSpeed:
                Number(
                  current.wind_speed_10m ||
                  0
                ),

              precipitationProbability,
            });

            /*
              Reverse geocoding gives a readable place name.
            */

            try {

              const geoResponse =
                await fetch(
                  `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`
                );

              if (geoResponse.ok) {

                const geoData =
                  await geoResponse.json();

                const place =
                  geoData.results?.[0];

                if (place) {

                  const parts = [
                    place.name,
                    place.admin2,
                    place.admin1,
                  ].filter(Boolean);

                  setLocationName(
                    [...new Set(parts)]
                      .join(", ")
                  );

                } else {

                  setLocationName(
                    `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
                  );

                }

              }

            } catch {
              setLocationName(
                `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
              );
            }

          } catch (err) {

            console.error(
              "WEATHER ERROR:",
              err
            );

            setWeatherError(
              err.message ||
              "Unable to load weather information."
            );

          } finally {

            setWeatherLoading(false);
            setLocationLoading(false);

          }
        },

        (geoError) => {

          console.error(
            "LOCATION ERROR:",
            geoError
          );

          let message =
            "Unable to access your location.";

          if (
            geoError.code ===
            geoError.PERMISSION_DENIED
          ) {
            message =
              "Location permission was denied. Please allow location access in your browser and try again.";
          }

          if (
            geoError.code ===
            geoError.POSITION_UNAVAILABLE
          ) {
            message =
              "Your location could not be determined.";
          }

          if (
            geoError.code ===
            geoError.TIMEOUT
          ) {
            message =
              "Location request timed out. Please try again.";
          }

          setWeatherError(message);

          setWeatherLoading(false);
          setLocationLoading(false);
        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000,
        }
      );
    };

  /* =========================================================
     VOICE QUESTION ANSWER
  ========================================================= */

  const createVoiceAnswer =
    (question) => {

      const lowerQuestion =
        question.toLowerCase();

      const latestResult =
        analysisResult ||
        (
          cases.length > 0
            ? {
                crop: cases[0].crop,
                disease: cases[0].disease,
                confidence:
                  cases[0].confidence,
              }
            : null
        );

      if (!latestResult) {

        return (
          "Please upload a wheat crop image first. " +
          "After the AI analysis, you can ask me about disease, treatment, prevention or weather."
        );
      }

      const disease =
        formatDiseaseName(
          latestResult.disease
        );

      const currentAdvisory =
        getDiseaseAdvice(
          latestResult.disease
        );

      if (
        lowerQuestion.includes("disease") ||
        lowerQuestion.includes("bimari") ||
        lowerQuestion.includes("مرض") ||
        lowerQuestion.includes("what") ||
        lowerQuestion.includes("kya")
      ) {

        return (
          `The AI detected possible ${disease} in your wheat crop with ${latestResult.confidence} percent confidence. Please ask an Agriculture Officer for final verification.`
        );
      }

      if (
        lowerQuestion.includes("treatment") ||
        lowerQuestion.includes("ilaaj") ||
        lowerQuestion.includes("ilaj") ||
        lowerQuestion.includes("treat")
      ) {

        return currentAdvisory.treatment;
      }

      if (
        lowerQuestion.includes("pesticide") ||
        lowerQuestion.includes("spray") ||
        lowerQuestion.includes("dawai") ||
        lowerQuestion.includes("medicine")
      ) {

        return currentAdvisory.pesticide;
      }

      if (
        lowerQuestion.includes("prevention") ||
        lowerQuestion.includes("bachao") ||
        lowerQuestion.includes("prevent")
      ) {

        return currentAdvisory.prevention;
      }

      if (
        lowerQuestion.includes("weather") ||
        lowerQuestion.includes("mosam") ||
        lowerQuestion.includes("mausam") ||
        lowerQuestion.includes("rain") ||
        lowerQuestion.includes("barish")
      ) {

        if (weather) {

          const spray =
            getSprayAlert(weather);

          return (
            `The current temperature is ${Math.round(
              weather.temperature
            )} degrees Celsius. Humidity is ${
              weather.humidity
            } percent and wind speed is ${
              Math.round(weather.windSpeed)
            } kilometers per hour. Spray alert: ${
              spray.title
            }. ${spray.message}`
          );

        }

        return (
          "Please use your location first so I can check the current local weather conditions."
        );
      }

      if (
        lowerQuestion.includes("hello") ||
        lowerQuestion.includes("salam") ||
        lowerQuestion.includes("assalam")
      ) {

        return (
          "Wa Alaikum Assalam. I am Kissan Advisor. You can ask me about your wheat disease, treatment, pesticide guidance, prevention or weather."
        );
      }

      return (
        `Your latest AI result is possible ${disease} with ${latestResult.confidence} percent confidence. You can ask me about its treatment, pesticide guidance, prevention or current weather conditions.`
      );
    };

  /* =========================================================
     START VOICE INPUT
  ========================================================= */

  const startVoiceInput =
    () => {

      const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

      if (!SpeechRecognition) {

        alert(
          "Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge."
        );

        return;
      }

      if (recognitionRef.current) {

        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }

      const recognition =
        new SpeechRecognition();

      recognition.lang =
        voiceLanguage;

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {

        setIsListening(true);
        setVoiceTranscript("");
        setVoiceAnswer("");
      };

      recognition.onresult =
        (event) => {

          const transcript =
            event.results?.[0]?.[0]?.transcript ||
            "";

          setVoiceTranscript(
            transcript
          );

          const answer =
            createVoiceAnswer(
              transcript
            );

          setVoiceAnswer(
            answer
          );

          setTimeout(() => {
            speakAdvice(answer);
          }, 150);
        };

      recognition.onerror =
        (event) => {

          console.error(
            "VOICE RECOGNITION ERROR:",
            event
          );

          if (
            event.error ===
            "not-allowed"
          ) {

            setVoiceAnswer(
              "Microphone permission was denied. Please allow microphone access and try again."
            );

          } else if (
            event.error ===
            "no-speech"
          ) {

            setVoiceAnswer(
              "I could not hear your question. Please try speaking again."
            );

          } else {

            setVoiceAnswer(
              "Voice recognition could not complete. Please try again."
            );
          }

          setIsListening(false);
        };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current =
        recognition;

      try {

        recognition.start();

      } catch (err) {

        console.error(
          "VOICE START ERROR:",
          err
        );

        setIsListening(false);

      }
    };

  /* =========================================================
     STOP VOICE INPUT
  ========================================================= */

  const stopVoiceInput =
    () => {

      if (
        recognitionRef.current
      ) {

        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }

      setIsListening(false);
    };

  /* =========================================================
     PAGE ROUTING
  ========================================================= */

  return (
    <>

      {/* HOME */}

      {page === "home" && (

        <Home
          setPage={setPage}
          setFarmerMode={
            setFarmerMode
          }
        />

      )}

      {/* FARMER AUTH */}

      {page === "auth" && (

        <Auth
          farmerMode={
            farmerMode
          }

          setFarmerMode={
            setFarmerMode
          }

          formData={
            formData
          }

          setFormData={
            setFormData
          }

          handleAuth={
            handleAuth
          }

          loading={
            loading
          }

          error={
            error
          }

          setError={
            setError
          }

          setPage={
            setPage
          }
        />

      )}

      {/* OFFICER LOGIN */}

      {page === "officer-login" && (

        <StaffLogin
          staffRole="officer"
          setPage={setPage}
          onLogin={
            handleStaffLogin
          }
        />

      )}

      {/* ADMIN LOGIN */}

      {page === "admin-login" && (

        <StaffLogin
          staffRole="admin"
          setPage={setPage}
          onLogin={
            handleStaffLogin
          }
        />

      )}

      {/* FARMER DASHBOARD */}

      {page === "dashboard" &&
        farmer &&
        farmer.role === "farmer" && (

          <Dashboard

            farmer={
              farmer
            }

            cases={
              cases
            }

            selectedFile={
              selectedFile
            }

            selectedImage={
              selectedImage
            }

            isAnalyzing={
              isAnalyzing
            }

            showResult={
              showResult
            }

            analysisResult={
              analysisResult
            }

            error={
              error
            }

            voiceLanguage={
              voiceLanguage
            }

            setVoiceLanguage={
              setVoiceLanguage
            }

            fileInputRef={
              fileInputRef
            }

            handleImageChange={
              handleImageChange
            }

            handleAnalyze={
              handleAnalyze
            }

            loadFarmerCases={
              loadFarmerCases
            }

            speakAdvice={
              speakAdvice
            }

            logout={
              logout
            }

            shareCase={
              shareCase
            }

            weather={
              weather
            }

            locationName={
              locationName
            }

            weatherLoading={
              weatherLoading
            }

            locationLoading={
              locationLoading
            }

            weatherError={
              weatherError
            }

            getLocationWeather={
              getLocationWeather
            }

            startVoiceInput={
              startVoiceInput
            }

            stopVoiceInput={
              stopVoiceInput
            }

            isListening={
              isListening
            }

            voiceTranscript={
              voiceTranscript
            }

            voiceAnswer={
              voiceAnswer
            }

          />

        )}

      {/* OFFICER DASHBOARD */}

      {page === "officer" &&
        staffUser &&
        staffUser.role === "officer" && (

          <OfficerDashboard

            cases={
              cases
            }

            selectedCase={
              selectedCase
            }

            setSelectedCase={
              setSelectedCase
            }

            advice={
              advice
            }

            setAdvice={
              setAdvice
            }

            loadOfficerCases={
              loadOfficerCases
            }

            verifyCase={
              verifyCase
            }

            sendAdvice={
              sendAdvice
            }

            speakAdvice={
              speakAdvice
            }

            setPage={
              setPage
            }

            correctDiagnosis={
              correctDiagnosis
            }

            setCorrectDiagnosis={
              setCorrectDiagnosis
            }

            logout={
              staffLogout
            }

          />

        )}

      {/* ADMIN DASHBOARD */}

      {page === "admin" &&
        staffUser &&
        staffUser.role === "admin" && (

          <AdminDashboard

            cases={
              cases
            }

            setPage={
              setPage
            }

            logout={
              staffLogout
            }

          />

        )}

    </>
  );
}

export default App;