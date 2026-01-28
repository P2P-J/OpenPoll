# Voting System with Points Implementation

## Overview

This implementation provides a complete voting system with:
- ✅ Points deduction (5 points per vote)
- ✅ Real-time points display with animations
- ✅ Visual feedback (ripple effects, loading states, animations)
- ✅ Sound effects (optional)
- ✅ Insufficient points warnings
- ✅ Multiple voting support

---

## Architecture

### State Management

**UserContext** (`src/contexts/UserContext.tsx`)
- Manages user points (500 initial points)
- Provides `deductPoints()` function
- Auto-recharges points daily

**VotingContext** (`src/contexts/VotingContext.tsx`)
- Handles vote casting
- Updates party statistics
- Syncs with UserContext for points

---

## Components

### 1. VoteButton Component
**Location**: `src/components/atoms/voteButton/VoteButton.tsx`

**Features**:
- Ripple animation on click
- Press animation (scale down on click)
- Loading spinner during vote
- Success animation when vote completes
- Disabled state when insufficient points

**Props**:
```typescript
interface VoteButtonProps {
  isSelected: boolean;      // Show "투표완료" state
  isLoading?: boolean;       // Show loading spinner
  disabled?: boolean;        // Disable button (e.g., insufficient points)
  onClick: () => void;       // Click handler
  className?: string;        // Additional styles
}
```

**Usage**:
```tsx
<VoteButton
  isSelected={selectedParty === party.id}
  isLoading={loadingParty === party.id}
  disabled={points < 5}
  onClick={() => handleVote(party.id)}
/>
```

---

### 2. PointsDisplay Component
**Location**: `src/components/atoms/pointsDisplay/PointsDisplay.tsx`

