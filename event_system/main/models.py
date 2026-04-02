from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(username, email, password, **extra_fields)

class User(AbstractUser):
    ROLE_CHOICES = (
        ('USER', 'USER'),
        ('ADMIN', 'ADMIN'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='USER')
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Login Blocking
    login_attempts = models.IntegerField(default=0)
    block_until = models.DateTimeField(blank=True, null=True)

    # Profile & Settings
    profile_photo = models.TextField(blank=True, null=True)
    theme = models.CharField(max_length=10, default='light') # light, dark

    objects = UserManager()

    def __str__(self):
        return self.username

# --- New Model for Job Applications ---

class Decoration(models.Model):
    CATEGORY_CHOICES = (
        ('Wedding', 'Wedding'),
        ('Sangeet', 'Sangeet'),
        ('Mehendi', 'Mehendi'),
        ('Haldi', 'Haldi'),
        ('Reception', 'Reception'),
        ('Other', 'Other'),
    )
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Wedding')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    image = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Decorations"

class Catering(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    price_per_plate = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    image = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Catering Options"

class Performer(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100, default='Singer') # Singer, DJ, Dance Troupe
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    image = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Performers & Entertainment"

class Booking(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Cancelled', 'Cancelled'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    event_type = models.CharField(max_length=100)
    event_date = models.DateField()
    guests = models.IntegerField()
    budget = models.DecimalField(max_digits=15, decimal_places=2)
    address = models.TextField(blank=True, null=True)
    
    # Selection Details
    catering_package = models.CharField(max_length=150, blank=True, null=True)
    catering_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    selected_decoration = models.ForeignKey(Decoration, on_delete=models.SET_NULL, null=True, blank=True)
    decoration_name = models.CharField(max_length=150, blank=True, null=True) # Snapshot name
    decoration_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    performer_name = models.CharField(max_length=150, blank=True, null=True)
    performer_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Financials
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    advance_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Tracking
    booking_date = models.DateTimeField(auto_now_add=True, null=True)
    refund_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cancellation_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    PAYMENT_STATUS = (
        ('Pending', 'Pending'),
        ('Advance Paid', 'Advance Paid'),
        ('Fully Paid', 'Fully Paid'),
    )
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='Pending')
    
    wedding_details = models.JSONField(default=dict, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.event_type} ({self.status})"

class JobApplication(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    portfolio = models.URLField(blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    position = models.CharField(max_length=100) # e.g. Lead Decor Stylist
    status = models.CharField(max_length=20, default='Applied') # Applied, Interviewing, Hired
    is_deleted = models.BooleanField(default=False)
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} - {self.position}"

class EventInquiry(models.Model):
    planner_name = models.CharField(max_length=200)
    event_type = models.CharField(max_length=100)
    event_date = models.DateField()
    guests = models.IntegerField(default=0)
    location_type = models.CharField(max_length=50, default='Indoor')
    venue_name = models.CharField(max_length=200, blank=True, null=True)
    service_style = models.CharField(max_length=100, default='Standard')
    cuisine_preferences = models.TextField(blank=True, null=True)
    budget_range = models.CharField(max_length=100, blank=True, null=True)
    contact_name = models.CharField(max_length=200)
    contact_phone = models.CharField(max_length=20)
    contact_email = models.EmailField()
    internal_notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, default='Pending') # Pending, Reviewed, Contacted
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.contact_name} - {self.event_type} ({self.status})"

    class Meta:
        verbose_name_plural = "Event Inquiries"



class Concert(models.Model):
    title = models.CharField(max_length=200)
    artist = models.CharField(max_length=200)
    artistBio = models.TextField()
    popularTracks = models.JSONField(default=list, blank=True)
    date = models.CharField(max_length=100)
    time = models.CharField(max_length=50)
    venue = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    genre = models.CharField(max_length=100)
    bannerImage = models.TextField()
    thumbnail = models.TextField()
    description = models.TextField()
    highlights = models.JSONField(default=dict, blank=True)
    tickets = models.JSONField(default=list, blank=True)
    schedule = models.JSONField(default=list, blank=True)
    rules = models.JSONField(default=list, blank=True)
    faqs = models.JSONField(default=list, blank=True)
    sponsors = models.JSONField(default=list, blank=True)
    is_deleted = models.BooleanField(default=False)
    is_visible = models.BooleanField(default=True)
    booking_deadline = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Festival(models.Model):
    name = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    venue = models.CharField(max_length=200)
    startDate = models.CharField(max_length=100)
    endDate = models.CharField(max_length=100)
    theme = models.CharField(max_length=200)
    image = models.TextField()
    color = models.CharField(max_length=100, default='rgba(0,0,0,0.9)')
    booking_deadline = models.DateField(null=True, blank=True)
    secondary = models.CharField(max_length=50, default='#FFD700')
    highlights = models.JSONField(default=list, blank=True)
    about = models.TextField()
    attractions = models.JSONField(default=list, blank=True)
    passes = models.JSONField(default=list, blank=True)
    schedule = models.JSONField(default=list, blank=True)
    rules = models.JSONField(default=list, blank=True)
    faqs = models.JSONField(default=list, blank=True)
    is_deleted = models.BooleanField(default=False)
    is_visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Tournament(models.Model):
    name = models.CharField(max_length=200)
    sport = models.CharField(max_length=100)
    category = models.CharField(max_length=50, default='Team')
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    registration_deadline = models.DateField(null=True, blank=True)
    max_teams = models.IntegerField(default=10)
    image = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='Registration Open') 
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.sport})"

