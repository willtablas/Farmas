# ESTADO DEL PROYECTO FARMAS

## Backend
- Proyecto backend con Django + Django REST Framework funcionando
- Entorno virtual (venv) configurado y activo
- Servidor levanta correctamente con `python manage.py runserver`

## Base de datos
- Base de datos: PostgreSQL (`farmas_db`)
- Conexión verificada desde Django
- Migraciones aplicadas correctamente
- Tablas visibles y operativas

## Inventario
- App principal: `farmas_inventory`
- Modelo `Producto`:
  - Campos: codigo, nombre, categoria, unidad
  - precio_costo, precio_venta
  - stock_minimo (campo agregado y migrado correctamente)
  - requiere_lote, activo, created_at
- Modelo `Lote`:
  - FK a Producto con `related_name="lotes"`
  - numero_lote, cantidad_disponible, fecha_vencimiento
- El stock real se calcula como la suma de `cantidad_disponible` de los lotes

## Ventas
- App: `farmas_sales`
- Modelos `Venta` y `DetalleVenta` existen
- `DetalleVenta` tiene FK a `Lote` (trazabilidad por lote)
- VentaCreateSerializer:
  - Crea la venta
  - Descuenta stock por lotes (FIFO por fecha_vencimiento)
  - Usa `transaction.atomic`
  - Lanza error si no hay stock suficiente
  - Calcula subtotal, ISV y total
- La trazabilidad por lote ya está implementada y funcionando
- No es necesario crear un modelo adicional para ventas por lote

## Alertas automáticas
- Archivo: `farmas_inventory/views_alerts.py`
- Endpoint de alerta de stock bajo IMPLEMENTADO y FUNCIONANDO:
  - `/api/alertas/stock-bajo/`
  - Devuelve productos cuyo stock total <= stock_minimo
  - Probado con HTTP 200 OK
- Endpoint de alerta de lotes por vencer IMPLEMENTADO:
  - `/api/alertas/lotes-por-vencer/?days=30`
  - Devuelve lotes con stock disponible y vencimiento cercano
- Rutas registradas correctamente en `config/urls.py`

## Estado actual del proyecto
- Backend estable y funcional
- Ventas con control de stock por lotes completadas
- Alertas automáticas de stock bajo funcionando
- Proyecto listo para ser consumido por frontend

## Próximos pasos recomendados
- Probar y ajustar alerta de lotes por vencer
- Implementar seguridad por roles (admin, vendedor, bodega)
- Auditoría de acciones (ventas, movimientos de inventario)
- Documentación final de endpoints para frontend
