from django.contrib import admin

from django.contrib import admin
from .models import Cliente, Venta, DetalleVenta

admin.site.register(Cliente)
admin.site.register(Venta)
admin.site.register(DetalleVenta)