class ConcertBooking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    concert_title = models.CharField(max_length=200)
    artist_name = models.CharField(max_length=200)
    event_date = models.CharField(max_length=100)
    ticket_type = models.CharField(max_length=100)
    quantity = models.IntegerField()
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    booking_date = models.DateTimeField(auto_now_add=True)
    payment_status = models.CharField(max_length=20, default='Paid')
    status = models.CharField(max_length=20, default='Confirmed')
    is_deleted = models.BooleanField(default=False)
    refund_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cancellation_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.user.username} - {self.concert_title}"

class FestivalBooking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    festival_name = models.CharField(max_length=200)
    pass_type = models.CharField(max_length=100)
    quantity = models.IntegerField()
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    booking_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='Confirmed')
    is_deleted = models.BooleanField(default=False)
    refund_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cancellation_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.user.username} - {self.festival_name}"

class SportsRegistration(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    registration_type = models.CharField(max_length=50)
    team_name = models.CharField(max_length=200, blank=True, null=True)
    captain_name = models.CharField(max_length=200, blank=True, null=True)
    player_name = models.CharField(max_length=200, blank=True, null=True)
    players = models.JSONField(default=list, blank=True)
    substitutes = models.JSONField(default=list, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    winning_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    prize_status = models.CharField(max_length=50, default='Pending') # Pending, Paid, N/A
    registration_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default='Confirmed')
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.tournament.name}"

class Fixture(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='fixtures')
    round_number = models.CharField(max_length=50, default='1')
    player1 = models.ForeignKey(SportsRegistration, on_delete=models.SET_NULL, related_name='fixtures_as_p1', null=True, blank=True)
    player2 = models.ForeignKey(SportsRegistration, on_delete=models.SET_NULL, related_name='fixtures_as_p2', null=True, blank=True)
    player1_tbd_label = models.CharField(max_length=150, blank=True, null=True) # "Winner of Match #1"
    player2_tbd_label = models.CharField(max_length=150, blank=True, null=True) # "Winner of Match #2"
    winner = models.ForeignKey(SportsRegistration, on_delete=models.SET_NULL, related_name='won_fixtures', null=True, blank=True)
    match_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=50, default='Scheduled')

    def __str__(self):
        return f"{self.tournament.name} Fixture"



class Blog(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    image = models.URLField(blank=True, null=True)
    author = models.CharField(max_length=100, default='Admin')
    date = models.DateField(auto_now_add=True)
    is_published = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Gallery(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='gallery/', blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    is_published = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class WeddingEvent(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    image = models.TextField(blank=True, null=True) # Text field for URL
    is_deleted = models.BooleanField(default=False)
    is_visible = models.BooleanField(default=True)
    
    # Advanced Details
    approx_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    highlights = models.JSONField(default=list, blank=True) # [{icon, label, detail}]
    schedule = models.JSONField(default=list, blank=True)   # [{day, event}]
    rules = models.JSONField(default=list, blank=True)      # [rules]
    faqs = models.JSONField(default=list, blank=True)        # [{question, answer}]
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Wedding Events"
