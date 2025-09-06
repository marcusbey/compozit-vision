import React, { ReactNode } from 'react';
import { 
  SafeAreaView, 
  StatusBar, 
  ScrollView, 
  StyleSheet,
  View
} from 'react-native';
import { ProgressHeader } from '@ui/ProgressHeader';
import { tokens } from '@theme';

interface WizardScreenLayoutProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  step?: number;
  totalSteps?: number;
  children: ReactNode;
  scrollable?: boolean;
  bottomAction?: ReactNode;
}

export const WizardScreenLayout: React.FC<WizardScreenLayoutProps> = ({
  title,
  subtitle,
  onBack,
  step,
  totalSteps,
  children,
  scrollable = true,
  bottomAction
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.background.primary} translucent={false} />
      
      <View style={styles.wrapper}>
        <ProgressHeader
          title={title}
          subtitle={subtitle}
          onBack={onBack}
          step={step}
          totalSteps={totalSteps}
        />

        {scrollable ? (
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.content}>
              {children}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.content}>
            {children}
          </View>
        )}

        {bottomAction && (
          <View style={styles.bottomContainer}>
            {bottomAction}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  wrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  content: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xl,
  },
  bottomContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: 40,
    backgroundColor: tokens.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.soft,
    paddingTop: tokens.spacing.xl,
  },
});