from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.shortcuts import render, get_object_or_404

from django.contrib.auth.decorators import login_required
from .models import User, Auction, Bid, Comment


def index(request):
    category = request.GET.get("category")
    if category:
        if category == "None":
             listings = Auction.objects.filter(isActive=True, category__isnull=True)
        else:
             listings = Auction.objects.filter(isActive=True, category=category)
    else:
        listings = Auction.objects.filter(isActive=True)
    
    return render(request, "auctions/index.html", {
        "listings": listings
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")


@login_required
def create_listing(request):
    if request.method == "POST":
        title = request.POST["title"]
        description = request.POST["description"]
        start_price = request.POST["start_price"]
        image_url = request.POST["image_url"]
        category = request.POST["category"]

        listing = Auction(
            title=title,
            description=description,
            start_price=start_price,
            image_url=image_url,
            category=category,
            owner=request.user
        )
        listing.save()
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/create.html")


def listing(request, listing_id):
    listing = get_object_or_404(Auction, pk=listing_id)
    is_in_watchlist = False
    if request.user.is_authenticated:
        is_in_watchlist = request.user.watchlist.filter(pk=listing_id).exists()

    bids = Bid.objects.filter(auction=listing).order_by('-amount')
    highest_bid = bids.first()
    current_price = highest_bid.amount if highest_bid else listing.start_price
    
    comments = Comment.objects.filter(auction=listing).order_by('-created_at')

    return render(request, "auctions/listing.html", {
        "listing": listing,
        "is_in_watchlist": is_in_watchlist,
        "current_price": current_price,
        "bids_count": bids.count(),
        "comments": comments,
        "user_is_owner": request.user == listing.owner,
        "highest_bid": highest_bid
    })


@login_required
def place_bid(request, listing_id):
    if request.method == "POST":
        listing = get_object_or_404(Auction, pk=listing_id)
        amount = float(request.POST["bid"])
        
        bids = Bid.objects.filter(auction=listing).order_by('-amount')
        highest_bid = bids.first()
        current_price = highest_bid.amount if highest_bid else listing.start_price

        if amount > current_price:
            Bid.objects.create(user=request.user, auction=listing, amount=amount)
            # You might want to display a success message here, but for now redirect
        else:
            # Handle error (maybe pass error via session or context on redirect - keeping simple for now)
            pass
            
        return HttpResponseRedirect(reverse("listing", args=(listing_id,)))
    return HttpResponseRedirect(reverse("index"))


@login_required
def close_auction(request, listing_id):
    if request.method == "POST":
        listing = get_object_or_404(Auction, pk=listing_id)
        if request.user == listing.owner:
            listing.isActive = False
            
            bids = Bid.objects.filter(auction=listing).order_by('-amount')
            highest_bid = bids.first()
            if highest_bid:
                listing.winner = highest_bid.user
            
            listing.save()
            
        return HttpResponseRedirect(reverse("listing", args=(listing_id,)))
    return HttpResponseRedirect(reverse("index"))


@login_required
def add_comment(request, listing_id):
    if request.method == "POST":
        listing = get_object_or_404(Auction, pk=listing_id)
        content = request.POST["content"]
        Comment.objects.create(user=request.user, auction=listing, content=content)
        return HttpResponseRedirect(reverse("listing", args=(listing_id,)))
    return HttpResponseRedirect(reverse("index"))


@login_required
def toggle_watchlist(request, listing_id):
    if request.method == "POST":
        listing = get_object_or_404(Auction, pk=listing_id)
        if request.user.watchlist.filter(pk=listing_id).exists():
            request.user.watchlist.remove(listing)
        else:
            request.user.watchlist.add(listing)
        return HttpResponseRedirect(reverse("listing", args=(listing_id,)))
    return HttpResponseRedirect(reverse("index"))

@login_required
def watchlist(request):
    listings = request.user.watchlist.all()
    return render(request, "auctions/watchlist.html", {
        "listings": listings
    })

def categories(request):
    return render(request, "auctions/categories.html", {
        "categories": Auction.objects.values_list('category', flat=True).distinct()
    })
