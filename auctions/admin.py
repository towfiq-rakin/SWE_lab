from django.contrib import admin

from .models import User, Auction, Bid, Comment

class AuctionAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "start_price", "category", "isActive", "created_at")

class BidAdmin(admin.ModelAdmin):
    list_display = ("user", "amount", "auction", "created_at")

class CommentAdmin(admin.ModelAdmin):
    list_display = ("user", "auction", "created_at")

admin.site.register(User)
admin.site.register(Auction, AuctionAdmin)
admin.site.register(Bid, BidAdmin)
admin.site.register(Comment, CommentAdmin)
