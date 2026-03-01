from io import BytesIO
from django.http import HttpResponse
from reportlab.lib.pagesizes import LETTER
from reportlab.pdfgen import canvas
from config.permissions import IsFarmaciaRole
from rest_framework.views import APIView
from .models import LibroVenta

class ExportLibroVentasPDF(APIView):
    permission_classes = [IsFarmaciaRole]

    def get(self, request):
        desde = request.query_params.get("desde")
        hasta = request.query_params.get("hasta")

        qs = LibroVenta.objects.all().order_by("fecha_contable", "id")
        if desde:
            qs = qs.filter(fecha_contable__gte=desde)
        if hasta:
            qs = qs.filter(fecha_contable__lte=hasta)

        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=LETTER)
        width, height = LETTER

        y = height - 50
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y, "Reporte: Libro de Ventas")
        y -= 20
        c.setFont("Helvetica", 10)
        c.drawString(50, y, f"Desde: {desde or '---'}  Hasta: {hasta or '---'}")
        y -= 30

        c.setFont("Helvetica-Bold", 9)
        c.drawString(50, y, "Fecha")
        c.drawString(110, y, "Doc")
        c.drawString(200, y, "Cliente")
        c.drawString(420, y, "Total")
        y -= 15
        c.setFont("Helvetica", 9)

        for x in qs[:500]:  # límite razonable
            if y < 60:
                c.showPage()
                y = height - 50
                c.setFont("Helvetica", 9)

            doc = f"{x.serie or ''}{x.numero_documento}"
            c.drawString(50, y, str(x.fecha_contable))
            c.drawString(110, y, doc[:12])
            c.drawString(200, y, (x.cliente_nombre or "")[:35])
            c.drawRightString(500, y, str(x.total))
            y -= 12

        c.showPage()
        c.save()

        pdf = buffer.getvalue()
        buffer.close()

        resp = HttpResponse(pdf, content_type="application/pdf")
        resp["Content-Disposition"] = 'attachment; filename="libro_ventas.pdf"'
        return resp