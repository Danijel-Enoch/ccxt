//  ---------------------------------------------------------------------------

import Exchange from './abstract/weex.js';
import { ExchangeError, ArgumentsRequired, OrderNotFound, InvalidOrder, InvalidNonce, AuthenticationError, RateLimitExceeded, PermissionDenied, BadRequest, BadSymbol, AccountSuspended, OnMaintenance } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Balances, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, int, Currencies } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class weex
 * @augments Exchange
 */
export default class weex extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'weex',
            'name': 'WEEX',
            'countries': [ 'SC' ], // Seychelles
            'rateLimit': 100,
            'version': 'v2',
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': false,
                'createLimitBuyOrder': true,
                'createLimitSellOrder': true,
                'createMarketBuyOrder': true,
                'createMarketOrderWithCost': true,
                'createMarketSellOrder': true,
                'createOrder': true,
                'createOrders': true,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopLossOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': false,
                'editOrder': false,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDeposits': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchL2OrderBook': false,
                'fetchLastPrices': false,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfers': true,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1day',
                '1w': '1week',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/85734211-85755480-b705-11ea-8b35-0b7f1db33a2f.jpg',
                'api': {
                    'public': 'https://api-spot.weex.com/api/v2',
                    'private': 'https://api-spot.weex.com/api/v2',
                },
                'www': 'https://www.weex.com',
                'doc': [
                    'https://doc-en.weex.com',
                    'https://github.com/weex-exchange',
                ],
                'fees': 'https://www.weex.com/fees',
                'referral': undefined,
            },
            'api': {
                'public': {
                    'get': {
                        'public/time': 1,
                        'public/currencies': 1,
                        'public/products': 1,
                        'public/exchangeInfo': 1,
                        'market/ticker': 1,
                        'market/tickers': 1,
                        'market/fills': 1,
                        'market/candles': 1,
                        'market/depth': 1,
                    },
                },
                'private': {
                    'get': {
                        'account/assets': 1,
                        'account/transferRecords': 1,
                    },
                    'post': {
                        'account/bills': 1,
                        'trade/orders': 1,
                        'trade/batch-orders': 1,
                        'trade/cancel-order': 1,
                        'trade/cancel-batch-orders': 1,
                        'trade/cancel-symbol-order': 1,
                        'trade/orderInfo': 1,
                        'trade/open-orders': 1,
                        'trade/history': 1,
                        'trade/fills': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.001'),
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    '40001': AuthenticationError, // Header "ACCESS_KEY" is required
                    '40002': AuthenticationError, // Header "ACCESS_SIGN" is required
                    '40003': AuthenticationError, // Header "ACCESS_TIMESTAMP" is required
                    '40005': InvalidNonce, // Invalid ACCESS_TIMESTAMP
                    '40006': AuthenticationError, // Invalid ACCESS_KEY
                    '40007': BadRequest, // Invalid Content_Type, use "application/json" format
                    '40008': InvalidNonce, // Request timestamp expired
                    '40009': AuthenticationError, // API verification failed
                    '40011': AuthenticationError, // Header "ACCESS_PASSPHRASE" is required
                    '40012': AuthenticationError, // Incorrect API key/Passphrase
                    '40013': AccountSuspended, // Account frozen
                    '40014': PermissionDenied, // Invalid permissions
                    '40015': ExchangeError, // System error
                    '40017': BadRequest, // Parameter validation failed
                    '40018': PermissionDenied, // Invalid IP request
                    '40102': BadSymbol, // Trading pair configuration does not exist
                    '40200': OnMaintenance, // The server is being upgraded. Please try again later.
                    '40305': InvalidOrder, // client_oid exceeds 40 characters or is in an invalid format
                    '40409': BadRequest, // Incorrect format
                    '40704': BadRequest, // Only the last three months of historical data are accessible
                    '40707': BadRequest, // Start time has a greater value than the end time
                    '40724': BadRequest, // Empty parameter
                    '40725': BadRequest, // Server returns an error response
                    '40912': BadRequest, // Batch cancel limit exceeded (max 50 orders)
                    '40913': ArgumentsRequired, // Either orderId or clientId is required
                    '43001': OrderNotFound, // Order does not exist
                    '43002': InvalidOrder, // Failed to place order
                    '43004': OrderNotFound, // There are no orders that can be canceled.
                    '43005': InvalidOrder, // Order quantity exceeds maximum order limit
                    '43006': InvalidOrder, // Amount is less than the minimum order amount
                    '43007': InvalidOrder, // Amount exceeds maximum order amount
                    '43009': InvalidOrder, // The current order price exceeds the limit of 0
                    '43010': InvalidOrder, // Trading volume cannot be less than 0
                    '43011': InvalidOrder, // The current order price cannot be lower than 0
                    '429': RateLimitExceeded, // Too Many Requests
                },
                'broad': {},
            },
            'commonCurrencies': {
                // Add any currency mappings if needed
            },
        });
    }

    async fetchTime (params = {}): Promise<Int> {
        /**
         * @method
         * @name weex#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @see https://doc-en.weex.com/#get-server-time
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetPublicTime (params);
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1622097118135,
        //         "data": 1622097118134
        //     }
        //
        return this.safeInteger (response, 'data');
    }

    async fetchCurrencies (params = {}): Promise<Currencies> {
        /**
         * @method
         * @name weex#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://doc-en.weex.com/#basic-crypto-information
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetPublicCurrencies (params);
        //
        //     {
        //         "code":"00000",
        //         "msg":"success",
        //         "requestTime":1622097139437,
        //         "data":[
        //             {
        //                 "coinId":"1",
        //                 "coinName":"BTC",
        //                 "transfer":"true",
        //                 "chains":[
        //                     {
        //                         "chain":null,
        //                         "needTag":"false",
        //                         "withdrawAble":"true",
        //                         "rechargeAble":"true",
        //                         "withdrawFee":"0.005",
        //                         "depositConfirm":"1",
        //                         "withdrawConfirm":"1",
        //                         "minDepositAmount":"0.001",
        //                         "minWithdrawAmount":"0.001",
        //                         "browserUrl":"https://blockchair.com/bitcoin/testnet/transaction/"
        //                     }
        //                 ]
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const result: Dict = {};
        for (let i = 0; i < data.length; i++) {
            const currency = data[i];
            const id = this.safeString (currency, 'coinName');
            const code = this.safeCurrencyCode (id);
            const chains = this.safeList (currency, 'chains', []);
            const networks: Dict = {};
            let fee = undefined;
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString (chain, 'chain');
                const networkCode = networkId ? networkId : id;
                const withdrawEnabled = this.safeBool (chain, 'withdrawAble');
                const depositEnabled = this.safeBool (chain, 'rechargeAble');
                const withdrawFee = this.safeNumber (chain, 'withdrawFee');
                if (fee === undefined) {
                    fee = withdrawFee;
                }
                networks[networkCode] = {
                    'info': chain,
                    'id': networkId,
                    'network': networkCode,
                    'active': withdrawEnabled && depositEnabled,
                    'deposit': depositEnabled,
                    'withdraw': withdrawEnabled,
                    'fee': withdrawFee,
                    'precision': undefined,
                    'limits': {
                        'withdraw': {
                            'min': this.safeNumber (chain, 'minWithdrawAmount'),
                            'max': undefined,
                        },
                        'deposit': {
                            'min': this.safeNumber (chain, 'minDepositAmount'),
                            'max': undefined,
                        },
                    },
                };
            }
            result[code] = {
                'info': currency,
                'id': id,
                'numericId': this.safeString (currency, 'coinId'),
                'code': code,
                'precision': undefined,
                'type': undefined,
                'name': undefined,
                'active': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'networks': networks,
                'fee': fee,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name weex#fetchMarkets
         * @description retrieves data on all markets for weex
         * @see https://doc-en.weex.com/#get-symbol-info
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetPublicExchangeInfo (params);
        //
        //     {
        //       "code": "00000",
        //       "msg": "success",
        //       "requestTime": 1743661516052,
        //       "data": [
        //         {
        //           "symbol": "BTCUSDT_SPBL",
        //           "baseCoin": "BTC",
        //           "quoteCoin": "USDT",
        //           "tickSize": "0.1",
        //           "stepSize": "0.00000001",
        //           "minTradeAmount": "0.00001",
        //           "maxTradeAmount": "99999",
        //           "takerFeeRate": "0.001",
        //           "makerFeeRate": "0",
        //           "enableTrade": true,
        //           "enableDisplay": true
        //         }
        //       ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const result: Market[] = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const marketId = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseCoin');
            const quoteId = this.safeString (market, 'quoteCoin');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const active = this.safeBool (market, 'enableTrade');
            const tickSize = this.safeString (market, 'tickSize');
            const stepSize = this.safeString (market, 'stepSize');
            result.push ({
                'info': market,
                'id': marketId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': active,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (stepSize),
                    'price': this.parseNumber (tickSize),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minTradeAmount'),
                        'max': this.safeNumber (market, 'maxTradeAmount'),
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'created': undefined,
            });
        }
        return result;
    }

    async fetchTicker (symbol: Str, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name weex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://doc-en.weex.com/#get-single-ticker
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketTicker (this.extend (request, params));
        //
        //     {
        //       "code": "00000",
        //       "msg": "success",
        //       "requestTime": 1743665793483,
        //       "data": {
        //         "symbol": "BTCUSDT_SPBL",
        //         "priceChange": "-965.6",
        //         "priceChangePercent": "-0.011451",
        //         "trades": 105901,
        //         "size": "78570.57284800",
        //         "value": "6731333236.9492884000",
        //         "high": "88495.5",
        //         "low": "82175.9",
        //         "open": "84319.6",
        //         "close": "83354.0",
        //         "lastPrice": "83354.0",
        //         "ts": 1750060557824
        //       }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseTicker (data, market);
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name weex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://doc-en.weex.com/#get-all-ticker
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetMarketTickers (params);
        //
        //     {
        //       "code": "00000",
        //       "msg": "success",
        //       "data": [
        //         {
        //           "symbol": "BTCUSDT_SPBL",
        //           "priceChange": "-965.6",
        //           "priceChangePercent": "-0.011451",
        //           // ... more ticker data
        //         }
        //       ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const result: Dict = {};
        for (let i = 0; i < data.length; i++) {
            const ticker = this.parseTicker (data[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //       "symbol": "BTCUSDT_SPBL",
        //       "priceChange": "-965.6",
        //       "priceChangePercent": "-0.011451",
        //       "trades": 105901,
        //       "size": "78570.57284800",
        //       "value": "6731333236.9492884000",
        //       "high": "88495.5",
        //       "low": "82175.9",
        //       "open": "84319.6",
        //       "close": "83354.0",
        //       "lastPrice": "83354.0",
        //       "ts": 1750060557824
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (ticker, 'ts');
        const last = this.safeString (ticker, 'lastPrice');
        const open = this.safeString (ticker, 'open');
        const high = this.safeString (ticker, 'high');
        const low = this.safeString (ticker, 'low');
        const change = this.safeString (ticker, 'priceChange');
        const percentage = this.safeString (ticker, 'priceChangePercent');
        const baseVolume = this.safeString (ticker, 'size');
        const quoteVolume = this.safeString (ticker, 'value');
        const count = this.safeInteger (ticker, 'trades');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'count': count,
            'info': ticker,
        }, market);
    }

    async fetchOrderBook (symbol: Str, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name weex#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://doc-en.weex.com/#get-orderbook-depth
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return (15 or 200)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // 15 or 200
        }
        const response = await this.publicGetMarketDepth (this.extend (request, params));
        //
        //     {
        //         "code":"00000",
        //         "msg":"success",
        //         "requestTime":1622102974025,
        //         "data":{
        //             "asks":[
        //                 ["38084.5","0.0039"],
        //                 ["38085.7","0.0018"]
        //             ],
        //             "bids":[
        //                 ["38073.7","0.4993000000000000"],
        //                 ["38073.4","0.4500"]
        //             ],
        //             "timestamp":"1622102974025"
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const timestamp = this.safeInteger (data, 'timestamp');
        return this.parseOrderBook (data, symbol, timestamp);
    }

    async fetchTrades (symbol: Str, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name weex#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://doc-en.weex.com/#get-trades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetMarketFills (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1743668717640,
        //         "data": [
        //             {
        //                 "symbol": "BTCUSDT_SPBL",
        //                 "tradeId": "778a5376-a0b6-4c8f-ab64-dd6ea40f896e",
        //                 "fillTime": 1743668713364,
        //                 "fillPrice": "83609.7",
        //                 "fillQuantity": "0.00011400",
        //                 "tradeValue": "9.531505800",
        //                 "bestMatch": true,
        //                 "buyerMaker": true
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades (public)
        //
        //     {
        //         "symbol": "BTCUSDT_SPBL",
        //         "tradeId": "778a5376-a0b6-4c8f-ab64-dd6ea40f896e",
        //         "fillTime": 1743668713364,
        //         "fillPrice": "83609.7",
        //         "fillQuantity": "0.00011400",
        //         "tradeValue": "9.531505800",
        //         "bestMatch": true,
        //         "buyerMaker": true
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "accountId": "590105411156181178",
        //         "symbol": "WXTUSDT_SPBL",
        //         "baseCoin": "WXT",
        //         "quoteCoin": "USDT",
        //         "orderId": "602929507946463674",
        //         "fillId": "602929507971629498",
        //         "orderType": "",
        //         "side": "buy",
        //         "fillPrice": "",
        //         "fillQuantity": "10",
        //         "fillTotalAmount": "0.10476",
        //         "fees": "0.01",
        //         "cTime": "1743749596589"
        //     }
        //
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const id = this.safeString2 (trade, 'tradeId', 'fillId');
        const orderId = this.safeString (trade, 'orderId');
        const timestamp = this.safeInteger2 (trade, 'fillTime', 'cTime');
        const priceString = this.safeString2 (trade, 'fillPrice', 'fillPrice');
        const amountString = this.safeString (trade, 'fillQuantity');
        const costString = this.safeString2 (trade, 'tradeValue', 'fillTotalAmount');
        const side = this.safeString (trade, 'side');
        let takerOrMaker = undefined;
        const buyerMaker = this.safeBool (trade, 'buyerMaker');
        if (buyerMaker !== undefined) {
            takerOrMaker = buyerMaker ? 'maker' : 'taker';
        }
        const feeString = this.safeString (trade, 'fees');
        let fee = undefined;
        if (feeString !== undefined) {
            fee = {
                'cost': feeString,
                'currency': undefined,
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'amount': amountString,
            'price': priceString,
            'cost': costString,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
        }, market);
    }

    async fetchOHLCV (symbol: Str, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name weex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://doc-en.weex.com/#get-candlestick-data
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'period': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetMarketCandles (this.extend (request, params));
        //
        //     {
        //       "code": "00000",
        //       "msg": "success",
        //       "requestTime": 1743669821003,
        //       "data": [
        //         [
        //           1743669000000,
        //           "83654.0",
        //           "83778.0",
        //           "83531.5",
        //           "83688.7",
        //           "248.17024800",
        //           "20755885.859164900"
        //         ]
        //       ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     [
        //       1743669000000,
        //       "83654.0",
        //       "83778.0",
        //       "83531.5",
        //       "83688.7",
        //       "248.17024800",
        //       "20755885.859164900"
        //     ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name weex#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://doc-en.weex.com/#get-account-assets
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetAccountAssets (params);
        //
        //     {
        //       "code": "00000",
        //       "msg": "success",
        //       "requestTime": 1743729400189,
        //       "data": [{
        //         "coinId": 1,
        //         "coinName": "BTC",
        //         "available": "0.0040000000000000",
        //         "frozen": "0",
        //         "equity": "0.0040000000000000"
        //       }, {
        //         "coinId": 2,
        //         "coinName": "USDT",
        //         "available": "10000999657.8927028500000000",
        //         "frozen": "0",
        //         "equity": "10000999657.8927028500000000"
        //       }]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseBalance (data);
    }

    parseBalance (response: Dict): Balances {
        const result: Dict = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'coinName');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'frozen');
            account['total'] = this.safeString (balance, 'equity');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async createOrder (symbol: Str, type: OrderType, side: OrderSide, amount: Num, price: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name weex#createOrder
         * @description create a trade order
         * @see https://doc-en.weex.com/#place-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.clientOrderId] client order id, defaults to uuid if not passed
         * @param {string} [params.force] order execution type: 'normal', 'postOnly', 'fok', 'ioc'
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'side': side,
            'orderType': type,
            'quantity': this.amountToPrecision (symbol, amount),
        };
        const clientOrderId = this.safeString (params, 'clientOrderId', this.uuid ());
        request['clientOrderId'] = clientOrderId;
        if (type === 'limit') {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for limit orders');
            }
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const force = this.safeString (params, 'force', 'normal');
        request['force'] = force;
        params = this.omit (params, [ 'clientOrderId', 'force' ]);
        const response = await this.privatePostTradeOrders (this.extend (request, params));
        //
        //     {
        //       "code": "00000",
        //       "msg": "success",
        //       "requestTime": 1743736915184,
        //       "data": {
        //         "orderId": 602876318261969338,
        //         "clientOrderId": "202504041121509751743736910566"
        //       }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async cancelOrder (id: Str, symbol: Str = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name weex#cancelOrder
         * @description cancels an open order
         * @see https://doc-en.weex.com/#cancel-order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.clientOrderId] client order id
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clientOid'] = clientOrderId;
        } else {
            request['orderId'] = id;
        }
        params = this.omit (params, [ 'clientOrderId' ]);
        const response = await this.privatePostTradeCancelOrder (this.extend (request, params));
        //
        //     {
        //       "code": "00000",
        //       "msg": "success",
        //       "requestTime": 1743740792018,
        //       "data": {
        //         "order_id": "602882076026339770",
        //         "client_oid": null,
        //         "symbol": "WXTUSDT_SPBL",
        //         "result": true,
        //         "err_code": null,
        //         "err_msg": null
        //       }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async fetchOrder (id: Str, symbol: Str = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name weex#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://doc-en.weex.com/#get-order-info
         * @param {string} id the order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.clientOrderId] client order id
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {};
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clientOrderId'] = clientOrderId;
        } else {
            request['orderId'] = id;
        }
        params = this.omit (params, [ 'clientOrderId' ]);
        const response = await this.privatePostTradeOrderInfo (this.extend (request, params));
        //
        //     {
        //       "code": "00000",
        //       "msg": "success",
        //       "requestTime": 1743754256238,
        //       "data": [{
        //         "accountId": "590105411156181178",
        //         "symbol": "WXTUSDT_SPBL",
        //         "orderId": "602928955330134458",
        //         "clientOrderId": "202504041451014391743749461316",
        //         "price": "100.000000",
        //         "quantity": "10",
        //         "orderType": "limit",
        //         "side": "sell",
        //         "status": "open",
        //         "latestFillPrice": "0",
        //         "maxFillPrice": "0",
        //         "minFillPrice": "0",
        //         "fillQuantity": "0",
        //         "fillTotalAmount": "0",
        //         "cTime": "1743749464829",
        //         "uTime": "1743749464834"
        //       }]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const first = this.safeDict (data, 0, {});
        return this.parseOrder (first, market);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // createOrder
        //
        //     {
        //       "orderId": 602876318261969338,
        //       "clientOrderId": "202504041121509751743736910566"
        //     }
        //
        // cancelOrder
        //
        //     {
        //       "order_id": "602882076026339770",
        //       "client_oid": null,
        //       "symbol": "WXTUSDT_SPBL",
        //       "result": true,
        //       "err_code": null,
        //       "err_msg": null
        //     }
        //
        // fetchOrder, fetchOrders, fetchOpenOrders
        //
        //     {
        //       "accountId": "590105411156181178",
        //       "symbol": "WXTUSDT_SPBL",
        //       "orderId": "602928955330134458",
        //       "clientOrderId": "202504041451014391743749461316",
        //       "price": "100.000000",
        //       "quantity": "10",
        //       "orderType": "limit",
        //       "side": "sell",
        //       "status": "open",
        //       "latestFillPrice": "0",
        //       "maxFillPrice": "0",
        //       "minFillPrice": "0",
        //       "fillQuantity": "0",
        //       "fillTotalAmount": "0",
        //       "cTime": "1743749464829",
        //       "uTime": "1743749464834"
        //     }
        //
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const id = this.safeString2 (order, 'orderId', 'order_id');
        const clientOrderId = this.safeString2 (order, 'clientOrderId', 'client_oid');
        const timestamp = this.safeInteger (order, 'cTime');
        const lastUpdateTimestamp = this.safeInteger (order, 'uTime');
        const type = this.safeString (order, 'orderType');
        const side = this.safeString (order, 'side');
        const amount = this.safeString (order, 'quantity');
        const price = this.safeString (order, 'price');
        const filled = this.safeString (order, 'fillQuantity');
        const cost = this.safeString (order, 'fillTotalAmount');
        const average = this.safeString (order, 'latestFillPrice');
        let status = this.safeString (order, 'status');
        if (status === 'new') {
            status = 'open';
        } else if (status === 'partial_fill') {
            status = 'open';
        } else if (status === 'full_fill') {
            status = 'closed';
        } else if (status === 'cancelled') {
            status = 'canceled';
        }
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastUpdateTimestamp,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'amount': amount,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name weex#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://doc-en.weex.com/#get-current-orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of  open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.pageNo] page number (starting from 0, default 0)
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const pageNo = this.safeInteger (params, 'pageNo');
        if (pageNo !== undefined) {
            request['pageNo'] = pageNo;
        }
        params = this.omit (params, [ 'pageNo' ]);
        const response = await this.privatePostTradeOpenOrders (this.extend (request, params));
        //
        //     {
        //       "code": "00000",
        //       "msg": "success",
        //       "requestTime": 1743753174247,
        //       "data": {
        //         "orderInfoResultList": [{
        //           "accountId": "590105411156181178",
        //           "symbol": "WXTUSDT_SPBL",
        //           "orderId": "602941812964852154",
        //           "clientOrderId": "202504040742105191743752530280",
        //           // ... more order data
        //         }],
        //         "nextPage": null,
        //         "totals": null
        //       }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const orders = this.safeList (data, 'orderInfoResultList', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name weex#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @see https://doc-en.weex.com/#get-history-orders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.after] start timestamp (in milliseconds)
         * @param {int} [params.before] end timestamp (in milliseconds)
         * @param {int} [params.pageIndex] page number, starting from 0 (Default: 0)
         * @param {int} [params.pageSize] page size, must be greater than 0 and less than or equal to 100 (Default: 10)
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['after'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.privatePostTradeHistory (this.extend (request, params));
        //
        //     {
        //       "code": "00000",
        //       "msg": "success",
        //       "requestTime": 1743755234949,
        //       "data": {
        //         "orderInfoResultList": [{
        //           "accountId": "590105411156181178",
        //           "symbol": "WXTUSDT_SPBL",
        //           "orderId": "602941812964852154",
        //           // ... more order data
        //         }],
        //         "nextPage": true,
        //         "totals": 0
        //       }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const orders = this.safeList (data, 'orderInfoResultList', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name weex#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://doc-en.weex.com/#get-fills
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.orderId] order id
         * @param {int} [params.after] start timestamp (in milliseconds)
         * @param {int} [params.before] end timestamp (in milliseconds)
         * @param {int} [params.pageIndex] page number, starting from 0 (Default: 0)
         * @param {int} [params.pageSize] page size, must be greater than 0 and less than or equal to 100 (Default: 10)
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['after'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.privatePostTradeFills (this.extend (request, params));
        //
        //     {
        //       "code": "00000",
        //       "msg": "success",
        //       "requestTime": 1743750228305,
        //       "data": {
        //         "fillsOrderResultList": [{
        //           "accountId": "590105411156181178",
        //           "symbol": "WXTUSDT_SPBL",
        //           "baseCoin": "WXT",
        //           "quoteCoin": "USDT",
        //           "orderId": "602929507946463674",
        //           "fillId": "602929507971629498",
        //           "orderType": "",
        //           "side": "buy",
        //           "fillPrice": "",
        //           "fillQuantity": "10",
        //           "fillTotalAmount": "0.10476",
        //           "fees": "0.01",
        //           "cTime": "1743749596589"
        //         }],
        //         "nextPage": false,
        //         "totals": 0
        //       }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const trades = this.safeList (data, 'fillsOrderResultList', []);
        return this.parseTrades (trades, market, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined): Dict {
        let url = this.urls['api'][api] + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            let queryString = '';
            if (method === 'GET') {
                if (Object.keys (params).length) {
                    queryString = '?' + this.urlencode (params);
                    url += queryString;
                }
            } else {
                if (Object.keys (params).length) {
                    body = this.json (params);
                }
            }
            const auth = timestamp + method.toUpperCase () + '/' + path;
            const message = queryString ? auth + queryString + (body || '') : auth + (body || '');
            const signature = this.hmac (this.encode (message), this.encode (this.secret), sha256, 'base64');
            headers = {
                'ACCESS-KEY': this.apiKey,
                'ACCESS-SIGN': signature,
                'ACCESS-TIMESTAMP': timestamp,
                'ACCESS-PASSPHRASE': this.password,
                'Content-Type': 'application/json',
                'locale': 'en-US',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: int, reason: Str, url: Str, method: Str, headers: Dict, body: Str, response: Dict, requestHeaders: Dict, requestBody: Str): void {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     {
        //         "code": "40001",
        //         "msg": "Header \"ACCESS_KEY\" is required",
        //         "requestTime": 1622097118135
        //     }
        //
        const code = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg');
        if (code !== undefined && code !== '00000') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
}
