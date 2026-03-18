from openpyxl import Workbook
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import LibroVenta, LibroCompra


class ExportLibroVentasExcel(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        desde = request.query_params.get("desde")
        hasta = request.query_params.get("hasta")

        qs = LibroVenta.objects.all().order_by("-fecha_contable", "-id")

        if desde:
            qs = qs.filter(fecha_contable__gte=desde)
        if hasta:
            qs = qs.filter(fecha_contable__lte=hasta)

        wb = Workbook()
        ws = wb.active
        ws.title = "Libro Ventas"

        ws.append([
            "ID", "Venta", "Fecha", "Documento", "Cliente",
            "Identidad", "Subtotal Gravado", "Subtotal Exento",
            "IVA", "Descuento", "Costo", "Total", "Tipo Pago", "Estado"
        ])

        for item in qs:
            ws.append([
                item.id,
                item.venta_id,
                str(item.fecha_contable),
                item.numero_documento,
                item.cliente_nombre,
                item.cliente_identidad,
                float(item.subtotal_gravado),
                float(item.subtotal_exento),
                float(item.iva),
                float(item.descuento_total),
                float(item.costo_total),
                float(item.total),
                item.tipo_pago,
                item.estado,
            ])

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = 'attachment; filename="libro_ventas.xlsx"'
        wb.save(response)
        return response


class ExportLibroComprasExcel(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        desde = request.query_params.get("desde")
        hasta = request.query_params.get("hasta")

        qs = LibroCompra.objects.all().order_by("-fecha", "-id")

        if desde:
            qs = qs.filter(fecha__gte=desde)
        if hasta:
            qs = qs.filter(fecha__lte=hasta)

        wb = Workbook()
        ws = wb.active
        ws.title = "Libro Compras"

        ws.append([
            "ID", "Compra", "Fecha", "Proveedor", "RTN",
            "Factura Proveedor", "Subtotal", "ISV", "Total", "Estado"
        ])

        for item in qs:
            ws.append([
                item.id,
                item.compra_id,
                str(item.fecha),
                item.proveedor_nombre,
                item.proveedor_rtn,
                item.factura_proveedor,
                float(item.subtotal),
                float(item.isv),
                float(item.total),
                item.estado,
            ])

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = 'attachment; filename="libro_compras.xlsx"'
        wb.save(response)
        return response