#!/usr/bin/env python
"""
Seed script to create:
1. Superuser (credentials from .env)
2. Staff user (credentials from .env, bcrypt hashed)
3. SiteSettings singleton with site_name = "XYZ Flower Market"
4. Default products with images from static/images
"""

import os
import sys
import django
import shutil

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.conf import settings
from app.models import SiteSettings, Product
from config.settings import (
    SUPERUSER_USERNAME, SUPERUSER_EMAIL, SUPERUSER_PASSWORD,
    STAFF_USERNAME, STAFF_PASSWORD, STAFF_EMAIL
)

User = get_user_model()


def create_superuser():
    """Create superuser with credentials from .env"""
    username = SUPERUSER_USERNAME
    email = SUPERUSER_EMAIL
    password = SUPERUSER_PASSWORD

    if User.objects.filter(username=username).exists():
        print(f"Superuser '{username}' already exists.")
        user = User.objects.get(username=username)
        user.set_password(password)
        user.is_superuser = True
        user.is_staff = True
        user.is_active = True
        user.save()
        print(f"Updated superuser '{username}'.")
    else:
        user = User.objects.create_superuser(username, email, password)
        print(f"Created superuser '{username}'.")
    return user


def create_staff_user():
    """Create staff user with bcrypt password from .env"""
    username = STAFF_USERNAME
    email = STAFF_EMAIL
    password = STAFF_PASSWORD

    if User.objects.filter(username=username).exists():
        print(f"Staff user '{username}' already exists.")
        user = User.objects.get(username=username)
        user.set_password(password)
        user.is_staff = True
        user.is_active = True
        user.is_superuser = False
        user.save()
        print(f"Updated staff user '{username}'.")
    else:
        hashed_password = make_password(password, hasher='bcrypt_sha256')
        user = User.objects.create(
            username=username,
            email=email,
            password=hashed_password,
            is_staff=True,
            is_active=True,
            is_superuser=False
        )
        print(f"Created staff user '{username}' with bcrypt password.")
    return user


def create_site_settings():
    """Create or update SiteSettings singleton"""
    site_settings, created = SiteSettings.objects.get_or_create(
        pk=1,
        defaults={
            'site_name': 'XYZ Flower Market',
            'hero_title': 'Discover the Beauty of Nature\'s Finest Flowers',
            'hero_subtitle': 'Explore detailed flower information, care tips, symbolic meanings, and varieties to bring nature closer to your life.',
            'phone': '+880 1234 567890',
            'email': 'info@xyzflowermarket.com',
            'address': '123 Garden Street, Floral City, Bangladesh',
            'facebook': 'https://facebook.com/xyzflowermarket',
            'instagram': 'https://instagram.com/xyzflowermarket',
            'twitter': 'https://twitter.com/xyzflowermarket',
            'pinterest': 'https://pinterest.com/xyzflowermarket',
        }
    )

    if created:
        print("Created SiteSettings with default values.")
    else:
        if not site_settings.site_name:
            site_settings.site_name = 'XYZ Flower Market'
            site_settings.save()
            print("Updated SiteSettings site_name.")
        else:
            print(f"SiteSettings already exists: {site_settings.site_name}")

    return site_settings


