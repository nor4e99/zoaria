from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('pets', '0001_initial'),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='MedicalRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('diagnosis', models.TextField(blank=True)),
                ('treatment', models.TextField(blank=True)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('pet', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='medical_records', to='pets.pet')),
                ('vet', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='authored_records', to='users.user')),
            ],
            options={'db_table': 'medical_records', 'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='Prescription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('medication_name', models.CharField(max_length=255)),
                ('dosage', models.CharField(blank=True, max_length=100)),
                ('duration', models.CharField(blank=True, max_length=100)),
                ('instructions', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('pet', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='prescriptions', to='pets.pet')),
                ('vet', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='authored_prescriptions', to='users.user')),
            ],
            options={'db_table': 'prescriptions', 'ordering': ['-created_at']},
        ),
    ]
