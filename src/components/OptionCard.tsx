import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  emoji?: string;
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function OptionCard({ emoji, label, selected, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      {selected && (
        <View style={styles.check}>
          <Text style={styles.checkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  cardSelected: {
    borderColor: colors.selectedBorder,
    borderWidth: 2,
    backgroundColor: colors.background,
  },
  emoji: {
    fontSize: 22,
    marginRight: 14,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  labelSelected: {
    color: colors.text,
    fontWeight: '700',
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: '700',
  },
});
