from django.urls import path
from . import views

app_name = 'classes'

urlpatterns = [
    path('', views.class_list, name='class_list'),
    path('create/', views.class_create, name='class_create'),
    path('<int:pk>/', views.class_detail, name='class_detail'),
    path('<int:pk>/edit/', views.class_update, name='class_update'),
    path('<int:pk>/delete/', views.class_delete, name='class_delete'),
]