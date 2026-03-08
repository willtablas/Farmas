from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import LibroVenta, LibroCompra


class ReporteLibroVentas(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        desde = request.query_params.get("desde")
        hasta = request.query_params.get("hasta")

        qs = LibroVenta.objects.all().order_by("-fecha_contable", "-id")

        if desde:
            qs = qs.filter(fecha_contable__gte=desde)
        if hasta:
            qs = qs.filter(fecha_contable__lte=hasta)

        data = []
        for item in qs:
            data.append({
                "id": item.id,
                "venta": item.venta_id,
                "fecha_contable": item.fecha_contable,
                "numero_documento": item.numero_documento,
                "cliente_nombre": item.cliente_nombre,
                "cliente_identidad": item.cliente_identidad,
                "subtotal_gravado": item.subtotal_gravado,
                "subtotal_exento": item.subtotal_exento,
                "iva": item.iva,
                "descuento_total": item.descuento_total,
                "costo_total": item.costo_total,
                "total": item.total,
                "tipo_pago": item.tipo_pago,
                "estado": item.estado,
            })

        totales = qs.aggregate(
            total_subtotal_gravado=Sum("subtotal_gravado"),
            total_subtotal_exento=Sum("subtotal_exento"),
            total_iva=Sum("iva"),
            total_descuento=Sum("descuento_total"),
            total_costo=Sum("costo_total"),
            total_general=Sum("total"),
        )

        return Response({
            "count": qs.count(),
            "results": data,
            "totales": {
                "subtotal_gravado": totales["total_subtotal_gravado"] or 0,
                "subtotal_exento": totales["total_subtotal_exento"] or 0,
                "iva": totales["total_iva"] or 0,
                "descuento_total": totales["total_descuento"] or 0,
                "costo_total": totales["total_costo"] or 0,
                "total": totales["total_general"] or 0,
            }
        })


class ReporteLibroCompras(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        desde = request.query_params.get("desde")
        hasta = request.query_params.get("hasta")

        qs = LibroCompra.objects.all().order_by("-fecha", "-id")

        if desde:
            qs = qs.filter(fecha__gte=desde)
        if hasta:
            qs = qs.filter(fecha__lte=hasta)

        data = []
        for item in qs:
            data.append({
                "id": item.id,
                "compra": item.compra_id,
                "fecha": item.fecha,
                "proveedor_nombre": item.proveedor_nombre,
                "proveedor_rtn": item.proveedor_rtn,
                "factura_proveedor": item.factura_proveedor,
                "subtotal": item.subtotal,
                "isv": item.isv,
                "total": item.total,
                "estado": item.estado,
            })

        totales = qs.aggregate(
            total_subtotal=Sum("subtotal"),
            total_isv=Sum("isv"),
            total_general=Sum("total"),
        )

        return Response({
            "count": qs.count(),
            "results": data,
            "totales": {
                "subtotal": totales["total_subtotal"] or 0,
                "isv": totales["total_isv"] or 0,
                "total": totales["total_general"] or 0,
            }
        })