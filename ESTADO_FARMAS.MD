# ESTADO DEL PROYECTO FARMAS

# Estado del Proyecto FARMAS
Actualizado: Marzo 2026

## Descripción General
FARMAS es un sistema backend para la gestión de farmacias desarrollado con **Django + Django REST Framework**.  
El sistema implementa control de inventario por lotes, ventas POS, contabilidad básica y generación de reportes financieros.

La arquitectura del sistema está dividida en módulos principales:

- Inventario
- Ventas
- Compras
- Contabilidad
- Reportes
- Autenticación

---

# Arquitectura del Proyecto

Apps principales del sistema:

- farmas_inventory
- farmas_sales
- farmas_purchases
- farmas_accounting
- reportes
- config

---

# Módulo de Inventario

## Modelos implementados

- Categoria
- UnidadMedida
- Producto
- Lote

## Características

- Control de productos por categoría
- Control por unidad de medida
- Manejo de inventario por lotes
- Fecha de vencimiento por lote
- Control de cantidad disponible
- Stock mínimo por producto
- Índices para optimizar consultas por producto y fecha de vencimiento

## Endpoints disponibles


/api/categorias/
/api/unidades/
/api/productos/
/api/lotes/


## Funcionalidades adicionales

- Búsqueda de productos para POS


/api/productos/buscar/?q=texto


Permite buscar productos por:

- código
- nombre

---

# Módulo de Ventas

## Modelos implementados

- Cliente
- Venta
- DetalleVenta
- VentaLote
- AnulacionVenta

## Características

- Registro de ventas POS
- Cálculo automático de subtotal, ISV y total
- Asociación de productos con lotes
- Trazabilidad de lotes utilizados en cada venta
- Manejo de estado de venta

Estados disponibles:

- ACTIVA
- ANULADA

## Anulación de ventas

Endpoint:


POST /api/ventas/{id}/anular/


Características:

- registra motivo de anulación
- registra usuario que anula
- cambia estado de venta

## Generación automática de contabilidad

Al crear una venta se ejecuta automáticamente:


generar_libro_venta()


Esto crea el registro correspondiente en **LibroVenta**.

---

# Módulo de Compras

## Modelos

- Proveedor
- Compra
- DetalleCompra

## Funcionalidades

- Registro de compras
- Registro de detalle de compra
- Creación automática de lotes
- Actualización automática de inventario
- Generación automática de LibroCompra

## Endpoints

/api/proveedores/
/api/compras/

## Integración contable

Al crear una compra, el sistema genera automáticamente su registro en `LibroCompra`.

## Resultado

El flujo de compras quedó completo en backend y conectado con inventario y contabilidad.

# Módulo Contable

## Modelos

- LibroVenta
- LibroCompra

## Funcionalidades

### Libro de ventas

- Generación automática al crear venta
- Snapshot de cliente
- Registro contable independiente

### Libro de compras

- Generación automática al crear compra
- Snapshot de proveedor
- Registro contable independiente

## Endpoints

/api/libro-ventas/
/api/libro-compras/

## LibroCompra

Consulta contable de compras.

Endpoints:

/api/reportes/libro-compras/
/api/reportes/libro-compras/excel/
/api/reportes/libro-compras/pdf/
# Módulo de Reportes

## Reporte de Inventario

Endpoint:


GET /api/reportes/inventario/


Lista todos los lotes con stock disponible.

Campos principales:

- producto
- lote
- cantidad disponible
- fecha de vencimiento

---

## Reporte Financiero

Endpoint:


GET /api/reportes/financiero/


Este reporte consolida información de:

- LibroVenta
- LibroCompra

Cálculos incluidos:

- ventas totales
- compras totales
- utilidad

Permite filtros por rango de fechas:


?fecha_inicio=YYYY-MM-DD
?fecha_fin=YYYY-MM-DD


---

## Exportaciones disponibles

### Excel


/api/reportes/financiero/excel/


### PDF


/api/reportes/financiero/pdf/


---

# Alertas del sistema

## Stock bajo


/api/alertas/stock-bajo/


## Lotes por vencer


/api/alertas/lotes-por-vencer/


---

# Autenticación

El sistema utiliza **JWT (JSON Web Token)**.

Endpoints:


/api/token/
/api/token/refresh/


---

# Estado actual del sistema

## Módulos completamente funcionales

- Inventario
- Ventas
- Anulación de ventas
- Libro de ventas
- Reportes financieros
- Reporte de inventario
- Exportaciones Excel y PDF
- Alertas de inventario

## Módulos parcialmente implementados

- Compras
- Libro de compras (modelo y signal existen)

## Pendiente principal

Completar flujo de compras:

- serializers de compra
- vista para compras
- endpoint `/api/compras/`
- registro de detalle de compra
- actualización de inventario al comprar

---

# Conclusión

El sistema FARMAS cuenta con una arquitectura modular sólida y la mayor parte del backend funcional.

Los módulos de **inventario, ventas y contabilidad de ventas** están completamente operativos.

El siguiente paso para completar el sistema consiste en implementar el flujo completo del **módulo de compras**, permitiendo registrar compras, actualizar inventario y generar automáticamente los registros contables correspondientes.