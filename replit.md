# Rizz AI - Replit Project

## Overview
Rizz AI is a mobile dating assistant app built with Expo/React Native. It helps users improve their social interactions through conversation analysis, pickup line generation, and lookmaxing features.

## Tech Stack
- **Framework**: Expo SDK 54 / React Native 0.81.5
- **Language**: TypeScript
- **Navigation**: React Navigation (Native Stack, Bottom Tabs)
- **Animations**: React Native Reanimated
- **Styling**: React Native StyleSheet + Expo Linear Gradient
- **Package Manager**: npm

## Project Structure
- `App.tsx` - Entry point, providers setup, font loading, splash screen
- `navigation/` - Navigation configuration (RootStackNavigator)
- `screens/` - Screen components (Home, UploadScreenshot, PickupLine, Lookmaxing)
- `components/` - Reusable UI components
- `constants/` - Theme colors and spacing
- `data/` - Static data (pickup lines)
- `hooks/` - Custom React hooks
- `utils/` - Helper utilities (sound, credits)
- `assets/` - Fonts, images, sound effects

## Running the App
- **Workflow**: "Start application" runs `npx expo start --web --port 5000`
- **Port**: 5000 (web preview)
- The Expo Metro bundler serves the app as a web app via React Native Web

## Deployment
- Configured as a static site deployment
- Build: `npx expo export --platform web`
- Public directory: `dist`
