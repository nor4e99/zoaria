from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='VetProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('specialization', models.CharField(blank=True, max_length=255)),
                ('years_experience', models.IntegerField(blank=True, null=True)),
                ('clinic_name', models.CharField(blank=True, max_length=255)),
                ('clinic_address', models.TextField(blank=True)),
                ('consultation_price', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('license_document', models.TextField(blank=True)),
                ('approved', models.BooleanField(default=False)),
                ('rating', models.FloatField(default=0.0)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='vet_profile', to='users.user')),
            ],
            options={'db_table': 'vet_profiles'},
        ),
        migrations.CreateModel(
            name='VetReview',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating', models.IntegerField()),
                ('comment', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('vet', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to='vets.vetprofile')),
                ('reviewer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.user')),
            ],
            options={'unique_together': {('vet', 'reviewer')}},
        ),
    ]
