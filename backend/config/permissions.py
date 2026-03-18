from rest_framework.permissions import BasePermission, SAFE_METHODS

def in_group(user, name: str) -> bool:
    return user.is_authenticated and user.groups.filter(name=name).exists()

class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_superuser or in_group(request.user, "ADMIN")

class IsFarmaciaRole(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_superuser
            or in_group(request.user, "ADMIN")
            or in_group(request.user, "FARMACIA")
        )

class IsConsultaReadOnly(BasePermission):
    """
    CONSULTA: solo lectura
    FARMACIA / ADMIN: lectura y escritura
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return (
                request.user.is_superuser
                or in_group(request.user, "ADMIN")
                or in_group(request.user, "FARMACIA")
                or in_group(request.user, "CONSULTA")
            )

        return (
            request.user.is_superuser
            or in_group(request.user, "ADMIN")
            or in_group(request.user, "FARMACIA")
        )
