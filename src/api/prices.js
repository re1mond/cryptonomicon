const API_URL = "https://min-api.cryptocompare.com/data/price";
const API_KEY =
  "27335cf6f71ea9a5161d38c0182ecb305b0194550ebf9b429a9f283bcf62bd29";

async function getCurrencyPrice(coin, fiat) {
  let req = await fetch(`
    ${API_URL}?fsym=${coin}&tsyms=${fiat}&api_key=${API_KEY}`);

  let price = await req.json();

  return formatPrice(price[fiat]);
}

function formatPrice(price) {
  if (price > 1) return price.toFixed(2);

  return price.toPrecision(2);
}

export { getCurrencyPrice };
