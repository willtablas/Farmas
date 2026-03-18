Actualización de Avance – Proyecto FARMAS

Fecha: 11 de marzo de 2026

Estado General del Proyecto

El sistema FARMAS cuenta con un backend completamente funcional desarrollado en Django REST Framework y un frontend operativo construido con React + Vite.

Durante esta etapa se ha trabajado principalmente en la integración real entre frontend y backend, permitiendo que el sistema pueda utilizarse de forma funcional.

El objetivo actual del proyecto es completar y profesionalizar el frontend, utilizando los endpoints ya implementados en el backend.

Arquitectura del Sistema
Backend

Tecnologías utilizadas:

Python

Django

Django REST Framework

PostgreSQL

JWT Authentication

Openpyxl (exportación Excel)

Reportlab (exportación PDF)

El backend se encuentra completamente funcional e incluye:

inventario

compras

ventas

contabilidad

reportes

anulaciones

Frontend

Tecnologías utilizadas:

React

Vite

Axios

React Router

Bootstrap

El frontend consume directamente los endpoints del backend mediante Axios y utiliza JWT almacenado en localStorage para autenticación.

Módulos Backend Implementados
1. Autenticación

Sistema de autenticación basado en JWT.

Endpoint:

POST /api/token/

Devuelve:

access

refresh

El token se guarda en localStorage para autenticación en el frontend.

2. Inventario

Control de inventario por lotes.

Características:

control de stock por lote

fechas de vencimiento

consumo FEFO (First Expired First Out)

Endpoint:

GET /api/reportes/inventario/

Devuelve:

producto

cantidad disponible

fecha de vencimiento

3. Compras

Registro de compras con generación automática de inventario.

Flujo:

Compra → creación de lotes → actualización de inventario

Endpoints:

GET /api/compras/
POST /api/compras/

Cada compra genera automáticamente:

lote de producto

actualización de stock

registro contable en libro de compras

4. Ventas

Sistema completo de ventas con control de inventario.

Flujo:

Venta → consumo FEFO → registro detalle → cálculo de impuestos → registro contable

Características:

consumo automático de lotes

validación de stock

cálculo automático de subtotal

cálculo automático de ISV (15%)

cálculo automático de total

Endpoint principal:

GET /api/ventas/
POST /api/ventas/
5. Anulación de Ventas

Sistema para revertir ventas registradas.

Flujo:

Venta anulada → reversión de stock → registro de anulación

Endpoint:

POST /api/ventas/{id}/anular/

Se envía:

{
  "motivo": "motivo de la anulacion"
}

Acciones que realiza el backend:

cambia estado de venta a ANULADA

devuelve el stock a los lotes utilizados

registra la anulación

6. Módulo Contable
Libro de Ventas

Se genera automáticamente al crear ventas.

Endpoint:

GET /api/libro-ventas/

Campos:

fecha

cliente

subtotal

ISV

total

estado

Libro de Compras

Se genera automáticamente al registrar compras.

Endpoint:

GET /api/libro-compras/

Campos:

proveedor

subtotal

ISV

total

fecha

7. Reportes

Sistema de reportes financieros.

Endpoints disponibles:

GET /api/reportes/inventario/
GET /api/reportes/libro-ventas/
GET /api/reportes/libro-compras/

Exportaciones disponibles:

Excel

PDF

Estado del Frontend

El frontend actualmente permite consumir la mayoría de endpoints del backend.

Módulos implementados:

Login

Autenticación mediante JWT.

Ruta:

/login
Dashboard

Panel principal del sistema.

Muestra tarjetas informativas del sistema.

Ruta:

/dashboard
Inventario

Consulta de lotes con stock disponible.

Ruta:

/inventario
Compras

Listado de compras registradas.

Ruta:

/compras
Ventas (MEJORADO)

Durante esta etapa se mejoró completamente el módulo de ventas.

Ahora el sistema permite:

seleccionar cliente existente

registrar cliente nuevo desde la venta

agregar múltiples productos

visualizar precio del producto

ver subtotal por línea

ver resumen antes de confirmar la venta

registrar la venta desde el frontend

El sistema calcula automáticamente:

subtotal

ISV

total

Ruta:

/ventas
Anulaciones

Permite anular ventas registradas.

Incluye:

botón para anular venta

envío de motivo de anulación

actualización automática del estado

Ruta:

/anulaciones
Libro de Ventas

Consulta de registros contables generados por ventas.

Ruta:

/libro-ventas
Libro de Compras

Consulta de registros contables generados por compras.

Ruta:

/libro-compras
Reportes

Acceso a reportes del sistema.

Ruta:

/reportes
Mejoras Pendientes

Para completar el sistema aún faltan algunas mejoras:

Frontend

mejorar diseño visual

implementar tema verde estilo farmacia

mejorar dashboard

mejorar tablas

mejorar sidebar

Backend

Mejoras posibles:

incluir detalle de productos vendidos en endpoint de ventas

endpoint de detalle completo de venta

mejoras en validaciones

Estado Actual del Proyecto
Backend

Estado:

100% funcional

Incluye:

inventario

compras

ventas

contabilidad

reportes

anulaciones

Frontend

Estado actual aproximado:

70% – 75% completo

La integración principal ya funciona, pero aún faltan mejoras visuales y algunos flujos.