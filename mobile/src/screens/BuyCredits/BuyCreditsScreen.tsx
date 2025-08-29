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
      <StatusBar barStyle="dark-content" backgroundColor="#FBF9F4" />
      <View style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2D2B28" />
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
              <LinearGradient colors={["#E8C097", "#D4A574"]} style={styles.primaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="card-outline" size={20} color="#2D2B28" />
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBF9F4' },
  gradient: { flex: 1, backgroundColor: '#FBF9F4' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEFEFE', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#2D2B28', letterSpacing: 1 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  subtitle: { color: '#2D2B28', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  subtitle2: { color: '#8B7F73', fontSize: 14, marginBottom: 20 },
  packsContainer: { gap: 12 },
  packCard: { backgroundColor: '#FEFEFE', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E6DDD1' },
  packCardSelected: { borderColor: '#D4A574', backgroundColor: 'rgba(212, 165, 116, 0.08)' },
  packTitle: { color: '#2D2B28', fontSize: 18, fontWeight: '700' },
  packPrice: { color: '#D4A574', fontSize: 16, fontWeight: '600', marginTop: 6 },
  actions: { marginTop: 24, gap: 12 },
  primaryBtn: { borderRadius: 28, overflow: 'hidden', shadowColor: '#D4A574', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6 },
  primaryGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 24 },
  primaryText: { color: '#2D2B28', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  secondaryBtn: { paddingVertical: 12, alignItems: 'center', borderRadius: 10, backgroundColor: '#FEFEFE', borderWidth: 1, borderColor: '#E6DDD1' },
  secondaryText: { color: '#2D2B28', fontSize: 15, fontWeight: '600' },
  note: { color: '#8B7F73', fontSize: 12, marginTop: 16 },
});

export default BuyCreditsScreen;
