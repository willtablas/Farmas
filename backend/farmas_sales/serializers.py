from decimal import Decimal, ROUND_HALF_UP
from rest_framework import serializers
from django.db import transaction

from farmas_inventory.models import Lote, Producto
from .models import Cliente, Venta, DetalleVenta

ISV_RATE = Decimal("0.15")  # 15%
DINERO = Decimal("0.01")


def q2(x: Decimal) -> Decimal:
    return x.quantize(DINERO, rounding=ROUND_HALF_UP)


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = "__all__"


class VentaItemSerializer(serializers.Serializer):
    producto_id = serializers.IntegerField()
    cantidad = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=Decimal("0.01"),
    )


class VentaListSerializer(serializers.ModelSerializer):
    cliente = serializers.SerializerMethodField()
    fecha = serializers.SerializerMethodField()

    class Meta:
        model = Venta
        fields = [
            "id",
            "fecha",
            "cliente",
            "cliente_id",
            "subtotal",
            "isv",
            "total",
            "estado",
        ]

    def get_cliente(self, obj):
        if obj.cliente:
            return getattr(obj.cliente, "nombre", str(obj.cliente))
        return "-"

    def get_fecha(self, obj):
        if hasattr(obj, "created_at") and obj.created_at:
            return obj.created_at
        if hasattr(obj, "fecha") and obj.fecha:
            return obj.fecha
        return None


class VentaCreateSerializer(serializers.Serializer):
    cliente_id = serializers.IntegerField(required=False, allow_null=True)
    items = VentaItemSerializer(many=True, write_only=True)

    def validate(self, attrs):
        items = attrs.get("items") or []

        if len(items) == 0:
            raise serializers.ValidationError(
                {"items": ["Debe enviar al menos un item."]}
            )

        for i, item in enumerate(items):
            cantidad = item.get("cantidad")
            if cantidad is None:
                raise serializers.ValidationError(
                    {"items": [f"Item #{i+1}: cantidad es requerida."]}
                )
            if Decimal(str(cantidad)) <= 0:
                raise serializers.ValidationError(
                    {"items": [f"Item #{i+1}: cantidad debe ser > 0."]}
                )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        items = validated_data.pop("items")
        cliente_id = validated_data.get("cliente_id")

        venta = Venta.objects.create(
            cliente_id=cliente_id,
            subtotal=Decimal("0.00"),
            isv=Decimal("0.00"),
            total=Decimal("0.00"),
        )

        subtotal = Decimal("0.00")
        isv_total = Decimal("0.00")

        for item in items:
            producto_id = item["producto_id"]
            cantidad_restante = Decimal(str(item["cantidad"]))

            try:
                producto = Producto.objects.get(id=producto_id)
            except Producto.DoesNotExist:
                raise serializers.ValidationError(
                    {"items": [f"Producto no existe: {producto_id}"]}
                )

            precio = Decimal(str(producto.precio_venta))

            lotes = (
                Lote.objects.select_for_update()
                .filter(producto_id=producto_id, cantidad_disponible__gt=0)
                .order_by("fecha_vencimiento", "id")
            )

            for lote in lotes:
                if cantidad_restante <= 0:
                    break

                disponible = Decimal(str(lote.cantidad_disponible))
                usar = disponible if disponible < cantidad_restante else cantidad_restante

                lote.cantidad_disponible = q2(disponible - usar)
                lote.save(update_fields=["cantidad_disponible"])

                linea_base = precio * usar
                linea_isv = linea_base * ISV_RATE

                DetalleVenta.objects.create(
                    venta=venta,
                    producto=producto,
                    lote=lote,
                    cantidad=usar,
                    precio_unitario=precio,
                    isv_linea=q2(linea_isv),
                )

                subtotal += linea_base
                isv_total += linea_isv
                cantidad_restante -= usar

            if cantidad_restante > 0:
                raise serializers.ValidationError(
                    {
                        "items": [
                            f"Stock insuficiente para el producto {producto.nombre}. Faltan: {cantidad_restante}"
                        ]
                    }
                )

        venta.subtotal = q2(subtotal)
        venta.isv = q2(isv_total)
        venta.total = q2(venta.subtotal + venta.isv)
        venta.save(update_fields=["subtotal", "isv", "total"])

        return venta
