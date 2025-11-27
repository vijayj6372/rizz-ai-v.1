# Rizz AI - Pickup Line Generator Mobile App

## Overview
Rizz AI is a mobile app that generates pickup lines for users. The app works completely offline with no API calls required. Users can either upload a screenshot of a conversation or directly request pickup lines, and the app will display 3 random lines from different categories.

## Current State
- **Status**: Complete and functional
- **Platform**: React Native with Expo
- **Last Updated**: November 2025

## Project Architecture

### Navigation Structure
- Stack Navigator (no tabs)
- Home Screen → PickupLine Screen

### Screens
1. **HomeScreen** (`screens/HomeScreen.tsx`)
   - App branding with logo and title
   - Two action cards: "Upload Screenshot" and "Give me a pickup line"
   - Light blue gradient background

2. **PickupLineScreen** (`screens/PickupLineScreen.tsx`)
   - Displays 3 pickup lines in iMessage-style chat bubbles
   - Tap to copy functionality with haptic feedback
   - Chili pepper slider component
   - "gimme another" button for new lines

### Data
- **pickupLines.ts** (`data/pickupLines.ts`)
  - 30 flirty pickup lines
  - 30 poetic pickup lines
  - 30 bold pickup lines
  - Random selection function picks one from each category

### Design System
- **Primary Color**: #E86B6B (coral/salmon)
- **Message Bubbles**: #4A90D9 (blue)
- **Background Gradient**: #C5D8F0 → #E8F0F8 (light blue)
- **Slider Gradient**: #FF9500 → #FF3B30 (orange to red)

## Key Features
1. ✅ Offline functionality - no API calls
2. ✅ Image picker for screenshot upload (with simulated analysis)
3. ✅ 3 categories of pickup lines (flirty, poetic, bold)
4. ✅ iMessage-style chat bubble design
5. ✅ Tap to copy with haptic feedback
6. ✅ Chili pepper slider component
7. ✅ Spring animations on buttons and bubbles
8. ✅ Cross-platform (iOS, Android, Web)

## File Structure
```
├── App.tsx                    # Root component with ErrorBoundary
├── app.json                   # Expo configuration
├── assets/images/             # App icons and images
│   ├── icon.png              # App icon
│   ├── chili-pepper.png      # Slider thumb icon
│   └── splash-icon.png       # Splash screen
├── components/                # Reusable components
│   ├── Button.tsx
│   ├── ErrorBoundary.tsx
│   ├── ErrorFallback.tsx
│   ├── HeaderTitle.tsx
│   └── ...
├── constants/theme.ts         # Design tokens and colors
├── data/pickupLines.ts        # Pickup line arrays
├── hooks/                     # Custom React hooks
├── navigation/
│   ├── RootStackNavigator.tsx # Main navigation
│   └── screenOptions.ts       # Common screen options
└── screens/
    ├── HomeScreen.tsx         # Main entry screen
    └── PickupLineScreen.tsx   # Pickup line display
```

## Dependencies
- React Navigation 7 for navigation
- expo-linear-gradient for backgrounds
- expo-image-picker for photo library access
- expo-clipboard for copy functionality
- expo-haptics for tactile feedback
- react-native-reanimated for animations
- react-native-gesture-handler for gestures

## Testing
The app can be tested:
1. Web: View in browser at the dev server URL
2. Mobile: Scan QR code with Expo Go app

## User Preferences
- App name: "Rizz AI"
- Design: Matches provided mockups with coral/salmon buttons, light blue gradient, iMessage-style bubbles
- Interaction: Tap to copy (not double-tap only)
- Offline: All functionality works without internet
