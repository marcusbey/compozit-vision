import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Alert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../stores/userStore';

interface BuyCreditsScreenProps {
  navigation: any;
  route: any;
}

const PACKS = [
  { id: 'pack_25', tokens: 25, priceLabel: '$4.99', stripeLink: 'https://buy.stripe.com/test_XXXXX25' },
  { id: 'pack_50', tokens: 50, priceLabel: '$8.99', stripeLink: 'https://buy.stripe.com/test_XXXXX50' },
  { id: 'pack_100', tokens: 100, priceLabel: '$15.99', stripeLink: 'https://buy.stripe.com/test_XXXXX100' },
];

const BuyCreditsScreen: React.FC<BuyCreditsScreenProps> = ({ navigation, route }) => {
  const { user, updateUserTokens } = useUserStore();
  const [selectedPack, setSelectedPack] = useState<typeof PACKS[number] | null>(null);
  const returnScreen = route.params?.returnScreen ?? 'Processing';
  const returnParams = route.params?.returnParams ?? {};

  const handleOpenStripe = async () => {
    if (!selectedPack) {
      Alert.alert('Choose a pack', 'Please select a credit pack.');
      return;
    }
    try {
      await Linking.openURL(selectedPack.stripeLink);
      Alert.alert(
        'Test payment',
        "Use a Stripe test card (e.g. 4242 4242 4242 4242, 12/34, 123). After payment, come back to the app and press 'I paid' to credit your account.",
      );
    } catch (e) {
      Alert.alert('Error', 'Unable to open the payment page.');
    }
  };

  const handleConfirmPaid = async () => {
    if (!selectedPack) {
      Alert.alert('Choose a pack', 'Please select a credit pack.');
      return;
    }
    if (!user) {
      Alert.alert('Not signed in', 'Please sign in.');
      navigation.navigate('Auth');
      return;
    }

    const newTotal = (user.nbToken || 0) + selectedPack.tokens;
    try {
      await updateUserTokens(newTotal);
      Alert.alert('Credits added', `+${selectedPack.tokens} credits added. Total: ${newTotal}`);
      // Reprendre le flux de génération
      navigation.replace(returnScreen, returnParams);
    } catch (e) {
      Alert.alert('Error', 'Unable to credit your account.');
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <LinearGradient colors={["#1a1a2e", "#16213e", "#0f3460"]} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buy credits</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>You have no credits left.</Text>
          <Text style={styles.subtitle2}>Choose a pack to continue the generation.</Text>

          <View style={styles.packsContainer}>
            {PACKS.map((pack) => (
              <TouchableOpacity
                key={pack.id}
                style={[styles.packCard, selectedPack?.id === pack.id && styles.packCardSelected]}
                onPress={() => setSelectedPack(pack)}
                activeOpacity={0.85}
              >
                <Text style={styles.packTitle}>{pack.tokens} credits</Text>
                <Text style={styles.packPrice}>{pack.priceLabel}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleOpenStripe} activeOpacity={0.9}>
              <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.primaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="card-outline" size={20} color="#ffffff" />
                <Text style={styles.primaryText}>Pay with Stripe (test)</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleConfirmPaid} activeOpacity={0.9}>
              <Text style={styles.secondaryText}>I paid (credit my account)</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.note}>
            Test mode: use Stripe test cards. Replace these placeholder links with your Payment Links.
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  gradient: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#ffffff', letterSpacing: 1 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  subtitle: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  subtitle2: { color: '#b8c6db', fontSize: 14, marginBottom: 20 },
  packsContainer: { gap: 12 },
  packCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  packCardSelected: { borderColor: 'rgba(79, 172, 254, 0.8)', backgroundColor: 'rgba(79, 172, 254, 0.08)' },
  packTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  packPrice: { color: '#4facfe', fontSize: 16, fontWeight: '600', marginTop: 6 },
  actions: { marginTop: 24, gap: 12 },
  primaryBtn: { borderRadius: 28, overflow: 'hidden' },
  primaryGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 24 },
  primaryText: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  secondaryBtn: { paddingVertical: 12, alignItems: 'center', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  secondaryText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  note: { color: '#8892b0', fontSize: 12, marginTop: 16 },
});

export default BuyCreditsScreen;
