export default class PostOffice {
  constructor(worker) {
    this.worker = worker;
    this.messageId = 0;
    this.correspondents = {};
    this.subscriptions = {};

    this.worker.addEventListener('message', event => this.responder(event.data));
  }

  subscribe(eventName, callback) {
    if (typeof this.subscriptions[eventName] !== "object") {
      this.subscriptions[eventName] = [];
    }

    this.subscriptions[eventName].push(callback);
    this.worker.postMessage({command: 'subscribe', eventName: eventName});
  }

  unsubscribe(eventName, callback) {
    if (typeof this.subscriptions[eventName] === "object") {
      var i = this.subscriptions[eventName].indexOf(callback);
      this.subscriptions[eventName].splice(i, 1);

      // If there's no more callbacks waiting on this event, let the worker
      // know not to bother anymore.
      if (this.subscriptions[eventName].length === 0) {
        this.worker.postMessage({command: 'unsubscribe', eventName: eventName});
      }
    }
  }

  async send(message, callback) {
    const returnAddress = this.messageId++;
    this.correspondents[returnAddress] = callback;
    this.worker.postMessage({returnAddress, message});
  }

  responder(responseEnvelope) {
    const recipient = this.correspondents[responseEnvelope.returnAddress];
    const response = responseEnvelope.response;
    if (typeof recipient === 'function') {
      recipient(response);
    }
    delete this.correspondents[responseEnvelope.returnAddress];
  }
}
