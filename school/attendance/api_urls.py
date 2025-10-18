from rest_framework.routers import DefaultRouter
from .api_views import AttendanceViewSet

router = DefaultRouter()
router.register(r'', AttendanceViewSet)  # Remove 'attendance' prefix since it's already in the URL path

urlpatterns = router.urls