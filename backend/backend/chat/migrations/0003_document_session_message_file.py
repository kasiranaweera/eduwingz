# Generated manually

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0002_message_parent_message'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='session',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='documents', to='chat.chatsession'),
        ),
        migrations.AddField(
            model_name='document',
            name='message',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='documents', to='chat.message'),
        ),
        migrations.AddField(
            model_name='document',
            name='file',
            field=models.FileField(blank=True, null=True, upload_to='documents/'),
        ),
        migrations.AlterField(
            model_name='document',
            name='file_path',
            field=models.CharField(blank=True, max_length=255),
        ),
    ]

