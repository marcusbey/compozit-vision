import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import JourneyProgressBar from '../../components/ProgressBar/JourneyProgressBar';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import { useJourneyStore } from '../../stores/journeyStore';
import { useUserStore } from '../../stores/userStore';
import { tokens } from '../../theme/tokens';

interface BudgetScreenProps {
  navigation?: any;
  route?: any;
}

const BudgetScreen: React.FC<BudgetScreenProps> = ({ navigation }) => {
  const [budgetValue, setBudgetValue] = useState<number>(0.25); // Start at 25% of slider (50K)
  const journeyStore = useJourneyStore();
  const { isAuthenticated, user } = useUserStore();

  // Set current step when screen mounts
  useEffect(() => {
    journeyStore.setCurrentStep(6, 'budget');
  }, []);

  // Convert slider value to budget amount with 80/20 mapping
  const sliderValueToBudget = (value: number): number => {
    if (value <= 0.8) {
      // First 80%: 0-100K (detailed movement for most common budgets)
      return (value / 0.8) * 100000; // 0.8 = 100K
    } else {
      // Last 20%: 100K-500K+ (fast movement for high budgets)
      const remainingValue = value - 0.8; // 0-0.2 range
      return 100000 + (remainingValue / 0.2) * 400000; // 100K + 400K = 500K
    }
  };

  const formatBudget = (amount: number): string => {
    if (amount >= 500000) return '$500,000+';
    if (amount >= 100000) return `$${Math.round(amount / 1000)}K`;
    if (amount >= 1000) return `$${Math.round(amount / 1000)}K`;
    return `$${Math.round(amount).toLocaleString()}`;
  };

  const getBudgetDescription = (amount: number): string => {
    if (amount < 5000) return 'Budget-friendly refresh';
    if (amount < 15000) return 'Moderate makeover';
    if (amount < 50000) return 'Full transformation';
    if (amount < 100000) return 'Premium redesign';
    return 'Luxury complete renovation';
  };

  const currentBudget = sliderValueToBudget(budgetValue);

  const handleSliderChange = (value: number) => {
    setBudgetValue(value);
  };

  const handleContinue = () => {
    const finalBudget = sliderValueToBudget(budgetValue);

    // Save budget selection to journey store
    journeyStore.updateProject({
      budgetRange: {
        min: Math.max(0, finalBudget - 5000),
        max: finalBudget >= 500000 ? 1000000 : finalBudget + 5000,
        currency: 'USD',
      }
    });

    journeyStore.completeStep('budget');

    console.log('💰 Budget selected:', formatBudget(finalBudget));

    // Navigate to furniture selection screen
    console.log('💰 Budget selected, proceeding to furniture selection');
    NavigationHelpers.navigateToScreen('furnitureSelection');
  };

  const goBack = () => {
    NavigationHelpers.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Progress Bar */}
      <JourneyProgressBar />

      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={tokens.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Budget Range</Text>
      </View>

        <ScrollView style={styles.scrollContainer}>
          <View style={styles.content}>
            <Text style={styles.subtitle}>What's your budget for this project?</Text>
            <Text style={styles.helperText}>Drag the slider to set your budget range</Text>

            {/* Budget Display */}
            <View style={styles.budgetDisplay}>
              <Text style={styles.budgetAmount}>
                {formatBudget(currentBudget)}
              </Text>
              <Text style={styles.budgetDescription}>
                {getBudgetDescription(currentBudget)}
              </Text>
            </View>

            {/* Custom Slider */}
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                value={budgetValue}
                onValueChange={handleSliderChange}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor={tokens.colors.primary.DEFAULT}
                maximumTrackTintColor={tokens.colors.border.light}
                thumbTintColor={tokens.colors.primary.dark}
              />

              {/* Slider Labels */}
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>$0</Text>
                <Text style={styles.sliderLabel}>$100K</Text>
                <Text style={styles.sliderLabel}>$500K+</Text>
              </View>

              {/* Slider Guide */}
              <Text style={styles.sliderGuide}>
                💡 First 80% covers $0-$100K for precise selection, last 20% covers $100K-$500K+
              </Text>
            </View>

            {/* Selection Summary */}
            <View style={styles.selectionSummary}>
              <Text style={styles.selectionText}>
                ✨ Perfect! We'll find amazing options around {formatBudget(currentBudget)}.
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleContinue}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[tokens.colors.primary.light, tokens.colors.primary.DEFAULT] as [string, string]}
                style={styles.primaryButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.primaryButtonText}>
                  Continue with {formatBudget(currentBudget)}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    textAlign: 'center',
    flex: 1,
    marginRight: 56,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  helperText: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  budgetDisplay: {
    alignItems: 'center',
    marginBottom: 40,
    padding: 24,
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  budgetAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: tokens.colors.primary.DEFAULT,
    marginBottom: 8,
    textAlign: 'center',
  },
  budgetDescription: {
    fontSize: 16,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
  },
  sliderContainer: {
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  slider: {
    width: '100%',
    height: 60,
    marginBottom: 20,
  },
  sliderThumb: {
    backgroundColor: tokens.colors.primary.dark,
    width: 30,
    height: 30,
    borderRadius: 15,
    shadowColor: tokens.colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sliderTrack: {
    height: 8,
    borderRadius: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    fontWeight: '500',
  },
  sliderGuide: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  selectionSummary: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: tokens.colors.background.tertiary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  selectionText: {
    fontSize: 14,
    color: tokens.colors.primary.DEFAULT,
    textAlign: 'center',
    fontWeight: '500',
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: tokens.colors.primary.DEFAULT,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryButtonText: {
    color: tokens.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BudgetScreen;