def create_default_products():
    """Create default products with images from static/images"""
    static_images_dir = settings.BASE_DIR / 'static' / 'images'
    media_products_dir = settings.MEDIA_ROOT / 'products'
    media_products_dir.mkdir(parents=True, exist_ok=True)

    default_products = [
        {
            'name': 'Red Rose',
            'category': 'Rose',
            'price': 29.99,
            'image_file': 'red-rose.jpeg',
            'description': 'Classic red roses symbolizing love and passion. Perfect for romantic occasions.',
            'meaning': 'Love, passion, romance',
            'color': 'Red',
        },
        {
            'name': 'Pink Rose',
            'category': 'Rose',
            'price': 27.99,
            'image_file': 'pink-rose.jpeg',
            'description': 'Elegant pink roses representing grace and admiration. Ideal for expressing gratitude.',
            'meaning': 'Grace, admiration, gratitude',
            'color': 'Pink',
        },
        {
            'name': 'Red Tulip',
            'category': 'Tulip',
            'price': 24.99,
            'image_file': 'red-tulip.jpeg',
            'description': 'Vibrant red tulips declaring perfect love. A spring favorite.',
            'meaning': 'Perfect love, declaration of love',
            'color': 'Red',
        },
        {
            'name': 'Yellow Tulip',
            'category': 'Tulip',
            'price': 22.99,
            'image_file': 'yellow-tulip.jpeg',
            'description': 'Cheerful yellow tulips bringing sunshine and happiness.',
            'meaning': 'Cheerfulness, hope, friendship',
            'color': 'Yellow',
        },
        {
            'name': 'Purple Orchid',
            'category': 'Orchid',
            'price': 49.99,
            'image_file': 'purple-orchid.jpeg',
            'description': 'Exotic purple orchids symbolizing luxury and beauty. Long-lasting blooms.',
            'meaning': 'Luxury, beauty, strength',
            'color': 'Purple',
        },
        {
            'name': 'White Orchid',
            'category': 'Orchid',
            'price': 47.99,
            'image_file': 'white-orchid.png',
            'description': 'Pure white orchids representing elegance and innocence.',
            'meaning': 'Elegance, innocence, purity',
            'color': 'White',
        },
        {
            'name': 'Stargazer Lily',
            'category': 'Lily',
            'price': 34.99,
            'image_file': 'stargazer-lily.jpeg',
            'description': 'Fragrant stargazer lilies with stunning pink and white petals.',
            'meaning': 'Ambition, prosperity, sympathy',
            'color': 'Pink/White',
        },
        {
            'name': 'White Lily',
            'category': 'Lily',
            'price': 32.99,
            'image_file': 'white-lily.jpeg',
            'description': 'Classic white lilies symbolizing purity and refined beauty.',
            'meaning': 'Purity, virtue, sympathy',
            'color': 'White',
        },
        {
            'name': 'Sunflower',
            'category': 'Sunflower',
            'price': 19.99,
            'image_file': 'sunflower.jpeg',
            'description': 'Bright sunflowers bringing warmth and positivity to any space.',
            'meaning': 'Adoration, loyalty, longevity',
            'color': 'Yellow',
        },
        {
            'name': 'Autumn Sunflower',
            'category': 'Sunflower',
            'price': 21.99,
            'image_file': 'autumn-sunflower.jpeg',
            'description': 'Rich autumn-toned sunflowers perfect for fall arrangements.',
            'meaning': 'Warmth, harvest, gratitude',
            'color': 'Orange/Yellow',
        },
    ]

    created_count = 0
    for product_data in default_products:
        image_file = product_data.pop('image_file')
        src_path = static_images_dir / image_file
        dst_path = media_products_dir / image_file

        if not src_path.exists():
            print(f"Warning: Source image not found: {src_path}")
            continue

        if not dst_path.exists():
            shutil.copy2(src_path, dst_path)
            print(f"Copied {image_file} to media/products/")

        if Product.objects.filter(name=product_data['name']).exists():
            print(f"Product '{product_data['name']}' already exists, skipping.")
            continue

        product = Product.objects.create(
            image=f'products/{image_file}',
            **product_data
        )
        created_count += 1
        print(f"Created product: {product.name}")

    if created_count > 0:
        print(f"Created {created_count} default products.")
    else:
        print("No new products created (all already exist).")


def main():
    print("=" * 50)
    print("Seeding Database...")
    print("=" * 50)

    create_superuser()
    print()
    create_staff_user()
    print()
    create_site_settings()
    print()
    create_default_products()
    print()
    print("=" * 50)
    print("Seeding completed successfully!")
    print("=" * 50)
    print()
    print("Login credentials (from .env):")
    print(f"  Superuser: {SUPERUSER_USERNAME} / {SUPERUSER_PASSWORD}")
    print(f"  Staff:     {STAFF_USERNAME} / {STAFF_PASSWORD}")
    print("  Admin panel: http://localhost:8000/admin/")
    print("  Django admin: http://localhost:8000/django-admin/")


if __name__ == '__main__':
    main()