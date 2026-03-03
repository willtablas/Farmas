from decimal import Decimal
from django.utils import timezone
from datetime import date, timedelta
import random

from farmas_inventory.models import Categoria, UnidadMedida, Producto, Lote
from farmas_sales.models import Cliente, Venta, DetalleVenta

# -------------------------
# Helpers
# -------------------------
def get_or_create_categoria(nombre):
    obj, _ = Categoria.objects.get_or_create(nombre=nombre)
    return obj

def get_or_create_unidad(nombre, abreviatura):
    obj, created = UnidadMedida.objects.get_or_create(
        abreviatura=abreviatura,
        defaults={"nombre": nombre}
    )
    # si existía pero con otro nombre, lo actualizamos
    if not created and obj.nombre != nombre:
        obj.nombre = nombre
        obj.save()
    return obj

print("== Seed DEMO Farmas: iniciando ==")

# -------------------------
# 1) Catálogos base
# -------------------------
cat_medic = get_or_create_categoria("Medicamentos")
cat_hig = get_or_create_categoria("Higiene")
cat_supl = get_or_create_categoria("Suplementos")

u_unid = get_or_create_unidad("Unidad", "und")
u_caja = get_or_create_unidad("Caja", "caja")

# -------------------------
# 2) Crear 10 productos
# -------------------------
productos_data = [
    ("P001", "Paracetamol 500mg", cat_medic, u_caja, True, Decimal("35.00"), Decimal("55.00")),
    ("P002", "Ibuprofeno 400mg", cat_medic, u_caja, True, Decimal("45.00"), Decimal("70.00")),
    ("P003", "Loratadina 10mg", cat_medic, u_caja, True, Decimal("40.00"), Decimal("65.00")),
    ("P004", "Omeprazol 20mg", cat_medic, u_caja, True, Decimal("60.00"), Decimal("95.00")),
    ("P005", "Amoxicilina 500mg", cat_medic, u_caja, True, Decimal("85.00"), Decimal("125.00")),
    ("P006", "Alcohol 70% 120ml", cat_hig, u_unid, False, Decimal("18.00"), Decimal("30.00")),
    ("P007", "Gel antibacterial 250ml", cat_hig, u_unid, False, Decimal("35.00"), Decimal("55.00")),
    ("P008", "Vitamina C 1000mg", cat_supl, u_caja, True, Decimal("95.00"), Decimal("140.00")),
    ("P009", "Zinc 50mg", cat_supl, u_caja, True, Decimal("80.00"), Decimal("120.00")),
    ("P010", "Multivitamínico", cat_supl, u_caja, True, Decimal("110.00"), Decimal("165.00")),
]

productos = []
for codigo, nombre, cat, und, requiere_lote, pc, pv in productos_data:
    p, created = Producto.objects.get_or_create(
        codigo=codigo,
        defaults={
            "nombre": nombre,
            "categoria": cat,
            "unidad": und,
            "requiere_lote": requiere_lote,
            "precio_costo": pc,
            "precio_venta": pv,
            "activo": True,
            "stock_minimo": Decimal("5.00"),
        }
    )
    if not created:
        # actualiza por si cambió algo
        p.nombre = nombre
        p.categoria = cat
        p.unidad = und
        p.requiere_lote = requiere_lote
        p.precio_costo = pc
        p.precio_venta = pv
        p.activo = True
        if hasattr(p, "stock_minimo"):
            p.stock_minimo = Decimal("5.00")
        p.save()
    productos.append(p)

print(f"Productos listos: {len(productos)}")

# -------------------------
# 3) Crear lotes (para FEFO)
# -------------------------
# 2 lotes por producto con vencimientos distintos
today = date.today()
for p in productos:
    if p.requiere_lote:
        for i, days in enumerate([30, 120], start=1):
            Lote.objects.get_or_create(
                producto=p,
                numero_lote=f"{p.codigo}-L{i}",
                defaults={
                    "fecha_vencimiento": today + timedelta(days=days),
                    "cantidad_disponible": Decimal("50.00"),
                }
            )
    else:
        # si no requiere lote, igual podemos tener un lote "GEN"
        Lote.objects.get_or_create(
            producto=p,
            numero_lote=f"{p.codigo}-GEN",
            defaults={
                "fecha_vencimiento": today + timedelta(days=365),
                "cantidad_disponible": Decimal("200.00"),
            }
        )

