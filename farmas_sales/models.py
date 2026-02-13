from django.db import models
from django.db import models
from farmas_inventory.models import Producto, Lote


class Cliente(models.Model):
    # No crédito: datos básicos
    nombre = models.CharField(max_length=150)
    telefono = models.CharField(max_length=30, blank=True, null=True)

    def __str__(self):
        return self.nombre


class Venta(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.SET_NULL, null=True, blank=True)
    fecha = models.DateTimeField(auto_now_add=True, db_index=True)

    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    isv = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    tipo_comprobante = models.CharField(max_length=30, default="ticket")
    numero_comprobante = models.CharField(max_length=60, unique=True, null=True, blank=True)

    def __str__(self):
        return f"Venta #{self.id}"


class DetalleVenta(models.Model):
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE, related_name="detalles")
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    lote = models.ForeignKey(Lote, on_delete=models.PROTECT)

    cantidad = models.DecimalField(max_digits=12, decimal_places=2)
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    isv_linea = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"Venta #{self.venta_id} - {self.producto.codigo}"
from django.db import models

class VentaLote(models.Model):
    venta = models.ForeignKey("Venta", on_delete=models.CASCADE, related_name="lotes_usados")
    detalle = models.ForeignKey("DetalleVenta", on_delete=models.CASCADE, related_name="lotes_usados")
    lote = models.ForeignKey("farmas_inventory.Lote", on_delete=models.PROTECT, related_name="salidas")
    cantidad = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Venta {self.venta_id} | Lote {self.lote_id} | {self.cantidad}"
