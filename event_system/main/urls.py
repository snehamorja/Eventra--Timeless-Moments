from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import *
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    # Auth
    path('register/', csrf_exempt(RegisterView.as_view()), name='register'),
    path('login/', csrf_exempt(CustomTokenObtainPairView.as_view()), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', csrf_exempt(ChangePasswordView.as_view()), name='change-password'),
    path('token/refresh/', csrf_exempt(TokenRefreshView.as_view()), name='token_refresh'),
    path('users/', UserListView.as_view(), name='user-list'),

    # Weddings / Custom Inquiries
    path('bookings/', BookingListView.as_view(), name='booking-list'),
    path('bookings/<int:pk>/', csrf_exempt(BookingDeleteView.as_view()), name='booking-delete'),
    path('custom-inquiry/', csrf_exempt(CustomInquiryView.as_view()), name='custom-inquiry'),
    path('event-inquiries/', csrf_exempt(EventInquiryCreateView.as_view()), name='event-inquiry-create'),
    path('event-inquiries/list/', EventInquiryListView.as_view(), name='event-inquiry-list'),
    path('event-inquiries/<int:pk>/', csrf_exempt(EventInquiryDetailView.as_view()), name='event-inquiry-detail'),

    # Admin Actions
    path('admin/bookings/<int:pk>/status/', csrf_exempt(BookingStatusUpdateView.as_view()), name='booking-status'),
    path('admin/restore/<int:pk>/', csrf_exempt(RestoreItemView.as_view()), name='restore-item'),

    # Careers
    path('careers/apply/', csrf_exempt(JobApplicationCreateView.as_view()), name='career-apply'),
    path('careers/applications/', JobApplicationListView.as_view(), name='career-list'),
    path('careers/applications/<int:pk>/', csrf_exempt(JobApplicationDetailView.as_view()), name='career-detail'),

    # Blogs
    path('blogs/', csrf_exempt(BlogListCreateView.as_view()), name='blog-list'),
    path('blogs/<int:pk>/', csrf_exempt(BlogDetailView.as_view()), name='blog-detail'),

    # Gallery
    path('gallery/', csrf_exempt(GalleryListCreateView.as_view()), name='gallery-list'),
    path('gallery/<int:pk>/', csrf_exempt(GalleryDetailView.as_view()), name='gallery-detail'),

    # Decorations
    path('decorations/', csrf_exempt(DecorationListCreateView.as_view()), name='decoration-list'),
    path('decorations/<int:pk>/', csrf_exempt(DecorationDetailView.as_view()), name='decoration-detail'),

    # Catering
    path('catering/', csrf_exempt(CateringListCreateView.as_view()), name='catering-list'),
    path('catering/<int:pk>/', csrf_exempt(CateringDetailView.as_view()), name='catering-detail'),

    # Performers
    path('performers/', csrf_exempt(PerformerListCreateView.as_view()), name='performer-list'),
    path('performers/<int:pk>/', csrf_exempt(PerformerDetailView.as_view()), name='performer-detail'),

    # Concerts
    path('concerts/', csrf_exempt(ConcertListCreateView.as_view()), name='concert-list'),
    path('concerts/<int:pk>/', csrf_exempt(ConcertDetailView.as_view()), name='concert-detail'),
    path('concert-bookings/', csrf_exempt(ConcertBookingCreateView.as_view()), name='concert-booking-create'),
    path('concert-bookings/list/', ConcertBookingListView.as_view(), name='concert-booking-list'),
    path('concert-bookings/<int:pk>/', csrf_exempt(ConcertBookingDetailView.as_view()), name='concert-booking-detail'),

    # Festivals
    path('festivals/', csrf_exempt(FestivalListCreateView.as_view()), name='festival-list'),
    path('festivals/<int:pk>/', csrf_exempt(FestivalDetailView.as_view()), name='festival-detail'),
    path('festival-bookings/', csrf_exempt(FestivalBookingCreateView.as_view()), name='festival-booking-create'),
    path('festival-bookings/list/', FestivalBookingListView.as_view(), name='festival-booking-list'),
    path('festival-bookings/<int:pk>/', csrf_exempt(FestivalBookingDetailView.as_view()), name='festival-booking-detail'),

    # Sports
    path('tournaments/', csrf_exempt(TournamentListCreateView.as_view()), name='tournament-list'),
    path('tournaments/<int:pk>/', csrf_exempt(TournamentDetailView.as_view()), name='tournament-detail'),
    path('sports-registrations/', csrf_exempt(SportsRegistrationListCreateView.as_view()), name='sports-reg-list'),
    path('sports-registrations/<int:pk>/', csrf_exempt(SportsRegistrationDetailView.as_view()), name='sports-reg-detail'),
    path('fixtures/', csrf_exempt(FixtureListCreateView.as_view()), name='fixture-list'),
    path('fixtures/<int:pk>/', csrf_exempt(FixtureDetailView.as_view()), name='fixture-detail'),

    # Wedding Events (Ceremony Types)
    path('wedding-events/', csrf_exempt(WeddingEventListCreateView.as_view()), name='wedding-event-list'),
    path('wedding-events/<int:pk>/', csrf_exempt(WeddingEventDetailView.as_view()), name='wedding-event-detail'),
]
