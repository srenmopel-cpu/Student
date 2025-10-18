from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Class
from .serializers import ClassSerializer

class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for development

    def get_queryset(self):
        # Ensure we return a queryset, not a list
        return Class.objects.all()

    def create(self, request, *args, **kwargs):
        print("API Create called with data:", request.data)
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            print("API Create error:", str(e))
            print("Serializer errors:", serializer.errors if 'serializer' in locals() else "No serializer")
            raise

    def update(self, request, *args, **kwargs):
        print("API Update called with data:", request.data)
        return super().update(request, *args, **kwargs)