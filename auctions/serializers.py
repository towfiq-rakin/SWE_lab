from rest_framework import serializers

from .models import Auction, Bid, Comment


class UserSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)


class BidSerializer(serializers.ModelSerializer):
    user = UserSummarySerializer(read_only=True)

    class Meta:
        model = Bid
        fields = ["id", "amount", "created_at", "updated_at", "user"]


class CommentSerializer(serializers.ModelSerializer):
    user = UserSummarySerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "content", "created_at", "updated_at", "user"]


class AuctionSerializer(serializers.ModelSerializer):
    owner = UserSummarySerializer(read_only=True)
    winner = UserSummarySerializer(read_only=True)
    current_price = serializers.SerializerMethodField()
    bids_count = serializers.SerializerMethodField()
    is_in_watchlist = serializers.SerializerMethodField()

    class Meta:
        model = Auction
        fields = [
            "id",
            "title",
            "description",
            "start_price",
            "image_url",
            "created_at",
            "updated_at",
            "category",
            "isActive",
            "owner",
            "winner",
            "current_price",
            "bids_count",
            "is_in_watchlist",
        ]

    def get_current_price(self, obj):
        highest_bid = obj.bid_set.order_by("-amount", "-created_at").first()
        return highest_bid.amount if highest_bid else obj.start_price

    def get_bids_count(self, obj):
        return obj.bid_set.count()

    def get_is_in_watchlist(self, obj):
        watchlist_ids = self.context.get("watchlist_ids", set())
        return obj.pk in watchlist_ids


class AuctionDetailSerializer(AuctionSerializer):
    bids = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    highest_bid = serializers.SerializerMethodField()
    user_is_owner = serializers.SerializerMethodField()

    class Meta(AuctionSerializer.Meta):
        fields = AuctionSerializer.Meta.fields + [
            "bids",
            "comments",
            "highest_bid",
            "user_is_owner",
        ]

    def get_bids(self, obj):
        bids = obj.bid_set.order_by("-amount", "-created_at")
        return BidSerializer(bids, many=True).data

    def get_comments(self, obj):
        comments = obj.comment_set.order_by("-created_at")
        return CommentSerializer(comments, many=True).data

    def get_highest_bid(self, obj):
        highest_bid = obj.bid_set.order_by("-amount", "-created_at").first()
        if not highest_bid:
            return None
        return BidSerializer(highest_bid).data

    def get_user_is_owner(self, obj):
        request = self.context.get("request")
        return bool(request and request.user.is_authenticated and request.user == obj.owner)


class AuctionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Auction
        fields = ["title", "description", "start_price", "image_url", "category"]

    def validate(self, attrs):
        attrs["image_url"] = attrs.get("image_url") or None
        attrs["category"] = attrs.get("category") or None
        return attrs


class BidCreateSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)


class CommentCreateSerializer(serializers.Serializer):
    content = serializers.CharField()

    def validate_content(self, value):
        content = value.strip()
        if not content:
            raise serializers.ValidationError("Comment content cannot be empty.")
        return content
