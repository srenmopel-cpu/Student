from rest_framework.routers import DefaultRouter
from .api_views import StudentViewSet

router = DefaultRouter()
router.register(r'', StudentViewSet)  # Remove 'students' prefix since it's already in the URL path

urlpatterns = router.urls