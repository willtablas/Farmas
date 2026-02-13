from datetime import timedelta
from django.db.models import Sum
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response

from farmas_inventory.models import Producto, Lote


class AlertaStockBajoView(APIView):
    """
    Productos cuyo stock total (suma de lotes) es menor o igual al stock mínimo
    """
    def get(self, request):
        productos = Producto.objects.annotate(
            stock_total=Sum("lotes__cantidad_disponible")
        )

        alertas = []
        for p in productos:
            stock_total = p.stock_total or 0
            if stock_total <= p.stock_minimo:
                alertas.append({
                    "producto_id": p.id,
                    "codigo": p.codigo,
                    "nombre": p.nombre,
                    "stock_total": str(stock_total),
                    "stock_minimo": str(p.stock_minimo),
                })

        return Response({
            "count": len(alertas),
            "results": alertas
        })


class AlertaLotesPorVencerView(APIView):
    """
    Lotes con fecha de vencimiento cercana y con stock disponible
    """
    def get(self, request):
        days = int(request.query_params.get("days", 30))
        hoy = timezone.now().date()
        limite = hoy + timedelta(days=days)

        lotes = (
            Lote.objects
            .filter(
                cantidad_disponible__gt=0,
                fecha_vencimiento__lte=limite
            )
            .select_related("producto")
            .order_by("fecha_vencimiento")
        )

        results = []
        for l in lotes:
            results.append({
                "lote_id": l.id,
                "producto_id": l.producto_id,
                "producto": l.producto.nombre,
                "numero_lote": l.numero_lote,
                "cantidad_disponible": str(l.cantidad_disponible),
                "fecha_vencimiento": str(l.fecha_vencimiento),
                "dias_para_vencer": (l.fecha_vencimiento - hoy).days
            })

        return Response({
            "days": days,
            "count": len(results),
            "results": results
        })
