import express from "express";
import bodyParser from "body-parser";

// Import your API route handlers
import * as ordersRoute from "./app/api/orders/route";

const app = express();
app.use(bodyParser.json());

// Map Next.js-style handlers to Express routes
app.get("/api/orders", (req, res) => {
  ordersRoute.GET().then((response) => {
    res.status(response.status || 200).json(response.body || response);
  });
});

app.post("/api/orders", (req, res) => {
  const mockReq: any = {
    json: async () => req.body,
    url: req.url,
  };
  ordersRoute.POST(mockReq).then((response) => {
    res.status(response.status || 200).json(response.body || response);
  });
});

app.delete("/api/orders", (req, res) => {
  const mockReq: any = {
    url: req.originalUrl,
  };
  ordersRoute.DELETE(mockReq).then((response) => {
    res.status(response.status || 200).json(response.body || response);
  });
});

export { app };
