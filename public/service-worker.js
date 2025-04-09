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
      response = this.publish(message.eventName, message.data);
      break;

    case 'subscribe':
      response = this.subscribe(message.eventName, source);
      break;

    case 'unsubscribe':
      response = this.unsubscribe(message.eventName, source);
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

  publish(eventName, data) {
    if (typeof this.subscriptions[eventName] === "object") {
      for (const source of this.subscriptions[eventName]) {
        source.postMessage({eventName, data});
      }
    }
  }

  subscribe(eventName, source) {
    if (typeof this.subscriptions[eventName] === "undefined") {
      this.subscriptions[eventName] = [];
    }

    // We don't need to add this source if it's already in the list.
    if (this.subscriptions[eventName].indexOf(source) < 0) {
      this.subscriptions[eventName].push(source);
    }
  }

  unsubscribe(eventName, source) {
    const i = this.subscriptions[eventName].indexOf(source);
    if (i >= 0) {
      this.subscriptions[eventName].splice(i, 1);
    }
  }
}

// Actually set up the handler.
const w = new MyWorker();

self.addEventListener("message", event => {
  w.dispatcher(event);
});
