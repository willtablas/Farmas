import { useEffect, useMemo, useState } from "react";
import Layout from "../componentes/Layout";
import api from "../api/axios";

function Compras() {
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroProveedor, setFiltroProveedor] = useState("");
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);
  const [mostrarModalNueva, setMostrarModalNueva] = useState(false);

  const [nuevaCompra, setNuevaCompra] = useState({
    proveedor: "",
    detalles: [
      {
        producto: "",
        numero_lote: "",
        fecha_vencimiento: "",
        cantidad: "",
        precio_unitario: "",
      },
    ],
  });

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    const f = new Date(fecha);
    if (isNaN(f.getTime())) return fecha;
    return f.toLocaleDateString();
  };

  const formatearMoneda = (valor) => {
    const numero = Number(valor || 0);
    return `L. ${numero.toFixed(2)}`;
  };

  const obtenerFechaCompra = (compra) => {
    return compra.fecha || compra.created_at || null;
  };

  const obtenerProveedorNombre = (compra) => {
    return compra.proveedor_nombre || compra.nombre_proveedor || `Proveedor #${compra.proveedor}`;
  };

  const obtenerDetalles = (compra) => {
    return Array.isArray(compra.detalles) ? compra.detalles : [];
  };

  const cargarCompras = async () => {
    try {
      const response = await api.get("/api/compras/");
      setCompras(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error al cargar compras:", err);
      setError("No se pudo cargar la lista de compras.");
    }
  };

  const cargarCatalogos = async () => {
    try {
      const [resProveedores, resProductos] = await Promise.all([
        api.get("/api/proveedores/"),
        api.get("/api/productos/"),
      ]);

      setProveedores(Array.isArray(resProveedores.data) ? resProveedores.data : []);
      setProductos(Array.isArray(resProductos.data) ? resProductos.data : []);
    } catch (err) {
      console.error("Error al cargar catálogos:", err);
      setError("No se pudieron cargar proveedores o productos.");
    }
  };

  const cargarTodo = async () => {
    try {
      setCargando(true);
      setError("");
      await Promise.all([cargarCompras(), cargarCatalogos()]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  const comprasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return compras.filter((compra) => {
      const proveedor = obtenerProveedorNombre(compra).toLowerCase();
      const fecha = formatearFecha(obtenerFechaCompra(compra)).toLowerCase();
      const coincideBusqueda =
        proveedor.includes(texto) ||
        fecha.includes(texto) ||
        String(compra.id || "").includes(texto);

      const coincideProveedor =
        !filtroProveedor || String(compra.proveedor) === String(filtroProveedor);

      return coincideBusqueda && coincideProveedor;
    });
  }, [compras, busqueda, filtroProveedor]);

  const totalCompras = comprasFiltradas.length;
  const subtotalAcumulado = comprasFiltradas.reduce(
    (acc, compra) => acc + Number(compra.subtotal || 0),
    0
  );
  const isvAcumulado = comprasFiltradas.reduce(
    (acc, compra) => acc + Number(compra.isv || 0),
    0
  );
  const totalAcumulado = comprasFiltradas.reduce(
    (acc, compra) => acc + Number(compra.total || 0),
    0
  );

  const cambiarDetalle = (index, campo, valor) => {
    const copia = [...nuevaCompra.detalles];
    copia[index][campo] = valor;
    setNuevaCompra({ ...nuevaCompra, detalles: copia });
  };

  const agregarDetalle = () => {
    setNuevaCompra((prev) => ({
      ...prev,
      detalles: [
        ...prev.detalles,
        {
          producto: "",
          numero_lote: "",
          fecha_vencimiento: "",
          cantidad: "",
          precio_unitario: "",
        },
      ],
    }));
  };

  const eliminarDetalle = (index) => {
    if (nuevaCompra.detalles.length === 1) return;
    const copia = nuevaCompra.detalles.filter((_, i) => i !== index);
    setNuevaCompra({ ...nuevaCompra, detalles: copia });
  };

  const subtotalPreview = nuevaCompra.detalles.reduce((acc, item) => {
    const cantidad = Number(item.cantidad || 0);
    const precio = Number(item.precio_unitario || 0);
    return acc + cantidad * precio;
  }, 0);

  const limpiarFormulario = () => {
    setNuevaCompra({
      proveedor: "",
      detalles: [
        {
          producto: "",
          numero_lote: "",
          fecha_vencimiento: "",
          cantidad: "",
          precio_unitario: "",
        },
      ],
    });
  };

  const guardarCompra = async () => {
    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      if (!nuevaCompra.proveedor) {
        setError("Debes seleccionar un proveedor.");
        return;
      }

      for (const item of nuevaCompra.detalles) {
        if (
          !item.producto ||
          !item.numero_lote ||
          !item.fecha_vencimiento ||
          !item.cantidad ||
          !item.precio_unitario
        ) {
          setError("Completa todos los campos de cada detalle de compra.");
          return;
        }
      }

      const payload = {
        proveedor: Number(nuevaCompra.proveedor),
        detalles: nuevaCompra.detalles.map((item) => ({
          producto: Number(item.producto),
          numero_lote: item.numero_lote,
          fecha_vencimiento: item.fecha_vencimiento,
          cantidad: String(item.cantidad),
          precio_unitario: String(item.precio_unitario),
        })),
      };

      const response = await api.post("/api/compras/", payload);

      setMensaje(
        `Compra registrada correctamente. ID: ${response.data.compra_id} | Total: L. ${Number(
          response.data.total || 0
        ).toFixed(2)}`
      );

      setMostrarModalNueva(false);
      limpiarFormulario();
      await cargarCompras();
    } catch (err) {
      console.error("Error al guardar compra:", err);
      const detalle =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "No se pudo registrar la compra.";
      setError(detalle);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
          <div>
            <h1 className="mb-1">Compras</h1>
            <p className="text-muted mb-0">
              Gestión y registro de compras del sistema.
            </p>
          </div>

          <button
            className="btn btn-success"
            onClick={() => {
              setError("");
              setMensaje("");
              setMostrarModalNueva(true);
            }}
          >
            + Nueva compra
          </button>
        </div>

        {mensaje && <div className="alert alert-success mt-3">{mensaje}</div>}
        {cargando && <div className="alert alert-info mt-3">Cargando compras...</div>}
        {error && <div className="alert alert-danger mt-3">{error}</div>}

        {!cargando && !error && (
          <>
            <div className="row g-3 my-3">
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="text-muted">Compras registradas</h6>
                    <h2 className="text-success mb-0">{totalCompras}</h2>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="text-muted">Subtotal acumulado</h6>
                    <h5 className="mb-0">{formatearMoneda(subtotalAcumulado)}</h5>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="text-muted">ISV acumulado</h6>
                    <h5 className="mb-0">{formatearMoneda(isvAcumulado)}</h5>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="text-muted">Monto total</h6>
                    <h5 className="mb-0">{formatearMoneda(totalAcumulado)}</h5>
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label fw-semibold">Buscar</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar por proveedor, fecha o ID..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Filtrar por proveedor</label>
                    <select
                      className="form-select"
                      value={filtroProveedor}
                      onChange={(e) => setFiltroProveedor(e.target.value)}
                    >
                      <option value="">Todos los proveedores</option>
                      {proveedores.map((prov) => (
                        <option key={prov.id} value={prov.id}>
                          {prov.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm border-0">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Fecha</th>
                        <th>Proveedor</th>
                        <th>Subtotal</th>
                        <th>ISV</th>
                        <th>Total</th>
                        <th>Detalles</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comprasFiltradas.length > 0 ? (
                        comprasFiltradas.map((compra, index) => (
                          <tr key={compra.id || index}>
                            <td>{compra.id || index + 1}</td>
                            <td>{formatearFecha(obtenerFechaCompra(compra))}</td>
                            <td>{obtenerProveedorNombre(compra)}</td>
                            <td>{formatearMoneda(compra.subtotal)}</td>
                            <td>{formatearMoneda(compra.isv)}</td>
                            <td className="fw-semibold">{formatearMoneda(compra.total)}</td>
                            <td>
                              <button
                                className="btn btn-outline-success btn-sm"
                                onClick={() => setCompraSeleccionada(compra)}
                              >
                                Ver detalle
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center text-muted py-4">
                            No hay compras registradas con los filtros actuales.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {compraSeleccionada && (
          <>
            <div
              className="modal fade show"
              style={{ display: "block", backgroundColor: "rgba(0,0,0,0.4)" }}
              tabIndex="-1"
            >
              <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      Detalle de compra #{compraSeleccionada.id}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setCompraSeleccionada(null)}
                    ></button>
                  </div>

                  <div className="modal-body">
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <div className="border rounded p-3 h-100">
                          <h6 className="fw-bold">Información general</h6>
                          <p className="mb-1">
                            <strong>Fecha:</strong>{" "}
                            {formatearFecha(obtenerFechaCompra(compraSeleccionada))}
                          </p>
                          <p className="mb-0">
                            <strong>Proveedor:</strong>{" "}
                            {obtenerProveedorNombre(compraSeleccionada)}
                          </p>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="border rounded p-3 h-100">
                          <h6 className="fw-bold">Resumen financiero</h6>
                          <p className="mb-1">
                            <strong>Subtotal:</strong>{" "}
                            {formatearMoneda(compraSeleccionada.subtotal)}
                          </p>
                          <p className="mb-1">
                            <strong>ISV:</strong>{" "}
                            {formatearMoneda(compraSeleccionada.isv)}
                          </p>
                          <p className="mb-0">
                            <strong>Total:</strong>{" "}
                            {formatearMoneda(compraSeleccionada.total)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded p-3">
                      <h6 className="fw-bold mb-3">Productos de la compra</h6>

                      {obtenerDetalles(compraSeleccionada).length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-sm table-bordered align-middle">
                            <thead className="table-light">
                              <tr>
                                <th>Código</th>
                                <th>Producto</th>
                                <th>Lote</th>
                                <th>Vencimiento</th>
                                <th>Cantidad</th>
                                <th>Precio unitario</th>
                              </tr>
                            </thead>
                            <tbody>
                              {obtenerDetalles(compraSeleccionada).map((item, idx) => (
                                <tr key={idx}>
                                  <td>{item.producto_codigo || "-"}</td>
                                  <td>{item.producto_nombre || "-"}</td>
                                  <td>{item.numero_lote || "-"}</td>
                                  <td>{formatearFecha(item.fecha_vencimiento)}</td>
                                  <td>{item.cantidad}</td>
                                  <td>{formatearMoneda(item.precio_unitario)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="alert alert-warning mb-0">
                          Esta compra no tiene detalles disponibles.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setCompraSeleccionada(null)}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show"></div>
          </>
        )}

        {mostrarModalNueva && (
          <>
            <div
              className="modal fade show"
              style={{ display: "block", backgroundColor: "rgba(0,0,0,0.4)" }}
              tabIndex="-1"
            >
              <div className="modal-dialog modal-xl modal-dialog-scrollable">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Registrar nueva compra</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => {
                        setMostrarModalNueva(false);
                        limpiarFormulario();
                      }}
                    ></button>
                  </div>

                  <div className="modal-body">
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Proveedor</label>
                      <select
                        className="form-select"
                        value={nuevaCompra.proveedor}
                        onChange={(e) =>
                          setNuevaCompra({ ...nuevaCompra, proveedor: e.target.value })
                        }
                      >
                        <option value="">Seleccione un proveedor</option>
                        {proveedores.map((prov) => (
                          <option key={prov.id} value={prov.id}>
                            {prov.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-bold mb-0">Detalle de productos</h6>
                      <button className="btn btn-outline-success btn-sm" onClick={agregarDetalle}>
                        + Agregar producto
                      </button>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-bordered align-middle">
                        <thead className="table-light">
                          <tr>
                            <th style={{ minWidth: "220px" }}>Producto</th>
                            <th>Número de lote</th>
                            <th>Fecha vencimiento</th>
                            <th>Cantidad</th>
                            <th>Precio unitario</th>
                            <th>Subtotal</th>
                            <th>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {nuevaCompra.detalles.map((item, index) => {
                            const subtotalFila =
                              Number(item.cantidad || 0) * Number(item.precio_unitario || 0);

                            return (
                              <tr key={index}>
                                <td>
                                  <select
                                    className="form-select"
                                    value={item.producto}
                                    onChange={(e) =>
                                      cambiarDetalle(index, "producto", e.target.value)
                                    }
                                  >
                                    <option value="">Seleccione</option>
                                    {productos.map((prod) => (
                                      <option key={prod.id} value={prod.id}>
                                        {prod.codigo ? `${prod.codigo} - ` : ""}
                                        {prod.nombre}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={item.numero_lote}
                                    onChange={(e) =>
                                      cambiarDetalle(index, "numero_lote", e.target.value)
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="date"
                                    className="form-control"
                                    value={item.fecha_vencimiento}
                                    onChange={(e) =>
                                      cambiarDetalle(index, "fecha_vencimiento", e.target.value)
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    className="form-control"
                                    value={item.cantidad}
                                    onChange={(e) =>
                                      cambiarDetalle(index, "cantidad", e.target.value)
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="form-control"
                                    value={item.precio_unitario}
                                    onChange={(e) =>
                                      cambiarDetalle(index, "precio_unitario", e.target.value)
                                    }
                                  />
                                </td>
                                <td className="fw-semibold">
                                  {formatearMoneda(subtotalFila)}
                                </td>
                                <td>
                                  <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => eliminarDetalle(index)}
                                    disabled={nuevaCompra.detalles.length === 1}
                                  >
                                    Eliminar
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="row mt-3">
                      <div className="col-md-4 ms-auto">
                        <div className="card border-0 bg-light">
                          <div className="card-body">
                            <div className="d-flex justify-content-between">
                              <span>Subtotal estimado:</span>
                              <strong>{formatearMoneda(subtotalPreview)}</strong>
                            </div>
                            <div className="d-flex justify-content-between mt-2">
                              <span>ISV:</span>
                              <strong>{formatearMoneda(0)}</strong>
                            </div>
                            <div className="d-flex justify-content-between mt-2">
                              <span>Total estimado:</span>
                              <strong className="text-success">
                                {formatearMoneda(subtotalPreview)}
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setMostrarModalNueva(false);
                        limpiarFormulario();
                      }}
                    >
                      Cancelar
                    </button>

                    <button
                      className="btn btn-success"
                      onClick={guardarCompra}
                      disabled={guardando}
                    >
                      {guardando ? "Guardando..." : "Guardar compra"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show"></div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default Compras;