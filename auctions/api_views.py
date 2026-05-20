from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.db.models import Count, Q
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Auction, Bid, Comment, User
from .serializers import (
    AuctionCreateSerializer,
    AuctionDetailSerializer,
    AuctionSerializer,
    BidCreateSerializer,
    CommentCreateSerializer,
)


def _watchlist_ids_for_user(user):
    if not user.is_authenticated:
        return set()
    return set(user.watchlist.values_list("id", flat=True))


def _current_price_for_listing(listing):
    highest_bid = listing.bid_set.order_by("-amount", "-created_at").first()
    return highest_bid.amount if highest_bid else listing.start_price


@api_view(["GET"])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf_token_view(request):
    return Response({"csrfToken": get_token(request)})


class CurrentUserAPIView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"authenticated": False})

        return Response(
            {
                "authenticated": True,
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
            }
        )


class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username", "")
        password = request.data.get("password", "")

        if not username or not password:
            return Response(
                {"detail": "Username and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response(
                {"detail": "Invalid username and/or password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        login(request, user)
        return Response(
            {
                "detail": "Logged in successfully.",
                "authenticated": True,
                "id": user.id,
                "username": user.username,
                "email": user.email,
            }
        )


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username", "")
        email = request.data.get("email", "")
        password = request.data.get("password", "")
        confirmation = request.data.get("confirmation", "")

        if not username or not email or not password or not confirmation:
            return Response(
                {"detail": "Username, email, password, and confirmation are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if password != confirmation:
            return Response(
                {"detail": "Passwords must match."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return Response(
                {"detail": "Username already taken."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        login(request, user)
        return Response(
            {
                "detail": "Registered successfully.",
                "authenticated": True,
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )


class LogoutAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logout(request)
        return Response({"detail": "Logged out successfully."})


class ListingListCreateAPIView(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request):
        category = request.query_params.get("category")
        queryset = Auction.objects.filter(isActive=True).select_related("owner", "winner")

        if category:
            if category == "None":
                queryset = queryset.filter(Q(category__isnull=True) | Q(category=""))
            else:
                queryset = queryset.filter(category=category)

        queryset = queryset.order_by("-created_at")
        serializer = AuctionSerializer(
            queryset,
            many=True,
            context={
                "request": request,
                "watchlist_ids": _watchlist_ids_for_user(request.user),
            },
        )
        return Response(serializer.data)

    def post(self, request):
        serializer = AuctionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        listing = serializer.save(owner=request.user)

        response_serializer = AuctionDetailSerializer(
            listing,
            context={
                "request": request,
                "watchlist_ids": _watchlist_ids_for_user(request.user),
            },
        )
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class ListingDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, listing_id):
        listing = get_object_or_404(
            Auction.objects.select_related("owner", "winner"),
            pk=listing_id,
        )
        serializer = AuctionDetailSerializer(
            listing,
            context={
                "request": request,
                "watchlist_ids": _watchlist_ids_for_user(request.user),
            },
        )
        return Response(serializer.data)


class ListingBidAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, listing_id):
        listing = get_object_or_404(Auction, pk=listing_id)
        if not listing.isActive:
            return Response(
                {"detail": "This auction is closed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = BidCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        current_price = _current_price_for_listing(listing)
        bid_amount = serializer.validated_data["amount"]
        if bid_amount <= current_price:
            return Response(
                {"detail": f"Bid must be greater than the current price ({current_price})."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        bid = Bid.objects.create(auction=listing, user=request.user, amount=bid_amount)
        return Response(
            {
                "detail": "Bid placed successfully.",
                "bid": {
                    "id": bid.id,
                    "amount": bid.amount,
                },
                "current_price": bid.amount,
            },
            status=status.HTTP_201_CREATED,
        )


class ListingCommentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, listing_id):
        listing = get_object_or_404(Auction, pk=listing_id)
        serializer = CommentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        comment = Comment.objects.create(
            auction=listing,
            user=request.user,
            content=serializer.validated_data["content"],
        )
        return Response(
            {
                "detail": "Comment added successfully.",
                "comment": {
                    "id": comment.id,
                    "content": comment.content,
                    "created_at": comment.created_at,
                    "user": {
                        "id": request.user.id,
                        "username": request.user.username,
                    },
                },
            },
            status=status.HTTP_201_CREATED,
        )


class ListingWatchlistAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, listing_id):
        listing = get_object_or_404(Auction, pk=listing_id)
        if request.user.watchlist.filter(pk=listing.pk).exists():
            request.user.watchlist.remove(listing)
            is_in_watchlist = False
            action = "removed"
        else:
            request.user.watchlist.add(listing)
            is_in_watchlist = True
            action = "added"

        return Response(
            {
                "detail": f"Listing {action} from watchlist.",
                "is_in_watchlist": is_in_watchlist,
            }
        )


class ListingCloseAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, listing_id):
        listing = get_object_or_404(Auction, pk=listing_id)
        if request.user != listing.owner:
            return Response(
                {"detail": "Only the listing owner can close this auction."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not listing.isActive:
            return Response({"detail": "This auction is already closed."})

        listing.isActive = False
        highest_bid = listing.bid_set.order_by("-amount", "-created_at").first()
        if highest_bid:
            listing.winner = highest_bid.user
        listing.save()

        return Response(
            {
                "detail": "Auction closed successfully.",
                "winner": listing.winner.username if listing.winner else None,
            }
        )


class WatchlistAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = request.user.watchlist.select_related("owner", "winner").order_by("-created_at")
        serializer = AuctionSerializer(
            queryset,
            many=True,
            context={
                "request": request,
                "watchlist_ids": _watchlist_ids_for_user(request.user),
            },
        )
        return Response(serializer.data)


class CategoryListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = (
            Auction.objects.filter(isActive=True)
            .values("category")
            .annotate(count=Count("id"))
            .order_by("category")
        )

        payload = []
        uncategorized_count = 0

        for item in categories:
            value = item["category"]
            if value in (None, ""):
                uncategorized_count += item["count"]
                continue

            payload.append(
                {
                    "label": value,
                    "value": value,
                    "count": item["count"],
                }
            )

        if uncategorized_count:
            payload.append(
                {
                    "label": "Uncategorized",
                    "value": None,
                    "count": uncategorized_count,
                }
            )

        return Response(payload)
