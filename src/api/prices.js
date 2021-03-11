const COURSES_API_URL = "https://min-api.cryptocompare.com/data/price";

const COURSES_API_KEY =
  "27335cf6f71ea9a5161d38c0182ecb305b0194550ebf9b429a9f283bcf62bd29";

const COIN_LIST_API_URL =
  "https://min-api.cryptocompare.com/data/all/coinlist?summary=true";

async function getCurrencyPrice(coin, fiat) {
  let req = await fetch(`
    ${COURSES_API_URL}?fsym=${coin}&tsyms=${fiat}&api_key=${COURSES_API_KEY}`);

  let price = await req.json();

  return formatPrice(price[fiat]);
}

async function getCoinsList() {
  return fetch(COIN_LIST_API_URL).then(response => {
    return response.json();
  });
}

function formatPrice(price) {
  if (price > 1) return price.toFixed(2);

  return price.toPrecision(2);
}

export { getCurrencyPrice, getCoinsList };