**Features**:
- Animated points counter
- Color-coded warnings:
  - Red: < 5 points (critical - can't vote)
  - Yellow: < 25 points (low - warning)
  - White: ≥ 25 points (normal)
- Shows point delta (±X animation)
- Coin icon

**Props**:
```typescript
interface PointsDisplayProps {
  points: number;           // Current points
  className?: string;       // Additional styles
  showAnimation?: boolean;  // Enable/disable animations (default: true)
}
```

**Usage**:
```tsx
<PointsDisplay points={userPoints} />
```

---

### 3. SupportRateSection (Updated)
**Location**: `src/pages/home/components/SupportRateSection.tsx`

**Changes**:
- Integrated VoteButton and PointsDisplay
- Added insufficient points warning banner
- Added loading states during voting
- Shows remaining points after vote

---

## Sound Effects

### Sound Manager
**Location**: `src/utils/sound.ts`

**Features**:
- Web Audio API-based sound generation
- No external audio files needed
- Three sound types:
  - `vote`: Pleasant "ding" sound on button click
  - `success`: Ascending tones on successful vote
  - `error`: Lower tone on error

**API**:
```typescript
// Play a sound effect
playSoundEffect('vote' | 'error' | 'success');

// Enable/disable globally
setSoundEnabled(true | false);

// Check if enabled
isSoundEnabled();
```

**Usage in VoteButton**:
```typescript
import { playSoundEffect } from '@/utils/sound';

const handleClick = () => {
  playSoundEffect('vote');  // Play click sound
  onClick();                 // Execute vote
};
```

---

## Animations

### Ripple Effect
**CSS**: `src/styles/animations.css`

```css
@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(20);
    opacity: 0;
  }
}

.animate-ripple {
  animation: ripple 0.6s ease-out;
}
```

### Other Animations
- **Press effect**: Scale down on click (whileTap in Framer Motion)
- **Success pulse**: Expanding white overlay when vote completes
- **Point delta**: Color-coded sliding animation
- **Warning banner**: Slide in/out with height animation

---

## Flow Diagram

```
User clicks Vote Button
        ↓
Check if points >= 5
        ↓
     [YES]                    [NO]
        ↓                      ↓
Play sound effect         Show warning
Create ripple effect      Disable button
Show loading state
        ↓
Call votingService.castVote()
        ↓
Deduct 5 points
Increment party vote
        ↓
Update UI:
- Show "투표완료" button
- Update points display (-5)
- Show success message
- Animate percentage change
```

---

## Points System Rules

1. **Initial Points**: 500 points on first visit
2. **Vote Cost**: 5 points per vote
3. **Multiple Votes**: Users can vote multiple times for the same or different parties
4. **Daily Recharge**: Points automatically recharge to 500 at midnight
5. **Minimum**: Must have ≥ 5 points to vote
6. **Persistence**: Stored in localStorage

---

## Testing the Implementation

### 1. Normal Vote
1. Open the app (you should have 500 points)
2. Click any "투표하기" button
3. Observe:
   - Ripple effect on button
   - Sound effect plays
   - Loading spinner appears
   - Button changes to "투표완료"
   - Points decrease by 5
   - Success message appears

### 2. Multiple Votes
1. Vote for different parties
2. Each vote should:
   - Deduct 5 points
   - Update the statistics
   - Play sound effect
   - Show visual feedback

### 3. Insufficient Points
1. Manually reduce points in localStorage to < 5
2. Refresh page
3. Observe:
   - Red warning banner appears
   - Vote buttons are disabled
   - Points display is red
   - Cannot vote

---

## Customization

### Change Vote Cost
Edit `src/services/voting.service.ts`:
```typescript
const VOTE_COST = 5;  // Change this value
```

### Disable Sound Effects
```typescript
import { setSoundEnabled } from '@/utils/sound';

setSoundEnabled(false);  // Disable all sounds
```

### Customize Animations
Edit `src/styles/animations.css` to modify:
- Ripple speed/size
- Button press scale
- Color transitions

### Change Point Thresholds
Edit `src/components/atoms/pointsDisplay/PointsDisplay.tsx`:
```typescript
const isLowPoints = points < 25;      // Warning threshold
const isCriticalPoints = points < 5;  // Critical threshold
```

---

## File Structure

```
src/
├── components/
│   └── atoms/
│       ├── voteButton/
│       │   ├── VoteButton.tsx     ← New enhanced button
│       │   └── index.ts
│       ├── pointsDisplay/
│       │   ├── PointsDisplay.tsx  ← New points display
│       │   └── index.ts
│       └── index.ts               ← Updated exports
├── contexts/
│   ├── UserContext.tsx            ← Existing (manages points)
│   └── VotingContext.tsx          ← Existing (handles votes)
├── services/
│   └── voting.service.ts          ← Existing (5-point deduction)
├── utils/
│   └── sound.ts                   ← New sound manager
├── styles/
│   └── animations.css             ← Updated (ripple effect)
└── pages/
    └── home/
        └── components/
            └── SupportRateSection.tsx  ← Updated integration
```

---

## Troubleshooting

### Sound not playing?
- Browser may block autoplay. User must interact with the page first.
- Check browser console for errors.
- Verify Web Audio API support.

### Points not updating?
- Check localStorage: `voting-user` key should contain points
- Verify UserContext is wrapped around the app
- Check browser console for errors

### Animations not working?
- Verify motion library is installed: `npm list motion`
- Check for CSS conflicts
- Try disabling browser extensions

---

## Performance Considerations

- **Animations**: Uses CSS and Framer Motion for GPU-accelerated animations
- **Sound**: Lazy-loads AudioContext on first user interaction
- **State Updates**: Optimized with useCallback and memo
- **Real-time Sync**: Uses BroadcastChannel for cross-tab sync

---

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ⚠️ IE11: Not supported (motion library requires modern JS)

---

## Future Enhancements

Potential improvements:
- [ ] Add confetti animation on vote
- [ ] Sound toggle in settings
- [ ] Point purchase system
- [ ] Vote history visualization
- [ ] Achievement badges
- [ ] Daily streak bonuses
- [ ] Social sharing of votes

---

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all dependencies are installed
3. Review this documentation
4. Contact the development team
