from django.db import models

class Subject(models.Model):
    subject_code = models.CharField(max_length=20, unique=True)
    subject_name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['subject_name']

    def __str__(self):
        return f"{self.subject_code} - {self.subject_name}"
