from django.shortcuts import render
from rest_framework.generics import ListAPIView
from farmas_inventory.models import Lote
from .serializers import InventarioLoteReporteSerializer
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from openpyxl import Workbook
from django.http import HttpResponse
from farmas_accounting.models import LibroVenta, LibroCompra
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter


class ReporteInventarioView(ListAPIView):
    serializer_class = InventarioLoteReporteSerializer

    def get_queryset(self):
        # Solo lotes con stock disponible
        return (
            Lote.objects
            .filter(cantidad_disponible__gt=0)
            .select_related("producto")
            .order_by("producto__nombre", "fecha_vencimiento")
        )


class ReporteFinancieroView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        fi = request.query_params.get("fecha_inicio")
        ff = request.query_params.get("fecha_fin")

        # exclusion de anulados
        qs_ventas = LibroVenta.objects.exclude(estado="ANULADA")
        qs_compras = LibroCompra.objects.exclude(estado="ANULADA")

        # Filtros por fecha
        if fi:
            qs_ventas = qs_ventas.filter(fecha_contable__gte=fi)
            qs_compras = qs_compras.filter(fecha__gte=fi)
        if ff:
            qs_ventas = qs_ventas.filter(fecha_contable__lte=ff)
            qs_compras = qs_compras.filter(fecha__lte=ff)

        ventas_totales = qs_ventas.aggregate(total=Sum("total"))["total"] or 0
        compras_totales = qs_compras.aggregate(total=Sum("total"))["total"] or 0
        utilidad = ventas_totales - compras_totales

        return Response({
            "fecha_inicio": fi,
            "fecha_fin": ff,
            "ventas_totales": ventas_totales,
            "compras_totales": compras_totales,
            "utilidad": utilidad
        })
    

class ReporteFinancieroExcelView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        fi = request.query_params.get("fecha_inicio")
        ff = request.query_params.get("fecha_fin")

        qs_ventas = LibroVenta.objects.exclude(estado="ANULADA")
        qs_compras = LibroCompra.objects.exclude(estado="ANULADA")

        if fi:
            qs_ventas = qs_ventas.filter(fecha_contable__gte=fi)
            qs_compras = qs_compras.filter(fecha__gte=fi)
        if ff:
            qs_ventas = qs_ventas.filter(fecha_contable__lte=ff)
            qs_compras = qs_compras.filter(fecha__lte=ff)

        ventas_totales = qs_ventas.aggregate(total=Sum("total"))["total"] or 0
        compras_totales = qs_compras.aggregate(total=Sum("total"))["total"] or 0
        utilidad = ventas_totales - compras_totales

        wb = Workbook()
        ws = wb.active
        ws.title = "Reporte Financiero"

        ws.append(["REPORTE FINANCIERO"])
        ws.append(["Fecha inicio", fi or ""])
        ws.append(["Fecha fin", ff or ""])
        ws.append([])
        ws.append(["ventas_totales", float(ventas_totales)])
        ws.append(["compras_totales", float(compras_totales)])
        ws.append(["utilidad", float(utilidad)])

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = 'attachment; filename="reporte_financiero.xlsx"'
        wb.save(response)
        return response
    

class ReporteFinancieroPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        fi = request.query_params.get("fecha_inicio")
        ff = request.query_params.get("fecha_fin")

        qs_ventas = LibroVenta.objects.exclude(estado="ANULADA")
        qs_compras = LibroCompra.objects.exclude(estado="ANULADA")

        if fi:
            qs_ventas = qs_ventas.filter(fecha_contable__gte=fi)
            qs_compras = qs_compras.filter(fecha__gte=fi)
        if ff:
            qs_ventas = qs_ventas.filter(fecha_contable__lte=ff)
            qs_compras = qs_compras.filter(fecha__lte=ff)

        ventas_totales = qs_ventas.aggregate(total=Sum("total"))["total"] or 0
        compras_totales = qs_compras.aggregate(total=Sum("total"))["total"] or 0
        utilidad = ventas_totales - compras_totales

        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="reporte_financiero.pdf"'

        c = canvas.Canvas(response, pagesize=letter)
        width, height = letter

        y = height - 80
        c.setFont("Helvetica-Bold", 16)
        c.drawString(60, y, "REPORTE FINANCIERO")
        y -= 28

        c.setFont("Helvetica", 11)
        c.drawString(60, y, f"Fecha inicio: {fi or ''}")
        y -= 16
        c.drawString(60, y, f"Fecha fin: {ff or ''}")
        y -= 28

        c.setFont("Helvetica-Bold", 12)
        c.drawString(60, y, f"Ventas totales: {ventas_totales}")
        y -= 18
        c.drawString(60, y, f"Compras totales: {compras_totales}")
        y -= 18
        c.drawString(60, y, f"Utilidad: {utilidad}")

        c.showPage()
        c.save()
        return response