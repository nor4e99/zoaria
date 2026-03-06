from django.db import models
from apps.users.models import User


class HubArticle(models.Model):
    """Maps to `hub_articles` table."""
    title = models.CharField(max_length=255)
    content = models.TextField()
    language = models.CharField(max_length=10, default='en')
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    published = models.BooleanField(default=True)
    tags = models.CharField(max_length=255, blank=True)  # comma-separated

    class Meta:
        db_table = 'hub_articles'
        ordering = ['-created_at']


class HubVideo(models.Model):
    """Maps to `hub_videos` table."""
    title = models.CharField(max_length=255)
    video_url = models.TextField()
    language = models.CharField(max_length=10, default='en')
    created_at = models.DateTimeField(auto_now_add=True)
    published = models.BooleanField(default=True)

    class Meta:
        db_table = 'hub_videos'
        ordering = ['-created_at']
