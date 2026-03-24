import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../paginas/Login";
import Dashboard from "../paginas/Dashboard";
import Productos from "../paginas/Productos";
import Inventario from "../paginas/Inventario";
import Compras from "../paginas/Compras";
import Ventas from "../paginas/Ventas";
import Anulaciones from "../paginas/Anulaciones";
import Contabilidad from "../paginas/Contabilidad";
import LibroVentas from "../paginas/LibroVentas";
import LibroCompras from "../paginas/LibroCompras";
import Reportes from "../paginas/Reportes";
import ProtectedRoute from "../componentes/ProtectedRoute";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/productos"
        element={
          <ProtectedRoute>
            <Productos />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventario"
        element={
          <ProtectedRoute>
            <Inventario />
          </ProtectedRoute>
        }
      />

      <Route
        path="/compras"
        element={
          <ProtectedRoute>
            <Compras />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ventas"
        element={
          <ProtectedRoute>
            <Ventas />
          </ProtectedRoute>
        }
      />

      <Route
        path="/anulaciones"
        element={
          <ProtectedRoute>
            <Anulaciones />
          </ProtectedRoute>
        }
      />

      <Route
        path="/contabilidad"
        element={
          <ProtectedRoute>
            <Contabilidad />
          </ProtectedRoute>
        }
      />

      <Route
        path="/libro-ventas"
        element={
          <ProtectedRoute>
            <LibroVentas />
          </ProtectedRoute>
        }
      />

      <Route
        path="/libro-compras"
        element={
          <ProtectedRoute>
            <LibroCompras />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reportes"
        element={
          <ProtectedRoute>
            <Reportes />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRouter;