import { useEffect, useState } from "react";
import Layout from "../componentes/Layout";
import api from "../api/axios";

function LibroVentas() {
  const [registros, setRegistros] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const cargarLibroVentas = async () => {
    setCargando(true);
    setError("");

    try {
      const response = await api.get("/api/libro-ventas/", {
        params: {
          fecha_inicio: fechaInicio || undefined,
          fecha_fin: fechaFin || undefined,
        },
      });

      setRegistros(response.data);
    } catch (err) {
      console.error("Error al cargar libro de ventas:", err);
      setError("No se pudo cargar el libro de ventas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarLibroVentas();
  }, []);

  return (
    <Layout>
      <div className="container-fluid">
        <h1 className="mb-4">Libro de Ventas</h1>
        <p className="text-muted">
          Consulta de registros contables generados por las ventas.
        </p>

        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Fecha inicio</label>
                <input
                  type="date"
                  className="form-control"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Fecha fin</label>
                <input
                  type="date"
                  className="form-control"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>

              <div className="col-md-4 d-flex align-items-end">
                <button
                  className="btn btn-primary w-100"
                  onClick={cargarLibroVentas}
                  disabled={cargando}
                >
                  {cargando ? "Consultando..." : "Consultar"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {cargando && (
          <div className="alert alert-info">Cargando libro de ventas...</div>
        )}

        {!cargando && !error && (
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Subtotal</th>
                      <th>ISV</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registros.length > 0 ? (
                      registros.map((item, index) => (
                        <tr key={item.id || index}>
                          <td>{index + 1}</td>
                          <td>
                            {item.fecha
                            ? new Date(item.fecha).toLocaleDateString()
                            : item.created_at
                            ? new Date(item.created_at).toLocaleDateString()
                            : "-"}
                          </td>                           
                          <td>{item.cliente || "-"}</td>
                          <td>{item.subtotal ?? 0}</td>
                          <td>{item.isv ?? 0}</td>
                          <td>{item.total ?? 0}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No hay registros de libro de ventas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default LibroVentas;