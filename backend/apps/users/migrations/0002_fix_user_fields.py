from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            "ALTER TABLE users DROP COLUMN IF EXISTS full_name;",
            migrations.RunSQL.noop,
        ),
        migrations.RunSQL(
            "ALTER TABLE users DROP COLUMN IF EXISTS phone;",
            migrations.RunSQL.noop,
        ),
        migrations.RunSQL(
            "ALTER TABLE users DROP COLUMN IF EXISTS date_joined;",
            migrations.RunSQL.noop,
        ),
        migrations.RunSQL(
            "ALTER TABLE users DROP COLUMN IF EXISTS is_email_verified;",
            migrations.RunSQL.noop,
        ),
        migrations.RunSQL(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;",
            migrations.RunSQL.noop,
        ),
        migrations.RunSQL(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at timestamp with time zone NOT NULL DEFAULT now();",
            migrations.RunSQL.noop,
        ),
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AlterField(
                    model_name='user',
                    name='email_verified',
                    field=models.BooleanField(default=False),
                ),
                migrations.AlterField(
                    model_name='user',
                    name='created_at',
                    field=models.DateTimeField(default=django.utils.timezone.now),
                ),
            ],
            database_operations=[],
        ),
    ]
