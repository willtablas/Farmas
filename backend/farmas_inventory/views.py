from django.db.models import Q

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from config.permissions import IsConsultaReadOnly

from .models import Categoria, UnidadMedida, Producto, Lote
from .serializers import (
    CategoriaSerializer,
    UnidadMedidaSerializer,
    ProductoSerializer,
    LoteSerializer,
    ProductoPOSSerializer,
)


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all().order_by("id")
    serializer_class = CategoriaSerializer
    permission_classes = [IsConsultaReadOnly]


class UnidadMedidaViewSet(viewsets.ModelViewSet):
    queryset = UnidadMedida.objects.all().order_by("id")
    serializer_class = UnidadMedidaSerializer
    permission_classes = [IsConsultaReadOnly]


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all().order_by("id")
    serializer_class = ProductoSerializer
    permission_classes = [IsConsultaReadOnly]

    @action(detail=False, methods=["get"], url_path="buscar")
    def buscar(self, request):
        q = (request.query_params.get("q") or "").strip()
        solo_activos = (request.query_params.get("solo_activos", "true")).lower() in ("1", "true", "yes")
        limite_str = request.query_params.get("limite", "20")

        if not q:
            return Response(
                {"detail": "Parámetro 'q' es requerido."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            limite = int(limite_str)
        except ValueError:
            limite = 20

        if limite <= 0:
            limite = 20

        if limite > 100:
            limite = 100

        qs = self.get_queryset().prefetch_related("lotes")

        if solo_activos:
            qs = qs.filter(activo=True)

        qs = qs.filter(
            Q(codigo__iexact=q) |
            Q(codigo__icontains=q) |
            Q(nombre__icontains=q)
        ).order_by("nombre")

        results_qs = qs[:limite]
        data = ProductoPOSSerializer(results_qs, many=True).data

        return Response(
            {"count": qs.count(), "limite": limite, "results": data},
            status=status.HTTP_200_OK
        )


class LoteViewSet(viewsets.ModelViewSet):
    queryset = Lote.objects.all().order_by("id")
    serializer_class = LoteSerializer
    permission_classes = [IsConsultaReadOnly]
