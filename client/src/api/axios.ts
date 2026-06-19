import axios from "axios";

export const subscriptionBlockedMessage =
  "Your workspace subscription is not active. Please contact support.";

export const api = axios.create({
  baseURL: "http://localhost:5001/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message;

    if (
      error.response?.status === 403 &&
      message === subscriptionBlockedMessage &&
      window.location.pathname !== "/subscription-blocked"
    ) {
      window.location.assign("/subscription-blocked");
    }

    return Promise.reject(error);
  },
);
