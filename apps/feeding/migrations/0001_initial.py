from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('pets', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='FeedingLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('food_type', models.CharField(max_length=100)),
                ('amount', models.FloatField()),
                ('calories', models.IntegerField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('pet', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='feeding_logs', to='pets.pet')),
            ],
            options={'db_table': 'feeding_logs', 'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='FeedingGuideline',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('food_category', models.CharField(max_length=100)),
                ('food_name', models.CharField(max_length=150)),
                ('species', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='pets.species')),
            ],
            options={'db_table': 'feeding_guidelines'},
        ),
    ]
