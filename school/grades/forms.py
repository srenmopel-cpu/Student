from django import forms
from .models import Grade

class GradeForm(forms.ModelForm):
    class Meta:
        model = Grade
        fields = ['student', 'subject', 'class_id', 'grade_value', 'max_grade',
                 'grade_type', 'title', 'description', 'graded_by', 'graded_at']
        widgets = {
            'graded_at': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
            'description': forms.Textarea(attrs={'rows': 3}),
        }