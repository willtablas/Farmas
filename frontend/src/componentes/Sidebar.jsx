import { NavLink } from "react-router-dom";

function Sidebar() {
  const linkClass = ({ isActive }) =>
    `d-block text-decoration-none px-3 py-2 rounded mb-2 ${
      isActive ? "bg-success text-white" : "text-dark"
    }`;

  return (
    <div
      className="bg-white border-end p-3 shadow-sm"
      style={{ width: "250px", minHeight: "100vh" }}
    >
      <h3 className="mb-4 text-success fw-bold">FARMAS</h3>

      <NavLink to="/dashboard" className={linkClass}>
        Dashboard
      </NavLink>

      <NavLink to="/productos" className={linkClass}>
        Productos
      </NavLink>

      <NavLink to="/inventario" className={linkClass}>
        Inventario
      </NavLink>

      <NavLink to="/compras" className={linkClass}>
        Compras
      </NavLink>

      <NavLink to="/ventas" className={linkClass}>
        Ventas
      </NavLink>

      <NavLink to="/anulaciones" className={linkClass}>
        Anulaciones
      </NavLink>

      <NavLink to="/contabilidad" className={linkClass}>
        Contabilidad
      </NavLink>

      <NavLink to="/libro-ventas" className={linkClass}>
        Libro de Ventas
      </NavLink>

      <NavLink to="/libro-compras" className={linkClass}>
        Libro de Compras
      </NavLink>

      <NavLink to="/reportes" className={linkClass}>
        Reportes
      </NavLink>
    </div>
  );
}

export default Sidebar;