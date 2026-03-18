from django.db.models.signals import post_save
from django.dispatch import receiver

from farmas_accounting.models import LibroCompra
from farmas_purchases.models import Compra  # ⚠️ si tu modelo o app tiene otro nombre, lo ajustamos


@receiver(post_save, sender=Compra)
def crear_libro_compra(sender, instance, created, **kwargs):
    if not created:
        return

    compra = instance
    proveedor = getattr(compra, "proveedor", None)

    # fecha: usa compra.fecha si existe, si no usa created_at/fecha_creacion
    fecha = getattr(compra, "fecha", None)
    if fecha is None:
        created_at = getattr(compra, "created_at", None) or getattr(compra, "creado_at", None)
        if created_at:
            fecha = created_at.date()

    LibroCompra.objects.create(
        compra=compra,
        fecha=fecha,
        proveedor_nombre=getattr(proveedor, "nombre", str(proveedor)) if proveedor else "",
        proveedor_rtn=getattr(proveedor, "rtn", "") if proveedor else "",
        factura_proveedor=getattr(compra, "numero_factura", "") or getattr(compra, "factura_proveedor", "") or "",
        subtotal=getattr(compra, "subtotal", 0),
        isv=getattr(compra, "isv", 0),
        total=getattr(compra, "total", 0),
        estado=LibroCompra.Estado.EMITIDA,
        usuario=getattr(compra, "usuario", None),
    )