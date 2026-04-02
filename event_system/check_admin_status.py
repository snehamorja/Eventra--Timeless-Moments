import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'event_system.settings')
django.setup()
from main.models import User
try:
    u = User.objects.get(username='admin_master')
    print(f"User: {u.username}")
    print(f"Attempts: {u.login_attempts}")
    print(f"Blocked until: {u.block_until}")
    print(f"Is staff: {u.is_staff}")
    print(f"Is superuser: {u.is_superuser}")
    print(f"Is active: {u.is_active}")
except Exception as e:
    print(f"Error: {e}")
