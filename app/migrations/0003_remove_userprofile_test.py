# Generated by Django 3.1.1 on 2021-07-30 06:32

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_userprofile_test'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userprofile',
            name='test',
        ),
    ]
