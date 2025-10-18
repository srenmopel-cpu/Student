from django.contrib import admin
from .models import Class

@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ['class_name', 'grade_level', 'section', 'academic_year', 'class_teacher', 'current_enrollment', 'capacity']
    list_filter = ['grade_level', 'academic_year', 'class_teacher']
    search_fields = ['class_name', 'grade_level']
    ordering = ['grade_level', 'section', 'class_name']
    fieldsets = (
        ('Basic Information', {
            'fields': ('class_name', 'grade_level', 'section', 'academic_year')
        }),
        ('Teacher & Capacity', {
            'fields': ('class_teacher', 'capacity', 'room_number')
        }),
        ('Additional Information', {
            'fields': ('description',),
            'classes': ('collapse',)
        }),
    )
