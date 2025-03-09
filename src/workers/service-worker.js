self.addEventListener("install", (event) => {
  console.log("Installed");
});

self.addEventListener("activate", (event) => {
  console.log("Activated");
});
