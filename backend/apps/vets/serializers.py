from rest_framework import serializers, generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import VetProfile, VetReview
from apps.users.models import UserProfile


class VetProfileSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email', read_only=True)
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = VetProfile
        fields = [
            'id', 'email', 'name', 'profile_image',
            'specialization', 'years_experience', 'clinic_name',
            'clinic_address', 'consultation_price', 'rating', 'approved',
        ]

    def get_name(self, obj):
        try:
            return obj.user.profile.name
        except Exception:
            return obj.user.email

    def get_profile_image(self, obj):
        try:
            return obj.user.profile.profile_image
        except Exception:
            return ''


class VetProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VetProfile
        fields = [
            'specialization', 'years_experience', 'clinic_name',
            'clinic_address', 'consultation_price',
        ]


class VetReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()

    class Meta:
        model = VetReview
        fields = ['id', 'rating', 'comment', 'created_at', 'reviewer_name']
        read_only_fields = ['id', 'created_at', 'reviewer_name']

    def get_reviewer_name(self, obj):
        try:
            return obj.reviewer.profile.name or obj.reviewer.email
        except Exception:
            return obj.reviewer.email

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value

    def create(self, validated_data):
        validated_data['reviewer'] = self.context['request'].user
        validated_data['vet'] = self.context['vet']
        return super().create(validated_data)
