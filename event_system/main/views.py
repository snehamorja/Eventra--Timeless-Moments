import random
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .models import (
    User, JobApplication, Blog, Gallery, Booking, EventInquiry, Decoration, 
    Catering, Performer, Concert, Festival, Tournament, ConcertBooking, 
    FestivalBooking, SportsRegistration, Fixture, WeddingEvent
)
from .serializers import (
    UserSerializer, JobApplicationSerializer, BlogSerializer, GallerySerializer,
    BookingSerializer, EventInquirySerializer, DecorationSerializer,
    CateringSerializer, PerformerSerializer, ConcertSerializer, 
    FestivalSerializer, TournamentSerializer, ConcertBookingSerializer,
    FestivalBookingSerializer, SportsRegistrationSerializer, FixtureSerializer,
    WeddingEventSerializer
)

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        confirm_password = request.data.get('confirm_password')
        
        if password != confirm_password:
            return Response({'error': 'Passwords do not match'}, status=400)
            
        role = request.data.get('role', 'USER').upper()
        if role not in ['USER', 'ADMIN']:
            role = 'USER'

        # Admin creation may be restricted later, but for now allow bypass if they pass ADMIN
        
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=400)
        
        # --- Gmail Validation ---
        if not email or not email.lower().endswith('@gmail.com'):
            return Response({'error': 'Registration requires a @gmail.com address.'}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=400)
            
        phone = request.data.get('phone', '')

        user = User.objects.create_user(
            username=username, 
            email=email, 
            password=password, 
            role=role,
            phone=phone
        )
        if role == 'ADMIN':
            user.is_staff = True
            user.is_superuser = True
            user.save()

        # --- Send Welcome Email to the new user ---
        try:
            send_mail(
                subject='🎉 Welcome to Eventra – Your Account is Ready!',
                message=(
                    f'Hi {username},\n\n'
                    f'Welcome to Eventra – Timeless Moments! 🎊\n\n'
                    f'Your account has been successfully created.\n\n'
                    f'Username: {username}\n'
                    f'Email: {email}\n\n'
                    f'You can now log in and start exploring our wedding packages, careers, and more.\n\n'
                    f'Login here: http://localhost:4000/login\n\n'
                    f'Thank you for joining us!\n'
                    f'– Team Eventra'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=True
            )
        except Exception as e:
            print(f'Registration email failed: {e}')

        return Response({'message': 'User registered successfully'}, status=201)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = attrs.get('username', '').strip()
        password = attrs.get('password')
        
        # Allow login with Username OR Email (Case Insensitive)
        user = User.objects.filter(username__iexact=username).first()
        if not user:
            user = User.objects.filter(email__iexact=username).first()

        # 1. Check if User exists
        if not user:
            raise InvalidToken({
                'detail': 'Username or Email is wrong.',
                'error_type': 'username'
            })

        # 2. Check if currently blocked
        if user.block_until and timezone.now() < user.block_until:
            diff = user.block_until - timezone.now()
            minutes, seconds = divmod(int(diff.total_seconds()), 60)
            raise InvalidToken({
                'detail': f'Account blocked. Try again after {minutes} min {seconds} sec.',
                'blocked': True,
                'seconds_left': int(diff.total_seconds())
            })
        
        # 3. Check password
        if not user.check_password(password):
            user.login_attempts += 1
            if user.login_attempts >= 3:
                user.block_until = timezone.now() + timedelta(minutes=10)
                user.login_attempts = 0 
                user.save()
                raise InvalidToken({
                    'detail': 'Too many failed attempts. Account blocked for 10 minutes.',
                    'blocked': True,
                    'seconds_left': 600
                })
            user.save()
            attempts_left = 3 - user.login_attempts
            raise InvalidToken({
                'detail': f'Password is wrong. {attempts_left} attempts left.',
                'error_type': 'password'
            })

        # 4. Successful login
        data = super().validate(attrs)
        user.login_attempts = 0
        user.block_until = None
        user.save()
        
        # Add user info to response
        data['user'] = {
            'username': user.username,
            'is_superuser': user.is_superuser,
            'role': (getattr(user, 'role', '') or '').upper()
        }
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# --- REST OF VIEWS ---

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('password') # The frontend seems to send 'password'
        confirm_password = request.data.get('confirm_password')

        if not old_password or not new_password:
            return Response({'error': 'Old password and new password are required.'}, status=400)

        if not user.check_password(old_password):
            return Response({'error': 'Incorrect old password.'}, status=400)

        if new_password != confirm_password:
            return Response({'error': 'New passwords do not match.'}, status=400)

        if len(new_password) < 8:
             return Response({'error': 'New password must be at least 8 characters long.'}, status=400)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password changed successfully!'})


class JobApplicationCreateView(generics.CreateAPIView):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class JobApplicationListView(generics.ListAPIView):
    queryset = JobApplication.objects.all().order_by('-applied_at')
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Auto-reject applications older than 7 days (only if still 'Applied')
        cut_off = timezone.now() - timedelta(days=7)
        JobApplication.objects.filter(
            status='Applied',
            applied_at__lt=cut_off
        ).update(status='Auto-Rejected')
        
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        show_deleted = self.request.query_params.get('deleted', '').lower() == 'true'

        if is_admin:
            if show_deleted:
                return JobApplication.objects.filter(is_deleted=True).order_by('-applied_at')
            return JobApplication.objects.filter(is_deleted=False).order_by('-applied_at')
        return JobApplication.objects.none()

class JobApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        if is_admin:
            return JobApplication.objects.all()
        return JobApplication.objects.none()

    def perform_update(self, serializer):
        old_status = self.get_object().status
        instance = serializer.save()
        new_status = instance.status

        # Block hiring an auto-rejected applicant
        if old_status == 'Auto-Rejected' and new_status == 'Hired':
            instance.status = 'Auto-Rejected'
            instance.save()
            return

        # Send email on status change
        if new_status in ('Hired', 'Rejected') and new_status != old_status:
            try:
                if new_status == 'Hired':
                    subject = '🎉 Congratulations! You have been Hired – Eventra'
                    message = (
                        f'Dear {instance.full_name},\n\n'
                        f'We are thrilled to inform you that your application for the position of '
                        f'"{instance.position}" has been ACCEPTED!\n\n'
                        f'Our HR team will reach out to you shortly with further details about '
                        f'your onboarding process.\n\n'
                        f'Welcome to the Eventra family! 🎊\n\n'
                        f'Best Regards,\nEventra – Timeless Moments'
                    )
                else:
                    subject = 'Update on Your Application – Eventra'
                    message = (
                        f'Dear {instance.full_name},\n\n'
                        f'Thank you for applying for the position of "{instance.position}" at Eventra.\n\n'
                        f'After careful consideration, we regret to inform you that we will not '
                        f'be moving forward with your application at this time.\n\n'
                        f'We encourage you to apply again in the future. Thank you for your interest!\n\n'
                        f'Best Regards,\nEventra – Timeless Moments'
                    )
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[instance.email],
                    fail_silently=True
                )
            except Exception as e:
                print(f'Career status email failed: {e}')

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

