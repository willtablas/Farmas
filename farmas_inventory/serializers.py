from rest_framework import serializers
from .models import Categoria, UnidadMedida, Producto, Lote
from rest_framework import serializers
from .models import Producto


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = "__all__"


class UnidadMedidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnidadMedida
        fields = "__all__"


class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = "__all__",


class LoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lote
        fields = "__all__"

class ProductoPOSSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = [
            "id",
            "codigo",
            "nombre",
            "categoria",
            "unidad",
            "precio_venta",
            "requiere_lote",
            "activo",
            "stock_minimo",
        ]
        
from rest_framework import serializers
from .models import Producto, Lote

class ProductoPOSSerializer(serializers.ModelSerializer):
    stock_total = serializers.SerializerMethodField()

    class Meta:
        model = Producto
        fields = [
            "id",
            "codigo",
            "nombre",
            "categoria",
            "unidad",
            "precio_venta",
            "requiere_lote",
            "activo",
            "stock_minimo",
            "stock_total",
        ]

    def get_stock_total(self, obj):
        return sum(
            lote.cantidad_disponible
            for lote in obj.lotes.all()
            if lote.cantidad_disponible > 0
        )
