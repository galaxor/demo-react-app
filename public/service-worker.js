class MyWorker {
  constructor() {
    this.subscriptions = {};
  }

  dispatcher(event) {
    const source = event.source;
    const envelope = event.data;
    const message = envelope.message;

    var response;

    if (typeof message !== "object") {
      return;
    }

    switch (message.command) {
    case 'ping':
      response = this.ping(message);
      break;

    case 'publish':
      response = this.publish(event);
      break;

    case 'subscribe':
      response = this.subscribe(message.eventName, envelope, source);
      break;

    case 'unsubscribe':
      response = this.unsubscribe(message.eventName, id);
      break;

    default:
      return;
    }

    this.respond(source, envelope, response);
  }

  respond(source, envelope, response) {
    source.postMessage({returnAddress: envelope.returnAddress, response});
  }

  ping(message) {
    return {pong: 'pong', message: message.message};
  }

  subscribe(eventName, envelope, source) {
    if (typeof this.subscriptions[eventName] === "undefined") {
      this.subscriptions[eventName] = {};
    }

    console.log("SOURC", envelope, source);

    return "Check the sw console.";

    // const uuid = crypto.randomUUID();
    // this.subscriptions[eventName][uuid] = 
  }

  unsubscribe(eventName) {
  }
}

// Actually set up the handler.
const w = new MyWorker();


self.addEventListener("install", (event) => {
  console.log("Installed");
});

self.addEventListener("activate", (event) => {
  console.log("Activated");
});

self.addEventListener("message", event => {
  w.dispatcher(event);
});
