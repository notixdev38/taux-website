const express = require("express");
const session = require("express-session");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
  secret: "taux_secret_key",
  resave: false,
  saveUninitialized: false
}));

app.use(express.static("public"));

/* ================= ACHIEVEMENTS ================= */
app.get("/api/achievements", (req, res) => {
  const dir = path.join(__dirname, "public", "achievements");
  if (!fs.existsSync(dir)) return res.json([]);

  const files = fs.readdirSync(dir).filter(file =>
    /\.(png|jpg|jpeg|gif|webp)$/i.test(file)
  );

  res.json(files.map(f => `/achievements/${f}`));
});

/* ================= DISCORD OAUTH ================= */
app.get("/auth/discord", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    redirect_uri: process.env.BASE_URL + "/auth/callback",
    response_type: "code",
    scope: "identify guilds"
  });

  res.redirect("https://discord.com/api/oauth2/authorize?" + params.toString());
});

app.get("/auth/callback", async (req, res) => {
  if (!req.query.code) return res.redirect("/");

  const data = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: "authorization_code",
    code: req.query.code,
    redirect_uri: process.env.BASE_URL + "/auth/callback"
  });

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: data
  });

  const token = await tokenRes.json();

  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token.access_token}` }
  });

  const user = await userRes.json();
  req.session.user = user;

  res.redirect("/");
});

/* ================= USER API ================= */
app.get("/api/user", (req, res) => {
  res.json(req.session.user || null);
});

app.listen(PORT, () => {
  console.log("Taux Website läuft auf Port " + PORT);
});
