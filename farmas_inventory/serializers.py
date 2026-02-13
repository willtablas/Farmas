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
        
        from .models import Producto
from rest_framework import serializers

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