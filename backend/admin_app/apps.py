from django.apps import AppConfig


class AdminAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'admin_app'
    
    def ready(self):
        # Customize admin site when app is ready
        from django.contrib import admin
        admin.site.site_header = "Charity Donation Admin Panel"
        admin.site.site_title = "Admin Panel"
        admin.site.index_title = "Welcome to Charity Donation Administration"