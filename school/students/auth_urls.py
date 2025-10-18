from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .auth_views import RegisterView, login_view, logout_view, user_profile
from django.contrib.auth.models import User
from rest_framework import viewsets, permissions
from rest_framework.response import Response

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for development

    def list(self, request):
        users = self.get_queryset()
        user_data = [{
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
        } for user in users]
        return Response(user_data)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', login_view, name='auth_login'),
    path('logout/', logout_view, name='auth_logout'),
    path('profile/', user_profile, name='auth_profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', UserViewSet.as_view({'get': 'list'}), name='user_list'),
]