export default class PostOffice {

  // This can be used to communicate with either a worker or a service worker.
  // If it's a worker, we send to and receive from the same place.  If it's a
  // service worker, we send to the active registration and receive from the
  // worker itself.
  // So if this is used to contact a worker, give it just the one argument --
  // the worker.
  // But if it's used for a service worker, put the active registration in the
  // first argument and put navigator.serviceWorker in the second argument.
  constructor(worker, serviceWorker) {
    this.sendTo = worker;
    this.receiveFrom = serviceWorker ?? worker;

    this.messageId = 0;
    this.correspondents = {};
    this.subscriptions = {};

    this.receiveFrom.addEventListener('message', event => this.responder(event.data));
  }

  subscribe(eventName, callback) {
    if (typeof this.subscriptions[eventName] !== "object") {
      this.subscriptions[eventName] = [];
    }

    this.subscriptions[eventName].push(callback);
    this.sendTo.postMessage({command: 'subscribe', eventName: eventName});
  }

  unsubscribe(eventName, callback) {
    if (typeof this.subscriptions[eventName] === "object") {
      var i = this.subscriptions[eventName].indexOf(callback);
      this.subscriptions[eventName].splice(i, 1);

      // If there's no more callbacks waiting on this event, let the worker
      // know not to bother anymore.
      if (this.subscriptions[eventName].length === 0) {
        this.sendTo.postMessage({command: 'unsubscribe', eventName: eventName});
      }
    }
  }

  async send(message, callback) {
    const returnAddress = this.messageId++;
    this.correspondents[returnAddress] = callback;
    this.sendTo.postMessage({returnAddress, message});
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
