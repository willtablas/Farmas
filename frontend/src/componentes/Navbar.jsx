import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center shadow-sm">
      
      <div>
        <h4 className="m-0 fw-bold text-success">
          Sistema de Gestión FARMAS
        </h4>
        <small className="text-muted">
          Sistema de gestión farmacéutica
        </small>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* SOLO EL NOMBRE */}
        <span className="fw-semibold text-dark">
          {username || "Usuario"}
        </span>

        <button
          className="btn btn-danger btn-sm"
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>
      </div>

    </div>
  );
}

export default Navbar;