from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.db.models import Sum, Count, Q
from django.core.paginator import Paginator
from django.utils import timezone
from django.http import JsonResponse
from datetime import date
from .models import SiteSettings, Product, Order, OrderItem
from .forms import ProductForm, SiteSettingsForm


def home(request):
    """Frontend home page"""
    return render(request, 'frontend/index.html')


def api_products(request):
    """API endpoint to fetch products for frontend"""
    products = Product.objects.filter(in_stock=True).order_by('-created_at')
    
    category = request.GET.get('category')
    if category:
        products = products.filter(category=category)
    
    search = request.GET.get('search')
    if search:
        products = products.filter(
            Q(name__icontains=search) | 
            Q(category__icontains=search) |
            Q(meaning__icontains=search)
        )
    
    data = []
    for product in products:
        data.append({
            'id': product.id,
            'name': product.name,
            'category': product.category,
            'price': float(product.price),
            'image': product.image.url if product.image else '',
            'desc': product.description,
            'meaning': product.meaning or '',
            'care': '',  # Not in model, but keep for compatibility
            'color': product.color or '',
            'in_stock': product.in_stock,
        })
    
    return JsonResponse({'products': data})


def staff_required(view_func):
    return login_required(user_passes_test(lambda u: u.is_staff)(view_func))


def admin_login(request):
    if request.user.is_authenticated and request.user.is_staff:
        return redirect('app:admin_dashboard')

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None and user.is_staff:
            login(request, user)
            return redirect('app:admin_dashboard')
        else:
            messages.error(request, 'Invalid credentials or not authorized.')

    site_settings = SiteSettings.load()
    return render(request, 'admin/login.html', {'site_settings': site_settings})


@staff_required
def admin_logout(request):
    logout(request)
    return redirect('app:admin_login')


@staff_required
def admin_dashboard(request):
    site_settings = SiteSettings.load()
    today = date.today()

    total_customers = Order.objects.values('phone').distinct().count()
    total_orders = Order.objects.count()
    total_sell = OrderItem.objects.aggregate(total=Sum('quantity'))['total'] or 0
    total_earning = Order.objects.aggregate(total=Sum('total'))['total'] or 0
    collected_paid = Order.objects.filter(payment_status='paid').aggregate(total=Sum('total'))['total'] or 0

    recent_orders = Order.objects.select_related().order_by('-created_at')[:5]

    context = {
        'site_settings': site_settings,
        'today': today,
        'total_customers': total_customers,
        'total_orders': total_orders,
        'total_sell': total_sell,
        'total_earning': total_earning,
        'collected_paid': collected_paid,
        'recent_orders': recent_orders,
    }
    return render(request, 'admin/dashboard.html', context)


@staff_required
def admin_settings(request):
    site_settings = SiteSettings.load()

    if request.method == 'POST':
        form = SiteSettingsForm(request.POST, request.FILES, instance=site_settings)
        if form.is_valid():
            form.save()
            messages.success(request, 'Settings updated successfully.')
            return redirect('app:admin_settings')
    else:
        form = SiteSettingsForm(instance=site_settings)

    context = {
        'site_settings': site_settings,
        'form': form,
    }
    return render(request, 'admin/settings.html', context)


@staff_required
def admin_products_add(request):
    site_settings = SiteSettings.load()

    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            messages.success(request, 'Product added successfully.')
            return redirect('app:admin_products')
    else:
        form = ProductForm()

    context = {
        'site_settings': site_settings,
        'form': form,
        'action': 'Add',
    }
    return render(request, 'admin/product_form.html', context)


@staff_required
def admin_products(request):
    site_settings = SiteSettings.load()

    products = Product.objects.all()

    search = request.GET.get('search', '')
    if search:
        products = products.filter(Q(name__icontains=search) | Q(category__icontains=search))

    category = request.GET.get('category', '')
    if category:
        products = products.filter(category=category)

    categories = Product.objects.values_list('category', flat=True).distinct()

    paginator = Paginator(products, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'site_settings': site_settings,
        'page_obj': page_obj,
        'search': search,
        'category': category,
        'categories': categories,
    }
    return render(request, 'admin/products.html', context)


