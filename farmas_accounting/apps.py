from django.apps import AppConfig


class FarmasAccountingConfig(AppConfig):
    name = 'farmas_accounting'
    verbose_name = "Contabilidad"

    def ready(self):
        from . import signals