# --- SIGNALS FOR NOTIFICATIONS ---

@receiver(post_save, sender=JobApplication)
def notify_job_applicant(sender, instance, created, **kwargs):
    if created:
        try:
            subject = f"Application Received: {instance.position}"
            message = f"Dear {instance.full_name},\n\nWe have received your application for the position of {instance.position}.\nOur team will review your portfolio and get back to you shortly.\n\nBest Regards,\nEVENTRA Timeless Moments"
            from_email = settings.EMAIL_HOST_USER if hasattr(settings, 'EMAIL_HOST_USER') else 'snehamorja902@gmail.com'
            send_mail(subject, message, from_email, [instance.email], fail_silently=True)
        except Exception as e:
            print(f"Failed to send career email: {e}")



class BlogListCreateView(generics.ListCreateAPIView):
    serializer_class = BlogSerializer
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        show_deleted = self.request.query_params.get('deleted', '').lower() == 'true'

        if is_admin:
            if show_deleted:
                return Blog.objects.filter(is_deleted=True).order_by('-created_at')
            return Blog.objects.filter(is_deleted=False).order_by('-created_at')
        return Blog.objects.filter(is_published=True, is_deleted=False).order_by('-created_at')

class BlogDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        if is_admin:
            return Blog.objects.all()
        return Blog.objects.filter(is_published=True, is_deleted=False)

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

# --- BOOKING VIEWS ---

