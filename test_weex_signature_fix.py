#!/usr/bin/env python3
"""
Test script to verify WEEX signature fix
"""

import sys
import os
import hashlib
import hmac
import base64
import urllib.parse

# Add the current directory to Python path to import the fixed weex module
sys.path.insert(0, '/Users/danielolaide/git-workspace/ccxt/python')

def test_signature_generation():
    """Test the WEEX signature generation according to official spec"""
    
    print("🔍 Testing WEEX Signature Generation Fix")
    print("=" * 50)
    
    # Test parameters (from WEEX docs example)
    timestamp = "1591089508404"
    method = "GET"
    path = "/api/v2/market/depth"
    query_params = {"symbol": "btcusdt_spbl", "limit": "20"}
    secret_key = "test_secret_key"
    
    # Expected message according to WEEX spec
    query_string = "?" + urllib.parse.urlencode(query_params)
    expected_message = timestamp + method + path + query_string
    
    print(f"📋 Test Parameters:")
    print(f"   Timestamp: {timestamp}")
    print(f"   Method: {method}")
    print(f"   Path: {path}")
    print(f"   Query: {query_params}")
    print()
    
    print(f"📖 Expected Message (WEEX Spec):")
    print(f"   '{expected_message}'")
    
    # Generate expected signature
    expected_signature = hmac.new(
        secret_key.encode('utf-8'),
        expected_message.encode('utf-8'),
        hashlib.sha256
    ).digest()
    expected_signature_b64 = base64.b64encode(expected_signature).decode('utf-8')
    
    print(f"📖 Expected Signature: {expected_signature_b64}")
    
    try:
        # Test with our fixed CCXT implementation
        import ccxt
        
        print(f"\n🔧 Testing Fixed CCXT Implementation:")
        print(f"   CCXT Version: {ccxt.__version__}")
        print(f"   CCXT Location: {ccxt.__file__}")
        
        # Create a weex exchange instance
        exchange = ccxt.weex({
            'apiKey': 'test_api_key',
            'secret': secret_key,
            'password': 'test_passphrase'
        })
        
        # Mock the milliseconds method to return our test timestamp
        original_milliseconds = exchange.milliseconds
        exchange.milliseconds = lambda: int(timestamp)
        
        # Test the sign method
        result = exchange.sign(path, 'private', method, query_params)
        
        # Extract the signature from headers
        ccxt_signature = result['headers']['ACCESS-SIGN']
        
        print(f"🔧 CCXT Generated Signature: {ccxt_signature}")
        print()
        
        # Compare signatures
        if ccxt_signature == expected_signature_b64:
            print("✅ SUCCESS: CCXT signature matches WEEX specification!")
            print("🎉 The signature fix is working correctly!")
            return True
        else:
            print("❌ FAILED: CCXT signature does not match WEEX specification")
            print("🐛 The signature generation still has issues")
            return False
            
    except ImportError as e:
        print(f"❌ Could not import CCXT: {e}")
        print("Please ensure CCXT is properly installed")
        return False
    except Exception as e:
        print(f"❌ Error testing CCXT implementation: {e}")
        return False

if __name__ == "__main__":
    success = test_signature_generation()
    sys.exit(0 if success else 1)
