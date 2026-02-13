from decimal import Decimal
from django.db import models


class Categoria(models.Model):
    nombre = models.CharField(max_length=80, unique=True)

    def __str__(self):
        return self.nombre


class UnidadMedida(models.Model):
    nombre = models.CharField(max_length=80)
    abreviatura = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.abreviatura


class Producto(models.Model):
    codigo = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=150)
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT, related_name="productos")
    unidad = models.ForeignKey(UnidadMedida, on_delete=models.PROTECT, related_name="productos")

    precio_costo = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    precio_venta = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    requiere_lote = models.BooleanField(default=True)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    stock_minimo = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    def __str__(self):
        return f"{self.codigo} - {self.nombre}"


class Lote(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="lotes")
    numero_lote = models.CharField(max_length=80)
    fecha_vencimiento = models.DateField()
    cantidad_disponible = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["producto", "numero_lote"], name="uq_lote_producto")
        ]
        indexes = [
            models.Index(fields=["producto", "fecha_vencimiento"], name="idx_lote_prod_venc")
        ]

    def __str__(self):
        return f"{self.producto.codigo} | Lote {self.numero_lote} | Vence {self.fecha_vencimiento}"
