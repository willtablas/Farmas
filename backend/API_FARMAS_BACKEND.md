# API FARMAS BACKEND

Documentación técnica de endpoints disponibles en el sistema FARMAS.  
Backend desarrollado con Django + Django REST Framework.

Fecha de actualización: 07 marzo 2026

---

# 1. AUTENTICACIÓN

## Obtener token JWT

**POST**
`/api/token/`

### Body
```json
{
  "username": "usuario",
  "password": "contraseña"
}
Respuesta esperada
{
  "refresh": "token_refresh",
  "access": "token_access"
}
Refrescar token

POST
/api/token/refresh/

Body
{
  "refresh": "token_refresh"
}
2. INVENTARIO
Categorías

GET, POST
/api/categorias/

GET, PUT, PATCH, DELETE
/api/categorias/{id}/

Unidades de medida

GET, POST
/api/unidades/

GET, PUT, PATCH, DELETE
/api/unidades/{id}/

Productos

GET, POST
/api/productos/

GET, PUT, PATCH, DELETE
/api/productos/{id}/

Campos principales

codigo

nombre

categoria

unidad

precio_costo

precio_venta

requiere_lote

activo

stock_minimo

Búsqueda de productos para POS

GET
/api/productos/buscar/?q=texto

Parámetros opcionales

q: texto de búsqueda

solo_activos=true

limite=20

Lotes

GET, POST
/api/lotes/

GET, PUT, PATCH, DELETE
/api/lotes/{id}/

Campos principales

producto

numero_lote

fecha_vencimiento

cantidad_disponible

3. ALERTAS
Alerta de stock bajo

GET
/api/alertas/stock-bajo/

Alerta de lotes por vencer

GET
/api/alertas/lotes-por-vencer/

4. CLIENTES
Clientes

GET, POST
/api/clientes/

GET, PUT, PATCH, DELETE
/api/clientes/{id}/

Campos principales

nombre

telefono

identidad

5. PROVEEDORES
Proveedores

GET, POST
/api/proveedores/

GET, PUT, PATCH, DELETE
/api/proveedores/{id}/

Campos principales

nombre

contacto

telefono

6. COMPRAS
Compras

GET, POST
/api/compras/

GET, PUT, PATCH, DELETE
/api/compras/{id}/

Estructura de creación
{
  "proveedor": 1,
  "detalles": [
    {
      "producto": 1,
      "numero_lote": "PRUEBA-COMP-01",
      "fecha_vencimiento": "2027-12-31",
      "cantidad": 10,
      "precio_unitario": 15.00
    }
  ]
}
Comportamiento

Al crear una compra, el sistema:

crea el encabezado de compra

crea los detalles

crea el lote si no existe

aumenta stock si el lote ya existe

genera automáticamente el registro en LibroCompra

7. VENTAS
Ventas

GET, POST
/api/ventas/

GET, PUT, PATCH, DELETE
/api/ventas/{id}/

Comportamiento

Al crear una venta, el sistema:

registra la venta

registra el detalle

descuenta stock por lote

aplica FEFO

genera automáticamente el registro en LibroVenta

Anular venta

POST
/api/ventas/{id}/anular/

Body
{
  "motivo": "Texto del motivo"
}
Comportamiento

cambia estado de la venta a ANULADA

registra la anulación

revierte stock por lote

registra usuario y fecha

8. CONTABILIDAD
Libro de ventas

GET
/api/libro-ventas/

Filtros opcionales

?desde=YYYY-MM-DD

?hasta=YYYY-MM-DD

Libro de compras

GET
/api/libro-compras/

Filtros opcionales

?desde=YYYY-MM-DD

?hasta=YYYY-MM-DD

9. REPORTES
Reporte de inventario

GET
/api/reportes/inventario/

Devuelve

producto

lote

cantidad disponible

fecha de vencimiento

Reporte financiero consolidado

GET
/api/reportes/financiero/

Filtros opcionales

?fecha_inicio=YYYY-MM-DD

?fecha_fin=YYYY-MM-DD

Devuelve

ventas_totales

compras_totales

utilidad

Exportación reporte financiero Excel

GET
/api/reportes/financiero/excel/

Exportación reporte financiero PDF

GET
/api/reportes/financiero/pdf/

Reporte libro de ventas

GET
/api/reportes/libro-ventas/

Filtros opcionales

?desde=YYYY-MM-DD

?hasta=YYYY-MM-DD

Exportación libro de ventas Excel

GET
/api/reportes/libro-ventas/excel/

Exportación libro de ventas PDF

GET
/api/reportes/libro-ventas/pdf/

Reporte libro de compras

GET
/api/reportes/libro-compras/

Filtros opcionales

?desde=YYYY-MM-DD

?hasta=YYYY-MM-DD

Exportación libro de compras Excel

GET
/api/reportes/libro-compras/excel/

Exportación libro de compras PDF

GET
/api/reportes/libro-compras/pdf/

10. OBSERVACIONES TÉCNICAS

El sistema utiliza autenticación JWT.

Las ventas generan automáticamente LibroVenta.

Las compras generan automáticamente LibroCompra.

El reporte financiero consolida información contable de ventas y compras.

El inventario trabaja con lotes y fechas de vencimiento.

El flujo de ventas utiliza lógica FEFO.

El sistema soporta exportación de reportes a Excel y PDF.

11. ESTADO GENERAL

Backend funcional y validado en los módulos de:

inventario

compras

ventas

contabilidad

reportes

alertas

autenticación