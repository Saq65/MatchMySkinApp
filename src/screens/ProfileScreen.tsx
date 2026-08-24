import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useFocusEffect } from '@react-navigation/native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { QuizProfile } from '../services/quizApi';
import { getStoredQuizProfile } from '../services/quizProfileStorage';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import type { ThemeColors } from '../theme/colors';
import type { IoniconName } from '../theme/icons';
import { rf, rh, rw } from '../theme/responsive';
import { radii, spacing } from '../theme/spacing';
import { useThemedStyles } from '../theme/useThemedStyles';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

type MenuKey = 'Orders' | 'Settings' | 'Login' | 'logout';

function menuItems(isLoggedIn: boolean): Array<{ key: MenuKey; label: string; icon: IoniconName }> {
  return [
    { key: 'Orders', label: 'My orders', icon: 'list-outline' },
    { key: 'Settings', label: 'Settings', icon: 'settings-outline' },
    isLoggedIn
      ? { key: 'logout', label: 'Log out', icon: 'log-out-outline' }
      : { key: 'Login', label: 'Log in', icon: 'log-in-outline' },
  ];
}

function joinOrNone(values: string[]): string {
  return values.length > 0 ? values.join(', ') : 'None';
}

function skinProfileRows(profile: QuizProfile) {
  return [
    { label: 'skin type', value: profile.selectedSkinType || '—' },
    { label: 'skin concern', value: joinOrNone(profile.selectedFaceBodyConcerns) },
    { label: 'age', value: profile.age || '—' },
    { label: 'special concerns', value: joinOrNone(profile.selectedSpecialConditions) },
    { label: 'skin sensitivity', value: profile.selectedSensitive ? 'Yes' : 'No' },
  ];
}

export function ProfileScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(colors, createStyles);
  const { isLoggedIn, userName, logout } = useAuth();
  const [profile, setProfile] = useState<QuizProfile | null | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getStoredQuizProfile()
        .then(stored => {
          if (!cancelled) {
            setProfile(stored);
          }
        })
        .catch(err => {
          console.warn('[quizProfileStorage] read failed:', err);
          if (!cancelled) {
            setProfile(null);
          }
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={rw(28)} color={colors.primaryDark} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName ?? 'Guest'}</Text>
            <Text style={styles.userSubtitle}>
              {profile
                ? `${profile.selectedSkinType} skin${profile.selectedSensitive ? ', sensitive' : ''}`
                : 'Take the quiz to build your skin profile'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>SKIN PROFILE</Text>
        {profile ? (
          <View style={styles.card}>
            {skinProfileRows(profile).map((row, index) => (
              <TouchableOpacity
                key={row.label}
                style={[styles.profileRow, index === 0 && styles.profileRowFirst]}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Quiz')}
              >
                <Text style={styles.profileRowLabel}>{row.label}</Text>
                <View style={styles.profileRowValue}>
                  <Text style={styles.profileRowValueText} numberOfLines={1}>
                    {row.value}
                  </Text>
                  <Ionicons name="chevron-forward" size={rw(16)} color={colors.tabInactive} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.emptyProfileText}>
              You haven't taken the skin quiz yet. Complete it to see your skin profile here.
            </Text>
            <TouchableOpacity
              style={styles.quizButton}
              onPress={() => navigation.navigate('Quiz')}
              activeOpacity={0.85}
            >
              <Text style={styles.quizButtonText}>Take the skin quiz</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          {menuItems(isLoggedIn).map((item, index) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.menuRow, index === 0 && styles.profileRowFirst]}
              activeOpacity={0.7}
              onPress={() => {
                if (item.key === 'logout') {
                  logout();
                  return;
                }
                navigation.navigate(item.key);
              }}
            >
              <Ionicons name={item.icon} size={rw(20)} color={colors.text} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={rw(18)} color={colors.tabInactive} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: rf(22),
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  avatar: {
    width: rw(52),
    height: rw(52),
    borderRadius: rw(26),
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: rf(16),
    fontWeight: '700',
    color: colors.text,
  },
  userSubtitle: {
    fontSize: rf(12),
    color: colors.textMuted,
    marginTop: rh(2),
  },
  sectionLabel: {
    fontSize: rf(12),
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: rh(14),
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  profileRowFirst: {
    borderTopWidth: 0,
  },
  profileRowLabel: {
    fontSize: rf(14),
    color: colors.textMuted,
  },
  profileRowValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(4),
    flexShrink: 1,
    marginLeft: spacing.md,
  },
  profileRowValueText: {
    fontSize: rf(14),
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
  },
  emptyProfileText: {
    fontSize: rf(14),
    color: colors.textMuted,
    lineHeight: rf(20),
    padding: spacing.md,
  },
  quizButton: {
    backgroundColor: colors.text,
    borderRadius: radii.sm,
    paddingVertical: rh(14),
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  quizButtonText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: rf(14),
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: rf(15),
    fontWeight: '500',
    color: colors.text,
  },
});
