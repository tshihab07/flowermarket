from django.contrib import admin
from .models import SiteSettings, Product, Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'price', 'get_subtotal')
    fields = ('product', 'quantity', 'price', 'get_subtotal')

    def get_subtotal(self, obj):
        return f'৳{obj.get_subtotal():,.2f}'
    get_subtotal.short_description = 'Subtotal'


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ('site_name', 'phone', 'email', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Basic Info', {
            'fields': ('site_name', 'logo')
        }),
        ('Hero Section', {
            'fields': ('hero_title', 'hero_subtitle', 'hero_image')
        }),
        ('Social Links', {
            'fields': ('facebook', 'instagram', 'twitter', 'pinterest')
        }),
        ('Contact Info', {
            'fields': ('phone', 'email', 'address')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'in_stock', 'created_at')
    list_filter = ('category', 'in_stock', 'created_at')
    search_fields = ('name', 'category', 'description')
    list_editable = ('in_stock',)
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'category', 'price', 'image')
        }),
        ('Details', {
            'fields': ('description', 'meaning', 'color', 'in_stock')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer_name', 'phone', 'total', 'status', 'payment_status', 'created_at')
    list_filter = ('status', 'payment_status', 'created_at')
    search_fields = ('customer_name', 'phone', 'id')
    readonly_fields = ('created_at', 'updated_at', 'total')
    inlines = [OrderItemInline]
    fieldsets = (
        ('Customer Info', {
            'fields': ('customer_name', 'phone', 'address')
        }),
        ('Order Details', {
            'fields': ('delivery_option', 'delivery_note', 'payment_method', 'payment_status', 'status', 'total')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'quantity', 'price', 'get_subtotal')
    readonly_fields = ('created_at', 'updated_at')

    def get_subtotal(self, obj):
        return f'৳{obj.get_subtotal():,.2f}'
    get_subtotal.short_description = 'Subtotal'