from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from farmas_inventory.views import (
    CategoriaViewSet, UnidadMedidaViewSet, ProductoViewSet, LoteViewSet
)
from farmas_sales.views import ClienteViewSet, VentaViewSet
from farmas_purchases.views import ProveedorViewSet, CompraViewSet

from farmas_inventory.views_alerts import AlertaStockBajoView, AlertaLotesPorVencerView
from farmas_accounting.views import LibroVentaViewSet
from farmas_accounting.reports import ReporteLibroVentas
from farmas_accounting.exports import ExportLibroVentasExcel
from farmas_accounting.exports_pdf import ExportLibroVentasPDF
from reportes.views import ReporteInventarioView
from farmas_accounting.views import LibroVentaViewSet, LibroCompraViewSet
from farmas_accounting.reports import ReporteLibroVentas, ReporteLibroCompras
from farmas_accounting.exports import ExportLibroVentasExcel, ExportLibroComprasExcel
from farmas_accounting.exports_pdf import ExportLibroVentasPDF, ExportLibroComprasPDF



router = DefaultRouter()
router.register(r"categorias", CategoriaViewSet, basename="categoria")
router.register(r"unidades", UnidadMedidaViewSet, basename="unidad")
router.register(r"productos", ProductoViewSet, basename="producto")
router.register(r"lotes", LoteViewSet, basename="lote")
router.register(r"clientes", ClienteViewSet, basename="cliente")
router.register(r"proveedores", ProveedorViewSet, basename="proveedor")
router.register(r"ventas", VentaViewSet, basename="venta")
router.register(r"libro-ventas", LibroVentaViewSet, basename="libro-venta")
router.register(r"compras", CompraViewSet, basename="compra")
router.register(r"libro-compras", LibroCompraViewSet, basename="libro-compra")


urlpatterns = [
    path("admin/", admin.site.urls),

    # API (router)
    path("api/", include(router.urls)),

    # Alertas
    path("api/alertas/stock-bajo/", AlertaStockBajoView.as_view(), name="alerta_stock_bajo"),
    path("api/alertas/lotes-por-vencer/", AlertaLotesPorVencerView.as_view(), name="alerta_lotes_por_vencer"),

    # Auth JWT (solo una vez)
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Reportes contables
    path("api/reportes/libro-ventas/", ReporteLibroVentas.as_view()),
    path("api/reportes/libro-ventas/excel/", ExportLibroVentasExcel.as_view()),
    path("api/reportes/libro-ventas/pdf/", ExportLibroVentasPDF.as_view()),
    path("api/reportes/libro-compras/", ReporteLibroCompras.as_view()),
    path("api/reportes/libro-compras/excel/", ExportLibroComprasExcel.as_view()),
    path("api/reportes/libro-compras/pdf/", ExportLibroComprasPDF.as_view()),
    
    path("api/reportes/inventario/", ReporteInventarioView.as_view(), name="reporte-inventario"),
    path("", include("reportes.urls")),

    
]


