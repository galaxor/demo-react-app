import Database from '../logic/database.js'


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
    }

    console.log("Doot", event.data);
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
}

// Actually set up the handler.
const w = new MyWorker();
