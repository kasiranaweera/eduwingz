from rest_framework import serializers
from .models import Profile, OtherDetail, Notification
from users.models import User
from users.serializer import UserSerializer

class OtherDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = OtherDetail
        fields = ['id', 'subject', 'avg_hours', 'time_period', 'strength', 'style']

class ProfileSerializer(serializers.ModelSerializer):
    # user = UserSerializer(read_only=True)
    other = OtherDetailSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = [
            'profile_id',
            'user',
            'first_name',
            'last_name',
            'username',
            'tagline',
            'bio',
            'status',
            'other',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['profile_id', 'created_at', 'updated_at']

class ProfileUpdateSerializer(serializers.ModelSerializer):
    other = OtherDetailSerializer(required=False)

    class Meta:
        model = Profile
        fields = ['first_name', 'last_name', 'username', 'bio', 'tagline', 'status', 'other']

    def validate_username(self, value):
        profile = self.instance
        if value != profile.username:
            if Profile.objects.filter(username=value).exclude(id=profile.id).exists():
                raise serializers.ValidationError("This username is already taken.")
        return value

    def update(self, instance, validated_data):
        other_data = validated_data.pop('other', None)

        # Update Profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        # Create or update OtherDetail
        if other_data:
            if instance.other:
                # Update existing OtherDetail
                for attr, value in other_data.items():
                    setattr(instance.other, attr, value)
                instance.other.save()
            else:
                # Create new OtherDetail
                other = OtherDetail.objects.create(**other_data)
                instance.other = other
                instance.save()

        return instance
    

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'title', 'content', 'notification_type', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

