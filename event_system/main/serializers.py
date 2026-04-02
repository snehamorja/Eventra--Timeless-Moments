from rest_framework import serializers
from .models import *

class WeddingEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeddingEvent
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'password', 'role', 'is_staff', 'is_superuser', 'date_joined', 'profile_photo', 'theme']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'USER'),
            phone=validated_data.get('phone', '')
        )
        return user



class DecorationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Decoration
        fields = '__all__'

class CateringSerializer(serializers.ModelSerializer):
    class Meta:
        model = Catering
        fields = '__all__'

class PerformerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Performer
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Booking
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True}
        }

class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = '__all__'

class EventInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = EventInquiry
        fields = '__all__'

class BlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blog
        fields = '__all__'

class GallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Gallery
        fields = '__all__'

class ConcertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Concert
        fields = '__all__'

class FestivalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Festival
        fields = '__all__'

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = '__all__'

class ConcertBookingSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = ConcertBooking
        fields = '__all__'
        read_only_fields = ['user']

class FestivalBookingSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = FestivalBooking
        fields = '__all__'
        read_only_fields = ['user']

class SportsRegistrationSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    tournament_name = serializers.CharField(source='tournament.name', read_only=True)
    sport = serializers.CharField(source='tournament.sport', read_only=True)
    class Meta:
        model = SportsRegistration
        fields = '__all__'
        read_only_fields = ['user']

class FixtureSerializer(serializers.ModelSerializer):
    player1_name = serializers.SerializerMethodField()
    player2_name = serializers.SerializerMethodField()
    winner_name = serializers.SerializerMethodField()

    class Meta:
        model = Fixture
        fields = '__all__'

    def validate(self, data):
        tournament = data.get('tournament')
        match_dt = data.get('match_date')
        
        if tournament and match_dt:
            match_date = match_dt.date()
            if match_date < tournament.start_date:
                raise serializers.ValidationError(f"Match date {match_date} cannot be before tournament start date {tournament.start_date}")
            if tournament.end_date and match_date > tournament.end_date:
                raise serializers.ValidationError(f"Match date {match_date} cannot be after tournament end date {tournament.end_date}")
        
        return data

    def get_player1_name(self, obj):
        if not obj.player1: return obj.player1_tbd_label or "TBD"
        return obj.player1.team_name or obj.player1.player_name or obj.player1.user.username

    def get_player2_name(self, obj):
        if not obj.player2: return obj.player2_tbd_label or "TBD"
        return obj.player2.team_name or obj.player2.player_name or obj.player2.user.username

    def get_winner_name(self, obj):
        if not obj.winner: return None
        return obj.winner.team_name or obj.winner.player_name or obj.winner.user.username
