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
      console.error("ERROR COMPLETO:", error);
      console.error("RESPUESTA DEL SERVIDOR:", error.response);
      console.error("DATOS DEL ERROR:", error.response?.data);

      if (error.response?.data?.detail) {
        setMensaje(error.response.data.detail);
      } else {
        setMensaje("Error al iniciar sesión");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <h2 className="text-center mb-4">FARMAS</h2>
        <h5 className="text-center mb-4">Iniciar sesión</h5>

        {mensaje && (
          <div className="alert alert-info text-center">{mensaje}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Usuario</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={cargando}
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;