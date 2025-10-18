from rest_framework.routers import DefaultRouter
from .api_views import GradeViewSet

router = DefaultRouter()
router.register(r'', GradeViewSet)  # Remove 'grades' prefix since it's already in the URL path

urlpatterns = router.urls