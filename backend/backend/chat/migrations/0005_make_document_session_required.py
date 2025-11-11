# Generated manually

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0004_populate_document_session'),
    ]

    operations = [
        migrations.AlterField(
            model_name='document',
            name='session',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='documents', to='chat.chatsession'),
        ),
    ]

