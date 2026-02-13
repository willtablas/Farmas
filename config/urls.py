from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from farmas_inventory.views import (
    CategoriaViewSet, UnidadMedidaViewSet, ProductoViewSet, LoteViewSet
)
from farmas_sales.views import ClienteViewSet, VentaViewSet
from farmas_purchases.views import ProveedorViewSet

from farmas_inventory.views_alerts import AlertaStockBajoView, AlertaLotesPorVencerView

router = DefaultRouter()
router.register(r"categorias", CategoriaViewSet, basename="categoria")
router.register(r"unidades", UnidadMedidaViewSet, basename="unidad")
router.register(r"productos", ProductoViewSet, basename="producto")
router.register(r"lotes", LoteViewSet, basename="lote")
router.register(r"clientes", ClienteViewSet, basename="cliente")
router.register(r"proveedores", ProveedorViewSet, basename="proveedor")
router.register(r"ventas", VentaViewSet, basename="venta")

urlpatterns = [
    path("admin/", admin.site.urls),

    # API (router)
    path("api/", include(router.urls)),

    # Alertas
    path("api/alertas/stock-bajo/", AlertaStockBajoView.as_view(), name="alerta_stock_bajo"),
    path("api/alertas/lotes-por-vencer/", AlertaLotesPorVencerView.as_view(), name="alerta_lotes_por_vencer"),

    # Auth JWT (SimpleJWT)
    path("api/auth/login/", TokenObtainPairView.as_view(), name="jwt_login"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="jwt_refresh"),
]


