from django.db.models import Sum
from django.db.models.functions import TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from config.permissions import IsFarmaciaRole
from .models import LibroVenta

class ReporteLibroVentas(APIView):
    permission_classes = [IsFarmaciaRole]

    def get(self, request):
        desde = request.query_params.get("desde")
        hasta = request.query_params.get("hasta")

        qs = LibroVenta.objects.all()
        if desde:
            qs = qs.filter(fecha_contable__gte=desde)
        if hasta:
            qs = qs.filter(fecha_contable__lte=hasta)

        totales = qs.aggregate(
            subtotal_gravado=Sum("subtotal_gravado"),
            subtotal_exento=Sum("subtotal_exento"),
            iva=Sum("iva"),
            descuento_total=Sum("descuento_total"),
            costo_total=Sum("costo_total"),
            total=Sum("total"),
        )

        por_mes = (
            qs.annotate(mes=TruncMonth("fecha_contable"))
              .values("mes")
              .annotate(total=Sum("total"), iva=Sum("iva"))
              .order_by("mes")
        )

        return Response({
            "filtros": {"desde": desde, "hasta": hasta},
            "totales": {k: str(v or 0) for k, v in totales.items()},
            "acumulado_por_mes": [
                {"mes": str(x["mes"])[:10], "total": str(x["total"] or 0), "iva": str(x["iva"] or 0)}
                for x in por_mes
            ]
        })