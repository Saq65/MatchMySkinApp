import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { rf, rh, rw } from '../theme/responsive';
import { radii, spacing } from '../theme/spacing';

type Props<T extends string> = {
  visible: boolean;
  value: T;
  options: Array<{ value: T; label: string }>;
  onApply: (value: T) => void;
  onClose: () => void;
  title?: string;
};

export function SortSheet<T extends string>({
  visible,
  value,
  options,
  onApply,
  onClose,
  title = 'Sort By',
}: Props<T>) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}
          activeOpacity={1}
        >
          <Text style={styles.title}>{title}</Text>
          {options.map(option => (
            <TouchableOpacity
              key={option.value}
              style={styles.row}
              onPress={() => {
                onApply(option.value);
                onClose();
              }}
            >
              <Text style={styles.rowLabel}>{option.label}</Text>
              <View style={[styles.radio, value === option.value && styles.radioSelected]}>
                {value === option.value && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  title: {
    fontSize: rf(17),
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: rh(14),
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowLabel: {
    fontSize: rf(15),
    color: colors.text,
  },
  radio: {
    width: rw(20),
    height: rw(20),
    borderRadius: rw(10),
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: rw(10),
    height: rw(10),
    borderRadius: rw(5),
    backgroundColor: colors.primary,
  },
});
