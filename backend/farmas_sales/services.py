from django.db import transaction
from django.db.models import F
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from .models import Venta, AnulacionVenta
from farmas_inventory.models import Lote  


@transaction.atomic
def anular_venta(*, venta: Venta, usuario, motivo: str) -> None:
    # 1) Validaciones
    if venta.estado == "ANULADA":
        raise ValidationError("La venta ya está anulada.")

    motivo = (motivo or "").strip()
    if not motivo:
        raise ValidationError("El motivo de anulación es obligatorio.")

    # 2) Revertir stock al mismo lote usado 
    detalles = venta.detalles.select_related("lote").all()
    if not detalles.exists():
        raise ValidationError("No se puede anular una venta sin detalles.")

    for d in detalles:
        # suma exacta al lote original
        Lote.objects.filter(pk=d.lote_id).update(
            cantidad_disponible=F("cantidad_disponible") + d.cantidad
        )

    # 3) Marcar venta como ANULADA
    venta.estado = "ANULADA"
    venta.anulada_at = timezone.now()
    venta.anulada_por = usuario
    venta.save(update_fields=["estado", "anulada_at", "anulada_por"])

    # 4) Guardar registro de anulación
    AnulacionVenta.objects.create(
        venta=venta,
        motivo=motivo,
        usuario=usuario
    )