from rest_framework import viewsets
from .models import Proveedor
from .serializers import ProveedorSerializer

class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all().order_by("id")
    serializer_class = ProveedorSerializer
