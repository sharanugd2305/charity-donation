from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.AdminLoginView.as_view(), name='admin_login'),
    path('dashboard/stats/', views.AdminDashboardStatsView.as_view(), name='admin_dashboard_stats'),
    path('ngos/', views.NGOListView.as_view(), name='admin_ngos'),
    path('ngos/<int:pk>/', views.NGODetailView.as_view(), name='admin_ngo_detail'),
    path('ngos/<int:pk>/approval/', views.NGOApprovalView.as_view(), name='admin_ngo_approval'),
    path('login-history/', views.UserLoginHistoryView.as_view(), name='admin_login_history'),
    path('donations/', views.DonationManagementView.as_view(), name='admin_donations'),
    path('donations/<int:pk>/', views.DonationManagementView.as_view(), name='admin_donation_detail'),
    path('feedback/', views.FeedbackView.as_view(), name='admin_feedback'),
    path('contact/', views.ContactView.as_view(), name='admin_contact'),
]


