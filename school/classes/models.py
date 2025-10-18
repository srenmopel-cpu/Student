from django.db import models
from django.contrib.auth.models import User

class Class(models.Model):
    class_name = models.CharField(max_length=100)
    grade_level = models.CharField(max_length=20)  # e.g., 'Grade 1', 'Grade 2', etc.
    section = models.CharField(max_length=10, blank=True, null=True)  # e.g., 'A', 'B', 'C'
    academic_year = models.CharField(max_length=20)  # e.g., '2023-2024'
    class_teacher = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    room_number = models.CharField(max_length=20, blank=True, null=True)
    capacity = models.PositiveIntegerField(default=30)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['grade_level', 'section', 'class_name']
        unique_together = ['class_name', 'section', 'academic_year']

    def __str__(self):
        if self.section:
            return f"{self.class_name} - Section {self.section} ({self.grade_level})"
        return f"{self.class_name} ({self.grade_level})"

    @property
    def current_enrollment(self):
        return self.student_set.count()

    @property
    def available_seats(self):
        return self.capacity - self.current_enrollment
