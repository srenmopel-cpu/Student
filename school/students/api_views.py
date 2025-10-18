from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Student
from .serializers import StudentSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for development

    @action(detail=True, methods=['get'])
    def grades(self, request, pk=None):
        student = self.get_object()
        grades = student.grade_set.all()
        # You can create a grade serializer here if needed
        grades_data = [{
            'id': grade.id,
            'subject': grade.subject.subject_name,
            'grade_value': grade.grade_value,
            'max_grade': grade.max_grade,
            'grade_type': grade.grade_type,
            'title': grade.title,
            'graded_date': grade.graded_date
        } for grade in grades]
        return Response(grades_data)

    @action(detail=True, methods=['get'])
    def attendance(self, request, pk=None):
        student = self.get_object()
        attendance_records = student.attendance_set.all()
        attendance_data = [{
            'id': record.id,
            'class_name': record.class_name.class_name,
            'date': record.date,
            'status': record.status,
            'check_in_time': record.check_in_time,
            'check_out_time': record.check_out_time
        } for record in attendance_records]
        return Response(attendance_data)