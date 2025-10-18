from django.db import models
from django.contrib.auth.models import User
from students.models import Student
from classes.models import Class
from subjects.models import Subject

class Grade(models.Model):
    GRADE_TYPE_CHOICES = [
        ('assignment', 'Assignment'),
        ('quiz', 'Quiz'),
        ('exam', 'Exam'),
        ('midterm', 'Midterm'),
        ('final', 'Final'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    class_id = models.ForeignKey(Class, on_delete=models.CASCADE)
    grade_value = models.DecimalField(max_digits=5, decimal_places=2)
    max_grade = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    grade_type = models.CharField(max_length=20, choices=GRADE_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    graded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    graded_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-graded_at', 'title']
        unique_together = ['student', 'subject', 'class_id', 'title', 'graded_at']

    def __str__(self):
        return f"{self.student} - {self.subject} - {self.title} - {self.grade_value}/{self.max_grade}"

    @property
    def percentage(self):
        if self.max_grade > 0:
            return (self.grade_value / self.max_grade) * 100
        return 0

    @property
    def letter_grade(self):
        percentage = self.percentage
        if percentage >= 95:
            return 'A'
        elif percentage >= 80:
            return 'B'
        elif percentage >= 70:
            return 'C'
        elif percentage >= 60:
            return 'D'
        else:
            return 'F'
