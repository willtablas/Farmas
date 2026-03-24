import { useState } from "react";
import Layout from "../componentes/Layout";
import api from "../api/axios";

function Reportes() {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const consultarReporte = async () => {
    setCargando(true);
    setError("");
    setReporte(null);

    try {
      const response = await api.get("/api/reportes/financiero/", {
        params: {
          fecha_inicio: fechaInicio || undefined,
          fecha_fin: fechaFin || undefined,
        },
      });

      setReporte(response.data);
    } catch (err) {
      console.error("Error al consultar reporte financiero:", err);
      setError("No se pudo cargar el reporte financiero.");
    } finally {
      setCargando(false);
    }
  };

  const descargarExcel = async () => {
    try {
      const response = await api.get("/api/reportes/financiero/excel/", {
        params: {
          fecha_inicio: fechaInicio || undefined,
          fecha_fin: fechaFin || undefined,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "reporte_financiero.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error al descargar Excel:", err);
      setError("No se pudo descargar el Excel.");
    }
  };

  const descargarPDF = async () => {
    try {
      const response = await api.get("/api/reportes/financiero/pdf/", {
        params: {
          fecha_inicio: fechaInicio || undefined,
          fecha_fin: fechaFin || undefined,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "reporte_financiero.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error al descargar PDF:", err);
      setError("No se pudo descargar el PDF.");
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <h1 className="mb-4">Reportes</h1>
        <p className="text-muted">Consulta y exportación del reporte financiero.</p>

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
                  onClick={consultarReporte}
                  disabled={cargando}
                >
                  {cargando ? "Consultando..." : "Consultar reporte"}
                </button>
              </div>
            </div>

            <div className="mt-3 d-flex gap-2 flex-wrap">
              <button className="btn btn-success" onClick={descargarExcel}>
                Descargar Excel
              </button>

              <button className="btn btn-danger" onClick={descargarPDF}>
                Descargar PDF
              </button>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {reporte && (
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h6 className="text-muted">Total Ventas</h6>
                  <h3>{reporte.total_ventas ?? 0}</h3>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h6 className="text-muted">Total Compras</h6>
                  <h3>{reporte.total_compras ?? 0}</h3>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h6 className="text-muted">Balance</h6>
                  <h3>{reporte.balance ?? 0}</h3>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Reportes;