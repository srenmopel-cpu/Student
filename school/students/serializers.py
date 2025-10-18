from rest_framework import serializers
from .models import Student

class StudentSerializer(serializers.ModelSerializer):
    class_enrolled = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.none(),  # Will be set in __init__ to avoid circular import
        allow_null=True,
        required=False
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Import here to avoid circular import
        from classes.models import Class
        self.fields['class_enrolled'].queryset = Class.objects.all()

    class Meta:
        model = Student
        fields = ['id', 'student_id', 'first_name', 'last_name', 'email', 'date_of_birth',
                 'gender', 'phone', 'address', 'enrollment_date', 'status', 'class_enrolled',
                 'guardian_name', 'guardian_phone', 'guardian_email', 'created_at', 'updated_at']
        read_only_fields = ['id', 'enrollment_date', 'created_at', 'updated_at']

    def validate_student_id(self, value):
        # Check uniqueness only for new instances or if value changed
        queryset = Student.objects.filter(student_id=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("Student ID must be unique.")
        return value

    def validate_email(self, value):
        # Check uniqueness only for new instances or if value changed
        queryset = Student.objects.filter(email=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("Email must be unique.")
        return value