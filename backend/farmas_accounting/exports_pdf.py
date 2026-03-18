from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

from .models import LibroVenta, LibroCompra


class ExportLibroVentasPDF(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        desde = request.query_params.get("desde")
        hasta = request.query_params.get("hasta")

        qs = LibroVenta.objects.all().order_by("-fecha_contable", "-id")

        if desde:
            qs = qs.filter(fecha_contable__gte=desde)
        if hasta:
            qs = qs.filter(fecha_contable__lte=hasta)

        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="libro_ventas.pdf"'

        c = canvas.Canvas(response, pagesize=letter)
        width, height = letter
        y = height - 40

        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y, "LIBRO DE VENTAS")
        y -= 30

        c.setFont("Helvetica", 9)
        for item in qs:
            line = f"{item.id} | Venta {item.venta_id} | {item.fecha_contable} | {item.cliente_nombre} | Total: {item.total}"
            c.drawString(50, y, line[:110])
            y -= 15

            if y < 50:
                c.showPage()
                c.setFont("Helvetica", 9)
                y = height - 40

        c.save()
        return response


class ExportLibroComprasPDF(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        desde = request.query_params.get("desde")
        hasta = request.query_params.get("hasta")

        qs = LibroCompra.objects.all().order_by("-fecha", "-id")

        if desde:
            qs = qs.filter(fecha__gte=desde)
        if hasta:
            qs = qs.filter(fecha__lte=hasta)

        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="libro_compras.pdf"'

        c = canvas.Canvas(response, pagesize=letter)
        width, height = letter
        y = height - 40

        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y, "LIBRO DE COMPRAS")
        y -= 30

        c.setFont("Helvetica", 9)
        for item in qs:
            line = f"{item.id} | Compra {item.compra_id} | {item.fecha} | {item.proveedor_nombre} | Total: {item.total}"
            c.drawString(50, y, line[:110])
            y -= 15

            if y < 50:
                c.showPage()
                c.setFont("Helvetica", 9)
                y = height - 40

        c.save()
        return response