from django.contrib import admin
from .models import Student

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['student_id', 'first_name', 'last_name', 'email', 'enrollment_date', 'status']
    list_filter = ['status', 'enrollment_date', 'gender']
    search_fields = ['student_id', 'first_name', 'last_name', 'email']
    ordering = ['last_name', 'first_name']
    fieldsets = (
        ('Personal Information', {
            'fields': ('student_id', 'first_name', 'last_name', 'email', 'date_of_birth', 'gender')
        }),
        ('Contact Information', {
            'fields': ('phone', 'address')
        }),
        ('Academic Information', {
            'fields': ('enrollment_date', 'status')
        }),
        ('Guardian Information', {
            'fields': ('guardian_name', 'guardian_phone', 'guardian_email'),
            'classes': ('collapse',)
        }),
    )
