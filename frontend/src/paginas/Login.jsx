import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setMensaje("");
  setCargando(true);

  try {
    const response = await api.post("/api/token/", {
      username,
      password,
    });

    localStorage.setItem("token", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);
    localStorage.setItem("username", username);

    setMensaje("Inicio de sesión exitoso");
    navigate("/dashboard");
  } catch (error) {
    console.log("Error completo:", error);

    if (error.response) {
      console.log("Respuesta backend:", error.response.data);

      setMensaje(
        error.response.data.detail || "Usuario o contraseña incorrectos"
      );
    } else {
      setMensaje("Error de conexión con el servidor");
    }
  } finally {
    setCargando(false);
  }
};

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* PANEL IZQUIERDO */}
        <div style={styles.leftPanel}>
          <div style={styles.brand}>
            {/* CUADRO VACÍO (ANTES ERA EL +) */}
            <div style={styles.brandIcon}></div>

            <div>
              <h1 style={styles.brandTitle}>FARMAS</h1>
              <p style={styles.brandSubtitle}>
                Sistema de Gestión Farmacéutica
              </p>
            </div>
          </div>

          <div style={styles.leftContent}>
            <h2 style={styles.welcomeTitle}>Bienvenido al sistema</h2>
            <p style={styles.welcomeText}>
              Administra productos, clientes, compras, ventas, inventario, lotes y
              reportes contables en una sola plataforma.
            </p>

            <div style={styles.featureCard}>
              <h3 style={styles.featureTitle}>Inventario inteligente</h3>
              <p style={styles.featureText}>
                Control de stock, lotes y vencimientos en tiempo real.
              </p>
            </div>

            <div style={styles.featureCard}>
              <h3 style={styles.featureTitle}>Ventas y compras</h3>
              <p style={styles.featureText}>
                Registro rápido de operaciones con integración contable.
              </p>
            </div>

            <div style={styles.featureCard}>
              <h3 style={styles.featureTitle}>Seguridad</h3>
              <p style={styles.featureText}>
                Acceso controlado mediante autenticación JWT.
              </p>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div style={styles.rightPanel}>
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Iniciar sesión</h2>
            <p style={styles.formSubtitle}>
              Ingresa tus credenciales para acceder a FARMAS
            </p>

            <form onSubmit={handleSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Usuario</label>
                <input
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Contraseña</label>
                <input
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              {mensaje && (
                <div
                  style={{
                    ...styles.message,
                    backgroundColor: mensaje.includes("exitoso")
                      ? "#e8f7ec"
                      : "#fdeaea",
                    color: mensaje.includes("exitoso") ? "#1f7a3d" : "#b42318",
                  }}
                >
                  {mensaje}
                </div>
              )}

              <button type="submit" style={styles.button} disabled={cargando}>
                {cargando ? "Ingresando..." : "Entrar al sistema"}
              </button>

              <button
                type="button"
                style={styles.linkButton}
                onClick={() =>
                  alert("Recuperación de contraseña próximamente")
                }
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>

            <p style={styles.footerText}>
              FARMAS · Control integral para farmacia
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #edf7ef 0%, #f8fbf8 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },

  container: {
    width: "100%",
    maxWidth: "1200px",
    minHeight: "700px",
    backgroundColor: "#ffffff",
    borderRadius: "30px",
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
  },

  leftPanel: {
    background: "linear-gradient(180deg, #6ecb63, #43a047)",
    color: "#fff",
    padding: "40px",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "30px",
  },

  brandIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "15px",
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  brandTitle: {
    margin: 0,
    fontSize: "2.5rem",
    fontWeight: "bold",
  },

  brandSubtitle: {
    margin: 0,
    fontSize: "0.9rem",
  },

  welcomeTitle: {
    fontSize: "2rem",
    marginBottom: "10px",
  },

  welcomeText: {
    marginBottom: "25px",
  },

  featureCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: "15px",
    borderRadius: "15px",
    marginBottom: "10px",
  },

  featureTitle: {
    margin: 0,
  },

  featureText: {
    margin: 0,
    fontSize: "0.9rem",
  },

  rightPanel: {
    backgroundColor: "#f7faf7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  formCard: {
    width: "90%",
    maxWidth: "400px",
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "20px",
  },

  formTitle: {
    margin: 0,
  },

  formSubtitle: {
    marginBottom: "20px",
  },

  inputGroup: {
    marginBottom: "15px",
  },

  label: {
    display: "block",
    marginBottom: "5px",
  },

  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ccc",
  },

  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    marginTop: "10px",
    cursor: "pointer",
  },

  linkButton: {
    background: "none",
    border: "none",
    color: "#2e7d32",
    marginTop: "10px",
    cursor: "pointer",
  },

  message: {
    padding: "10px",
    borderRadius: "10px",
    marginBottom: "10px",
  },

  footerText: {
    marginTop: "15px",
    textAlign: "center",
    fontSize: "0.8rem",
  },
};

export default Login;