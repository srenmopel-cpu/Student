from rest_framework.routers import DefaultRouter
from .api_views import SubjectViewSet

router = DefaultRouter()
router.register(r'', SubjectViewSet)  # Remove 'subjects' prefix since it's already in the URL path

urlpatterns = router.urls