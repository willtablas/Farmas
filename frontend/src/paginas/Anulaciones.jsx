import { useEffect, useState } from "react";
import Layout from "../componentes/Layout";
import api from "../api/axios";

function Anulaciones() {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const cargarVentas = async () => {
    try {
      const response = await api.get("/api/ventas/");
      setVentas(response.data);
    } catch (error) {
      console.error("Error cargando ventas:", error);
      setMensaje("No se pudieron cargar las ventas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarVentas();
  }, []);

  const anularVenta = async (id) => {
    const motivo = window.prompt("Ingrese el motivo de la anulación:");

    if (motivo === null) return;

    if (!motivo.trim()) {
      setMensaje("Debe ingresar un motivo para anular la venta.");
      return;
    }

    try {
      const response = await api.post(`/api/ventas/${id}/anular/`, {
        motivo: motivo.trim(),
      });

      console.log("Respuesta anulación:", response.data);
      setMensaje("Venta anulada correctamente.");
      cargarVentas();
    } catch (error) {
      console.error("Error al anular:", error);
      console.error("Respuesta del backend:", error.response?.data);

      const data = error.response?.data;

      let textoError = "Error al anular la venta.";

      if (typeof data === "string") {
        textoError = data;
      } else if (data?.detail) {
        textoError = data.detail;
      } else if (data?.error) {
        textoError = data.error;
      } else if (data?.mensaje) {
        textoError = data.mensaje;
      } else if (data?.motivo?.[0]) {
        textoError = data.motivo[0];
      } else if (data?.anulada_por?.[0]) {
        textoError = data.anulada_por[0];
      }

      setMensaje(textoError);
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <h1 className="mb-4 text-success fw-bold">Anulaciones de Ventas</h1>

        {mensaje && <div className="alert alert-info">{mensaje}</div>}

        {cargando ? (
          <p>Cargando ventas...</p>
        ) : (
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((venta) => (
                    <tr key={venta.id}>
                      <td>{venta.id}</td>
                      <td>{venta.fecha}</td>
                      <td>{venta.cliente}</td>
                      <td>{venta.total}</td>
                      <td>
                        {String(venta.estado).toUpperCase() === "ANULADA" ? (
                          <span className="badge bg-danger">Anulada</span>
                        ) : (
                          <span className="badge bg-success">Activa</span>
                        )}
                      </td>
                      <td>
                        {String(venta.estado).toUpperCase() !== "ANULADA" && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => anularVenta(venta.id)}
                          >
                            Anular
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {ventas.length === 0 && (
                <p className="text-muted">No hay ventas registradas.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Anulaciones;