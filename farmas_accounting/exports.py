from io import BytesIO
from django.http import HttpResponse
from openpyxl import Workbook
from config.permissions import IsFarmaciaRole
from rest_framework.views import APIView
from .models import LibroVenta

class ExportLibroVentasExcel(APIView):
    permission_classes = [IsFarmaciaRole]

    def get(self, request):
        desde = request.query_params.get("desde")
        hasta = request.query_params.get("hasta")

        qs = LibroVenta.objects.all().order_by("fecha_contable", "id")
        if desde:
            qs = qs.filter(fecha_contable__gte=desde)
        if hasta:
            qs = qs.filter(fecha_contable__lte=hasta)

        wb = Workbook()
        ws = wb.active
        ws.title = "LibroVentas"

        headers = [
            "Fecha", "Documento", "Cliente", "Identidad", "RTN",
            "Gravado", "Exento", "IVA", "Descuento", "Total"
        ]
        ws.append(headers)

        for x in qs:
            doc = f"{x.serie or ''}{x.numero_documento}"
            ws.append([
                str(x.fecha_contable),
                doc,
                x.cliente_nombre,
                x.cliente_identidad,
                x.cliente_rtn,
                float(x.subtotal_gravado),
                float(x.subtotal_exento),
                float(x.iva),
                float(x.descuento_total),
                float(x.total),
            ])

        bio = BytesIO()
        wb.save(bio)
        bio.seek(0)

        filename = "libro_ventas.xlsx"
        resp = HttpResponse(
            bio.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        resp["Content-Disposition"] = f'attachment; filename="{filename}"'
        return resp