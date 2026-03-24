from django.contrib import admin
from .models import Categoria, UnidadMedida, Producto, Lote

from django.contrib import admin
from .models import Categoria, UnidadMedida, Producto, Lote

admin.site.register(Categoria)
admin.site.register(UnidadMedida)
admin.site.register(Producto)
admin.site.register(Lote)