print("Lotes listos.")

# -------------------------
# 4) Crear 10 clientes
# -------------------------
clientes_data = [
    ("Ana López", "9876-0001", "0801199900011"),
    ("Carlos Mejía", "9876-0002", "0801199900012"),
    ("Diana Reyes", "9876-0003", "0801199900013"),
    ("José Martínez", "9876-0004", "0801199900014"),
    ("María Fernández", "9876-0005", "0801199900015"),
    ("Luis Herrera", "9876-0006", "0801199900016"),
    ("Sofía Castro", "9876-0007", "0801199900017"),
    ("Pedro Gómez", "9876-0008", "0801199900018"),
    ("Valeria Díaz", "9876-0009", "0801199900019"),
    ("Ricardo Núñez", "9876-0010", "0801199900020"),
]

clientes = []
for nombre, tel, ident in clientes_data:
    c, created = Cliente.objects.get_or_create(
        nombre=nombre,
        defaults={"telefono": tel, "identidad": ident}
    )
    if not created:
        c.telefono = tel
        if hasattr(c, "identidad"):
            c.identidad = ident
        c.save()
    clientes.append(c)

print(f"Clientes listos: {len(clientes)}")

# -------------------------
# 5) Crear 10 ventas (facturas)
# -------------------------
# Nota: tu modelo Venta ya calcula subtotal/isv/total en backend cuando creas detalles
# Si no lo hace automáticamente, igual quedarán en 0 y lo ajustamos luego.
for n in range(10):
    cliente = random.choice(clientes)
    venta = Venta.objects.create(
        cliente=cliente,
        fecha=timezone.now(),
        tipo_comprobante="FACTURA",
        numero_comprobante=f"F-{timezone.now().strftime('%Y%m%d')}-{n+1:03d}",
        subtotal=Decimal("0.00"),
        isv=Decimal("0.00"),
        total=Decimal("0.00"),
    )

    # 1 a 3 items por venta
    items = random.sample(productos, k=random.randint(1, 3))

    for p in items:
        # seleccionar lote FEFO (más próximo a vencer con stock)
        lote = (Lote.objects
                .filter(producto=p, cantidad_disponible__gt=0)
                .order_by("fecha_vencimiento")
                .first())
        if not lote:
            continue

        cantidad = Decimal(str(random.randint(1, 3)))
        # descuenta stock
        if lote.cantidad_disponible < cantidad:
            cantidad = lote.cantidad_disponible

        precio_unit = p.precio_venta
        isv_linea = (precio_unit * cantidad * Decimal("0.15")).quantize(Decimal("0.01"))  # si usas 15% ISV
        DetalleVenta.objects.create(
            venta=venta,
            producto=p,
            lote=lote,
            cantidad=cantidad,
            precio_unitario=precio_unit,
            isv_linea=isv_linea
        )

        lote.cantidad_disponible -= cantidad
        lote.save()

    # recalcular totales básico (por si tu backend no lo hace solo)
    detalles = DetalleVenta.objects.filter(venta=venta)
    subtotal = sum([d.precio_unitario * d.cantidad for d in detalles], Decimal("0.00"))
    isv = sum([d.isv_linea for d in detalles], Decimal("0.00"))
    total = subtotal + isv
    venta.subtotal = subtotal.quantize(Decimal("0.01"))
    venta.isv = isv.quantize(Decimal("0.01"))
    venta.total = total.quantize(Decimal("0.01"))
    venta.save()

print("Ventas (facturas) creadas: 10")
print("== Seed DEMO Farmas: listo ==")
