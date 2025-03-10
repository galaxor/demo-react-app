export default class PostOffice {
  constructor(worker) {
    this.worker = worker;
    this.messageId = 0;
    this.correspondents = {};

    this.worker.addEventListener('message', event => this.responder(event.data));
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
