import { useEffect, useState } from "react";
import Layout from "../componentes/Layout";
import api from "../api/axios";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const response = await api.get("/api/productos/");
        const data = response.data?.results || response.data || [];
        setProductos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setError("No se pudieron cargar los productos.");
        setProductos([]);
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, []);

  return (
    <Layout>
      <div className="container-fluid">
        <h1 className="mb-4 text-success fw-bold">Productos</h1>

        {cargando && <p>Cargando productos...</p>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!cargando && !error && (
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Unidad</th>
                    <th>Precio</th>
                  </tr>
                </thead>

                <tbody>
                  {Array.isArray(productos) && productos.length > 0 ? (
                    productos.map((producto) => (
                      <tr key={producto.id}>
                        <td>{producto.id}</td>
                        <td>{producto.nombre}</td>
                        <td>{producto.categoria || "-"}</td>
                        <td>{producto.unidad_medida || "-"}</td>
                        <td>{producto.precio || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No hay productos registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Productos;