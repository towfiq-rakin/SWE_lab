const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const fallbackImage =
  "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80";

export function formatCurrency(value) {
  const number = Number(value || 0);
  return currencyFormatter.format(Number.isNaN(number) ? 0 : number);
}

export function formatDate(value) {
  if (!value) {
    return "Unknown date";
  }
  return dateFormatter.format(new Date(value));
}

export function getListingImage(imageUrl) {
  return imageUrl || fallbackImage;
}