@staff_required
def admin_product_edit(request, pk):
    site_settings = SiteSettings.load()
    product = get_object_or_404(Product, pk=pk)

    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES, instance=product)
        if form.is_valid():
            form.save()
            messages.success(request, 'Product updated successfully.')
            return redirect('app:admin_products')
    else:
        form = ProductForm(instance=product)

    context = {
        'site_settings': site_settings,
        'form': form,
        'product': product,
        'action': 'Edit',
    }
    return render(request, 'admin/product_form.html', context)


@staff_required
def admin_product_delete(request, pk):
    site_settings = SiteSettings.load()
    product = get_object_or_404(Product, pk=pk)

    if request.method == 'POST':
        product.delete()
        messages.success(request, 'Product deleted successfully.')
        return redirect('app:admin_products')

    context = {
        'site_settings': site_settings,
        'product': product,
    }
    return render(request, 'admin/product_confirm_delete.html', context)


@staff_required
def admin_orders(request):
    site_settings = SiteSettings.load()

    orders = Order.objects.all()

    status_filter = request.GET.get('status', '')
    if status_filter:
        orders = orders.filter(status=status_filter)

    paginator = Paginator(orders, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    status_choices = Order.STATUS_CHOICES

    context = {
        'site_settings': site_settings,
        'page_obj': page_obj,
        'status_filter': status_filter,
        'status_choices': status_choices,
    }
    return render(request, 'admin/orders.html', context)


@staff_required
def admin_order_detail(request, pk):
    site_settings = SiteSettings.load()
    order = get_object_or_404(Order.objects.prefetch_related('items__product'), pk=pk)

    if request.method == 'POST':
        order.status = request.POST.get('status', order.status)
        order.payment_status = request.POST.get('payment_status', order.payment_status)
        order.save()
        messages.success(request, 'Order updated successfully.')
        return redirect('app:admin_order_detail', pk=order.pk)

    context = {
        'site_settings': site_settings,
        'order': order,
        'status_choices': Order.STATUS_CHOICES,
        'payment_status_choices': Order.PAYMENT_STATUS_CHOICES,
    }
    return render(request, 'admin/order_detail.html', context)


@staff_required
def admin_customers(request):
    site_settings = SiteSettings.load()

    customer_data = []
    phones = Order.objects.values_list('phone', flat=True).distinct()
    for phone in phones:
        orders = Order.objects.filter(phone=phone).order_by('-created_at')
        latest_order = orders.first()
        customer_data.append({
            'name': latest_order.customer_name,
            'phone': phone,
            'latest_address': latest_order.address,
            'order_count': orders.count(),
            'total_spent': orders.aggregate(total=Sum('total'))['total'] or 0,
        })

    # Sort by latest order date
    customer_data.sort(key=lambda x: Order.objects.filter(phone=x['phone']).order_by('-created_at').first().created_at, reverse=True)

    paginator = Paginator(customer_data, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'site_settings': site_settings,
        'page_obj': page_obj,
    }
    return render(request, 'admin/customers.html', context)


@staff_required
def admin_customer_orders(request, phone):
    site_settings = SiteSettings.load()

    orders = Order.objects.filter(phone=phone).order_by('-created_at')

    context = {
        'site_settings': site_settings,
        'orders': orders,
        'phone': phone,
    }
    return render(request, 'admin/customer_orders.html', context)


@staff_required
def admin_payments(request):
    site_settings = SiteSettings.load()

    orders = Order.objects.all()

    status_filter = request.GET.get('payment_status', '')
    if status_filter:
        orders = orders.filter(payment_status=status_filter)

    paginator = Paginator(orders, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    collected = Order.objects.filter(payment_status='paid').aggregate(total=Sum('total'))['total'] or 0
    due = Order.objects.filter(payment_status='pending').aggregate(total=Sum('total'))['total'] or 0

    context = {
        'site_settings': site_settings,
        'page_obj': page_obj,
        'status_filter': status_filter,
        'collected': collected,
        'due': due,
    }
    return render(request, 'admin/payments.html', context)


@staff_required
def admin_payment_update(request, pk):
    if request.method == 'POST':
        order = get_object_or_404(Order, pk=pk)
        order.payment_status = request.POST.get('payment_status')
        order.save()
        messages.success(request, 'Payment status updated.')
    return redirect('app:admin_payments')