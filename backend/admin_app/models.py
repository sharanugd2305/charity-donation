from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Create your models here.

class AdminUser(models.Model):
    """Extended admin user profile with role-based access"""
    ROLE_CHOICES = [
        ('super_admin', 'Super Admin'),
        ('admin', 'Admin'),
        ('moderator', 'Moderator'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile', db_constraint=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='admin')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_admins', db_constraint=False)
    
    def __str__(self):
        try:
            from django.contrib.auth.models import User
            user = User.objects.using('default').get(id=self.user_id)
            username = user.username
        except Exception:
            username = f"User {self.user_id}"
            
        return f"{username} - {self.role}"

class NGOOrganization(models.Model):
    """NGO organization model for registration and management"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('suspended', 'Suspended'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=200)
    founded = models.IntegerField(null=True, blank=True)
    website = models.URLField(blank=True, null=True)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    impact = models.TextField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    registration_date = models.DateTimeField(auto_now_add=True)
    approved_date = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_ngos', db_constraint=False)
    rejection_reason = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'NGO Organization'
        verbose_name_plural = 'NGO Organizations'
    
    def __str__(self):
        return f"{self.name} - {self.status}"

class NGOCampaign(models.Model):
    """Campaign model for NGO organizations"""
    ngo = models.ForeignKey(NGOOrganization, on_delete=models.CASCADE, related_name='campaigns')
    name = models.CharField(max_length=200)
    description = models.TextField()
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    raised_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.ngo.name} - {self.name}"

class UserLoginHistory(models.Model):
    """Track user login history"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_history', db_constraint=False)
    login_time = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    logout_time = models.DateTimeField(null=True, blank=True)
    session_duration = models.DurationField(null=True, blank=True)
    
    class Meta:
        ordering = ['-login_time']
        verbose_name = 'User Login History'
        verbose_name_plural = 'User Login Histories'
    
    def __str__(self):
        try:
            from django.contrib.auth.models import User
            user = User.objects.using('default').get(id=self.user_id)
            username = user.username
        except Exception:
            username = f"User {self.user_id}"
            
        return f"{username} - {self.login_time}"

class DonationRecord(models.Model):
    """Donation records synced from main database"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    
    DONATION_TYPE_CHOICES = [
        ('money', 'Money'),
        ('clothes', 'Clothes'),
        ('food', 'Food'),
    ]
    
    # Reference to main donation (if syncing)
    main_donation_id = models.IntegerField(null=True, blank=True, unique=True)
    user_id = models.IntegerField()
    username = models.CharField(max_length=150)
    user_email = models.EmailField()
    ngo_name = models.CharField(max_length=200)
    campaign_name = models.CharField(max_length=200)
    campaign_id = models.IntegerField()
    ngo_id = models.IntegerField()
    donation_type = models.CharField(max_length=20, choices=DONATION_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    item_type = models.CharField(max_length=200, blank=True, null=True)
    quantity = models.CharField(max_length=100, blank=True, null=True)
    payment_method = models.CharField(max_length=50, default='upi', blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    transaction_id = models.CharField(max_length=100, unique=True)
    donation_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-donation_date']
    
    def __str__(self):
        return f"{self.username} - {self.donation_type} - ₹{self.amount or 'N/A'} - {self.campaign_name}"

class Feedback(models.Model):
    """User feedback model"""
    CATEGORY_CHOICES = [
        ('general', 'General Feedback'),
        ('donation', 'Donation Process'),
        ('ngo', 'NGO Experience'),
        ('website', 'Website Usability'),
        ('support', 'Customer Support'),
        ('other', 'Other'),
    ]
    
    RATING_CHOICES = [
        (1, '1 - Very Poor'),
        (2, '2 - Poor'),
        (3, '3 - Average'),
        (4, '4 - Good'),
        (5, '5 - Excellent'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feedbacks', null=True, blank=True)
    user_email = models.EmailField(null=True, blank=True)
    user_name = models.CharField(max_length=150, null=True, blank=True)
    rating = models.IntegerField(choices=RATING_CHOICES, default=5)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Feedback'
        verbose_name_plural = 'Feedbacks'
    
    def __str__(self):
        name = self.user.username if self.user else (self.user_name or 'Anonymous')
        return f"{name} - {self.category} ({self.rating}★)"

class Contact(models.Model):
    """Contact form submissions model"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contacts', null=True, blank=True)
    name = models.CharField(max_length=150)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    response = models.TextField(blank=True, null=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    responded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='contact_responses')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Contact'
        verbose_name_plural = 'Contacts'
    
    def __str__(self):
        return f"{self.name} - {self.subject}"
