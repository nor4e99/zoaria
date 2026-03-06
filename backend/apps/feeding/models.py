from django.db import models
from apps.pets.models import Pet, Species


class FeedingLog(models.Model):
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='feeding_logs')
    food_type = models.CharField(max_length=100)
    amount = models.FloatField()
    calories = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'feeding_logs'
        ordering = ['-created_at']


class FeedingGuideline(models.Model):
    species = models.ForeignKey(Species, on_delete=models.CASCADE)
    food_category = models.CharField(max_length=100)
    food_name = models.CharField(max_length=150)

    class Meta:
        db_table = 'feeding_guidelines'
