from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from farmas_inventory.models import Producto, Lote
from .models import Proveedor, Compra, DetalleCompra


class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = "__all__"


class DetalleCompraSerializer(serializers.Serializer):
    producto = serializers.PrimaryKeyRelatedField(queryset=Producto.objects.all())
    numero_lote = serializers.CharField(max_length=80)
    fecha_vencimiento = serializers.DateField()
    cantidad = serializers.DecimalField(max_digits=12, decimal_places=2)
    precio_unitario = serializers.DecimalField(max_digits=12, decimal_places=2)

    def validate_cantidad(self, value):
        if value <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor que cero.")
        return value

    def validate_precio_unitario(self, value):
        if value < 0:
            raise serializers.ValidationError("El precio unitario no puede ser negativo.")
        return value


class CompraCreateSerializer(serializers.ModelSerializer):
    detalles = DetalleCompraSerializer(many=True)

    class Meta:
        model = Compra
        fields = ["id", "proveedor", "subtotal", "isv", "total", "detalles"]
        read_only_fields = ["id", "subtotal", "isv", "total"]

    def validate_detalles(self, value):
        if not value:
            raise serializers.ValidationError("Debes enviar al menos un detalle de compra.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        detalles_data = validated_data.pop("detalles")

        subtotal = Decimal("0.00")
        for item in detalles_data:
            cantidad = Decimal(str(item["cantidad"]))
            precio = Decimal(str(item["precio_unitario"]))
            subtotal += cantidad * precio

        isv = Decimal("0.00")
        total = subtotal + isv

        compra = Compra.objects.create(
            proveedor=validated_data["proveedor"],
            subtotal=subtotal,
            isv=isv,
            total=total,
        )

        for item in detalles_data:
            producto = item["producto"]
            numero_lote = item["numero_lote"]
            fecha_vencimiento = item["fecha_vencimiento"]
            cantidad = Decimal(str(item["cantidad"]))
            precio_unitario = Decimal(str(item["precio_unitario"]))

            lote, created = Lote.objects.get_or_create(
                producto=producto,
                numero_lote=numero_lote,
                defaults={
                    "fecha_vencimiento": fecha_vencimiento,
                    "cantidad_disponible": Decimal("0.00"),
                },
            )

            if not created and lote.fecha_vencimiento != fecha_vencimiento:
                raise serializers.ValidationError(
                    f"El lote '{numero_lote}' del producto '{producto.nombre}' ya existe con otra fecha de vencimiento."
                )

            lote.cantidad_disponible += cantidad
            lote.save()

            DetalleCompra.objects.create(
                compra=compra,
                producto=producto,
                lote=lote,
                cantidad=cantidad,
                precio_unitario=precio_unitario,
            )

        return compra


class DetalleCompraReadSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source="producto.nombre", read_only=True)
    producto_codigo = serializers.CharField(source="producto.codigo", read_only=True)
    numero_lote = serializers.CharField(source="lote.numero_lote", read_only=True)
    fecha_vencimiento = serializers.DateField(source="lote.fecha_vencimiento", read_only=True)

    class Meta:
        model = DetalleCompra
        fields = [
            "id",
            "producto",
            "producto_codigo",
            "producto_nombre",
            "numero_lote",
            "fecha_vencimiento",
            "cantidad",
            "precio_unitario",
        ]


class CompraReadSerializer(serializers.ModelSerializer):
    proveedor_nombre = serializers.CharField(source="proveedor.nombre", read_only=True)
    detalles = DetalleCompraReadSerializer(many=True, read_only=True)

    class Meta:
        model = Compra
        fields = [
            "id",
            "proveedor",
            "proveedor_nombre",
            "fecha",
            "subtotal",
            "isv",
            "total",
            "detalles",
        ]