from decimal import Decimal
from django.db import transaction
from django.utils import timezone

from farmas_accounting.models import LibroVenta


from farmas_sales.models import Venta, DetalleVenta


def _d(val) -> Decimal:
    try:
        return Decimal(str(val or "0"))
    except Exception:
        return Decimal("0")


@transaction.atomic
def generar_libro_venta(venta_id: int, usuario=None) -> LibroVenta:
    """
    Crea el registro contable (LibroVenta) para una venta ya confirmada.
    - No modifica stock ni FEFO
    - Guarda snapshot de cliente y totales
    - Evita duplicados (1-1)
    """
    venta = Venta.objects.select_related("cliente").get(id=venta_id)

   
    if hasattr(venta, "libro_venta"):
        return venta.libro_venta

    
    fecha_base = getattr(venta, "fecha", None) or getattr(venta, "created_at", None) or timezone.now()
    fecha_contable = fecha_base.date()

    
    numero_documento = getattr(venta, "numero", None) or getattr(venta, "correlativo", None) or str(venta.id)

   
    cliente = getattr(venta, "cliente", None)
    cliente_nombre = ""
    cliente_identidad = ""
    cliente_rtn = ""
    if cliente:
        cliente_nombre = getattr(cliente, "nombre", "") or str(cliente)
        cliente_identidad = getattr(cliente, "identidad", "") or ""
        cliente_rtn = getattr(cliente, "rtn", "") or ""

    
    descuento_total = _d(getattr(venta, "descuento_total", 0))
    total_venta = getattr(venta, "total", None)

    if total_venta is None:
        detalles = DetalleVenta.objects.filter(venta_id=venta.id)
        total_calc = Decimal("0.00")
        for d in detalles:
            cantidad = _d(getattr(d, "cantidad", 0))
            precio = _d(getattr(d, "precio_unitario", None) or getattr(d, "precio", 0))
            desc = _d(getattr(d, "descuento", 0))
            total_calc += (cantidad * precio) - desc
        total_venta = total_calc

   
    libro = LibroVenta.objects.create(
        venta=venta,
        fecha_contable=fecha_contable,
        serie=getattr(venta, "serie", None),
        numero_documento=str(numero_documento),

        cliente_nombre=cliente_nombre,
        cliente_identidad=cliente_identidad,
        cliente_rtn=cliente_rtn,

        subtotal_gravado=_d(total_venta),   
        subtotal_exento=Decimal("0.00"),
        iva=Decimal("0.00"),

        descuento_total=descuento_total,
        costo_total=Decimal("0.00"),
        total=_d(total_venta),

        tipo_pago=getattr(venta, "tipo_pago", "CONTADO"),
        usuario=usuario,
    )

    return libro