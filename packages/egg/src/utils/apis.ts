import axios from "axios";

export const imgur = axios.create({
  baseURL: "https://api.imgur.com/3",
  headers: {
    "User-Agent": "sussy/amogus:1.0.0",
    "Authorization": `Client-ID ${process.env.IMGUR_CLIENT_ID}`
  }
})