from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import AdminUser, NGOOrganization, NGOCampaign, UserLoginHistory
from auth_app.models import Donation, UserProfile
from .models import Feedback, Contact
@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ['user', 'ngo_name', 'campaign_name', 'donation_type', 'amount', 'status', 'created_at']
    search_fields = ['user__username', 'ngo_name', 'campaign_name', 'transaction_id']
    list_filter = ['donation_type', 'status', 'ngo_name', 'campaign_name']

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'address', 'created_at']
    search_fields = ['user__username', 'phone', 'address']

# Customize admin site header and title
admin.site.site_header = "Charity Donation Admin Panel"
admin.site.site_title = "Admin Panel"
admin.site.index_title = "Welcome to Charity Donation Administration"

@admin.register(AdminUser)
class AdminUserAdmin(admin.ModelAdmin):
    list_display = ['get_username', 'role', 'is_active', 'created_at', 'get_created_by']
    list_filter = ['role', 'is_active', 'created_at']
    search_fields = [] # Cannot search cross-db relation 'user__username'
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'role', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_username(self, obj):
        # Manual lookup to avoid cross-db join error
        try:
            # We import User inside to avoid circular imports or early loading issues if any
            from django.contrib.auth.models import User
            user = User.objects.using('default').get(id=obj.user_id)
            return user.username
        except Exception:
            return f"User ID {obj.user_id} (Not Found)"
    get_username.short_description = 'Username'
    
    def get_created_by(self, obj):
        if obj.created_by_id:
            try:
                from django.contrib.auth.models import User
                user = User.objects.using('default').get(id=obj.created_by_id)
                return user.username
            except Exception:
                return f"User {obj.created_by_id}"
        return '-'
    get_created_by.short_description = 'Created By'
    
    def save_model(self, request, obj, form, change):
        if not change:  # If creating new object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(NGOOrganization)
class NGOOrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'status_badge', 'location', 'is_active', 'registration_date', 'approved_by', 'campaigns_count']
    list_filter = ['status', 'is_active', 'registration_date', 'founded']
    search_fields = ['name', 'description', 'location', 'contact_email', 'contact_phone']
    readonly_fields = ['registration_date', 'approved_date', 'created_at', 'updated_at', 'approved_by']
    list_editable = ['is_active']
    date_hierarchy = 'registration_date'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'location', 'founded')
        }),
        ('Contact Information', {
            'fields': ('contact_email', 'contact_phone', 'website')
        }),
        ('Additional Details', {
            'fields': ('impact', 'image_url')
        }),
        ('Status & Approval', {
            'fields': ('status', 'is_active', 'rejection_reason', 'approved_by', 'approved_date')
        }),
        ('Metadata', {
            'fields': ('registration_date', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def status_badge(self, obj):
        colors = {
            'pending': 'orange',
            'approved': 'green',
            'rejected': 'red',
            'suspended': 'gray'
        }
        color = colors.get(obj.status, 'blue')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            color, obj.status.upper()
        )
    status_badge.short_description = 'Status'
    
    def campaigns_count(self, obj):
        count = obj.campaigns.count()
        url = reverse('admin:admin_app_ngocampaign_changelist')
        return format_html('<a href="{}?ngo__id__exact={}">{} Campaigns</a>', url, obj.id, count)
    campaigns_count.short_description = 'Campaigns'
    
    def save_model(self, request, obj, form, change):
        if not change and obj.status == 'approved':
            obj.approved_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(NGOCampaign)
class NGOCampaignAdmin(admin.ModelAdmin):
    list_display = ['name', 'ngo', 'target_amount', 'raised_amount', 'progress_bar', 'is_active', 'start_date']
    list_filter = ['is_active', 'start_date', 'ngo']
    search_fields = ['name', 'description', 'ngo__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'start_date'
    
    fieldsets = (
        ('Campaign Information', {
            'fields': ('ngo', 'name', 'description')
        }),
        ('Financial Details', {
            'fields': ('target_amount', 'raised_amount')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def progress_bar(self, obj):
        if obj.target_amount > 0:
            percentage = min(100, (obj.raised_amount / obj.target_amount) * 100)
            percentage_str = "{:.0f}".format(percentage)
            color = 'green' if percentage >= 100 else 'orange' if percentage >= 50 else 'red'
            return format_html(
                '<div style="width: 100px; background-color: #f0f0f0; border-radius: 3px; height: 20px;">'
                '<div style="width: {}%; background-color: {}; height: 100%; border-radius: 3px; text-align: center; color: white; font-size: 10px; line-height: 20px;">{}%</div>'
                '</div>',
                percentage_str, color, percentage_str
            )
        return 'N/A'
    progress_bar.short_description = 'Progress'

@admin.register(UserLoginHistory)
class UserLoginHistoryAdmin(admin.ModelAdmin):
    list_display = ['get_username', 'login_time', 'ip_address', 'logout_time', 'session_duration_display']
    list_filter = ['login_time', 'ip_address']
    search_fields = ['ip_address', 'user_agent'] # Removed user__username
    readonly_fields = ['user', 'login_time', 'logout_time', 'ip_address', 'user_agent', 'session_duration']
    date_hierarchy = 'login_time'
    
    def get_username(self, obj):
        try:
            from django.contrib.auth.models import User
            user = User.objects.using('default').get(id=obj.user_id)
            return user.username
        except Exception:
            return f"User {obj.user_id}"
    get_username.short_description = 'User'
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Login Details', {
            'fields': ('login_time', 'logout_time', 'session_duration')
        }),
        ('Technical Details', {
            'fields': ('ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
    )
    
    def session_duration_display(self, obj):
        if obj.session_duration:
            total_seconds = int(obj.session_duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            if hours > 0:
                return f"{hours}h {minutes}m {seconds}s"
            elif minutes > 0:
                return f"{minutes}m {seconds}s"
            else:
                return f"{seconds}s"
        return 'Active'
    session_duration_display.short_description = 'Duration'
    
    def has_add_permission(self, request):
        return False  # Login history should only be created automatically
    
    def has_change_permission(self, request, obj=None):
        return False  # Login history should not be editable


# Register Feedback and Contact models so admin users can view submissions
@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['user_name', 'user_email', 'rating', 'category', 'is_read', 'created_at']
    search_fields = ['user_name', 'user_email', 'message']
    list_filter = ['category', 'rating', 'is_read', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
    actions = ['mark_as_read', 'mark_as_unread']

    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
    mark_as_read.short_description = 'Mark selected feedbacks as read'

    def mark_as_unread(self, request, queryset):
        queryset.update(is_read=False)
    mark_as_unread.short_description = 'Mark selected feedbacks as unread'


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'is_read', 'responded_at', 'created_at']
    search_fields = ['name', 'email', 'subject', 'message']
    list_filter = ['is_read', 'responded_at', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
    actions = ['mark_contact_read', 'mark_contact_unread']

    def mark_contact_read(self, request, queryset):
        queryset.update(is_read=True)
    mark_contact_read.short_description = 'Mark selected contacts as read'

    def mark_contact_unread(self, request, queryset):
        queryset.update(is_read=False)
    mark_contact_unread.short_description = 'Mark selected contacts as unread'


