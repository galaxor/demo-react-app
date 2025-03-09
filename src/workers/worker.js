// importScripts(new URL('/src/logic/test.js', import.meta.url));
import Doot from '../logic/test.js'

onmessage = event => {
  Doot(event.data);
  console.log("Doot", event.data);
};
