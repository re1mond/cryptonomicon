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
let tickersToConvert = [];
let aliveConnections = [];

const socket = new WebSocket(`${SOCKET_URL}?api_key=${API_KEY}`);

socket.addEventListener("message", msg => {
  const UPDATE_TYPE = "5";
  const INVALID_SUB_TYPE = "500";

  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
    PARAMETER: parameter
  } = JSON.parse(msg.data);

  if (type === UPDATE_TYPE && newPrice !== undefined) {
    if (!aliveConnections.includes(currency)) {
      aliveConnections.push(currency);
    }

    const handlers = tickersHandlers[currency] ?? [];
    handlers.forEach(handler => handler({ price: newPrice, type: "success" }));
  }

  if (type === INVALID_SUB_TYPE) {
    const missedCurrency = parameter.split("~")[2];

    // Если тиккер был добавлен на конвертаци - возращаем ошибку
    if (tickersToConvert.includes(missedCurrency)) {
      const handlers = tickersHandlers[missedCurrency] ?? [];
      handlers.forEach(handler => handler({ type: "error" }));
      return;
    }

    // Если тиккер не добавлен на ковертацию - добавляем
    tickersToConvert.push(missedCurrency);
    const handlers = tickersHandlers[missedCurrency] ?? [];
    handlers.forEach(handler => handler({ type: "pending" }));

    // Подписываем на обновление тиккера к битку
    subscribeToTicker({ fsym: missedCurrency, tsym: "BTC" }, updateMsg => {
      if (updateMsg.type === "success") {
        subscribeToTicker(
          { fsym: "BTC", tsym: "USD" },
          ({ price: btcPrice }) => {
            handlers.forEach(handler =>
              handler({ type: "success", price: btcPrice * updateMsg.price })
            );
          }
        );

        tickersToConvert = tickersToConvert.filter(
          ticker => ticker !== missedCurrency
        );
      }
    });
  }
});

function subscribeToTicker({ fsym, tsym }, cb) {
  const subscribers = tickersHandlers[fsym] || [];
  tickersHandlers[fsym] = [...subscribers, cb];

  subscribeToTickerOnSocket(fsym, tsym);
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

function subscribeToTickerOnSocket(ticker, tsym) {
  if (aliveConnections.includes(ticker)) {
    return;
  }

  const msgToSend = JSON.stringify({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~${tsym}`]
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

window.a = tickersToConvert;

export { getCoinsList, subscribeToTicker, unsubscribeFromTicker };
