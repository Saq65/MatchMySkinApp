import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../theme/colors';
import { rf, rh, rw } from '../theme/responsive';
import { radii, spacing } from '../theme/spacing';
import { useThemedStyles } from '../theme/useThemedStyles';

type Props = {
  placeholder: string;
  value: string | null;
  options: string[];
  formatOption?: (option: string) => string;
  onSelect: (option: string) => void;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export function DropdownField({
  placeholder,
  value,
  options,
  formatOption = option => option,
  onSelect,
  open,
  onOpen,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(colors, createStyles);
  const insets = useSafeAreaInsets();
  return (
    <>
      <TouchableOpacity style={styles.field} onPress={onOpen} activeOpacity={0.8}>
        <Text style={[styles.fieldText, !value && styles.placeholder]} numberOfLines={1}>
          {value ? formatOption(value) : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={rw(18)} color={colors.textMuted} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
            <Text style={styles.sheetTitle}>{placeholder}</Text>
            {options.map(option => (
              <TouchableOpacity
                key={option}
                style={styles.option}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text style={[styles.optionText, value === option && styles.optionTextSelected]}>
                  {formatOption(option)}
                </Text>
                {value === option && (
                  <Ionicons name="checkmark" size={rw(18)} color={colors.text} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: radii.md,
      paddingHorizontal: spacing.md,
      paddingVertical: rh(16),
    },
    fieldText: {
      fontSize: rf(16),
      fontWeight: '500',
      color: colors.text,
    },
    placeholder: {
      color: colors.textMuted,
      fontWeight: '400',
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radii.lg,
      borderTopRightRadius: radii.lg,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
    },
    sheetTitle: {
      fontSize: rf(13),
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.sm,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: rh(14),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    optionText: {
      fontSize: rf(16),
      color: colors.text,
    },
    optionTextSelected: {
      fontWeight: '700',
    },
  });
