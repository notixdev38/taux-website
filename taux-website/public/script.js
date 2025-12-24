function openPage(id) {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  document.getElementById(id).style.display = "block";
}

openPage("dashboard");

/* ===== Achievements ===== */
fetch("/api/achievements")
  .then(res => res.json())
  .then(images => {
    const gallery = document.getElementById("gallery");
    images.forEach(src => {
      const img = document.createElement("img");
      img.src = src;
      gallery.appendChild(img);
    });
  });

/* ===== OAuth User ===== */
fetch("/api/user")
  .then(res => res.json())
  .then(user => {
    if (!user) return;
    document.getElementById("user").innerHTML = `
      <p>${user.username}</p>
      <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png">
    `;
  });
