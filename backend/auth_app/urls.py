from django.urls import path
from . import views

urlpatterns = [
    path('auth/signup/', views.SignupView.as_view(), name='signup'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('dashboard/', views.user_dashboard, name='user_dashboard'),
    path('donations/', views.DonationView.as_view(), name='donations'),
    path('impact/', views.ImpactView.as_view(), name='impact'),
    path('user/profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('ngos/', views.NGOListView.as_view(), name='ngos'),
    path('admin/stats/', views.AdminDashboardStatsView.as_view(), name='admin_stats'),
    path('admin/users/', views.AdminUsersView.as_view(), name='admin_users'),
    # path('admin/donations/', views.AdminDonationsView.as_view(), name='admin_donations'),
    path('admin/activities/', views.AdminActivitiesView.as_view(), name='admin_activities'),
    path('admin/analytics/', views.AdminAnalyticsView.as_view(), name='admin_analytics'),
]
