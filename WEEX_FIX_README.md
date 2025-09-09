# WEEX Signature Fix - CCXT v4.4.88

## Overview
This fork contains a critical fix for WEEX exchange signature generation in CCXT. The original CCXT library had an issue where private API calls to WEEX would fail with "40009 sign signature error".

## The Problem
The WEEX API requires the full API path `/api/v2/` to be included in the signature message, but CCXT was only using the relative endpoint path (e.g., `account/assets` instead of `/api/v2/account/assets`).

## The Fix
**File**: `ts/src/weex.ts` (Line 1287)
```typescript
// Before (incorrect)
const message = timestamp + method.toUpperCase() + path + queryString + (body || '');

// After (fixed)
const message = timestamp + method.toUpperCase() + "/api/v2/" + path + queryString + (body || '');
```

## Changes Made
1. **TypeScript Source**: Fixed signature message construction in `ts/src/weex.ts`
2. **Version Bump**: Updated to `4.4.88`
3. **Transpiled**: Applied fix to all target languages (Python, PHP, JavaScript)
4. **Tested**: Verified fix works with real WEEX API calls

## Testing
- ✅ All comprehensive tests pass
- ✅ Signature generation matches WEEX specification exactly
- ✅ Private API calls work without signature errors
- ✅ Public API calls continue to work normally

## Usage
This fixed version can be used as a drop-in replacement for the standard CCXT library when working with WEEX exchange.

### Installation from GitHub
```bash
npm install git+https://github.com/Danijel-Enoch/ccxt.git
```

### Python Installation
```bash
cd ccxt/python
pip install -e .
```

## Before and After
### Before (Failed)
```
❌ Connectivity test failed: weex {"code":"40009","msg":"sign signature error"}
```

### After (Success)  
```
✅ Public API working - BTC/USDT price: 112359.9
✅ Private API working - Balance retrieved
```

## Files Changed
- `ts/src/weex.ts` - TypeScript source fix
- `python/ccxt/weex.py` - Python transpiled version
- `python/ccxt/async_support/weex.py` - Python async version
- `php/weex.php` - PHP transpiled version
- `php/async/weex.php` - PHP async version
- `package.json` - Version update
- `python/ccxt/__init__.py` - Version update

## Commit Hash
`fa4a8e6` - Fix WEEX signature generation - include full API path in signature message
