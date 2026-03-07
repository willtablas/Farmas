from rest_framework import serializers
from farmas_inventory.models import Lote


class InventarioLoteReporteSerializer(serializers.ModelSerializer):
    producto = serializers.CharField(source="producto.nombre", read_only=True)

    class Meta:
        model = Lote
        fields = [
            "id",
            "producto",
            "cantidad_disponible",
            "fecha_vencimiento",
        ]