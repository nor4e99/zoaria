from django.urls import path
from .views import HubArticleListView, HubVideoListView

urlpatterns = [
    path('articles/', HubArticleListView.as_view(), name='hub-articles'),
    path('videos/', HubVideoListView.as_view(), name='hub-videos'),
]
