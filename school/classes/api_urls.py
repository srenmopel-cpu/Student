from rest_framework.routers import DefaultRouter
from .api_views import ClassViewSet

router = DefaultRouter()
router.register(r'', ClassViewSet)  # Remove 'classes' prefix since it's already in the URL path

urlpatterns = router.urls