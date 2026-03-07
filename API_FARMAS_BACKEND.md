# 🏥 Sistema de Gestión de Farmacias "Farmas"
## Documentación Oficial del Backend

**Tecnologías:** Django + Django REST Framework + PostgreSQL  
**Autenticación:** JWT (Bearer Token)  
**Base URL local:** `http://127.0.0.1:8000`  
**Prefijo API:** `/api/`

---

# 🔐 1) Autenticación (JWT)

## Login (obtener tokens)
**POST** `/api/auth/login/`

**Body:**
```json
{
  "username": "usuario",
  "password": "password"
}
Respuesta:

{
  "refresh": "...",
  "access": "..."
}
Refresh (renovar access)
POST /api/auth/refresh/

Body:

{
  "refresh": "..."
}
🧾 2) Headers requeridos
Para endpoints protegidos:

Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
📌 3) API Root (rutas disponibles)
GET /api/
Devuelve la lista de endpoints principales:

/api/categorias/

/api/unidades/

/api/productos/

/api/lotes/

/api/clientes/

/api/proveedores/

/api/ventas/

🧩 4) Catálogos
Categorías
GET /api/categorias/ (listar)

POST /api/categorias/ (crear)

GET /api/categorias/{id}/ (detalle)

PUT/PATCH /api/categorias/{id}/ (actualizar)

DELETE /api/categorias/{id}/ (eliminar)

Unidades
GET /api/unidades/

POST /api/unidades/

GET /api/unidades/{id}/

PUT/PATCH /api/unidades/{id}/

DELETE /api/unidades/{id}/

💊 5) Productos
Listar productos
GET /api/productos/

Crear producto
POST /api/productos/

Body (ejemplo):

{
  "codigo": "P001",
  "nombre": "Paracetamol",
  "categoria": 1,
  "unidad": 1,
  "precio_costo": "3.00",
  "precio_venta": "5.00",
  "requiere_lote": true,
  "activo": true
}
Operaciones por ID
GET /api/productos/{id}/

PUT/PATCH /api/productos/{id}/

DELETE /api/productos/{id}/

📦 6) Lotes (Inventario)
Listar lotes
GET /api/lotes/

Crear lote
POST /api/lotes/

Body (ejemplo):

{
  "producto": 1,
  "numero_lote": "A001",
  "fecha_vencimiento": "2026-02-20",
  "cantidad_disponible": "5.00"
}
Operaciones por ID
GET /api/lotes/{id}/

PUT/PATCH /api/lotes/{id}/

DELETE /api/lotes/{id}/

👤 7) Clientes
GET /api/clientes/

POST /api/clientes/

GET /api/clientes/{id}/

PUT/PATCH /api/clientes/{id}/

DELETE /api/clientes/{id}/

🏭 8) Proveedores
GET /api/proveedores/

POST /api/proveedores/

GET /api/proveedores/{id}/

PUT/PATCH /api/proveedores/{id}/

DELETE /api/proveedores/{id}/

🧾 9) Ventas (POS)
Crear venta
POST /api/ventas/

Body (ejemplo):

{
  "cliente": null,
  "metodo_pago": "EFECTIVO",
  "items": [
    { "producto_id": 1, "cantidad": "2.00" }
  ]
}
Respuesta (ejemplo):

{
  "venta_id": 10,
  "subtotal": 10.0,
  "isv": 1.5,
  "total": 11.5
}
Reglas de negocio implementadas
FEFO automático (vence primero, sale primero)

Validación de stock insuficiente (retorna faltante)

Cantidades decimales soportadas (ej: 0.50)

Transacción segura (transaction.atomic)

⚠️ 10) Alertas
Productos con stock bajo
GET /api/alertas/stock-bajo/

Lotes por vencer
GET /api/alertas/lotes-por-vencer/

