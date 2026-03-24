import { useEffect, useMemo, useState } from "react";
import Layout from "../componentes/Layout";
import api from "../api/axios";

function Ventas() {
  // =========================
  // ESTADOS
  // =========================
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);

  const [clienteId, setClienteId] = useState("");
  const [buscarCliente, setBuscarCliente] = useState("");
  const [usarClienteNuevo, setUsarClienteNuevo] = useState(false);

  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    identidad: "",
    telefono: "",
    direccion: "",
  });

  const [items, setItems] = useState([
    { producto_id: "", cantidad: "", busqueda: "" },
  ]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // =========================
  // HELPERS GENERALES
  // =========================
  const obtenerLista = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  };

  const formatearMoneda = (valor) => {
    return `L ${Number(valor || 0).toFixed(2)}`;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "No disponible";

    const f = new Date(fecha);
    if (Number.isNaN(f.getTime())) return fecha;

    return f.toLocaleDateString("es-HN");
  };

  const obtenerPresentacionProducto = (producto) => {
    return (
      producto?.presentacion ||
      producto?.unidad_medida_nombre ||
      producto?.unidad_medida ||
      producto?.unidad ||
      producto?.descripcion_presentacion ||
      "No especificada"
    );
  };

  const obtenerStockProducto = (producto) => {
    const valor =
      producto?.stock_disponible ??
      producto?.stock ??
      producto?.existencia ??
      producto?.cantidad_disponible ??
      producto?.cantidad ??
      0;

    return Number(valor || 0);
  };

  const obtenerStockMinimoProducto = (producto) => {
    const valor =
      producto?.stock_minimo ??
      producto?.min_stock ??
      producto?.existencia_minima ??
      producto?.cantidad_minima ??
      0;

    return Number(valor || 0);
  };

  const obtenerFechaVencimientoProducto = (producto) => {
    return (
      producto?.proximo_vencimiento ||
      producto?.fecha_vencimiento_proxima ||
      producto?.fecha_vencimiento ||
      producto?.vencimiento ||
      null
    );
  };

  const diasHastaVencimiento = (fecha) => {
    if (!fecha) return null;

    const hoy = new Date();
    const venc = new Date(fecha);

    if (Number.isNaN(venc.getTime())) return null;

    hoy.setHours(0, 0, 0, 0);
    venc.setHours(0, 0, 0, 0);

    const diff = venc.getTime() - hoy.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const productoTienePocoStock = (producto) => {
    const stock = obtenerStockProducto(producto);
    const stockMinimo = obtenerStockMinimoProducto(producto);

    if (stock <= 0) return true;
    if (stockMinimo > 0) return stock <= stockMinimo;
    return stock <= 5;
  };

  const productoProximoAVencer = (producto) => {
    const fecha = obtenerFechaVencimientoProducto(producto);
    const dias = diasHastaVencimiento(fecha);

    if (dias === null) return false;
    return dias >= 0 && dias <= 30;
  };

  // =========================
  // CARGA DE DATOS
  // =========================
  const cargarClientes = async () => {
    const response = await api.get("/api/clientes/");
    setClientes(obtenerLista(response.data));
  };

  const cargarProductos = async () => {
    const response = await api.get("/api/productos/");
    setProductos(obtenerLista(response.data));
  };

  const cargarTodo = async () => {
    try {
      setCargando(true);
      setError("");
      await Promise.all([cargarClientes(), cargarProductos()]);
    } catch (err) {
      console.error("Error cargando módulo de ventas:", err);
      setError("No se pudo cargar la información del módulo de ventas.");
    } finally {
      setCargando(false);
    }
  };

  // =========================
  // EFFECTS
  // =========================
  useEffect(() => {
    cargarTodo();
  }, []);

  // =========================
  // CLIENTES
  // =========================
  const actualizarNuevoCliente = (campo, valor) => {
    setNuevoCliente((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const seleccionarCliente = (cliente) => {
    setClienteId(String(cliente.id));
    setBuscarCliente(cliente.nombre || "");
  };

  const clienteSeleccionado = useMemo(() => {
    return clientes.find((c) => String(c.id) === String(clienteId));
  }, [clientes, clienteId]);

  const clientesFiltrados = useMemo(() => {
    if (!buscarCliente.trim()) return [];

    const texto = buscarCliente.toLowerCase().trim();

    return clientes
      .filter((cliente) =>
        String(cliente.nombre || "").toLowerCase().includes(texto)
      )
      .slice(0, 8);
  }, [clientes, buscarCliente]);

  // =========================
  // ITEMS / PRODUCTOS
  // =========================
  const agregarItem = () => {
    setItems((prev) => [
      ...prev,
      { producto_id: "", cantidad: "", busqueda: "" },
    ]);
  };

  const eliminarItem = (index) => {
    setItems((prev) => {
      const copia = prev.filter((_, i) => i !== index);
      return copia.length > 0
        ? copia
        : [{ producto_id: "", cantidad: "", busqueda: "" }];
    });
  };

  const actualizarItem = (index, campo, valor) => {
    setItems((prev) => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [campo]: valor };
      return copia;
    });
  };

  const buscarProducto = (productoId) => {
    return productos.find((p) => String(p.id) === String(productoId));
  };

  const seleccionarProducto = (index, producto) => {
    setItems((prev) => {
      const copia = [...prev];
      copia[index] = {
        ...copia[index],
        producto_id: String(producto.id),
        busqueda: producto.nombre || "",
      };
      return copia;
    });
  };

  const productosFiltradosPorLinea = (index) => {
    const texto = String(items[index]?.busqueda || "")
      .toLowerCase()
      .trim();

    if (!texto) return [];

    return productos
      .filter((producto) =>
        String(producto.nombre || "").toLowerCase().includes(texto)
      )
      .slice(0, 8);
  };

  const itemsConDetalle = useMemo(() => {
    return items.map((item) => {
      const producto = buscarProducto(item.producto_id);
      const precio = Number(producto?.precio_venta ?? 0);
      const cantidad = Number(item.cantidad || 0);
      const subtotal = precio * cantidad;
      const stockDisponible = obtenerStockProducto(producto);

      return {
        ...item,
        producto,
        precio,
        subtotal,
        stockDisponible,
      };
    });
  }, [items, productos]);

  const itemsValidos = useMemo(() => {
    return itemsConDetalle.filter(
      (item) =>
        item.producto_id &&
        Number(item.cantidad) > 0 &&
        item.producto &&
        Number(item.precio) > 0
    );
  }, [itemsConDetalle]);

  const productosRepetidos = useMemo(() => {
    const ids = items
      .map((item) => String(item.producto_id || "").trim())
      .filter(Boolean);

    const repetidos = ids.filter((id, index) => ids.indexOf(id) !== index);
    return [...new Set(repetidos)];
  }, [items]);

  // =========================
  // TOTALES
  // =========================
  const subtotalGeneral = useMemo(() => {
    return itemsConDetalle.reduce((acc, item) => acc + item.subtotal, 0);
  }, [itemsConDetalle]);

  const isvGeneral = useMemo(() => {
    return subtotalGeneral * 0.15;
  }, [subtotalGeneral]);

  const totalGeneral = useMemo(() => {
    return subtotalGeneral + isvGeneral;
  }, [subtotalGeneral, isvGeneral]);

  const formularioValido = useMemo(() => {
    const clienteValido = usarClienteNuevo
      ? nuevoCliente.nombre.trim() !== ""
      : clienteId !== "";

    const tieneItems = itemsValidos.length > 0;
    const sinRepetidos = productosRepetidos.length === 0;

    return clienteValido && tieneItems && sinRepetidos && totalGeneral > 0;
  }, [
    usarClienteNuevo,
    nuevoCliente,
    clienteId,
    itemsValidos,
    productosRepetidos,
    totalGeneral,
  ]);

  // =========================
  // LIMPIEZA
  // =========================
  const limpiarFormulario = () => {
    setClienteId("");
    setBuscarCliente("");
    setUsarClienteNuevo(false);
    setNuevoCliente({
      nombre: "",
      identidad: "",
      telefono: "",
      direccion: "",
    });
    setItems([{ producto_id: "", cantidad: "", busqueda: "" }]);
    setError("");
    setMensaje("");
  };

  // =========================
  // IMPRESIÓN
  // =========================
  const imprimirFactura = (factura) => {
    const ventana = window.open("", "_blank", "width=420,height=800");

    if (!ventana) {
      setError("El navegador bloqueó la ventana de impresión.");
      return;
    }

    const filasHtml = factura.items
      .map(
        (item) => `
          <tr>
            <td style="padding: 4px 0;">${item.nombre}</td>
            <td style="text-align:center; padding: 4px 0;">${item.cantidad}</td>
            <td style="text-align:right; padding: 4px 0;">${Number(item.precio).toFixed(2)}</td>
            <td style="text-align:right; padding: 4px 0;">${Number(item.subtotal).toFixed(2)}</td>
          </tr>
        `
      )
      .join("");

    ventana.document.write(`
      <html>
        <head>
          <title>Factura Venta #${factura.venta_id}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              margin: 0;
              padding: 16px;
              color: #000;
              background: #fff;
              font-size: 12px;
            }

            .ticket {
              width: 100%;
              max-width: 320px;
              margin: 0 auto;
            }

            .center {
              text-align: center;
            }

            .titulo {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 4px;
            }

            .subtitulo {
              font-size: 12px;
              margin-bottom: 2px;
            }

            .linea {
              border-top: 1px dashed #000;
              margin: 10px 0;
            }

            .info {
              line-height: 1.6;
              margin-bottom: 8px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }

            th {
              text-align: left;
              padding: 4px 0;
              border-bottom: 1px dashed #000;
            }

            td {
              vertical-align: top;
            }

            .totales {
              margin-top: 10px;
              width: 100%;
            }

            .totales td {
              padding: 3px 0;
            }

            .total-final td {
              font-size: 14px;
              font-weight: bold;
              border-top: 1px dashed #000;
              padding-top: 8px;
            }

            .pie {
              text-align: center;
              margin-top: 18px;
              line-height: 1.5;
            }

            .gracias {
              font-weight: bold;
              margin-top: 10px;
            }

            @page {
              size: 80mm auto;
              margin: 5mm;
            }

            @media print {
              body {
                padding: 0;
              }

              .ticket {
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="center">
              <div class="titulo">FARMAS</div>
              <div class="subtitulo">Farmacia y productos médicos</div>
              <div class="subtitulo">RTN: 0801-0000-000000</div>
              <div class="subtitulo">Tegucigalpa, Honduras</div>
              <div class="subtitulo">Tel: 2222-2222</div>
            </div>

            <div class="linea"></div>

            <div class="info">
              <div><strong>Factura No:</strong> ${factura.venta_id}</div>
              <div><strong>Fecha:</strong> ${factura.fecha}</div>
              <div><strong>Cliente:</strong> ${factura.cliente}</div>
            </div>

            <div class="linea"></div>

            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style="text-align:center;">Cant</th>
                  <th style="text-align:right;">Precio</th>
                  <th style="text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${filasHtml}
              </tbody>
            </table>

            <div class="linea"></div>

            <table class="totales">
              <tr>
                <td><strong>Subtotal:</strong></td>
                <td style="text-align:right;">L ${Number(factura.subtotal).toFixed(2)}</td>
              </tr>
              <tr>
                <td><strong>ISV (15%):</strong></td>
                <td style="text-align:right;">L ${Number(factura.isv).toFixed(2)}</td>
              </tr>
              <tr class="total-final">
                <td><strong>TOTAL:</strong></td>
                <td style="text-align:right;">L ${Number(factura.total).toFixed(2)}</td>
              </tr>
            </table>

            <div class="pie">
              <div class="gracias">¡Gracias por su compra!</div>
              <div>Conserve esta factura como comprobante.</div>
              <div>FARMAS</div>
            </div>
          </div>

          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    ventana.document.close();
  };

  // =========================
  // GUARDADO
  // =========================
  const crearClienteSiEsNecesario = async () => {
    if (!usarClienteNuevo) {
      if (!clienteId) {
        throw new Error("Debes seleccionar un cliente.");
      }
      return Number(clienteId);
    }

    if (!nuevoCliente.nombre.trim()) {
      throw new Error("El nombre del cliente nuevo es obligatorio.");
    }

    const payload = {
      nombre: nuevoCliente.nombre.trim(),
      identidad: nuevoCliente.identidad.trim(),
      telefono: nuevoCliente.telefono.trim(),
      direccion: nuevoCliente.direccion.trim(),
    };

    const response = await api.post("/api/clientes/", payload);
    const clienteCreado = response.data;

    await cargarClientes();

    return clienteCreado.id;
  };

  const guardarVenta = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (!usarClienteNuevo && !clienteId) {
      setError("Debes seleccionar un cliente.");
      return;
    }

    if (usarClienteNuevo && !nuevoCliente.nombre.trim()) {
      setError("Debes escribir el nombre del cliente nuevo.");
      return;
    }

    if (productosRepetidos.length > 0) {
      setError("No puedes repetir el mismo producto en varias líneas.");
      return;
    }

    const itemsLimpios = items
      .filter((item) => item.producto_id && item.cantidad)
      .map((item) => ({
        producto_id: Number(item.producto_id),
        cantidad: item.cantidad,
      }));

    if (itemsLimpios.length === 0) {
      setError("Debes agregar al menos un producto con cantidad.");
      return;
    }

    const hayProductoVacio = itemsLimpios.some(
      (item) => !item.producto_id || Number(item.cantidad) <= 0
    );

    if (hayProductoVacio) {
      setError("Todos los productos deben tener una cantidad válida.");
      return;
    }

    try {
      setGuardando(true);

      const facturaItems = itemsValidos.map((item) => ({
        nombre: item.producto?.nombre || "",
        cantidad: item.cantidad,
        precio: item.precio,
        subtotal: item.subtotal,
      }));

      const nombreClienteFactura = usarClienteNuevo
        ? nuevoCliente.nombre
        : clienteSeleccionado?.nombre || "Consumidor final";

      const clienteFinalId = await crearClienteSiEsNecesario();

      const payload = {
        cliente_id: clienteFinalId,
        items: itemsLimpios,
      };

      const response = await api.post("/api/ventas/", payload);

      const facturaData = {
        venta_id: response.data.venta_id,
        cliente: nombreClienteFactura,
        fecha: new Date().toLocaleString("es-HN"),
        items: facturaItems,
        subtotal: subtotalGeneral,
        isv: isvGeneral,
        total: totalGeneral,
      };

      setMensaje(
        `Venta registrada correctamente. ID: ${response.data.venta_id} | Total: ${response.data.total}`
      );

      imprimirFactura(facturaData);
      limpiarFormulario();
    } catch (err) {
      console.error("Error al guardar venta:", err);

      const data = err.response?.data;

      if (data?.non_field_errors?.[0]) {
        setError(data.non_field_errors[0]);
      } else if (data?.items?.[0]) {
        setError(
          typeof data.items[0] === "string"
            ? data.items[0]
            : "Hay un error en uno de los productos."
        );
      } else if (data?.detail) {
        setError(data.detail);
      } else if (typeof data === "string") {
        setError(data);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("No se pudo registrar la venta.");
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <h1 className="mb-4 text-success fw-bold">Ventas</h1>
        <p className="text-muted">Registro de ventas del sistema.</p>

        {mensaje && <div className="alert alert-success">{mensaje}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {cargando ? (
          <div className="alert alert-info">Cargando módulo de ventas...</div>
        ) : (
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h4 className="mb-3">Registrar nueva venta</h4>

              <form onSubmit={guardarVenta}>
                <div className="d-flex gap-3 flex-wrap mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="tipoCliente"
                      id="clienteExistente"
                      checked={!usarClienteNuevo}
                      onChange={() => {
                        setUsarClienteNuevo(false);
                        setClienteId("");
                        setBuscarCliente("");
                      }}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="clienteExistente"
                    >
                      Usar cliente existente
                    </label>
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="tipoCliente"
                      id="clienteNuevo"
                      checked={usarClienteNuevo}
                      onChange={() => {
                        setUsarClienteNuevo(true);
                        setClienteId("");
                        setBuscarCliente("");
                      }}
                    />
                    <label className="form-check-label" htmlFor="clienteNuevo">
                      Registrar cliente nuevo
                    </label>
                  </div>
                </div>

                {!usarClienteNuevo ? (
                  <div className="row g-3 mb-4">
                    <div className="col-md-6 position-relative">
                      <label className="form-label">Buscar cliente por nombre</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Escribe el nombre del cliente..."
                        value={buscarCliente}
                        onChange={(e) => {
                          setBuscarCliente(e.target.value);
                          setClienteId("");
                        }}
                        autoComplete="off"
                      />

                      {buscarCliente.trim() !== "" && !clienteId && (
                        <div
                          className="list-group position-absolute w-100 shadow-sm"
                          style={{ zIndex: 20 }}
                        >
                          {clientesFiltrados.length > 0 ? (
                            clientesFiltrados.map((cliente) => (
                              <button
                                key={cliente.id}
                                type="button"
                                className="list-group-item list-group-item-action"
                                onClick={() => seleccionarCliente(cliente)}
                              >
                                <div className="fw-semibold">
                                  {cliente.nombre || `Cliente ${cliente.id}`}
                                </div>
                                <small className="text-muted">
                                  ID: {cliente.id}
                                  {cliente.identidad
                                    ? ` | Identidad: ${cliente.identidad}`
                                    : ""}
                                </small>
                              </button>
                            ))
                          ) : (
                            <div className="list-group-item text-muted">
                              No se encontraron clientes.
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Cliente seleccionado</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clienteSeleccionado?.nombre || ""}
                        placeholder="Aquí aparecerá el cliente seleccionado"
                        disabled
                      />
                    </div>
                  </div>
                ) : (
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label">Nombre</label>
                      <input
                        type="text"
                        className="form-control"
                        value={nuevoCliente.nombre}
                        onChange={(e) =>
                          actualizarNuevoCliente("nombre", e.target.value)
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Identidad</label>
                      <input
                        type="text"
                        className="form-control"
                        value={nuevoCliente.identidad}
                        onChange={(e) =>
                          actualizarNuevoCliente("identidad", e.target.value)
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Teléfono</label>
                      <input
                        type="text"
                        className="form-control"
                        value={nuevoCliente.telefono}
                        onChange={(e) =>
                          actualizarNuevoCliente("telefono", e.target.value)
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Dirección</label>
                      <input
                        type="text"
                        className="form-control"
                        value={nuevoCliente.direccion}
                        onChange={(e) =>
                          actualizarNuevoCliente("direccion", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}

                <hr />
                <h5 className="mb-3">Detalle de la venta</h5>

                {itemsConDetalle.map((item, index) => {
                  const stockInsuficiente =
                    item.producto && Number(item.cantidad || 0) > item.stockDisponible;

                  return (
                    <div
                      className="row g-3 align-items-end mb-3 border rounded p-3 bg-light"
                      key={index}
                    >
                      <div className="col-md-1">
                        <label className="form-label">Línea</label>
                        <input
                          type="text"
                          className="form-control"
                          value={index + 1}
                          disabled
                        />
                      </div>

                      <div className="col-md-4 position-relative">
                        <label className="form-label">Producto</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Buscar medicamento..."
                          value={item.busqueda || ""}
                          onChange={(e) => {
                            actualizarItem(index, "busqueda", e.target.value);
                            actualizarItem(index, "producto_id", "");
                          }}
                          autoComplete="off"
                        />

                        {item.busqueda?.trim() !== "" && !item.producto_id && (
                          <div
                            className="list-group position-absolute w-100 shadow-sm"
                            style={{ zIndex: 20 }}
                          >
                            {productosFiltradosPorLinea(index).length > 0 ? (
                              productosFiltradosPorLinea(index).map((producto) => {
                                const stock = obtenerStockProducto(producto);
                                const stockMinimo = obtenerStockMinimoProducto(producto);
                                const fechaVencimiento =
                                  obtenerFechaVencimientoProducto(producto);

                                return (
                                  <button
                                    key={producto.id}
                                    type="button"
                                    className="list-group-item list-group-item-action"
                                    onClick={() => seleccionarProducto(index, producto)}
                                  >
                                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                      <div>
                                        <div className="fw-semibold">
                                          {producto.nombre}
                                        </div>
                                        <small className="text-muted">
                                          ID: {producto.id} | Precio:{" "}
                                          {formatearMoneda(producto.precio_venta)}
                                        </small>
                                      </div>

                                      <div className="text-end">
                                        {productoTienePocoStock(producto) ? (
                                          <span className="badge bg-warning text-dark">
                                            Poco stock
                                          </span>
                                        ) : (
                                          <span className="badge bg-success">
                                            Disponible
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="mt-1">
                                      <small className="d-block text-muted">
                                        Presentación: {obtenerPresentacionProducto(producto)}
                                      </small>
                                      <small className="d-block text-muted">
                                        Stock: {stock}
                                        {stockMinimo > 0
                                          ? ` | Stock mínimo: ${stockMinimo}`
                                          : ""}
                                      </small>
                                      {fechaVencimiento && (
                                        <small className="d-block text-muted">
                                          Próx. vencimiento:{" "}
                                          {formatearFecha(fechaVencimiento)}
                                        </small>
                                      )}
                                    </div>

                                    <div className="mt-1 d-flex gap-2 flex-wrap">
                                      {stockMinimo > 0 && stock <= stockMinimo && (
                                        <span className="badge bg-danger">
                                          En stock mínimo
                                        </span>
                                      )}

                                      {productoProximoAVencer(producto) && (
                                        <span className="badge bg-warning text-dark">
                                          Lote próximo a vencer
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })
                            ) : (
                              <div className="list-group-item text-muted">
                                No se encontraron productos.
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="col-md-2">
                        <label className="form-label">Cantidad</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          className="form-control"
                          value={item.cantidad}
                          onChange={(e) =>
                            actualizarItem(index, "cantidad", e.target.value)
                          }
                        />
                      </div>

                      <div className="col-md-2">
                        <label className="form-label">Precio</label>
                        <input
                          type="text"
                          className="form-control"
                          value={item.producto ? Number(item.precio).toFixed(2) : ""}
                          disabled
                        />
                      </div>

                      <div className="col-md-2">
                        <label className="form-label">Subtotal</label>
                        <input
                          type="text"
                          className="form-control"
                          value={
                            item.producto && item.cantidad
                              ? Number(item.subtotal).toFixed(2)
                              : ""
                          }
                          disabled
                        />
                      </div>

                      <div className="col-md-1">
                        <button
                          type="button"
                          className="btn btn-outline-danger w-100"
                          onClick={() => eliminarItem(index)}
                        >
                          X
                        </button>
                      </div>

                      {item.producto && (
                        <div className="col-12">
                          <div className="border rounded bg-white p-2">
                            <div className="row g-2">
                              <div className="col-md-3">
                                <small className="text-muted d-block">
                                  Presentación
                                </small>
                                <strong>
                                  {obtenerPresentacionProducto(item.producto)}
                                </strong>
                              </div>

                              <div className="col-md-3">
                                <small className="text-muted d-block">
                                  Stock disponible
                                </small>
                                <strong>{item.stockDisponible}</strong>
                              </div>

                              <div className="col-md-3">
                                <small className="text-muted d-block">
                                  Stock mínimo
                                </small>
                                <strong>
                                  {obtenerStockMinimoProducto(item.producto)}
                                </strong>
                              </div>

                              <div className="col-md-3">
                                <small className="text-muted d-block">
                                  Próx. vencimiento
                                </small>
                                <strong>
                                  {formatearFecha(
                                    obtenerFechaVencimientoProducto(item.producto)
                                  )}
                                </strong>
                              </div>
                            </div>

                            <div className="mt-2 d-flex gap-2 flex-wrap">
                              {productoTienePocoStock(item.producto) && (
                                <span className="badge bg-warning text-dark">
                                  Alerta de poco stock
                                </span>
                              )}

                              {productoProximoAVencer(item.producto) && (
                                <span className="badge bg-danger">
                                  Lote próximo a vencer
                                </span>
                              )}

                              {stockInsuficiente && (
                                <span className="badge bg-danger">
                                  Cantidad mayor al stock disponible
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {productosRepetidos.length > 0 && (
                  <div className="alert alert-warning">
                    Hay productos repetidos en el detalle. Deja cada producto una sola vez.
                  </div>
                )}

                <div className="d-flex gap-2 mb-4">
                  <button
                    type="button"
                    className="btn btn-outline-success"
                    onClick={agregarItem}
                  >
                    Agregar producto
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={limpiarFormulario}
                  >
                    Limpiar formulario
                  </button>
                </div>

                <div className="card border-0 bg-light mb-3">
                  <div className="card-body">
                    <h5 className="mb-3">Resumen de la venta</h5>

                    <div className="table-responsive mb-3">
                      <table className="table table-sm table-bordered align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {itemsValidos.length > 0 ? (
                            itemsValidos.map((item, index) => (
                              <tr key={index}>
                                <td>{item.producto?.nombre || "-"}</td>
                                <td>{item.cantidad}</td>
                                <td>{formatearMoneda(item.precio)}</td>
                                <td>{formatearMoneda(item.subtotal)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="text-center">
                                Aún no hay productos válidos en la venta.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="row">
                      <div className="col-md-4">
                        <strong>Subtotal:</strong> {formatearMoneda(subtotalGeneral)}
                      </div>
                      <div className="col-md-4">
                        <strong>ISV (15%):</strong> {formatearMoneda(isvGeneral)}
                      </div>
                      <div className="col-md-4">
                        <strong>Total:</strong> {formatearMoneda(totalGeneral)}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={guardando || !formularioValido}
                >
                  {guardando ? "Procesando venta..." : "Confirmar venta"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Ventas;