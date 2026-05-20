from django.urls import path

from . import api_views

urlpatterns = [
    path("auth/csrf/", api_views.csrf_token_view, name="api_csrf"),
    path("auth/me/", api_views.CurrentUserAPIView.as_view(), name="api_current_user"),
    path("auth/login/", api_views.LoginAPIView.as_view(), name="api_login"),
    path("auth/register/", api_views.RegisterAPIView.as_view(), name="api_register"),
    path("auth/logout/", api_views.LogoutAPIView.as_view(), name="api_logout"),
    path("listings/", api_views.ListingListCreateAPIView.as_view(), name="api_listings"),
    path("listings/<int:listing_id>/", api_views.ListingDetailAPIView.as_view(), name="api_listing_detail"),
    path("listings/<int:listing_id>/bid/", api_views.ListingBidAPIView.as_view(), name="api_listing_bid"),
    path("listings/<int:listing_id>/comment/", api_views.ListingCommentAPIView.as_view(), name="api_listing_comment"),
    path("listings/<int:listing_id>/watchlist/", api_views.ListingWatchlistAPIView.as_view(), name="api_listing_watchlist"),
    path("listings/<int:listing_id>/close/", api_views.ListingCloseAPIView.as_view(), name="api_listing_close"),
    path("watchlist/", api_views.WatchlistAPIView.as_view(), name="api_watchlist"),
    path("categories/", api_views.CategoryListAPIView.as_view(), name="api_categories"),
]
