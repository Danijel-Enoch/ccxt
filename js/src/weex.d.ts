import Exchange from './abstract/weex.js';
import type { Balances, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, int, Currencies } from './base/types.js';
/**
 * @class weex
 * @augments Exchange
 */
export default class weex extends Exchange {
    describe(): any;
    fetchTime(params?: {}): Promise<Int>;
    fetchCurrencies(params?: {}): Promise<Currencies>;
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchTicker(symbol: Str, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    fetchOrderBook(symbol: Str, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchTrades(symbol: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    fetchOHLCV(symbol: Str, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: Dict): Balances;
    createOrder(symbol: Str, type: OrderType, side: OrderSide, amount: Num, price?: Num, params?: {}): Promise<Order>;
    cancelOrder(id: Str, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrder(id: Str, symbol?: Str, params?: {}): Promise<Order>;
    parseOrder(order: Dict, market?: Market): Order;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): Dict;
    handleErrors(httpCode: int, reason: Str, url: Str, method: Str, headers: Dict, body: Str, response: Dict, requestHeaders: Dict, requestBody: Str): void;
}
