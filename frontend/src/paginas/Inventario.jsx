import { useEffect, useState } from "react";
import Layout from "../componentes/Layout";
import api from "../api/axios";

function Inventario() {
  const [lotes, setLotes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarInventario = async () => {
      try {
        const response = await api.get("/api/reportes/inventario/");

        const data = response.data?.results || response.data || [];
        setLotes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al cargar inventario:", err);
        setError("No se pudo cargar el inventario.");
        setLotes([]);
      } finally {
        setCargando(false);
      }
    };

    cargarInventario();
  }, []);

  return (
    <Layout>
      <div className="container-fluid">
        <h1 className="mb-4">Inventario</h1>
        <p className="text-muted">
          Consulta de lotes disponibles en inventario.
        </p>

        {cargando && (
          <div className="alert alert-info">Cargando inventario...</div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        {!cargando && !error && (
          <div className="card shadow-sm border-0 mt-3">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Producto</th>
                      <th>Cantidad disponible</th>
                      <th>Fecha de vencimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(lotes) && lotes.length > 0 ? (
                      lotes.map((lote, index) => (
                        <tr key={lote.id || index}>
                          <td>{index + 1}</td>
                          <td>{lote.producto || "-"}</td>
                          <td>{lote.cantidad_disponible || "-"}</td>
                          <td>{lote.fecha_vencimiento || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">
                          No hay lotes disponibles.
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

export default Inventario;