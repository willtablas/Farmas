import { useEffect, useState } from "react";
import Layout from "../componentes/Layout";
import api from "../api/axios";

function LibroCompras() {
  const [registros, setRegistros] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const cargarLibroCompras = async () => {
    setCargando(true);
    setError("");

    try {
      const response = await api.get("/api/libro-compras/", {
        params: {
          fecha_inicio: fechaInicio || undefined,
          fecha_fin: fechaFin || undefined,
        },
      });

      const data = response.data?.results || response.data || [];
      setRegistros(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar libro de compras:", err);
      setError("No se pudo cargar el libro de compras.");
      setRegistros([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarLibroCompras();
  }, []);

  return (
    <Layout>
      <div className="container-fluid">
        <h1 className="mb-4">Libro de Compras</h1>
        <p className="text-muted">
          Consulta de registros contables generados por las compras.
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
                  onClick={cargarLibroCompras}
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
          <div className="alert alert-info">Cargando libro de compras...</div>
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
                      <th>Proveedor</th>
                      <th>Subtotal</th>
                      <th>ISV</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(registros) && registros.length > 0 ? (
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
                          <td>{item.proveedor || "-"}</td>
                          <td>{item.subtotal ?? 0}</td>
                          <td>{item.isv ?? 0}</td>
                          <td>{item.total ?? 0}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No hay registros de libro de compras.
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

export default LibroCompras;