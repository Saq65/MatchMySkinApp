import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { useTheme } from '../context/ThemeContext';
import type { RootStackParamList } from '../navigation/types';
import type { ThemeColors } from '../theme/colors';
import { rf, rh } from '../theme/responsive';
import { spacing } from '../theme/spacing';
import { useThemedStyles } from '../theme/useThemedStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'>;

type Section = {
  heading: string;
  body: string[];
};

const LAST_UPDATED = 'August 17, 2026';

const INTRO =
  'This policy explains what information roopsee collects when you use the app, why we collect it, and the choices you have.';

const SECTIONS: Section[] = [
  {
    heading: 'Information We Collect',
    body: [
      'Account information. When you sign in, we collect your phone number for OTP-based verification (processed via our SMS/OTP provider, MSG91) and, where provided, your email address and basic profile details.',
      'Skin quiz responses. Answers you provide in the skin-profile quiz, used to generate personalized product recommendations.',
      'Usage data. Your wishlist, saved products, and order/search history within the app, used to operate core app features.',
      'Device storage. Some preferences (such as theme selection) and session information are stored locally on your device.',
      'We do not collect precise location, camera, or contact-list data. The app requests only network (internet) access.',
    ],
  },
  {
    heading: 'How We Use Your Information',
    body: [
      'To authenticate you and maintain your account session.',
      'To generate personalized skincare product recommendations based on your quiz answers.',
      'To operate features such as wishlist, search, and order history.',
      'To communicate with you regarding your account or orders.',
    ],
  },
  {
    heading: 'Data Sharing',
    body: [
      'We share your phone number with our OTP verification provider (MSG91) solely to deliver and verify one-time passcodes. We do not sell your personal information to third parties.',
    ],
  },
  {
    heading: 'Data Retention',
    body: [
      "We retain your account and profile data for as long as your account remains active, or as needed to provide the app's services. You may request deletion of your account and associated data at any time by contacting us.",
    ],
  },
  {
    heading: 'Your Choices',
    body: [
      'You can update or delete your account information, or request a copy of your data, by contacting us at the email below.',
    ],
  },
  {
    heading: "Children's Privacy",
    body: [
      'roopsee is not directed at children under 13, and we do not knowingly collect personal information from children under 13.',
    ],
  },
  {
    heading: 'Changes to This Policy',
    body: [
      'We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.',
    ],
  },
  {
    heading: 'Contact Us',
    body: ['Questions about this Privacy Policy? Reach us at contact@roopsee.com.'],
  },
];

export function PrivacyPolicyScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(colors, createStyles);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Privacy policy" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last updated — {LAST_UPDATED}</Text>
        <Text style={styles.intro}>{INTRO}</Text>

        {SECTIONS.map(section => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.heading}>{section.heading}</Text>
            {section.body.map(paragraph => (
              <Text key={paragraph} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl,
    },
    lastUpdated: {
      fontSize: rf(12),
      fontWeight: '700',
      letterSpacing: 0.5,
      color: colors.textMuted,
      textTransform: 'uppercase',
      marginBottom: spacing.sm,
    },
    intro: {
      fontSize: rf(15),
      color: colors.textMuted,
      lineHeight: rf(22),
      marginBottom: spacing.lg,
    },
    section: {
      marginBottom: spacing.lg,
    },
    heading: {
      fontSize: rf(17),
      fontWeight: '700',
      color: colors.text,
      marginBottom: rh(8),
    },
    paragraph: {
      fontSize: rf(14),
      color: colors.text,
      lineHeight: rf(21),
      marginBottom: rh(10),
    },
  });
