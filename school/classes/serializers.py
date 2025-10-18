from rest_framework import serializers
from .models import Class

class ClassSerializer(serializers.ModelSerializer):
    current_enrollment = serializers.ReadOnlyField()
    available_seats = serializers.ReadOnlyField()
    class_teacher = serializers.PrimaryKeyRelatedField(
        queryset=Class.objects.none(),  # Will be set in __init__ to avoid circular import
        allow_null=True,
        required=False
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Import here to avoid circular import
        from django.contrib.auth.models import User
        self.fields['class_teacher'].queryset = User.objects.all()

    def validate_class_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Class name is required.")
        return value.strip()

    def validate_grade_level(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Grade level is required.")
        return value.strip()

    def validate_academic_year(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Academic year is required.")
        return value.strip()

    def validate_capacity(self, value):
        if value is None or value < 1:
            raise serializers.ValidationError("Capacity must be at least 1.")
        return value

    class Meta:
        model = Class
        fields = ['id', 'class_name', 'grade_level', 'section', 'academic_year',
                 'class_teacher', 'room_number', 'capacity', 'description',
                 'current_enrollment', 'available_seats', 'created_at', 'updated_at']
        read_only_fields = ['id', 'current_enrollment', 'available_seats', 'created_at', 'updated_at']