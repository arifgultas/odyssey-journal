# Google Maps Setup Guide

## Overview
The Odyssey Journal app uses Google Maps for interactive location features:
- Interactive maps on post detail pages
- Journey map on user profiles

## Getting Google Maps API Keys

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing (required for Maps API)

### 2. Enable Required APIs
Enable these APIs in your project:
- **Maps SDK for Android**
- **Maps SDK for iOS**

Steps:
1. Go to "APIs & Services" > "Library"
2. Search for each API
3. Click "Enable"

### 3. Create API Keys

#### For Android:
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Click "Restrict Key"
4. Under "Application restrictions", select "Android apps"
5. Add your package name: `com.odysseyjournal.app`
6. Get your SHA-1 fingerprint:
   ```bash
   # Debug keystore (for development)
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
7. Add the SHA-1 fingerprint
8. Under "API restrictions", select "Restrict key"
9. Select "Maps SDK for Android"
10. Save

#### For iOS:
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Click "Restrict Key"
4. Under "Application restrictions", select "iOS apps"
5. Add your bundle identifier: `com.odysseyjournal.app`
6. Under "API restrictions", select "Restrict key"
7. Select "Maps SDK for iOS"
8. Save

### 4. Add Keys to Your Project

Update `app.json` with your API keys:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_IOS_API_KEY_HERE"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_API_KEY_HERE"
        }
      }
    }
  }
}
```

**⚠️ Security Note**: 
- Never commit API keys to public repositories
- Use environment variables for production
- Consider using `.env` file with `expo-constants`

### 5. Rebuild Your App

After adding API keys:
```bash
# Clear cache and rebuild
npx expo start --clear

# For production builds
eas build --platform android
eas build --platform ios
```

## Testing Maps

### Development Mode
Maps will work in Expo Go with API keys configured in `app.json`.

### Production Mode
For production builds, ensure:
1. API keys are properly restricted
2. Billing is enabled on Google Cloud
3. Usage limits are set to avoid unexpected charges

## Troubleshooting

### Maps Not Showing
1. Check API keys are correct in `app.json`
2. Verify APIs are enabled in Google Cloud Console
3. Check bundle identifier/package name matches
4. Ensure billing is enabled
5. Check for API quota limits

### "Authorization failure" Error
- Verify SHA-1 fingerprint is correct (Android)
- Check bundle identifier matches (iOS)
- Ensure API restrictions match your app

### Blank Map
- Check internet connection
- Verify API key restrictions
- Check console for error messages

## Cost Considerations

Google Maps API pricing:
- **Free tier**: $200 credit per month
- **Dynamic Maps**: ~$7 per 1,000 loads
- **Static Maps**: ~$2 per 1,000 loads

For a travel journal app with moderate usage, the free tier should be sufficient.

## Alternative: Development Without API Keys

For development without Google Maps API keys, you can:
1. Use mock location data
2. Display static map images
3. Use alternative map providers (Mapbox, OpenStreetMap)

## Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Expo Maps Documentation](https://docs.expo.dev/versions/latest/sdk/map-view/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
