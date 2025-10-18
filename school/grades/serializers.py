from rest_framework import serializers
from .models import Grade

class GradeSerializer(serializers.ModelSerializer):
    percentage = serializers.ReadOnlyField()
    letter_grade = serializers.ReadOnlyField()
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    subject_name = serializers.CharField(source='subject.subject_name', read_only=True)
    class_name = serializers.CharField(source='class_id.class_name', read_only=True)

    class Meta:
        model = Grade
        fields = ['id', 'student', 'student_name', 'subject', 'subject_name',
                  'class_id', 'class_name', 'grade_value', 'max_grade',
                  'grade_type', 'title', 'description', 'percentage',
                  'letter_grade', 'graded_by', 'graded_at', 'created_at', 'updated_at']
        read_only_fields = ['id', 'percentage', 'letter_grade', 'created_at', 'updated_at']