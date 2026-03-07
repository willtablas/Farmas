from rest_framework import status, viewsets
from rest_framework.response import Response

from config.permissions import IsFarmaciaRole
from .models import Proveedor, Compra
from .serializers import (
    ProveedorSerializer,
    CompraCreateSerializer,
    CompraReadSerializer,
)


class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all().order_by("id")
    serializer_class = ProveedorSerializer
    permission_classes = [IsFarmaciaRole]


class CompraViewSet(viewsets.ModelViewSet):
    queryset = Compra.objects.all().order_by("-id")
    permission_classes = [IsFarmaciaRole]

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return CompraReadSerializer
        return CompraCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        compra = serializer.save()

        return Response(
            {
                "compra_id": compra.id,
                "proveedor": compra.proveedor.nombre,
                "subtotal": str(compra.subtotal),
                "isv": str(compra.isv),
                "total": str(compra.total),
            },
            status=status.HTTP_201_CREATED,
        )