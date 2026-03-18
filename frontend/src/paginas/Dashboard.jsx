import { useEffect, useState } from "react";
import Layout from "../componentes/Layout";
import api from "../api/axios";

function Dashboard() {
  const [resumen, setResumen] = useState({
    inventario: 0,
    compras: 0,
    ventas: 0,
    libroVentas: 0,
    libroCompras: 0,
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        setCargando(true);
        setError("");

        const [
          inventarioRes,
          comprasRes,
          ventasRes,
          libroVentasRes,
          libroComprasRes,
        ] = await Promise.all([
          api.get("/api/reportes/inventario/"),
          api.get("/api/compras/"),
          api.get("/api/ventas/"),
          api.get("/api/libro-ventas/"),
          api.get("/api/libro-compras/"),
        ]);

        const obtenerCantidad = (data) => {
          if (Array.isArray(data)) return data.length;
          if (Array.isArray(data.results)) return data.results.length;
          return 0;
        };

        setResumen({
          inventario: obtenerCantidad(inventarioRes.data),
          compras: obtenerCantidad(comprasRes.data),
          ventas: obtenerCantidad(ventasRes.data),
          libroVentas: obtenerCantidad(libroVentasRes.data),
          libroCompras: obtenerCantidad(libroComprasRes.data),
        });
      } catch (err) {
        console.error("Error al cargar dashboard:", err);
        setError("No se pudo cargar la información del dashboard.");
      } finally {
        setCargando(false);
      }
    };

    cargarDashboard();
  }, []);

  return (
    <Layout>
      <div className="container-fluid">
        <div className="mb-4">
          <h1 className="fw-bold text-success">Dashboard de FARMAS</h1>
          <p className="text-muted mb-0">
            Resumen general del sistema de gestión farmacéutica.
          </p>
        </div>

        {cargando && (
          <div className="alert alert-info">Cargando información del dashboard...</div>
        )}

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {!cargando && !error && (
          <>
            <div className="row g-4">
              <div className="col-md-6 col-xl-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="text-muted">Inventario</h6>
                    <h2 className="fw-bold text-success">{resumen.inventario}</h2>
                    <p className="mb-0">Lotes disponibles</p>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-xl-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="text-muted">Compras</h6>
                    <h2 className="fw-bold text-success">{resumen.compras}</h2>
                    <p className="mb-0">Compras registradas</p>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-xl-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="text-muted">Ventas</h6>
                    <h2 className="fw-bold text-success">{resumen.ventas}</h2>
                    <p className="mb-0">Ventas registradas</p>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-xl-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="text-muted">Libro de Ventas</h6>
                    <h2 className="fw-bold text-success">{resumen.libroVentas}</h2>
                    <p className="mb-0">Registros contables</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4 mt-1">
              <div className="col-md-6 col-xl-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="text-muted">Libro de Compras</h6>
                    <h2 className="fw-bold text-success">{resumen.libroCompras}</h2>
                    <p className="mb-0">Registros contables</p>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-xl-9">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="fw-bold mb-3">Farmas</h5>
                    <p className="text-muted mb-2">
                      
                    </p>
                    <p className="mb-0">
                      
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;