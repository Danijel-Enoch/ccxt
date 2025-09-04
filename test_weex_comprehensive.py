#!/usr/bin/env python3

"""
Comprehensive test suite for WEEX exchange implementation
Tests both REST API and Pro WebSocket functionality
"""

import sys
import os
import traceback
import asyncio
from typing import Dict, Any

# Add the python directory to the path to import local ccxt
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'python'))

try:
    import ccxt
    import ccxt.pro as ccxtpro
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)

class WeexTestSuite:
    def __init__(self):
        self.results = {'passed': 0, 'failed': 0, 'tests': []}
    
    def log_test(self, test_name: str, passed: bool, message: str = ""):
        """Log test results"""
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name} {message}")
        
        self.results['tests'].append({
            'name': test_name,
            'passed': passed,
            'message': message
        })
        
        if passed:
            self.results['passed'] += 1
        else:
            self.results['failed'] += 1

    def test_basic_import(self):
        """Test basic CCXT library import and WEEX availability"""
        try:
            # Test that weex is in the exchanges list
            assert 'weex' in ccxt.exchanges, "WEEX not found in ccxt.exchanges"
            self.log_test("Basic Import - WEEX in exchanges", True)
            
            # Test that ccxt.pro imports successfully
            assert hasattr(ccxtpro, 'weex'), "WEEX not found in ccxt.pro"
            self.log_test("Pro Import - WEEX Pro available", True)
            
            return True
        except Exception as e:
            self.log_test("Basic Import", False, str(e))
            return False

    def test_exchange_instantiation(self):
        """Test WEEX exchange instantiation (REST)"""
        try:
            # Create WEEX exchange instance
            exchange = ccxt.weex()
            
            # Test basic properties
            assert exchange.id == 'weex', f"Expected id 'weex', got '{exchange.id}'"
            assert exchange.name == 'WEEX', f"Expected name 'WEEX', got '{exchange.name}'"
            assert exchange.countries == ['SC'], f"Expected countries ['SC'], got {exchange.countries}"
            
            # Test that it's a proper exchange instance
            assert isinstance(exchange, ccxt.Exchange), "WEEX instance is not a proper Exchange"
            assert hasattr(exchange, 'fetch_time'), "WEEX missing fetch_time method"
            assert hasattr(exchange, 'fetch_markets'), "WEEX missing fetch_markets method"
            assert hasattr(exchange, 'handleErrors'), "WEEX missing handleErrors method"
            
            self.log_test("REST Exchange Instantiation", True, f"Created {exchange.name} exchange")
            return True
        except Exception as e:
            self.log_test("REST Exchange Instantiation", False, f"Error: {e}")
            traceback.print_exc()
            return False

    def test_pro_exchange_instantiation(self):
        """Test WEEX Pro WebSocket exchange instantiation"""
        try:
            # Create WEEX Pro exchange instance
            exchange = ccxtpro.weex()
            
            # Test basic properties
            assert exchange.id == 'weex', f"Expected id 'weex', got '{exchange.id}'"
            assert exchange.name == 'WEEX', f"Expected name 'WEEX', got '{exchange.name}'"
            
            # Test Pro-specific capabilities
            assert exchange.has['ws'], "WEEX Pro should support WebSocket"
            assert exchange.has['watchTicker'], "WEEX Pro should support watchTicker"
            assert exchange.has['watchTrades'], "WEEX Pro should support watchTrades"
            assert exchange.has['watchOrderBook'], "WEEX Pro should support watchOrderBook"
            assert exchange.has['watchBalance'], "WEEX Pro should support watchBalance"
            assert exchange.has['watchOHLCV'], "WEEX Pro should support watchOHLCV"
            assert exchange.has['watchOrders'], "WEEX Pro should support watchOrders"
            assert exchange.has['watchMyTrades'], "WEEX Pro should support watchMyTrades"
            
            # Test critical methods exist and are callable
            assert hasattr(exchange, 'watch_ticker'), "WEEX Pro missing watch_ticker method"
            assert hasattr(exchange, 'watch_trades'), "WEEX Pro missing watch_trades method"
            assert hasattr(exchange, 'watch_order_book'), "WEEX Pro missing watch_order_book method"
            assert hasattr(exchange, 'handle_deltas'), "WEEX Pro missing handle_deltas method"
            
            self.log_test("Pro Exchange Instantiation", True, f"Created {exchange.name} Pro exchange")
            return True
        except Exception as e:
            self.log_test("Pro Exchange Instantiation", False, f"Error: {e}")
            traceback.print_exc()
            return False

    def test_error_handling_void_issue(self):
        """Test that the void error is fixed in both REST and Pro"""
        try:
            # Test REST exchange handleErrors method
            exchange = ccxt.weex()
            
            # This should work without NameError: name 'void' is not defined
            response = {'code': '00000', 'msg': 'success', 'data': {}}
            try:
                exchange.handleErrors(200, 'OK', 'test', 'GET', {}, '{}', response, {}, '{}')
                self.log_test("REST handleErrors - No void error", True)
            except NameError as e:
                if 'void' in str(e):
                    self.log_test("REST handleErrors - Void error still exists", False, str(e))
                    return False
                else:
                    raise e
            
            # Test Pro exchange handle_deltas method
            pro_exchange = ccxtpro.weex()
            
            # This should work without NameError: name 'void' is not defined
            bookside = {}
            deltas = [{'price': '100.0', 'size': '1.0'}]
            try:
                pro_exchange.handle_deltas(bookside, deltas)
                assert bookside[100.0] == 1.0, "handle_deltas should update bookside"
                self.log_test("Pro handle_deltas - No void error", True)
            except NameError as e:
                if 'void' in str(e):
                    self.log_test("Pro handle_deltas - Void error still exists", False, str(e))
                    return False
                else:
                    raise e
            
            return True
        except Exception as e:
            self.log_test("Error Handling - Void Issue", False, f"Unexpected error: {e}")
            traceback.print_exc()
            return False

    def test_api_endpoints(self):
        """Test API endpoint configuration"""
        try:
            exchange = ccxt.weex()
            
            # Test REST API URLs
            assert 'public' in exchange.urls['api'], "Missing public API URL"
            assert 'private' in exchange.urls['api'], "Missing private API URL"
            assert 'api-spot.weex.com' in exchange.urls['api']['public'], "Incorrect public API URL"
            assert 'api-spot.weex.com' in exchange.urls['api']['private'], "Incorrect private API URL"
            
            # Test Pro WebSocket URLs
            pro_exchange = ccxtpro.weex()
            assert 'ws' in pro_exchange.urls['api'], "Missing WebSocket API URLs"
            assert 'public' in pro_exchange.urls['api']['ws'], "Missing public WebSocket URL"
            assert 'private' in pro_exchange.urls['api']['ws'], "Missing private WebSocket URL"
            assert 'ws-spot.weex.com' in pro_exchange.urls['api']['ws']['public'], "Incorrect public WebSocket URL"
            assert 'ws-spot.weex.com' in pro_exchange.urls['api']['ws']['private'], "Incorrect private WebSocket URL"
            
            self.log_test("API Endpoints Configuration", True)
            return True
        except Exception as e:
            self.log_test("API Endpoints Configuration", False, str(e))
            return False

    def test_error_mappings(self):
        """Test error code mappings"""
        try:
            exchange = ccxt.weex()
            
            # Test that error mappings exist
            assert 'exact' in exchange.exceptions, "Missing exact error mappings"
            assert 'broad' in exchange.exceptions, "Missing broad error mappings"
            
            # Test specific error codes
            exact_errors = exchange.exceptions['exact']
            assert '40001' in exact_errors, "Missing authentication error mapping"
            assert '43001' in exact_errors, "Missing order not found error mapping"
            assert '429' in exact_errors, "Missing rate limit error mapping"
            
            self.log_test("Error Mappings", True, f"Found {len(exact_errors)} error codes")
            return True
        except Exception as e:
            self.log_test("Error Mappings", False, str(e))
            return False

    def test_timeframes(self):
        """Test timeframe configuration"""
        try:
            exchange = ccxt.weex()
            pro_exchange = ccxtpro.weex()
            
            # Test REST timeframes
            assert '1m' in exchange.timeframes, "Missing 1m timeframe"
            assert '1h' in exchange.timeframes, "Missing 1h timeframe"
            assert '1d' in exchange.timeframes, "Missing 1d timeframe"
            
            # Test Pro timeframe conversion methods
            assert hasattr(pro_exchange, 'timeframe_to_weex_interval'), "Missing timeframe conversion method"
            assert hasattr(pro_exchange, 'weex_interval_to_timeframe'), "Missing interval conversion method"
            
            # Test conversion functions
            weex_interval = pro_exchange.timeframe_to_weex_interval('1m')
            assert weex_interval == 'MINUTE_1', f"Expected 'MINUTE_1', got '{weex_interval}'"
            
            timeframe = pro_exchange.weex_interval_to_timeframe('MINUTE_5')
            assert timeframe == '5m', f"Expected '5m', got '{timeframe}'"
            
            self.log_test("Timeframes Configuration", True)
            return True
        except Exception as e:
            self.log_test("Timeframes Configuration", False, str(e))
            return False

    def test_parsing_methods(self):
        """Test data parsing methods"""
        try:
            exchange = ccxt.weex()
            pro_exchange = ccxtpro.weex()
            
            # Test REST parsing methods
            assert hasattr(exchange, 'parseTicker'), "Missing parseTicker method"
            assert hasattr(exchange, 'parseTrade'), "Missing parseTrade method"
            assert hasattr(exchange, 'parseOrder'), "Missing parseOrder method"
            assert hasattr(exchange, 'parseBalance'), "Missing parseBalance method"
            
            # Test Pro parsing methods  
            assert hasattr(pro_exchange, 'parse_ws_trade'), "Missing parse_ws_trade method"
            assert hasattr(pro_exchange, 'parse_ws_ohlcv'), "Missing parse_ws_ohlcv method"
            assert hasattr(pro_exchange, 'parse_ws_my_trade'), "Missing parse_ws_my_trade method"
            assert hasattr(pro_exchange, 'parse_ws_order'), "Missing parse_ws_order method"
            
            self.log_test("Parsing Methods", True)
            return True
        except Exception as e:
            self.log_test("Parsing Methods", False, str(e))
            return False

    def test_message_handlers(self):
        """Test WebSocket message handlers"""
        try:
            pro_exchange = ccxtpro.weex()
            
            # Test handler methods exist
            handlers = [
                'handle_message', 'handle_ping', 'handle_pong', 
                'handle_ticker', 'handle_trades', 'handle_order_book',
                'handle_ohlcv', 'handle_balance', 'handle_orders', 
                'handle_my_trades', 'handle_subscription_status'
            ]
            
            for handler in handlers:
                assert hasattr(pro_exchange, handler), f"Missing {handler} method"
            
            self.log_test("WebSocket Message Handlers", True, f"Found all {len(handlers)} handlers")
            return True
        except Exception as e:
            self.log_test("WebSocket Message Handlers", False, str(e))
            return False

    def print_summary(self):
        """Print test results summary"""
        total = self.results['passed'] + self.results['failed']
        print(f"\n{'='*60}")
        print(f"WEEX COMPREHENSIVE TEST RESULTS")
        print(f"{'='*60}")
        print(f"Total Tests: {total}")
        print(f"Passed: {self.results['passed']} ✅")
        print(f"Failed: {self.results['failed']} ❌")
        print(f"Success Rate: {(self.results['passed']/total*100):.1f}%" if total > 0 else "Success Rate: 0%")
        
        if self.results['failed'] > 0:
            print(f"\nFailed Tests:")
            for test in self.results['tests']:
                if not test['passed']:
                    print(f"  ❌ {test['name']}: {test['message']}")
        
        print(f"{'='*60}")
        return self.results['failed'] == 0

def main():
    """Run all WEEX tests"""
    print("🚀 Starting WEEX Exchange Comprehensive Test Suite")
    print("="*60)
    
    suite = WeexTestSuite()
    
    # Run all tests
    tests = [
        suite.test_basic_import,
        suite.test_exchange_instantiation,
        suite.test_pro_exchange_instantiation,
        suite.test_error_handling_void_issue,
        suite.test_api_endpoints,
        suite.test_error_mappings,
        suite.test_timeframes,
        suite.test_parsing_methods,
        suite.test_message_handlers,
    ]
    
    print(f"Running {len(tests)} test groups...\n")
    
    all_passed = True
    for test in tests:
        try:
            if not test():
                all_passed = False
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {e}")
            traceback.print_exc()
            all_passed = False
    
    # Print summary
    success = suite.print_summary()
    
    if success:
        print("🎉 All tests passed! WEEX implementation is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the implementation.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
