from django import forms
from .models import Class

class ClassForm(forms.ModelForm):
    section = forms.CharField(
        max_length=10,
        required=False,
        widget=forms.TextInput(attrs={'maxlength': '10'})
    )

    class Meta:
        model = Class
        fields = ['class_name', 'grade_level', 'section', 'academic_year',
                 'class_teacher', 'room_number', 'capacity', 'description']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 3}),
        }