from django.contrib import admin
from .models import Attendance

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['student', 'class_name', 'date', 'status', 'check_in_time', 'marked_by']
    list_filter = ['status', 'date', 'class_name']
    search_fields = ['student__first_name', 'student__last_name', 'class_name__class_name']
    ordering = ['-date', 'student__last_name']
    fieldsets = (
        ('Attendance Information', {
            'fields': ('student', 'class_name', 'date', 'status')
        }),
        ('Time Information', {
            'fields': ('check_in_time', 'check_out_time'),
            'classes': ('collapse',)
        }),
        ('Additional Information', {
            'fields': ('notes', 'marked_by')
        }),
    )

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        # Set the default marked_by to current user when creating
        if obj is None:
            form.base_fields['marked_by'].initial = request.user
        return form
