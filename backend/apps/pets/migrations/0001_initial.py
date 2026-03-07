from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Species',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
            ],
            options={'db_table': 'species', 'verbose_name_plural': 'Species'},
        ),
        migrations.CreateModel(
            name='Breed',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('breed_name', models.CharField(max_length=150)),
                ('min_weight', models.FloatField(blank=True, null=True)),
                ('max_weight', models.FloatField(blank=True, null=True)),
                ('species', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='breeds', to='pets.species')),
            ],
            options={'db_table': 'breeds', 'ordering': ['breed_name']},
        ),
        migrations.CreateModel(
            name='BreedCondition',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('condition_name', models.TextField()),
                ('breed', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='conditions', to='pets.breed')),
            ],
            options={'db_table': 'breed_conditions'},
        ),
        migrations.CreateModel(
            name='Pet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=150)),
                ('gender', models.CharField(choices=[('male', 'Male'), ('female', 'Female'), ('unknown', 'Unknown')], default='unknown', max_length=20)),
                ('sterilized', models.BooleanField(default=False)),
                ('age', models.IntegerField(blank=True, null=True)),
                ('weight', models.FloatField(blank=True, null=True)),
                ('ideal_weight', models.FloatField(blank=True, null=True)),
                ('height', models.FloatField(blank=True, null=True)),
                ('activity_level', models.CharField(choices=[('low', 'Low'), ('moderate', 'Moderate'), ('active', 'Active'), ('very_active', 'Very Active')], default='moderate', max_length=50)),
                ('chip_number', models.CharField(blank=True, max_length=100)),
                ('medical_notes', models.TextField(blank=True)),
                ('avatar_type', models.CharField(blank=True, max_length=50)),
                ('photo_url', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pets', to='users.user')),
                ('species', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='pets.species')),
                ('breed', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='pets.breed')),
            ],
            options={'db_table': 'pets', 'ordering': ['name']},
        ),
    ]
