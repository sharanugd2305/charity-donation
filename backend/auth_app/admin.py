from django.contrib import admin
from django.contrib.auth.models import User
from .models import UserActivity

from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

# Unregister the default User admin
admin.site.unregister(User)

# Register your models here.

class UserActivityAdmin(admin.ModelAdmin):
    list_display = ('get_username', 'activity_type', 'timestamp', 'ip_address')
    list_filter = ('activity_type', 'timestamp', 'user')
    search_fields = ('user__username', 'user__email', 'activity_type', 'details')
    readonly_fields = ('user', 'activity_type', 'timestamp', 'ip_address', 'user_agent', 'details')
    ordering = ('-timestamp',)

    def get_username(self, obj):
        return obj.user.username if obj.user else "Unknown User"
    get_username.short_description = 'Username'

    def has_add_permission(self, request):
        return False  # Prevent manual creation of activity logs

    def has_delete_permission(self, request, obj=None):
        return False  # Prevent deletion of activity logs

# Inherit from BaseUserAdmin to get password hashing and other security features for free
class CustomUserAdmin(BaseUserAdmin):
    list_display = ('id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'date_joined', 'last_login')
    ordering = ('-date_joined',)

admin.site.register(User, CustomUserAdmin)
admin.site.register(UserActivity, UserActivityAdmin)
