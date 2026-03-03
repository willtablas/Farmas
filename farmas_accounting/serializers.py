from rest_framework import serializers
from .models import LibroVenta

class LibroVentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = LibroVenta
        fields = [
            "id", "venta_id", "fecha_contable", "serie", "numero_documento",
            "cliente_nombre", "cliente_identidad", "cliente_rtn",
            "subtotal_gravado", "subtotal_exento", "iva",
            "descuento_total", "costo_total", "total",
            "tipo_pago", "estado", "created_at"
        ]