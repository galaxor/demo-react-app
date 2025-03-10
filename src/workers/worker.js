import Database from '../logic/database.js'
import sha256 from '../include/sha256.js'


class MyWorker {
  constructor() {
    this.db = new Database();
    onmessage = async event => this.dispatcher(event);
  }

  async dispatcher(event) {
    const envelope = event.data;
    const message = envelope.message;

    var response;

    switch (message.command) {
    case 'init':
      response = await this.init(message.serverUrl);
      break;

    case 'ding':
      response = await this.ding(message.message);
      break;

    case 'fetchImage':
      response = await this.fetchImage(message.url);
      break;
    }

    console.log("Doot", event.data, response);
    this.respond(envelope, response);
  }

  async init(serverUrl) {
    await this.db.open(serverUrl);
    return "ready";
  }

  ding(message) {
    console.log("Ding", message);
    return {ding: message};
  }

  respond(envelope, response) {
    postMessage({returnAddress: envelope.returnAddress, response});
  }

  async fetchImage(url) {
    const hash = await this.db.uploadImage(url);
    return hash;
  }
}

// Actually set up the handler.
const w = new MyWorker();
