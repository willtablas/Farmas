from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.response import Response

from config.permissions import IsFarmaciaRole
from farmas_accounting.services import generar_libro_venta
from .models import Cliente, Venta
from .serializers import ClienteSerializer, VentaCreateSerializer


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all().order_by("id")
    serializer_class = ClienteSerializer
    permission_classes = [IsFarmaciaRole]


class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all().order_by("-id")
    serializer_class = VentaCreateSerializer
    permission_classes = [IsFarmaciaRole]

    def perform_create(self, serializer):
        with transaction.atomic():
            venta = serializer.save()
            generar_libro_venta(venta.id, usuario=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        self.perform_create(serializer)
        venta = serializer.instance

        return Response(
            {
                "venta_id": venta.id,
                "subtotal": str(venta.subtotal),
                "isv": str(venta.isv),
                "total": str(venta.total),
            },
            status=status.HTTP_201_CREATED,
        )