from django.contrib import admin
from .models import Grade

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ['student', 'subject', 'class_id', 'grade_value', 'max_grade', 'grade_type', 'graded_at']
    list_filter = ['grade_type', 'graded_at', 'subject', 'class_id']
    search_fields = ['student__first_name', 'student__last_name', 'subject__subject_name', 'title']
    ordering = ['-graded_at']
    fieldsets = (
        ('Grade Information', {
            'fields': ('student', 'subject', 'class_id', 'grade_value', 'max_grade', 'grade_type')
        }),
        ('Details', {
            'fields': ('title', 'description', 'graded_by', 'graded_at')
        }),
    )
    readonly_fields = ['percentage', 'letter_grade']

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        # Set the default graded_by to current user when creating
        if obj is None:
            form.base_fields['graded_by'].initial = request.user
        return form
