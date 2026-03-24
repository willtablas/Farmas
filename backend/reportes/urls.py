from django.urls import path
from .views import ReporteInventarioView, ReporteFinancieroView, ReporteFinancieroExcelView
from .views import ReporteFinancieroPDFView

urlpatterns = [
    path("api/reportes/inventario/", ReporteInventarioView.as_view(), name="reporte-inventario"),
    path("api/reportes/financiero/", ReporteFinancieroView.as_view(), name="reporte-financiero"),
    path("api/reportes/financiero/excel/", ReporteFinancieroExcelView.as_view(), name="reporte-financiero-excel"),
    path("api/reportes/financiero/pdf/", ReporteFinancieroPDFView.as_view(), name="reporte-financiero-pdf"),
]