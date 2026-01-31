# Debug Steps for Gemini API

Follow these steps IN ORDER:

## Step 1: Enable the Generative Language API

1. Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
2. Make sure you're in the SAME project as your API key (check top bar)
3. Click the blue **"ENABLE"** button
4. Wait 30 seconds for it to activate

## Step 2: Configure Your API Key

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your API key name
3. Under "API restrictions":
   - Choose **"Restrict key"**
   - Search for and check: **"Generative Language API"**
   - Click **"Save"**

## Step 3: Verify Key Format

Your API key should:
- Start with `AIza`
- Be about 39 characters long
- Have no spaces or quotes around it in the code

In `aiAgent.js` line 6, it should look like:
```javascript
const GEMINI_API_KEY = 'AIzaSyB...your_key_here...XYZ';
```

## Step 4: Test Again

1. Refresh your browser (Cmd+R or Ctrl+R)
2. Open: http://localhost:8000/test-api.html
3. Click "Test API Key"
4. Check the console (F12) for any errors

## Common Fixes:

### If you see "403 Forbidden":
- API is not enabled → Go back to Step 1
- API key doesn't have permission → Go back to Step 2

### If you see "400 Bad Request":
- API key format is wrong
- Try creating a NEW key at: https://console.cloud.google.com/apis/credentials

### If you see "404 Not Found":
- Model name might be wrong
- Make sure line 7 of aiAgent.js says:
  ```javascript
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  ```

## Still Not Working?

Try creating a completely new key:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"+ CREATE CREDENTIALS"** → **"API key"**
3. Copy the new key IMMEDIATELY
4. Click **"RESTRICT KEY"**
5. Under "API restrictions":
   - Choose "Restrict key"
   - Select "Generative Language API"
   - Save
6. Paste the new key in aiAgent.js
7. Save and test again

## Test Checklist:

- [ ] Generative Language API is enabled
- [ ] API key has restrictions set to "Generative Language API"
- [ ] API key is correctly pasted in aiAgent.js (no spaces/quotes)
- [ ] File is saved
- [ ] Browser is refreshed
- [ ] Test page shows the key (partially) in output

