from django.db import models
from apps.users.models import User


class VetProfile(models.Model):
    """Maps to `vet_profiles` table."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='vet_profile')
    specialization = models.CharField(max_length=255, blank=True)
    years_experience = models.IntegerField(null=True, blank=True)
    clinic_name = models.CharField(max_length=255, blank=True)
    clinic_address = models.TextField(blank=True)
    consultation_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    license_document = models.TextField(blank=True)  # URL / path
    approved = models.BooleanField(default=False)
    rating = models.FloatField(default=0.0)

    class Meta:
        db_table = 'vet_profiles'

    def __str__(self):
        return f'Dr. {self.user.email} - {"Approved" if self.approved else "Pending"}'


class VetReview(models.Model):
    """Pet owner reviews for veterinarians."""
    vet = models.ForeignKey(VetProfile, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField()  # 1–5
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['vet', 'reviewer']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Recalculate vet average rating
        from django.db.models import Avg
        avg = VetReview.objects.filter(vet=self.vet).aggregate(Avg('rating'))['rating__avg']
        self.vet.rating = round(avg or 0, 2)
        self.vet.save(update_fields=['rating'])
