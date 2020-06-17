import BCHJS from "@chris.troutner/bch-js";

const bchjs = new BCHJS({
  restURL: "https://api.fullstack.cash/v3/",
  apiToken:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlOGUzMGU2MDIyMWMxMDAxMmFkOTQwNyIsImVtYWlsIjoibGlnaHRzd2FybUBnbWFpbC5jb20iLCJhcGlMZXZlbCI6MCwicmF0ZUxpbWl0IjozLCJpYXQiOjE1OTEyMTIyNzEsImV4cCI6MTU5MzgwNDI3MX0.UZoJwGt52H4-MClC6HWIDGQInVBVGytWiPKO6ayEpUo"
});

export { bchjs };
