from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Cliente, Venta
from .serializers import ClienteSerializer, VentaCreateSerializer
from config.permissions import IsFarmaciaRole

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all().order_by("id")
    serializer_class = ClienteSerializer


class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all().order_by("-id")
    serializer_class = VentaCreateSerializer
    permission_classes = [IsFarmaciaRole]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        venta = serializer.save()
        return Response(
            {"venta_id": venta.id, "subtotal": venta.subtotal, "isv": venta.isv, "total": venta.total},
            status=status.HTTP_201_CREATED,
        )



