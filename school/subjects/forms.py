from django import forms
from .models import Subject

class SubjectForm(forms.ModelForm):
    class Meta:
        model = Subject
        fields = ['subject_code', 'subject_name', 'description']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 3}),
        }