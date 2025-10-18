"""
URL configuration for school project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from classes.api_views import ClassViewSet
from students.api_views import StudentViewSet

router = DefaultRouter()
router.register(r'classes', ClassViewSet)
router.register(r'students', StudentViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('students.auth_urls')),
    path('api/', include(router.urls)),
    path('api/subjects/', include('subjects.api_urls')),
    path('api/grades/', include('grades.api_urls')),
    path('api/attendance/', include('attendance.api_urls')),
]