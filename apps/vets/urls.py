from django.urls import path
from .views import VetListView, VetDetailView, MyVetProfileView, VetReviewListCreateView

urlpatterns = [
    path('', VetListView.as_view(), name='vet-list'),
    path('<int:pk>/', VetDetailView.as_view(), name='vet-detail'),
    path('me/', MyVetProfileView.as_view(), name='my-vet-profile'),
    path('<int:vet_id>/reviews/', VetReviewListCreateView.as_view(), name='vet-reviews'),
]
