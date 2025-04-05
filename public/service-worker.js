self.addEventListener("install", (event) => {
  console.log("Installed");
});

self.addEventListener("activate", (event) => {
  console.log("Activated");
});

self.addEventListener("message", event => {
  console.log("Got msg", event.data);

  event.source.postMessage(`I heard ${event.data}`);
});
