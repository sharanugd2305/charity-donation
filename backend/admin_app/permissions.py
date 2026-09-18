"""
Custom permissions for admin backend
"""
from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Permission check for admin users
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has AdminUser profile
        if hasattr(request.user, 'admin_profile'):
            return request.user.admin_profile.is_active
        return False

class IsSuperAdmin(permissions.BasePermission):
    """
    Permission check for super admin users only
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if hasattr(request.user, 'admin_profile'):
            return request.user.admin_profile.role == 'super_admin' and request.user.admin_profile.is_active
        return False

class IsAdminOrModerator(permissions.BasePermission):
    """
    Permission check for admin or moderator users
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if hasattr(request.user, 'admin_profile'):
            role = request.user.admin_profile.role
            return role in ['super_admin', 'admin', 'moderator'] and request.user.admin_profile.is_active
        return False


