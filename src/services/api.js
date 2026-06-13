
import axios from "axios";
import { setupCache } from "axios-cache-interceptor";

export const api = setupCache(
  axios.create({
    baseURL: "https://api.jikan.moe/v4",
  })
);