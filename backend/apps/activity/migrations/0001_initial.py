from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('apps.pets', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ActivityLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('activity_type', models.CharField(choices=[('walk','Walk'),('run','Run'),('play','Play'),('swim','Swim'),('training','Training'),('other','Other')], default='walk', max_length=50)),
                ('distance', models.FloatField(blank=True, null=True)),
                ('duration_minutes', models.IntegerField(blank=True, null=True)),
                ('calories_burned', models.FloatField(blank=True, null=True)),
                ('activity_date', models.DateField()),
                ('notes', models.CharField(blank=True, max_length=255)),
                ('gps_start_lat', models.FloatField(blank=True, null=True)),
                ('gps_start_lng', models.FloatField(blank=True, null=True)),
                ('gps_end_lat', models.FloatField(blank=True, null=True)),
                ('gps_end_lng', models.FloatField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('pet', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='activity_logs', to='pets.pet')),
            ],
            options={'db_table': 'activity_logs', 'ordering': ['-activity_date', '-created_at']},
        ),
    ]
