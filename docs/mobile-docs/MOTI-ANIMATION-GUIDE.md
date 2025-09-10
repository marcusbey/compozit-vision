# Moti Animation Library - React Native Framer Motion Alternative

## 🎯 **What is Moti?**

Moti is the **React Native equivalent of Framer Motion**, created by Fernando Rojo. It provides a declarative API for animations built on top of React Native Reanimated.

## 📦 **Installation**

```bash
npm install moti
# or
yarn add moti
```

**Prerequisites:** You already have `react-native-reanimated ~3.17.4` installed ✅

## ✨ **Key Features**

- **Declarative Animations** - Similar to Framer Motion's API
- **Built on Reanimated** - Native performance 
- **Layout Animations** - Automatic layout transitions
- **Gesture Support** - Built-in gesture handling
- **Exit Animations** - Smooth unmount animations
- **TypeScript Support** - Full type safety

## 🚀 **Basic Usage Examples**

### **Simple Fade In:**
```tsx
import { MotiView } from 'moti'

<MotiView
  from={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ type: 'timing', duration: 1000 }}
>
  <Text>Fade in content</Text>
</MotiView>
```

### **Sequence Animations:**
```tsx
<MotiView
  from={{ opacity: 0, translateY: 50 }}
  animate={{ opacity: 1, translateY: 0 }}
  exit={{ opacity: 0, translateY: -50 }}
  transition={{
    type: 'spring',
    damping: 15,
    stiffness: 150,
  }}
>
  <YourComponent />
</MotiView>
```

### **Carousel Enhancement Example:**
```tsx
// Enhanced StableCarousel with Moti
import { MotiView } from 'moti'

const renderImageItem = ({ item, index }) => (
  <MotiView
    from={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.8, opacity: 0 }}
    transition={{ type: 'spring', delay: index * 100 }}
  >
    <ExpoImage source={item.source} style={styles.image} />
  </MotiView>
);
```

## 🎬 **Advanced Features**

### **Layout Animations:**
```tsx
<MotiView layout transition={{ type: 'spring' }}>
  {/* Content that changes size/position */}
</MotiView>
```

### **Gesture-Driven Animations:**
```tsx
<MotiPressable
  animate={({ pressed }) => ({
    scale: pressed ? 0.95 : 1,
  })}
>
  <YourButton />
</MotiPressable>
```

### **Loop Animations:**
```tsx
<MotiView
  from={{ rotate: '0deg' }}
  animate={{ rotate: '360deg' }}
  transition={{
    type: 'timing',
    duration: 2000,
    loop: true,
  }}
>
  <LoadingSpinner />
</MotiView>
```

## 🔧 **Integration with Current Project**

### **Option 1: Enhance StableCarousel**
- Add subtle entrance animations for images
- Smooth transitions between carousel items
- Enhanced loading states

### **Option 2: Upgrade Onboarding Animations**
- Replace complex `Animated.Value` usage
- Declarative fade/slide animations
- Better animation sequencing

### **Option 3: Global Animation System**
- Create reusable animation components
- Consistent animation timing
- Better animation performance

## ⚡ **Performance Comparison**

| Feature | Current (Animated API) | Moti + Reanimated |
|---------|------------------------|-------------------|
| **Performance** | Good | Excellent |
| **Bundle Size** | Smaller | +12KB |
| **Developer Experience** | Complex | Simple |
| **Maintenance** | High effort | Low effort |
| **Animation Quality** | Good | Excellent |

## 🎯 **Recommendation**

**For your carousel fix:** Stick with the current StableCarousel implementation - it's already stable and performant.

**For future enhancements:** Consider adding Moti for:
1. **Complex onboarding sequences** (screen 1, 2, 3 transitions)
2. **Button interactions** (press animations, loading states)  
3. **Modal/panel animations** (slide up, fade in/out)
4. **List item animations** (staggered loading, reorder animations)

## 📚 **Documentation**
- **Official Docs:** https://moti.fyi/
- **Examples:** https://github.com/nandorojo/moti/tree/main/packages/moti
- **API Reference:** https://moti.fyi/api

---

**Current Status:** Your carousel is now stable with React Native Reanimated. Moti can be added later for enhanced animations across the app!