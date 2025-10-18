from rest_framework import serializers
from .models import Attendance

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    class_display = serializers.CharField(source='class_name.class_name', read_only=True)
    duration = serializers.ReadOnlyField()

    class Meta:
        model = Attendance
        fields = ['id', 'student', 'student_name', 'class_name', 'class_display',
                  'date', 'status', 'check_in_time', 'check_out_time', 'duration',
                  'notes', 'marked_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'duration', 'created_at', 'updated_at']