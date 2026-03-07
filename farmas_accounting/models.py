from decimal import Decimal
from django.conf import settings
from django.db import models


class LibroVenta(models.Model):
    class Estado(models.TextChoices):
        EMITIDA = "EMITIDA", "Emitida"
        ANULADA = "ANULADA", "Anulada"

    class TipoPago(models.TextChoices):
        CONTADO = "CONTADO", "Contado"
        CREDITO = "CREDITO", "Crédito"
        MIXTO = "MIXTO", "Mixto"

    # RELACIÓN 1-1 con tu Venta (esto NO modifica la tabla Venta)
    # Si tu app o modelo se llama diferente, me dices y lo ajusto.
    venta = models.OneToOneField(
        "farmas_sales.Venta",
        on_delete=models.PROTECT,
        related_name="libro_venta",
    )

    fecha_contable = models.DateField(db_index=True)

    # correlativo / número de documento (interno o fiscal)
    serie = models.CharField(max_length=20, null=True, blank=True)
    numero_documento = models.CharField(max_length=50, db_index=True)

    # SNAPSHOT del cliente (para que contabilidad no cambie si editan cliente después)
    cliente_nombre = models.CharField(max_length=200, blank=True, default="")
    cliente_identidad = models.CharField(max_length=50, blank=True, default="")
    cliente_rtn = models.CharField(max_length=50, blank=True, default="")

    # montos contables
    subtotal_gravado = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    subtotal_exento = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    iva = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    descuento_total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    costo_total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    total = models.DecimalField(max_digits=12, decimal_places=2)

    tipo_pago = models.CharField(max_length=10, choices=TipoPago.choices, default=TipoPago.CONTADO)
    estado = models.CharField(max_length=10, choices=Estado.choices, default=Estado.EMITIDA)

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="libros_venta",
    )

    motivo_anulacion = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "libro_ventas"
        indexes = [
            models.Index(fields=["fecha_contable"]),
            models.Index(fields=["numero_documento"]),
        ]

    def __str__(self):
        return f"{self.serie or ''}{self.numero_documento} - {self.total}"
    
class LibroCompra(models.Model):
    class Estado(models.TextChoices):
        EMITIDA = "EMITIDA", "Emitida"
        ANULADA = "ANULADA", "Anulada"

    # RELACIÓN 1-1 con tu Compra (NO modifica la tabla Compra)
    compra = models.OneToOneField(
        "farmas_purchases.Compra",
        on_delete=models.PROTECT,
        related_name="libro_compra",
    )

    fecha = models.DateField(db_index=True)

    # Snapshot del proveedor
    proveedor_nombre = models.CharField(max_length=255)
    proveedor_rtn = models.CharField(max_length=30, blank=True, default="")
    factura_proveedor = models.CharField(max_length=50, blank=True, default="")

    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    isv = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    estado = models.CharField(max_length=10, choices=Estado.choices, default=Estado.EMITIDA)

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="libros_compra",
    )

    motivo_anulacion = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "libro_compras"
        indexes = [
            models.Index(fields=["fecha"]),
        ]
        ordering = ["-fecha", "-id"]

    def __str__(self):
        return f"Compra {self.compra_id} - {self.total}"    