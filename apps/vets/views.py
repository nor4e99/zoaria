from rest_framework import generics, filters, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import VetProfile, VetReview
from .serializers import VetProfileSerializer, VetProfileUpdateSerializer, VetReviewSerializer


class VetListView(generics.ListAPIView):
    """Public vet directory. Only shows approved vets."""
    serializer_class = VetProfileSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['specialization', 'clinic_name', 'user__profile__name']
    ordering_fields = ['rating', 'consultation_price']
    ordering = ['-rating']

    def get_queryset(self):
        return VetProfile.objects.filter(approved=True).select_related('user__profile')


class VetDetailView(generics.RetrieveAPIView):
    serializer_class = VetProfileSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        return get_object_or_404(VetProfile, id=self.kwargs['pk'], approved=True)


class MyVetProfileView(APIView):
    """Vet can view and update their own profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_object_or_404(VetProfile, user=request.user)
        return Response(VetProfileSerializer(profile).data)

    def put(self, request):
        profile = get_object_or_404(VetProfile, user=request.user)
        serializer = VetProfileUpdateSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(VetProfileSerializer(profile).data)

    def patch(self, request):
        return self.put(request)


class VetReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = VetReviewSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        return VetReview.objects.filter(vet_id=self.kwargs['vet_id']).select_related('reviewer__profile')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['vet'] = get_object_or_404(VetProfile, id=self.kwargs['vet_id'])
        return ctx
