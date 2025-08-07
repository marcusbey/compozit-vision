// Deep Link Handler - Navigation Deep Linking Support
import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface DeepLinkHandlerProps {
  children: React.ReactNode;
}

export const DeepLinkHandler: React.FC<DeepLinkHandlerProps> = ({ children }) => {
  const navigation = useNavigation();

  useEffect(() => {
    // Handle initial URL when app is cold started
    const handleInitialURL = async () => {
      try {
        const initialURL = await Linking.getInitialURL();
        if (initialURL) {
          handleDeepLink(initialURL);
        }
      } catch (error) {
        console.warn('Error getting initial URL:', error);
      }
    };

    // Handle URL when app is already running
    const handleURLChange = (url: string) => {
      handleDeepLink(url);
    };

    handleInitialURL();

    // Subscribe to incoming links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleURLChange(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = (url: string) => {
    try {
      const parsed = parseDeepLink(url);
      if (parsed) {
        navigateToRoute(parsed);
      }
    } catch (error) {
      console.warn('Error handling deep link:', url, error);
    }
  };

  const parseDeepLink = (url: string) => {
    // Expected URL formats:
    // compozit://auth/callback?code=...
    // compozit://project/123
    // compozit://design/456
    // compozit://share/project/789
    // compozit://tutorial/camera

    const urlObj = new URL(url);
    const { protocol, hostname, pathname, searchParams } = urlObj;

    if (protocol !== 'compozit:') {
      return null;
    }

    const pathSegments = pathname.split('/').filter(Boolean);
    
    return {
      host: hostname,
      path: pathSegments,
      params: Object.fromEntries(searchParams.entries()),
    };
  };

  const navigateToRoute = (parsed: { host: string; path: string[]; params: Record<string, string> }) => {
    const { host, path, params } = parsed;

    switch (host) {
      case 'auth':
        handleAuthDeepLink(path, params);
        break;
      
      case 'project':
        handleProjectDeepLink(path, params);
        break;
      
      case 'design':
        handleDesignDeepLink(path, params);
        break;
      
      case 'share':
        handleShareDeepLink(path, params);
        break;
      
      case 'tutorial':
        handleTutorialDeepLink(path, params);
        break;
      
      case 'profile':
        handleProfileDeepLink(path, params);
        break;
      
      default:
        // Navigate to home if unknown deep link
        // @ts-ignore
        navigation.navigate('Home');
        break;
    }
  };

  const handleAuthDeepLink = (path: string[], params: Record<string, string>) => {
    if (path[0] === 'callback') {
      // Handle OAuth callback
      if (params.code) {
        // OAuth success callback
        // @ts-ignore
        navigation.navigate('AuthCallback', { code: params.code });
      } else if (params.error) {
        // OAuth error callback
        // @ts-ignore
        navigation.navigate('AuthError', { error: params.error });
      }
    } else if (path[0] === 'reset-password') {
      // Handle password reset
      // @ts-ignore
      navigation.navigate('ResetPassword', { token: params.token });
    } else if (path[0] === 'verify-email') {
      // Handle email verification
      // @ts-ignore
      navigation.navigate('VerifyEmail', { token: params.token });
    }
  };

  const handleProjectDeepLink = (path: string[], params: Record<string, string>) => {
    const projectId = path[0];
    if (projectId) {
      // @ts-ignore
      navigation.navigate('ProjectDetails', { projectId });
    } else {
      // @ts-ignore
      navigation.navigate('Projects');
    }
  };

  const handleDesignDeepLink = (path: string[], params: Record<string, string>) => {
    const designId = path[0];
    if (designId) {
      // @ts-ignore
      navigation.navigate('DesignViewer', { designId });
    } else {
      // @ts-ignore
      navigation.navigate('Designs');
    }
  };

  const handleShareDeepLink = (path: string[], params: Record<string, string>) => {
    if (path[0] === 'project' && path[1]) {
      // Shared project
      const projectId = path[1];
      // @ts-ignore
      navigation.navigate('SharedProject', { 
        projectId,
        shareCode: params.code
      });
    } else if (path[0] === 'design' && path[1]) {
      // Shared design
      const designId = path[1];
      // @ts-ignore
      navigation.navigate('SharedDesign', { 
        designId,
        shareCode: params.code
      });
    }
  };

  const handleTutorialDeepLink = (path: string[], params: Record<string, string>) => {
    const tutorialType = path[0];
    
    switch (tutorialType) {
      case 'camera':
        // @ts-ignore
        navigation.navigate('CameraTutorial');
        break;
      
      case 'onboarding':
        // @ts-ignore
        navigation.navigate('Onboarding');
        break;
      
      case 'features':
        // @ts-ignore
        navigation.navigate('FeatureTutorial', { feature: params.feature });
        break;
      
      default:
        // @ts-ignore
        navigation.navigate('Tutorial');
        break;
    }
  };

  const handleProfileDeepLink = (path: string[], params: Record<string, string>) => {
    const section = path[0];
    
    switch (section) {
      case 'settings':
        // @ts-ignore
        navigation.navigate('Settings');
        break;
      
      case 'preferences':
        // @ts-ignore
        navigation.navigate('Preferences');
        break;
      
      case 'subscription':
        // @ts-ignore
        navigation.navigate('Subscription');
        break;
      
      default:
        // @ts-ignore
        navigation.navigate('Profile');
        break;
    }
  };

  return <>{children}</>;
};

// Utility functions for generating deep links
export const DeepLinkUtils = {
  // Generate auth callback URL
  getAuthCallbackURL: (provider: string) => {
    return `compozit://auth/callback?provider=${provider}`;
  },

  // Generate project share URL
  getProjectShareURL: (projectId: string, shareCode: string) => {
    return `compozit://share/project/${projectId}?code=${shareCode}`;
  },

  // Generate design share URL
  getDesignShareURL: (designId: string, shareCode: string) => {
    return `compozit://share/design/${designId}?code=${shareCode}`;
  },

  // Generate tutorial URL
  getTutorialURL: (tutorialType: string, feature?: string) => {
    const baseURL = `compozit://tutorial/${tutorialType}`;
    return feature ? `${baseURL}?feature=${feature}` : baseURL;
  },

  // Generate profile URL
  getProfileURL: (section?: string) => {
    return section ? `compozit://profile/${section}` : 'compozit://profile';
  },

  // Generate password reset URL
  getPasswordResetURL: (token: string) => {
    return `compozit://auth/reset-password?token=${token}`;
  },

  // Generate email verification URL
  getEmailVerificationURL: (token: string) => {
    return `compozit://auth/verify-email?token=${token}`;
  },

  // Open external URL with fallback
  openURL: async (url: string, fallbackURL?: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else if (fallbackURL) {
        await Linking.openURL(fallbackURL);
      }
    } catch (error) {
      console.warn('Error opening URL:', url, error);
      if (fallbackURL) {
        try {
          await Linking.openURL(fallbackURL);
        } catch (fallbackError) {
          console.warn('Error opening fallback URL:', fallbackURL, fallbackError);
        }
      }
    }
  },
};