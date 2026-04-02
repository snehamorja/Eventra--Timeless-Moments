from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, JobApplication, Blog, Gallery, Booking, Decoration, EventInquiry, Catering, Performer

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('username', 'email', 'phone', 'role', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Info', {'fields': ('role', 'phone')}),
    )

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'user', 'position', 'status', 'applied_at')
    list_filter = ('status', 'position')
    search_fields = ('full_name', 'email')

@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'is_published', 'date')
    list_filter = ('is_published', 'author', 'date')
    search_fields = ('title', 'content')

@admin.register(Gallery)
class GalleryAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'is_published', 'created_at')
    list_filter = ('category', 'is_published', 'created_at')
    search_fields = ('title', 'description')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'event_type', 'event_date', 'status', 'payment_status')
    list_filter = ('status', 'payment_status', 'event_date')
    search_fields = ('user__username', 'event_type')

@admin.register(Decoration)
class DecorationAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price')
    list_filter = ('category',)
    search_fields = ('name',)

@admin.register(EventInquiry)
class EventInquiryAdmin(admin.ModelAdmin):
    list_display = ('contact_name', 'event_type', 'event_date', 'status')
    list_filter = ('event_type', 'status', 'event_date')
    search_fields = ('contact_name', 'contact_email', 'planner_name')

@admin.register(Catering)
class CateringAdmin(admin.ModelAdmin):
    list_display = ('name', 'price_per_plate')
    search_fields = ('name',)

@admin.register(Performer)
class PerformerAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price')
    list_filter = ('category',)
    search_fields = ('name',)

