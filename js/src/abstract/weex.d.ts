import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetPublicTime(params?: {}): Promise<implicitReturnType>;
    publicGetPublicCurrencies(params?: {}): Promise<implicitReturnType>;
    publicGetPublicProducts(params?: {}): Promise<implicitReturnType>;
    publicGetPublicExchangeInfo(params?: {}): Promise<implicitReturnType>;
    publicGetMarketTicker(params?: {}): Promise<implicitReturnType>;
    publicGetMarketTickers(params?: {}): Promise<implicitReturnType>;
    publicGetMarketFills(params?: {}): Promise<implicitReturnType>;
    publicGetMarketCandles(params?: {}): Promise<implicitReturnType>;
    publicGetMarketDepth(params?: {}): Promise<implicitReturnType>;
    privateGetAccountAssets(params?: {}): Promise<implicitReturnType>;
    privateGetAccountTransferRecords(params?: {}): Promise<implicitReturnType>;
    privatePostAccountBills(params?: {}): Promise<implicitReturnType>;
    privatePostTradeOrders(params?: {}): Promise<implicitReturnType>;
    privatePostTradeBatchOrders(params?: {}): Promise<implicitReturnType>;
    privatePostTradeCancelOrder(params?: {}): Promise<implicitReturnType>;
    privatePostTradeCancelBatchOrders(params?: {}): Promise<implicitReturnType>;
    privatePostTradeCancelSymbolOrder(params?: {}): Promise<implicitReturnType>;
    privatePostTradeOrderInfo(params?: {}): Promise<implicitReturnType>;
    privatePostTradeOpenOrders(params?: {}): Promise<implicitReturnType>;
    privatePostTradeHistory(params?: {}): Promise<implicitReturnType>;
    privatePostTradeFills(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
