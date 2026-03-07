from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0001_initial'),
        ('pets', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Appointment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('appointment_time', models.DateTimeField()),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('completed', 'Completed'), ('cancelled', 'Cancelled')], default='pending', max_length=50)),
                ('notes', models.TextField(blank=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='appointments_as_owner', to='users.user')),
                ('vet', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='appointments_as_vet', to='users.user')),
                ('pet', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='appointments', to='pets.pet')),
            ],
            options={'db_table': 'appointments', 'ordering': ['appointment_time']},
        ),
        migrations.CreateModel(
            name='Reminder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reminder_type', models.CharField(choices=[('vaccination', 'Vaccination'), ('deworming', 'Deworming'), ('appointment', 'Appointment'), ('medication', 'Medication'), ('custom', 'Custom')], max_length=100)),
                ('reminder_date', models.DateField()),
                ('repeat_interval_days', models.IntegerField(blank=True, null=True)),
                ('title', models.CharField(blank=True, max_length=255)),
                ('notes', models.TextField(blank=True)),
                ('sent', models.BooleanField(default=False)),
                ('pet', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reminders', to='pets.pet')),
            ],
            options={'db_table': 'reminders', 'ordering': ['reminder_date']},
        ),
    ]
