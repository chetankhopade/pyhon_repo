from django.contrib.auth.models import User
from django.db import models

# User extension (more data for Users)
class UserProfile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    # Avatar
    avatar = models.FileField(upload_to='avatars/', blank=True, null=True)

    # Contact
    phone = models.CharField(max_length=100, blank=True, null=True)

    # About
    title = models.CharField(max_length=100, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    company = models.CharField(max_length=100, blank=True, null=True)
    timezone = models.CharField(max_length=100, blank=True, null=True)

    # Token (could be useful for reset password, securities actions and other functionalities)
    token = models.CharField(max_length=100, blank=True, null=True)


    def __str__(self):
        return f"{self.user}"

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profile'
        db_table = "user_profiles"
        ordering = ('user', )
        unique_together = ('user', )
