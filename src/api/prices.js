const API_KEY =
  "27335cf6f71ea9a5161d38c0182ecb305b0194550ebf9b429a9f283bcf62bd29";

const COIN_LIST_API_URL =
  "https://min-api.cryptocompare.com/data/all/coinlist?summary=true";

const SOCKET_URL = "wss://streamer.cryptocompare.com/v2";

async function getCoinsList() {
  return fetch(COIN_LIST_API_URL).then(response => {
    return response.json();
  });
}

const tickersHandlers = {};
const socket = new WebSocket(`${SOCKET_URL}?api_key=${API_KEY}`);

socket.addEventListener("message", msg => {
  const UPDATE_TYPE = "5";
  const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(
    msg.data
  );

  if (type === UPDATE_TYPE && newPrice !== undefined) {
    const handlers = tickersHandlers[currency] ?? [];
    handlers.forEach(handler => handler(newPrice));
  }
});

function subscribeToTicker(ticker, cb) {
  const subscribers = tickersHandlers[ticker] || [];
  tickersHandlers[ticker] = [...subscribers, cb];

  subscribeToTickerOnSocket(ticker);
}

function unsubscribeFromTicker(ticker) {
  delete tickersHandlers[ticker];

  unsubscribeFromTickerOnSocket(ticker);
}

function sendToSocket(message) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(message);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(message);
    },
    { once: true }
  );
}

function subscribeToTickerOnSocket(ticker) {
  const msgToSend = JSON.stringify({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`]
  });

  sendToSocket(msgToSend);
}

function unsubscribeFromTickerOnSocket(ticker) {
  const msgToSend = JSON.stringify({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`]
  });

  sendToSocket(msgToSend);
}

export { getCoinsList, subscribeToTicker, unsubscribeFromTicker };
