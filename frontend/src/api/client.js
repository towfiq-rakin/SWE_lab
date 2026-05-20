import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

function getCookieValue(name) {
  if (typeof document === "undefined") {
    return "";
  }
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));
  if (!cookie) {
    return "";
  }
  return decodeURIComponent(cookie.split("=").slice(1).join("="));
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

apiClient.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();
  const isUnsafeMethod = ["post", "put", "patch", "delete"].includes(method);

  if (isUnsafeMethod) {
    const csrfToken = getCookieValue("csrftoken");
    if (csrfToken) {
      config.headers = {
        ...config.headers,
        "X-CSRFToken": csrfToken,
      };
    }
  }

  return config;
});

export function getErrorMessage(error) {
  const data = error.response?.data;
  if (typeof data === "string" && data) {
    return data;
  }
  if (data?.detail) {
    return data.detail;
  }
  if (data && typeof data === "object") {
    const firstValue = Object.values(data)[0];
    if (Array.isArray(firstValue) && firstValue[0]) {
      return firstValue[0];
    }
    if (typeof firstValue === "string") {
      return firstValue;
    }
  }
  return error.message || "Something went wrong.";
}

async function ensureCsrfCookie() {
  if (!getCookieValue("csrftoken")) {
    await apiClient.get("/auth/csrf/");
  }
}

export async function fetchCurrentUser() {
  const response = await apiClient.get("/auth/me/");
  return response.data;
}

export async function loginUser(payload) {
  await ensureCsrfCookie();
  const response = await apiClient.post("/auth/login/", payload);
  return response.data;
}

export async function registerUser(payload) {
  await ensureCsrfCookie();
  const response = await apiClient.post("/auth/register/", payload);
  return response.data;
}

export async function logoutUser() {
  await ensureCsrfCookie();
  const response = await apiClient.post("/auth/logout/");
  return response.data;
}

export async function fetchListings(category) {
  const params = {};
  if (category) {
    params.category = category;
  }
  const response = await apiClient.get("/listings/", { params });
  return response.data;
}

export async function fetchListingDetail(listingId) {
  const response = await apiClient.get(`/listings/${listingId}/`);
  return response.data;
}

export async function createListing(payload) {
  await ensureCsrfCookie();
  const response = await apiClient.post("/listings/", payload);
  return response.data;
}

export async function placeBid(listingId, amount) {
  await ensureCsrfCookie();
  const response = await apiClient.post(`/listings/${listingId}/bid/`, { amount });
  return response.data;
}

export async function addComment(listingId, content) {
  await ensureCsrfCookie();
  const response = await apiClient.post(`/listings/${listingId}/comment/`, { content });
  return response.data;
}

export async function toggleWatchlist(listingId) {
  await ensureCsrfCookie();
  const response = await apiClient.post(`/listings/${listingId}/watchlist/`);
  return response.data;
}

export async function closeAuction(listingId) {
  await ensureCsrfCookie();
  const response = await apiClient.post(`/listings/${listingId}/close/`);
  return response.data;
}

export async function fetchWatchlist() {
  const response = await apiClient.get("/watchlist/");
  return response.data;
}

export async function fetchCategories() {
  const response = await apiClient.get("/categories/");
  return response.data;
}
