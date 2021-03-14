<template>
  <div id="app">
    <!-- LOADER -->
    <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
      <div
        v-if="!loaded"
        class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center"
      >
        <svg
          class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
      <!-- / LOADER -->
      <div v-else class="container">
        <section>
          <div class="flex">
            <!-- TICKER INPUT -->
            <div class="max-w-xs">
              <label
                for="wallet"
                class="block text-sm font-medium text-gray-700"
                >Тикер</label
              >
              <div class="mt-1 relative rounded-md shadow-md">
                <input
                  v-model="ticker"
                  @keydown.enter="addTicker(ticker)"
                  type="text"
                  name="wallet"
                  id="wallet"
                  class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                  placeholder="Например DOGE"
                />
              </div>
              <div
                v-if="autocompleteList.length > 0"
                class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
              >
                <span
                  v-for="(item, i) in autocompleteList"
                  :key="i"
                  @click="pushTicker(item)"
                  class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
                >
                  {{ item }}
                </span>
              </div>
              <div v-if="isTickerExists" class="text-sm text-red-600">
                Такой тикер уже добавлен
              </div>
            </div>
            <!-- / TICKER INPUT -->
          </div>
          <!-- ADD BUTTON -->
          <button
            type="button"
            class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            @click="addTicker(ticker)"
          >
            <!-- Heroicon name: solid/mail -->
            <svg
              class="-ml-0.5 mr-2 h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="#ffffff"
            >
              <path
                d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
              ></path>
            </svg>
            Добавить
          </button>
          <!-- / ADD BUTTON -->
        </section>

        <hr class="w-full border-t border-gray-600 my-4" />
        <nav
          class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
          aria-label="Pagination"
        >
          <a
            @click.prevent="goPrevPage"
            href="#"
            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span class="sr-only">Previous</span>
            <!-- Heroicon name: solid/chevron-left -->
            <svg
              class="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </a>
          <a
            v-for="page in pagesCount"
            :key="page"
            @click="currentPage = page"
            href="#"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            :class="{ 'bg-gray-200': currentPage === page }"
          >
            {{ page }}
          </a>
          <a
            @click.prevent="goNextPage"
            href="#"
            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span class="sr-only">Next</span>
            <svg
              class="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </a>
        </nav>

        <hr class="w-full border-t border-gray-600 my-4" />
        <!-- TICKER ITEM -->
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="ticker in tickersToShow"
            :key="ticker.name"
            @click="selectTicker(ticker)"
            :class="selectedTicker === ticker ? 'border-4' : ''"
            class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ ticker.name }} - {{ fiatCurrency }}
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ ticker.price }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
              @click.stop="removeTicker(ticker)"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <!-- / TICKER ITEM -->
        <hr
          v-if="tickersList.length > 0"
          class="w-full border-t border-gray-600 my-4"
        />
        <!-- CHART -->
        <section v-if="selectedTicker" class="relative">
          <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
            {{ selectedTicker.name }} - {{ fiatCurrency }}
          </h3>
          <div class="flex items-end border-gray-600 border-b border-l h-64">
            <div
              v-for="(bar, i) in normizlizedChartData"
              :key="i"
              :style="{ height: `${bar}%` }"
              class="bg-purple-800 border w-10"
            ></div>
          </div>
          <button
            type="button"
            class="absolute top-0 right-0"
            @click="selectedTicker = null"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              xmlns:svgjs="http://svgjs.com/svgjs"
              version="1.1"
              width="30"
              height="30"
              x="0"
              y="0"
              viewBox="0 0 511.76 511.76"
              style="enable-background:new 0 0 512 512"
              xml:space="preserve"
            >
              <g>
                <path
                  d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                  fill="#718096"
                  data-original="#000000"
                ></path>
              </g>
            </svg>
          </button>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { getCurrencyPrice, getCoinsList } from "./api/prices";

const FETCH_INTERVAL = 3000;

// TODO:

