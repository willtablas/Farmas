from datetime import timedelta
from django.db.models import Sum
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from farmas_inventory.models import Producto, Lote
from django.db.models.functions import Coalesce
from rest_framework import status
from config.permissions import IsConsultaReadOnly
from .models import Producto, Lote


class AlertaStockBajoView(APIView):
    """
    Productos cuyo stock total (suma de lotes) es menor o igual al stock mínimo
    """
    permission_classes = [IsConsultaReadOnly]

    def get(self, request):
        productos_alerta = (
            Producto.objects
            .annotate(stock_total=Coalesce(Sum("lotes__cantidad_disponible"), 0))
            .filter(stock_total__lte=Coalesce("stock_minimo", 0))
            .order_by("nombre")
        )

        results = [
            {
                "producto_id": p.id,
                "codigo": p.codigo,
                "nombre": p.nombre,
                "stock_total": str(p.stock_total),
                "stock_minimo": str(p.stock_minimo),
            }
            for p in productos_alerta
        ]

        return Response({"count": len(results), "results": results}, status=status.HTTP_200_OK)


class AlertaLotesPorVencerView(APIView):
    """
    Lotes con fecha de vencimiento cercana y con stock disponible
    """
    permission_classes = [IsConsultaReadOnly]

    def get(self, request):
        days_raw = request.query_params.get("days", "30")

        try:
            days = int(days_raw)
        except ValueError:
            return Response(
                {"detail": "Parámetro 'days' debe ser un número entero."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if days <= 0:
            return Response(
                {"detail": "Parámetro 'days' debe ser mayor que 0."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if days > 365:
            days = 365  # tope para evitar abuso

        hoy = timezone.now().date()
        limite = hoy + timedelta(days=days)

        lotes = (
            Lote.objects
            .filter(cantidad_disponible__gt=0, fecha_vencimiento__lte=limite)
            .select_related("producto")
            .order_by("fecha_vencimiento", "id")
        )

        results = [
            {
                "lote_id": l.id,
                "producto_id": l.producto_id,
                "producto": l.producto.nombre,
                "numero_lote": l.numero_lote,
                "cantidad_disponible": str(l.cantidad_disponible),
                "fecha_vencimiento": str(l.fecha_vencimiento),
                "dias_para_vencer": (l.fecha_vencimiento - hoy).days,
            }
            for l in lotes
        ]

        return Response(
            {"days": days, "count": len(results), "results": results},
            status=status.HTTP_200_OK
        )

