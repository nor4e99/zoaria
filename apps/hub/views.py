from rest_framework import serializers, generics, filters
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.urls import path

from .models import HubArticle, HubVideo


class HubArticleSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = HubArticle
        fields = ['id', 'title', 'content', 'language', 'author_name', 'tags', 'created_at']

    def get_author_name(self, obj):
        if obj.author:
            try:
                return obj.author.profile.name or obj.author.email
            except Exception:
                return obj.author.email
        return 'ZOARIA'


class HubVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HubVideo
        fields = ['id', 'title', 'video_url', 'language', 'created_at']


class HubArticleListView(generics.ListCreateAPIView):
    serializer_class = HubArticleSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'tags', 'content']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        qs = HubArticle.objects.filter(published=True)
        lang = self.request.query_params.get('lang')
        if lang:
            qs = qs.filter(language=lang)
        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class HubVideoListView(generics.ListAPIView):
    serializer_class = HubVideoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = HubVideo.objects.filter(published=True)
        lang = self.request.query_params.get('lang')
        if lang:
            qs = qs.filter(language=lang)
        return qs


urlpatterns = [
    path('articles/', HubArticleListView.as_view(), name='hub-articles'),
    path('videos/', HubVideoListView.as_view(), name='hub-videos'),
]