export default {
  name: "App",
  data() {
    return {
      loaded: false,
      ticker: "",
      fiatCurrency: "USD",
      isTickerExists: false,

      selectedTicker: "",

      tickersList: [],
      chartData: [],
      currentPage: 1,
      maxTickersOnPage: 6
    };
  },

  computed: {
    normizlizedChartData() {
      let minValue = Math.min(...this.chartData);
      let maxValue = Math.max(...this.chartData);

      if (maxValue !== minValue)
        return this.chartData.map(
          price => 5 + ((price - minValue) * 95) / (maxValue - minValue)
        );

      return this.chartData.map(() => 50);
    },

    tickersNames() {
      return this.tickersList.map(({ name }) => name);
    },

    autocompleteList() {
      if (this.loaded && this.ticker) {
        let ticker = this.ticker.trim().toLowerCase();

        return Object.values(this.coinsList)
          .filter(({ Symbol, FullName }) => {
            return (
              Symbol.toLowerCase().includes(ticker) ||
              FullName.toLowerCase().includes(ticker)
            );
          })
          .map(({ Symbol }) => Symbol)
          .slice(0, 4);
      }

      return [];
    },

    pagesCount() {
      return Math.ceil(this.tickersList.length / this.maxTickersOnPage);
    },

    tickersToShow() {
      let start = (this.currentPage - 1) * this.maxTickersOnPage;
      let end = start + this.maxTickersOnPage;

      return this.tickersList.slice(start, end);
    }
  },

  watch: {
    tickersNames() {
      this.updateTickersStorage(this.tickersList);

      if (!this.tickersNames.includes(this.selectedTicker?.name)) {
        this.selectedTicker = null;
      }
    },

    ticker() {
      if (this.isTickerExists) this.isTickerExists = false;
    },

    selectedTicker() {
      this.chartData = [];
    }
  },

  async created() {
    this.coinsList = null;
    await getCoinsList()
      .then(coinsList => {
        this.coinsList = coinsList.Data;
        this.loaded = true;
      })
      .catch(err => console.error(err));

    const tickersStorage = localStorage.getItem("tickers-list");

    if (tickersStorage) {
      this.tickersList = JSON.parse(tickersStorage).map(ticker => {
        return {
          name: ticker.name,
          price: "-"
        };
      });

      this.tickersList.forEach(t => {
        t.interval = this.subscribeToUpdates(t);
      });
    }
  },

  methods: {
    async addTicker(ticker) {
      const newTicker = {
        name: ticker.toUpperCase(),
        price: "-",
        interval: null
      };

      if (this.tickersNames.includes(newTicker.name)) {
        return (this.isTickerExists = true);
      }

      this.isTickerExists = false;

      newTicker.interval = this.subscribeToUpdates(newTicker);

      this.tickersList.push(newTicker);
      this.updateTickersStorage(this.tickersList);

      this.currentPage = this.pagesCount;
      this.ticker = "";
    },

    subscribeToUpdates(ticker) {
      return setInterval(async () => {
        let data = await getCurrencyPrice(ticker.name, this.fiatCurrency);
        ticker.price = data;

        if (this.selectedTicker?.name === ticker.name) {
          this.chartData.push(+ticker.price);
        }
      }, FETCH_INTERVAL);
    },

    selectTicker(ticker) {
      if (this.selectedTicker === ticker) {
        return (this.selectedTicker = null);
      }

      this.selectedTicker = ticker;
    },

    removeTicker({ name, interval }) {
      clearInterval(interval);
      this.tickersList = this.tickersList.filter(t => t.name !== name);
    },

    pushTicker(ticker) {
      if (this.tickersNames.includes(ticker)) {
        this.ticker = ticker;

        // ??? Как лучше...
        this.$nextTick(() => {
          this.isTickerExists = true;
        });
      } else {
        this.addTicker(ticker);
      }
    },

    updateTickersStorage(tickersList) {
      localStorage.setItem(
        "tickers-list",
        JSON.stringify(
          tickersList.map(t => {
            return { name: t.name };
          })
        )
      );
    },

    goNextPage() {
      if (this.pagesCount !== this.currentPage) {
        this.currentPage++;
      }
    },

    goPrevPage() {
      if (this.currentPage !== 1) {
        this.currentPage--;
      }
    }
  }
};
</script>

<style src="./assets/app.css"></style>
