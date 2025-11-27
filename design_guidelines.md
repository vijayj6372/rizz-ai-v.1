# Rizz AI - Design Guidelines

## Authentication & User Accounts
**No authentication required.** This is a single-user, local-only utility app. All data stays on device with no backend integration.

## Navigation Architecture

### Root Navigation: Stack-Only
The app uses a simple navigation stack without tabs or drawer navigation:
- **Home Screen** (entry point)
- **Pickup Line Display Screen** (modal-style presentation)
- **Upload Screen** (intermediate step for screenshot flow)

### Navigation Flow
1. **Screenshot Upload Flow**: Home → Upload Screen (opens image picker) → Pickup Line Display
2. **Direct Generation Flow**: Home → Pickup Line Display (instant generation)

## Screen Specifications

### Home Screen
**Purpose:** Entry point with two primary actions matching the provided design mockups

**Layout:**
- Header: Custom branded header with "Rizz AI" title, transparent background
- Main content: 
  - Centered vertical layout
  - App branding/logo area at top
  - Two prominent action buttons stacked vertically
  - Light blue gradient background (top to bottom fade)
- Safe area insets: top = insets.top + Spacing.xl, bottom = insets.bottom + Spacing.xl

**Components:**
- App title/branding
- Button 1: "Upload Screenshot of Convo" - primary action style
- Button 2: "Gimme Pick-up Line" - secondary action style
- Both buttons should have rounded corners and match the design mockup aesthetic

### Upload Screen (Screenshot Flow)
**Purpose:** Intermediate screen that immediately opens device image picker

**Behavior:**
- Automatically triggers image picker on mount
- Shows simulated "Analyzing screenshot..." loading state after image selection
- Navigates to Pickup Line Display after brief analysis simulation (1-2 seconds)

### Pickup Line Display Screen
**Purpose:** Shows 3 pickup lines in iMessage-style chat interface

**Layout:**
- Header: 
  - Left button: Back arrow to return to Home
  - Right button: Plus icon (as shown in mockups)
  - Transparent background
- Main content area:
  - Scrollable chat-style interface
  - iMessage-style message bubbles (right-aligned, blue gradient)
  - Displays exactly 3 pickup lines
  - Chili pepper slider component below messages
- Safe area insets: top = headerHeight + Spacing.xl, bottom = insets.bottom + Spacing.xl

**Components:**
- iMessage-style chat bubbles (one per pickup line)
- Double-tap interaction on each bubble to copy text
- Visual feedback when bubble is tapped/copied
- Chili pepper slider with orange-to-red gradient fill
- "Tap to copy pickup line" hint text

**Interaction Design:**
- Double-tap any message bubble to copy that pickup line to clipboard
- Show brief toast/confirmation when text is copied
- Message bubbles should have subtle press animation

## Visual Design System

### Color Palette
**Primary Colors (from mockups):**
- Background gradient: Light blue to white (#E0F0FF → #FFFFFF)
- Message bubbles: Blue gradient matching iMessage style (#007AFF family)
- Accent: Orange-to-red gradient for chili slider (#FF6B35 → #FF0000)

**UI Elements:**
- Button backgrounds: Match the design mockups (likely solid colors with subtle shadows)
- Text: Dark gray/black for primary text, white for text on colored backgrounds

### Typography
- App title: Bold, large heading font
- Button text: Medium weight, readable size
- Pickup line text: Regular weight, comfortable reading size
- Hint text: Smaller, lighter weight

### Component Styling

**Buttons (Home Screen):**
- Large, pill-shaped buttons with rounded corners
- Sufficient padding for comfortable tapping
- Subtle drop shadow for floating effect:
  - shadowOffset: {width: 0, height: 2}
  - shadowOpacity: 0.10
  - shadowRadius: 2
- Press state: Slight scale down (0.95) with opacity change

**Message Bubbles:**
- Rounded corners (like iMessage)
- Right-aligned on screen
- Blue gradient fill
- White text
- Tail/pointer on bottom-right
- Spacing between bubbles: Spacing.md

**Chili Slider:**
- Horizontal slider component
- Track with orange-to-red gradient fill
- Custom thumb/handle matching design aesthetic
- Positioned below message bubbles

### Icons
- Use Feather icons from @expo/vector-icons
- Back arrow: "arrow-left"
- Plus button: "plus"
- Keep icons simple and consistent with the clean design aesthetic

### Assets Required
**Critical Assets:**
1. App logo/branding for home screen (if shown in mockups)
2. Chili pepper icon/graphic for slider
3. Message tail graphic for iMessage-style bubbles (can be drawn with code)

**Do Not Generate:**
- Standard navigation icons (use system icons)
- Generic decorative elements

## Interaction & Feedback

### Touch Feedback
- All buttons: Scale animation (0.95) + slight opacity change on press
- Message bubbles: Highlight/scale animation on double-tap
- Slider: Standard native slider interaction

### Animations
- Screen transitions: Slide from right (modal-style for pickup line screen)
- Message bubble appearance: Fade in + slide from right (staggered for 3 messages)
- Copy confirmation: Brief toast message or bubble highlight

### Accessibility
- All buttons have accessible labels
- Message text is readable (minimum 16px font size)
- Sufficient contrast ratios for all text
- Haptic feedback on successful copy action

## Data Architecture

### Offline Pickup Line Arrays
Three local arrays stored in app code:
1. **Flirty Pickup Lines** - Playful, lighthearted lines
2. **Poetic Pickup Lines** - Romantic, creative lines  
3. **Sexy/Bold Pickup Lines** - Confident, direct lines

**Selection Logic:**
- Randomly pick one line from EACH of the 3 arrays
- Display all 3 lines (one from each category) on the Pickup Line Display screen
- Each generation produces a new random set

### Local Storage
- No persistent data storage required
- Optional: Store user's favorite lines in AsyncStorage (future enhancement)

## Key Requirements
- ✅ Completely offline - no API calls
- ✅ Image picker uses device's native media library
- ✅ Screenshot analysis is simulated (visual loading state only)
- ✅ All pickup lines are hardcoded in local arrays
- ✅ Design strictly matches provided mockups
- ✅ iMessage-style chat interface for line display
- ✅ Double-tap to copy functionality
- ✅ Chili slider component included