class BookingListView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        show_deleted = self.request.query_params.get('deleted', '').lower() == 'true'

        # Auto-reject bookings older than 7 days (only if still 'Pending')
        from django.utils import timezone
        import datetime
        cut_off = timezone.now() - datetime.timedelta(days=7)
        Booking.objects.filter(
            status='Pending',
            booking_date__lt=cut_off
        ).update(status='Rejected')

        if is_admin:
            if show_deleted:
                return Booking.objects.filter(is_deleted=True).order_by('-booking_date')
            return Booking.objects.filter(is_deleted=False).order_by('-booking_date')
        return Booking.objects.filter(user=user, is_deleted=False).order_by('-booking_date')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        # Attach username to each booking
        for item in data:
            try:
                user_obj = User.objects.get(pk=item['user'])
                item['username'] = user_obj.username
                item['user_email'] = user_obj.email
            except Exception:
                item['username'] = 'Unknown'
                item['user_email'] = ''
        return Response(data)

    def perform_create(self, serializer):
        from datetime import date
        import datetime

        # --- Date Validation: must be at least 1 month from today ---
        event_date = serializer.validated_data.get('event_date')
        if event_date:
            today = date.today()
            # Calculate 30 days ahead for reliability
            one_month_later = today + datetime.timedelta(days=30)
            if event_date < one_month_later:
                from rest_framework.exceptions import ValidationError
                raise ValidationError(
                    {'event_date': f'Date {event_date} is too soon. Wedding bookings must be scheduled at least 1 month (30 days) in advance. Earliest available: {one_month_later}'}
                )

            # --- Date Conflict Check: is this date already booked and approved? ---
            conflict = Booking.objects.filter(
                event_date=event_date,
                is_deleted=False,
                status__in=['Pending', 'Approved']
            ).exists()
            if conflict:
                from rest_framework.exceptions import ValidationError
                raise ValidationError(
                    {'event_date': f'Date {event_date} is already booked. Please choose a different date.'}
                )

        booking = serializer.save(user=self.request.user)

        # --- Send Confirmation Email to the User ---
        try:
            user = self.request.user
            wd = booking.wedding_details or {}
            subject = f'💍 Wedding Booking Confirmed – #{booking.id} | Eventra'
            message = (
                f'Dear {user.username},\n\n'
                f'Your wedding booking has been successfully submitted on Eventra! 🎊\n'
                f'{'=' * 55}\n\n'
                f'BOOKING REFERENCE : #{booking.id}\n'
                f'STATUS            : {booking.status}\n\n'
                f'--- YOUR WEDDING DETAILS ---\n'
                f'Bride             : {wd.get("brideName", "N/A")}\n'
                f'Groom             : {wd.get("groomName", "N/A")}\n'
                f'Wedding Date      : {booking.event_date}\n'
                f'Venue             : {wd.get("venueName", "N/A")}\n'
                f'Guests            : {booking.guests}\n\n'
                f'--- SERVICES BOOKED ---\n'
                f'Catering          : {booking.catering_package or "Not selected"} – ₹{booking.catering_price}\n'
                f'Decoration        : {booking.decoration_name or "None"} – ₹{booking.decoration_price}\n'
                f'Performer         : {booking.performer_name or "None"} – ₹{booking.performer_price}\n\n'
                f'--- PAYMENT SUMMARY ---\n'
                f'Grand Total       : ₹{booking.total_cost}\n'
                f'Advance Paid      : ₹{booking.advance_amount}\n'
                f'Balance Due       : ₹{booking.balance_amount} (after event)\n\n'
                f'Our admin will review and approve your booking shortly.\n'
                f'You will receive another email once your booking is approved.\n\n'
                f'Thank you for choosing Eventra – Timeless Moments! 💐\n'
                f'{'=' * 55}'
            )
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True
            )
        except Exception as e:
            print(f'User confirmation email failed: {e}')

        # --- Send Wedding Booking Notification to Admin ---
        try:
            user = self.request.user
            wd = booking.wedding_details or {}
            selected_styles = wd.get('selectedStyles', {})
            decoration_list = ', '.join(
                [v.get('name', '') for v in selected_styles.values()]
            ) if selected_styles else 'None'
            performer = wd.get('performer', {})
            performer_name = (performer or {}).get('name', 'None') if performer else 'None'

            subject = f'💍 New Wedding Booking #{booking.id} – {user.username}'
            message = (
                f'A new wedding booking has been received on Eventra.\n'
                f'{'=' * 55}\n\n'
                f'BOOKING ID      : #{booking.id}\n'
                f'CLIENT          : {user.username}\n'
                f'EMAIL           : {user.email}\n'
                f'PHONE           : {getattr(user, "phone", "N/A") or "N/A"}\n\n'
                f'--- EVENT DETAILS ---\n'
                f'Event Type      : {booking.event_type or "Wedding"}\n'
                f'Event Date      : {booking.event_date}\n'
                f'Guests          : {booking.guests}\n'
                f'Address         : {booking.address or "N/A"}\n\n'
                f'--- WEDDING DETAILS ---\n'
                f'Bride Name      : {wd.get("brideName", "N/A")}\n'
                f'Groom Name      : {wd.get("groomName", "N/A")}\n'
                f'Wedding Date    : {wd.get("weddingDate", str(booking.event_date))}\n'
                f'Venue           : {wd.get("venueName", "N/A")}\n'
                f'Theme           : {wd.get("weddingTheme", "N/A")}\n'
                f'Guest Count     : {wd.get("guestCount", booking.guests)}\n'
                f'Color Prefs     : {wd.get("colorPreferences", "N/A")}\n'
                f'Destination     : {wd.get("isDestinationWedding", "No")}\n'
                f'Cultural Req.   : {wd.get("culturalRequirements", "None")}\n\n'
                f'--- SELECTED SERVICES ---\n'
                f'Catering Plan   : {booking.catering_package or "Not selected"} – ₹{booking.catering_price}\n'
                f'Decoration      : {decoration_list} – ₹{booking.decoration_price}\n'
                f'Performer       : {performer_name} – ₹{booking.performer_price}\n\n'
                f'--- FINANCIALS ---\n'
                f'Grand Total     : ₹{booking.total_cost}\n'
                f'Advance (50%)   : ₹{booking.advance_amount}\n'
                f'Balance Due     : ₹{booking.balance_amount}\n'
                f'Payment Status  : {booking.payment_status}\n\n'
                f'--- CUSTOM NOTES ---\n'
                f'{wd.get("notes", "None")}\n\n'
                f'{'=' * 55}\n'
                f'View in Admin Dashboard: http://localhost:4000/admin-dashboard\n'
            )
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.ADMIN_NOTIFICATION_EMAIL],
                fail_silently=True
            )
        except Exception as e:
            print(f'Wedding notification email failed: {e}')


class BookingDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        if is_admin:
            return Booking.objects.all()
        # Users can view and update their own bookings
        return Booking.objects.filter(user=user)

    def perform_update(self, serializer):
        old_payment = self.get_object().payment_status
        instance = serializer.save()
        
        # Send Payment Confirmation Email
        if instance.payment_status == 'Advance Paid' and old_payment != 'Advance Paid':
            try:
                user = instance.user
                subject = f'💳 Payment Received! Booking #{instance.id} Confirmed – Eventra'
                message = (
                    f'Dear {user.username},\n\n'
                    f'Thank you! Your advance payment of ₹{instance.advance_amount} has been received successfully. ✅\n\n'
                    f'BOOKING REF : #{instance.id}\n'
                    f'EVENT DATE  : {instance.event_date}\n'
                    f'TOTAL COST  : ₹{instance.total_cost}\n'
                    f'BALANCE DUE : ₹{instance.balance_amount} (to be paid after the event)\n\n'
                    f'Your wedding plan is now being reviewed by our team. We will notify you once it is officially approved!\n\n'
                    f'In the meantime, you can view your booking details on your dashboard.\n\n'
                    f'Thank you for trusting Eventra – Timeless Moments! 💍'
                )
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True
                )
            except Exception as e:
                print(f'Payment confirmation email failed: {e}')

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()


class BookingStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        user = request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        if not is_admin:
            return Response({'error': 'Admin only'}, status=403)
        try:
            booking = Booking.objects.get(pk=pk)
            new_status = request.data.get('status')
            if new_status:
                old_status = booking.status
                booking.status = new_status
                booking.save()

                # --- Send Email to Client on Approval or Rejection ---
                if new_status in ('Approved', 'Rejected', 'Cancelled') and new_status != old_status:
                    try:
                        client_user = booking.user
                        wd = booking.wedding_details or {}
                        if new_status == 'Approved':
                            subject = '✅ Your Wedding Booking is Approved! – Eventra'
                            message = (
                                f'Dear {client_user.username},\n\n'
                                f'Great news! 🎊 Your wedding booking has been APPROVED by our team.\n\n'
                                f'BOOKING REF : #{booking.id}\n'
                                f'EVENT DATE  : {booking.event_date}\n'
                                f'VENUE       : {wd.get("venueName", "N/A")}\n'
                                f'GRAND TOTAL : ₹{booking.total_cost}\n'
                                f'ADVANCE PAID: ₹{booking.advance_amount}\n'
                                f'BALANCE DUE : ₹{booking.balance_amount} (to be paid after event)\n\n'
                                f'Our team will contact you shortly to finalize arrangements.\n\n'
                                f'Thank you for choosing Eventra – Timeless Moments! 💍\n'
                                f'Contact us: snehamorja902@gmail.com'
                            )
                        elif new_status == 'Rejected':
                            subject = 'Important Update Regarding Your Booking – Eventra'
                            message = (
                                f'Dear {client_user.username},\n\n'
                                f'We have reviewed your wedding booking application (#{booking.id}) '
                                f'for {booking.event_date}.\n\n'
                                f'Unfortunately, we are unable to fulfill this request at the moment.\n'
                                f'This could be due to scheduling conflicts or other technical reasons.\n\n'
                                f'If you have already paid the advance, our finance team will initiate '
                                f'a refund within 3-5 business days.\n\n'
                                f'We apologize for any disappointment caused.\n\n'
                                f'Best Regards,\nEventra – Timeless Moments'
                            )
                        else:
                            subject = 'Booking Update – Eventra'
                            message = (
                                f'Dear {client_user.username},\n\n'
                                f'We regret to inform you that your wedding booking (#{booking.id}) '
                                f'for {booking.event_date} has been cancelled.\n\n'
                                f'If you have any questions or would like to rebook, please contact us.\n\n'
                                f'We apologize for any inconvenience.\n\n'
                                f'Best Regards,\nEventra – Timeless Moments\n'
                                f'Contact: snehamorja902@gmail.com'
                            )
                        send_mail(
                            subject=subject,
                            message=message,
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[client_user.email],
                            fail_silently=True
                        )
                    except Exception as e:
                        print(f'Booking status email failed: {e}')

            return Response({'message': 'Updated', 'status': booking.status})
        except Booking.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)


class RestoreItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        if not is_admin:
            return Response({'error': 'Admin only'}, status=403)

        item_type = request.data.get('type', '')
        try:
            type_map = {
                'wedding': Booking,
                'job': JobApplication,
                'blog': Blog,
                'inquiry': EventInquiry,
                'decoration': Decoration,
                'gallery': Gallery,
                'concert': ConcertBooking,
                'festival': FestivalBooking,
                'tournament': Tournament,
                'sports-registration': SportsRegistration,
                'concert-master': Concert,
                'festival-master': Festival,
                'catering': Catering,
                'performers': Performer,
                'wedding-event': WeddingEvent
            }
            model_class = type_map.get(item_type)
            if not model_class:
                return Response({'error': f'Unknown type: {item_type}'}, status=400)
                
            obj = model_class.objects.get(pk=pk)
            obj.is_deleted = False
            obj.save()
            return Response({'message': 'Restored successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=404)


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        if is_admin:
            return User.objects.all().order_by('-date_joined')
        return User.objects.none()

# --- EVENT INQUIRY VIEWS ---

class EventInquiryCreateView(generics.CreateAPIView):
    queryset = EventInquiry.objects.all()
    serializer_class = EventInquirySerializer
    permission_classes = [permissions.AllowAny] # Inquiries can be anonymous or logged in

class EventInquiryListView(generics.ListAPIView):
    serializer_class = EventInquirySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        show_deleted = self.request.query_params.get('deleted', '').lower() == 'true'
        
        if is_admin:
            if show_deleted:
                return EventInquiry.objects.filter(is_deleted=True).order_by('-created_at')
            return EventInquiry.objects.filter(is_deleted=False).order_by('-created_at')
        return EventInquiry.objects.none()

class EventInquiryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EventInquiry.objects.all()
    serializer_class = EventInquirySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

class GalleryListCreateView(generics.ListCreateAPIView):
    serializer_class = GallerySerializer
    
    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        show_deleted = self.request.query_params.get('deleted', '').lower() == 'true'
        
        if is_admin:
            if show_deleted:
                return Gallery.objects.filter(is_deleted=True).order_by('-created_at')
            return Gallery.objects.filter(is_deleted=False).order_by('-created_at')
        
        # Regular users only see published and NOT deleted items
        return Gallery.objects.filter(is_published=True, is_deleted=False).order_by('-created_at')

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class DecorationListCreateView(generics.ListCreateAPIView):
    serializer_class = DecorationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        show_deleted = self.request.query_params.get('deleted', '').lower() == 'true'
        
        if is_admin and show_deleted:
            return Decoration.objects.filter(is_deleted=True).order_by('-created_at')
        return Decoration.objects.filter(is_deleted=False).order_by('-created_at')

class DecorationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Decoration.objects.all()
    serializer_class = DecorationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class CustomInquiryView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        name = request.data.get('name')
        email = request.data.get('email')
        phone = request.data.get('phone')
        message_body = request.data.get('message')
        event_type = request.data.get('event_type', 'Wedding')

        if not email or not email.lower().endswith('@gmail.com'):
            return Response({'error': 'A valid @gmail.com address is required.'}, status=400)

        # Send Email to Admin
        try:
            subject = f'✨ New Custom Planning Request: {event_type} - {name}'
            message = (
                f'You have received a new custom planning inquiry via the website.\n'
                f"{'=' * 55}\n\n"
                f'CLIENT NAME     : {name}\n'
                f'EMAIL ADDRESS   : {email}\n'
                f'PHONE NUMBER    : {phone}\n'
                f'EVENT TYPE      : {event_type}\n\n'
                f'--- REQUIREMENTS ---\n'
                f'{message_body}\n\n'
                f"{'=' * 55}\n"
                f'This request was sent from the Custom Inquiry Modal.'
            )
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.ADMIN_NOTIFICATION_EMAIL],
                fail_silently=False
            )
            
            # Send copy to the provided admin email specifically if standard notification fails
            if settings.ADMIN_NOTIFICATION_EMAIL != 'snehamorja902@gmail.com':
                 send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=['snehamorja902@gmail.com'],
                    fail_silently=True
                )

            return Response({'message': 'Inquiry sent successfully!'})
        except Exception as e:
            print(f'Custom inquiry email failed: {e}')
            return Response({'error': 'Failed to send email. Please try again later.'}, status=500)

class GalleryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Gallery.objects.all()
    serializer_class = GallerySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        if is_admin:
            return Gallery.objects.all()
        return Gallery.objects.none()

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

class CateringListCreateView(generics.ListCreateAPIView):
    serializer_class = CateringSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        show_deleted = self.request.query_params.get('deleted', '').lower() == 'true'
        
        if is_admin and show_deleted:
            return Catering.objects.filter(is_deleted=True).order_by('-created_at')
        return Catering.objects.filter(is_deleted=False).order_by('-created_at')

class CateringDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Catering.objects.all()
    serializer_class = CateringSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

class PerformerListCreateView(generics.ListCreateAPIView):
    serializer_class = PerformerSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        show_deleted = self.request.query_params.get('deleted', '').lower() == 'true'
        
        if is_admin and show_deleted:
            return Performer.objects.filter(is_deleted=True).order_by('-created_at')
        return Performer.objects.filter(is_deleted=False).order_by('-created_at')

class PerformerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Performer.objects.all()
    serializer_class = PerformerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()


# --- CONCERT VIEWS ---
class ConcertListCreateView(generics.ListCreateAPIView):
    queryset = Concert.objects.all()
    serializer_class = ConcertSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        is_admin = not user.is_anonymous and ((getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser)
        show_all = self.request.query_params.get('all', '').lower() == 'true'
        show_deleted = self.request.query_params.get('deleted', '').lower() == 'true'
        
        if is_admin and show_deleted:
            return Concert.objects.filter(is_deleted=True).order_by('-id')
        
        qs = Concert.objects.filter(is_deleted=False).order_by('-id')
        if not (is_admin and show_all):
            qs = qs.filter(is_visible=True)
        return qs

class ConcertDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Concert.objects.all()
    serializer_class = ConcertSerializer
    permission_classes = [permissions.AllowAny]

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

# --- FESTIVAL VIEWS ---
class FestivalListCreateView(generics.ListCreateAPIView):
    queryset = Festival.objects.all()
    serializer_class = FestivalSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        is_admin = not user.is_anonymous and ((getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser)
        show_all = self.request.query_params.get('all', '').lower() == 'true'
        show_deleted = self.request.query_params.get('deleted', '').lower() == 'true'
        
        if is_admin and show_deleted:
            return Festival.objects.filter(is_deleted=True).order_by('-id')
        
        qs = Festival.objects.filter(is_deleted=False).order_by('-id')
        if not (is_admin and show_all):
            qs = qs.filter(is_visible=True)
        return qs

class FestivalDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Festival.objects.all()
    serializer_class = FestivalSerializer
    permission_classes = [permissions.AllowAny]

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

# --- CONCERT BOOKING VIEWS ---
class ConcertBookingCreateView(generics.CreateAPIView):
    serializer_class = ConcertBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        instance = serializer.save(user=self.request.user)
        # Send Confirmation Email
        try:
            subject = f'🎸 Booking Confirmed: {instance.concert_title}'
            message = (
                f'Hi {self.request.user.username},\n\n'
                f'Your booking for "{instance.concert_title}" is confirmed! 🎊\n\n'
                f'--- DETAILS ---\n'
                f'Artist : {instance.artist_name}\n'
                f'Date   : {instance.event_date}\n'
                f'Ticket : {instance.ticket_type} (x{instance.quantity})\n'
                f'Total  : ₹{instance.total_price}\n\n'
                f'Please show your "My Bookings" section at the venue for entry.\n\n'
                f'See you there,\n'
                f'Team Eventra'
            )
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [self.request.user.email], fail_silently=True)
        except Exception as e:
            print(f'Concert email failed: {e}')

class ConcertBookingListView(generics.ListAPIView):
    serializer_class = ConcertBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        show_deleted = self.request.query_params.get('deleted', '').lower() == 'true'

        if is_admin:
            if show_deleted:
                return ConcertBooking.objects.filter(is_deleted=True).order_by('-id')
            return ConcertBooking.objects.filter(is_deleted=False).order_by('-id')
        return ConcertBooking.objects.filter(user=user, is_deleted=False).order_by('-id')

class ConcertBookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ConcertBooking.objects.all()
    serializer_class = ConcertBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

# --- FESTIVAL BOOKING VIEWS ---
class FestivalBookingCreateView(generics.CreateAPIView):
    serializer_class = FestivalBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        instance = serializer.save(user=self.request.user)
        # Send Confirmation Email
        try:
            subject = f'🎭 Festival Pass Secured: {instance.festival_name}'
            message = (
                f'Hi {self.request.user.username},\n\n'
                f'Get ready for the vibes! Your pass for "{instance.festival_name}" is confirmed. 🎡\n\n'
                f'--- PASS DETAILS ---\n'
                f'Festival : {instance.festival_name}\n'
                f'Pass Type: {instance.pass_type} (x{instance.quantity})\n'
                f'Price    : ₹{instance.total_price}\n\n'
                f'Your passes are registered under {instance.user.email}.\n\n'
                f'Enjoy the festival!\n'
                f'– Team Eventra'
            )
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [self.request.user.email], fail_silently=True)
        except Exception as e:
            print(f'Festival email failed: {e}')

