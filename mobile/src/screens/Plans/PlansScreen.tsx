import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useUserStore } from '../../stores/userStore';

interface Plan {
  id: string;
  name: string;
  price: string;
  pricePerMonth: number;
  tokens: number;
  features: string[];
  popular?: boolean;
  description: string;
  badge?: string;
}

const PlansScreen = ({ navigation }: any) => {
  const { user, updateUserPlan } = useUserStore();
  const [selectedPlan, setSelectedPlan] = useState(user?.currentPlan || 'free');

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Gratuit',
      price: '0€',
      pricePerMonth: 0,
      tokens: 50,
      description: 'Parfait pour découvrir Compozit Vision',
      features: [
        '50 tokens de génération IA',
        '3 projets maximum',
        'Styles de base (5 styles)',
        'Support communautaire',
        'Résolution standard',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '19€',
      pricePerMonth: 19,
      tokens: 500,
      popular: true,
      badge: 'Le plus populaire',
      description: 'Idéal pour les professionnels et passionnés',
      features: [
        '500 tokens de génération IA',
        'Projets illimités',
        'Tous les styles disponibles (15+ styles)',
        'Support prioritaire',
        'Résolution haute qualité',
        'Export en haute résolution',
        'Historique des générations',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '49€',
      pricePerMonth: 49,
      tokens: 1500,
      badge: 'Meilleure valeur',
      description: 'Pour les architectes et designers professionnels',
      features: [
        '1500 tokens de génération IA',
        'Projets et équipes illimités',
        'Styles premium exclusifs (25+ styles)',
        'Support dédié 24/7',
        'Résolution ultra haute qualité',
        'API access pour intégrations',
        'Génération batch (plusieurs images)',
        'Analyse avancée des espaces',
        'Suggestions de mobilier premium',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Sur mesure',
      pricePerMonth: 0,
      tokens: -1, // Illimité
      badge: 'Contact requis',
      description: 'Solutions personnalisées pour les entreprises',
      features: [
        'Tokens illimités',
        'Déploiement on-premise',
        'Intégration API complète',
        'Formation équipe incluse',
        'SLA garanti 99.9%',
        'Modèles IA personnalisés',
        'Branding personnalisé',
        'Conformité RGPD avancée',
      ],
    },
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = async () => {
    if (selectedPlan === user?.currentPlan) {
      Alert.alert('Information', 'Vous êtes déjà sur ce plan !');
      return;
    }

    if (selectedPlan === 'enterprise') {
      Alert.alert(
        'Contact Enterprise',
        'Pour le plan Enterprise, veuillez nous contacter à enterprise@compozit.com',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Confirmer l\'abonnement',
      `Voulez-vous passer au plan ${plans.find(p => p.id === selectedPlan)?.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              // Ici, vous intégreriez votre système de paiement (Stripe, etc.)
              const selectedPlanData = plans.find(p => p.id === selectedPlan);
              if (selectedPlanData) {
                await updateUserPlan(selectedPlan, selectedPlanData.tokens);
                Alert.alert(
                  'Succès !',
                  `Vous êtes maintenant sur le plan ${selectedPlanData.name}`,
                  [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
              }
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de mettre à jour votre plan');
            }
          },
        },
      ]
    );
  };

  const renderPlan = (plan: Plan) => {
    const isSelected = selectedPlan === plan.id;
    const isCurrentPlan = user?.currentPlan === plan.id;

    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planCard,
          isSelected && styles.planCardSelected,
          plan.popular && styles.planCardPopular,
        ]}
        onPress={() => handleSelectPlan(plan.id)}
      >
        {plan.badge && (
          <View style={[
            styles.badge,
            plan.popular ? styles.badgePopular : styles.badgeDefault
          ]}>
            <Text style={[
              styles.badgeText,
              plan.popular ? styles.badgeTextPopular : styles.badgeTextDefault
            ]}>
              {plan.badge}
            </Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.planPrice}>{plan.price}</Text>
            {plan.pricePerMonth > 0 && (
              <Text style={styles.planPriceUnit}>/mois</Text>
            )}
          </View>
        </View>

        <Text style={styles.planDescription}>{plan.description}</Text>

        <View style={styles.tokensContainer}>
          <Text style={styles.tokensLabel}>Tokens IA inclus:</Text>
          <Text style={styles.tokensValue}>
            {plan.tokens === -1 ? 'Illimités' : `${plan.tokens.toLocaleString()}`}
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {isCurrentPlan && (
          <View style={styles.currentPlanBadge}>
            <Text style={styles.currentPlanText}>Plan actuel</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Choisir un Plan</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Choisissez le plan qui correspond à vos besoins
          </Text>

          <View style={styles.plansContainer}>
            {plans.map(renderPlan)}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>💡 Comment fonctionnent les tokens ?</Text>
            <Text style={styles.infoText}>
              • 1 token = 1 génération d'image IA{'\n'}
              • Les tokens se rechargent chaque mois{'\n'}
              • Qualité supérieure = plus de détails et précision{'\n'}
              • Changement de plan possible à tout moment
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.subscribeButton,
            selectedPlan === user?.currentPlan && styles.subscribeButtonDisabled,
          ]}
          onPress={handleSubscribe}
          disabled={selectedPlan === user?.currentPlan}
        >
          <Text style={styles.subscribeButtonText}>
            {selectedPlan === user?.currentPlan
              ? 'Plan actuel'
              : selectedPlan === 'enterprise'
              ? 'Nous contacter'
              : `Passer au plan ${plans.find(p => p.id === selectedPlan)?.name}`
            }
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  plansContainer: {
    gap: 20,
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f8fcff',
  },
  planCardPopular: {
    borderColor: '#34C759',
    backgroundColor: '#f8fff9',
  },
  badge: {
    position: 'absolute',
    top: -8,
    left: 24,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePopular: {
    backgroundColor: '#34C759',
  },
  badgeDefault: {
    backgroundColor: '#007AFF',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextPopular: {
    color: '#ffffff',
  },
  badgeTextDefault: {
    color: '#ffffff',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
    marginTop: 8,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  planPriceUnit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
    marginBottom: 2,
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  tokensContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  tokensLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tokensValue: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  featuresContainer: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    marginTop: 1,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  currentPlanBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  currentPlanText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginTop: 32,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  subscribeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  subscribeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  subscribeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PlansScreen;
