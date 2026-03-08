from rest_framework import viewsets
from config.permissions import IsFarmaciaRole
from .models import LibroVenta, LibroCompra
from .serializers import LibroVentaSerializer, LibroCompraSerializer


class LibroVentaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LibroVenta.objects.all().order_by("-id")
    serializer_class = LibroVentaSerializer
    permission_classes = [IsFarmaciaRole]

    def get_queryset(self):
        qs = super().get_queryset()
        desde = self.request.query_params.get("desde")
        hasta = self.request.query_params.get("hasta")

        if desde:
            qs = qs.filter(fecha_contable__gte=desde)
        if hasta:
            qs = qs.filter(fecha_contable__lte=hasta)

        return qs


class LibroCompraViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LibroCompra.objects.all().order_by("-id")
    serializer_class = LibroCompraSerializer
    permission_classes = [IsFarmaciaRole]

    def get_queryset(self):
        qs = super().get_queryset()
        desde = self.request.query_params.get("desde")
        hasta = self.request.query_params.get("hasta")

        if desde:
            qs = qs.filter(fecha__gte=desde)
        if hasta:
            qs = qs.filter(fecha__lte=hasta)

        return qs