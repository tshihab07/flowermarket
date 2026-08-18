from django.urls import path
from . import views

app_name = 'app'

urlpatterns = [
    path('', views.home, name='home'),
    path('api/products/', views.api_products, name='api_products'),
    path('login/', views.admin_login, name='admin_login'),
    path('logout/', views.admin_logout, name='admin_logout'),
    path('dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('settings/', views.admin_settings, name='admin_settings'),
    path('products/add/', views.admin_products_add, name='admin_products_add'),
    path('products/', views.admin_products, name='admin_products'),
    path('products/<int:pk>/edit/', views.admin_product_edit, name='admin_product_edit'),
    path('products/<int:pk>/delete/', views.admin_product_delete, name='admin_product_delete'),
    path('orders/', views.admin_orders, name='admin_orders'),
    path('orders/<int:pk>/', views.admin_order_detail, name='admin_order_detail'),
    path('customers/', views.admin_customers, name='admin_customers'),
    path('customers/<str:phone>/', views.admin_customer_orders, name='admin_customer_orders'),
    path('payments/', views.admin_payments, name='admin_payments'),
    path('payments/<int:pk>/update/', views.admin_payment_update, name='admin_payment_update'),
]