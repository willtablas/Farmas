Actualización de Avance – Proyecto FARMAS

Fecha: 10 de marzo de 2026

Estado General del Proyecto

El sistema FARMAS cuenta actualmente con un backend completamente funcional en Django REST Framework y un frontend operativo desarrollado en React + Vite.

Se ha completado la integración entre backend y frontend para los principales módulos del sistema.

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

Frontend

Tecnologías utilizadas:

React

Vite

Axios

React Router

Bootstrap

Módulos Backend Implementados
1. Autenticación

Autenticación mediante JWT.

Endpoint utilizado:

POST /api/token/

Devuelve:

access
refresh

El token se guarda en localStorage para autenticación en el frontend.

2. Inventario

Gestión de inventario por lotes.

Características:

control de stock por lote

fechas de vencimiento

consumo FEFO (First Expired First Out)

Endpoint utilizado:

GET /api/reportes/inventario/

Devuelve:

producto

cantidad disponible

fecha de vencimiento

3. Compras

Registro de compras con generación automática de inventario.

Flujo:

Compra → creación de lotes → actualización de inventario

Endpoint:

GET /api/compras/
POST /api/compras/

Cada compra genera automáticamente:

lote de producto

actualización de stock

4. Ventas

Sistema completo de ventas con control de inventario.

Flujo:

Venta → consumo FEFO de lotes → cálculo de impuestos → registro contable

Características:

consumo automático de lotes

validación de stock

cálculo automático de subtotal

cálculo automático de ISV (15%)

cálculo de total

Endpoint principal:

GET /api/ventas/
POST /api/ventas/
5. Anulación de Ventas

Sistema de reversión de ventas.

Flujo:

Venta anulada → reversión de stock → registro de anulación

Endpoint:

POST /api/ventas/{id}/anular/

Actualiza:

estado de venta

inventario

registro de anulación

6. Módulo Contable
Libro de Ventas

Generación automática al crear ventas.

Endpoint:

GET /api/libro-ventas/

Incluye:

fecha

cliente

subtotal

ISV

total

estado

Libro de Compras

Generación automática al registrar compras.

Endpoint:

GET /api/libro-compras/

Incluye:

proveedor

subtotal

ISV

total

fecha

7. Reportes

Sistema de reportes financieros.

Endpoints:

GET /api/reportes/inventario/
GET /api/reportes/libro-ventas/
GET /api/reportes/libro-compras/

Exportaciones disponibles:

Excel
PDF
Frontend Implementado

El frontend permite consumir todos los endpoints del backend.

Módulos disponibles
Login

Autenticación mediante JWT.

Ruta:

/login
Dashboard

Panel principal del sistema.

Ruta:

/dashboard
Inventario

Visualización de inventario por lotes.

Ruta:

/inventario
Compras

Consulta de compras registradas.

Ruta:

/compras
Ventas

Listado de ventas registradas.

Ruta:

/ventas

Incluye:

fecha

cliente

subtotal

ISV

total

estado

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
Seguridad

El sistema implementa:

autenticación JWT

control de roles mediante permisos

endpoints protegidos

Estado del Sistema
Backend

100% funcional.

Incluye:

inventario

ventas

compras

contabilidad

reportes

anulaciones

Frontend

Integración funcional con backend.

Módulos conectados:

Login

Dashboard

Inventario

Compras

Ventas

Libro de ventas

Libro de compras

Reportes

Pendiente
Mejoras visuales

Se realizará una mejora estética del sistema:

diseño profesional

paleta de colores verde (tema farmacia)

mejora de tablas

mejora del dashboard

mejora del sidebar