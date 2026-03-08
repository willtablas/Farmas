from rest_framework import serializers
from .models import LibroVenta, LibroCompra


class LibroVentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = LibroVenta
        fields = "__all__"


class LibroCompraSerializer(serializers.ModelSerializer):
    class Meta:
        model = LibroCompra
        fields = "__all__"