class FestivalBookingListView(generics.ListAPIView):
    serializer_class = FestivalBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        show_deleted = self.request.query_params.get('deleted', '').lower() == 'true'

        if is_admin:
            if show_deleted:
                return FestivalBooking.objects.filter(is_deleted=True).order_by('-id')
            return FestivalBooking.objects.filter(is_deleted=False).order_by('-id')
        return FestivalBooking.objects.filter(user=user, is_deleted=False).order_by('-id')

class FestivalBookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FestivalBooking.objects.all()
    serializer_class = FestivalBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

# --- SPORTS VIEWS ---
class TournamentListCreateView(generics.ListCreateAPIView):
    serializer_class = TournamentSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        show_deleted = self.request.query_params.get('deleted', '').lower() == 'true'
        user = self.request.user
        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser

        if is_admin and show_deleted:
            return Tournament.objects.filter(is_deleted=True).order_by('-id')
        
        return Tournament.objects.filter(is_deleted=False).order_by('-id')

class TournamentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

class SportsRegistrationListCreateView(generics.ListCreateAPIView):
    serializer_class = SportsRegistrationSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        personal_only = self.request.query_params.get('personal', '').lower() == 'true'
        show_deleted = self.request.query_params.get('deleted', '').lower() == 'true'
        
        if user.is_anonymous:
            return SportsRegistration.objects.filter(status='Winner', is_deleted=False).order_by('-id')

        is_admin = (getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser
        
        if is_admin and not personal_only:
            if show_deleted:
                return SportsRegistration.objects.filter(is_deleted=True).order_by('-id')
            return SportsRegistration.objects.filter(is_deleted=False).order_by('-id')
        return SportsRegistration.objects.filter(user=user, is_deleted=False).order_by('-id')

    def create(self, request, *args, **kwargs):
        tournament_id = request.data.get('tournament')
        if tournament_id:
            try:
                tournament = Tournament.objects.get(id=tournament_id)
                current_regs = SportsRegistration.objects.filter(tournament=tournament, is_deleted=False).count()
                if current_regs >= tournament.max_teams:
                    return Response({'error': f'Registration Closed: This tournament has reached its limit of {tournament.max_teams} teams.'}, status=400)
                
                # If this is the last spot, auto-close registration after this
                if current_regs + 1 >= tournament.max_teams:
                    tournament.status = 'Full/Closed'
                    tournament.save()
            except Tournament.DoesNotExist:
                pass
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        instance = serializer.save(user=self.request.user)
        # Send Confirmation Email
        try:
            tournament_name = instance.tournament.name if instance.tournament else "Tournament"
            subject = f'🏆 Registration Confirmed: {tournament_name}'
            message = (
                f'Hi {self.request.user.username},\n\n'
                f'You are officially registered for "{tournament_name}"! 🏅\n\n'
                f'--- REGISTRATION ---\n'
                f'Type: {instance.registration_type}\n'
                f'Name/Team: {instance.team_name or instance.player_name}\n'
                f'Status: Confirmed\n\n'
                f'Keep practicing and check the fixtures in your dashboard.\n\n'
                f'Lead the way to victory!\n'
                f'– Team Eventra'
            )
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [self.request.user.email], fail_silently=True)
        except Exception as e:
            print(f'Sports email failed: {e}')

class SportsRegistrationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SportsRegistration.objects.all()
    serializer_class = SportsRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        old_instance = self.get_object()
        old_status = old_instance.status
        instance = serializer.save()
        new_status = instance.status

        if new_status != old_status and new_status in ['Winner', 'Semi-Finalist', 'Runner Up']:
            try:
                user = instance.user
                t_name = instance.tournament.name if instance.tournament else "Tournament"
                subject = f'🎊 Congratulations! You are a {new_status}!'
                amount_info = ""
                if new_status == 'Winner':
                    amount_info = "You have won the Champion prize (50% pool share)!"
                elif new_status == 'Semi-Finalist':
                    amount_info = "You have secured the Semi-Finalist prize (20% pool share)!"

                message = (
                    f'Hi {user.username},\n\n'
                    f'Incredible news from {t_name}! 🏆\n\n'
                    f'You have been officially declared as the: {new_status.upper()}\n'
                    f'{amount_info}\n\n'
                    f'Our finance team will process your reward and registration refund within 12-24 hours. '
                    f'Please ensure your bank details/UPI in your profile are updated.\n\n'
                    f'Cheers to your victory!\n'
                    f'– The Eventra Sports Team'
                )
                send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=True)
            except Exception as e:
                print(f"Winner email error: {e}")

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

class FixtureListCreateView(generics.ListCreateAPIView):
    queryset = Fixture.objects.all()
    serializer_class = FixtureSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        tournament_id = self.request.query_params.get('tournament')
        if tournament_id:
            return Fixture.objects.filter(tournament_id=tournament_id).order_by('match_date')
        return Fixture.objects.all().order_by('-match_date')

class FixtureDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Fixture.objects.all()
    serializer_class = FixtureSerializer
    permission_classes = [permissions.IsAuthenticated]

# --- WEDDING EVENT VIEWS ---
class WeddingEventListCreateView(generics.ListCreateAPIView):
    serializer_class = WeddingEventSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        show_deleted = self.request.query_params.get('deleted', '').lower() == 'true'
        show_all = self.request.query_params.get('all', '').lower() == 'true'
        user = self.request.user
        
        # Helper to check admin role
        is_admin = not user.is_anonymous and ((getattr(user, 'role', '') or '').upper() == 'ADMIN' or user.is_staff or user.is_superuser)

        if is_admin and show_deleted:
            return WeddingEvent.objects.filter(is_deleted=True).order_by('-id')
        
        if is_admin and show_all:
            return WeddingEvent.objects.filter(is_deleted=False).order_by('-id')
            
        return WeddingEvent.objects.filter(is_deleted=False, is_visible=True).order_by('id')

class WeddingEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = WeddingEvent.objects.all()
    serializer_class = WeddingEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()
