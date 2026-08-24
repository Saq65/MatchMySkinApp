import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Alert, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { launchCamera, launchImageLibrary, type Asset } from 'react-native-image-picker';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../theme/colors';
import { rf, rw } from '../theme/responsive';
import { radii, spacing } from '../theme/spacing';
import { useThemedStyles } from '../theme/useThemedStyles';

type Props = {
  visible: boolean;
  onClose: () => void;
  onPhotoSelected: (asset: Asset) => void;
};

export function SearchByPhotoModal({ visible, onClose, onPhotoSelected }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(colors, createStyles);

  const pick = async (source: 'camera' | 'library') => {
    try {
      const result =
        source === 'camera'
          ? await launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: false })
          : await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });

      if (result.didCancel) {
        return;
      }
      if (result.errorCode) {
        onClose();
        Alert.alert(
          source === 'camera' ? "Couldn't open camera" : "Couldn't open photo library",
          result.errorMessage ?? `Error code: ${result.errorCode}`,
        );
        return;
      }
      const asset = result.assets?.[0];
      onClose();
      if (asset) {
        onPhotoSelected(asset);
      } else {
        Alert.alert('No photo selected', 'Please try again.');
      }
    } catch (error) {
      onClose();
      Alert.alert('Something went wrong', error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Search by photo</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-outline" size={rw(22)} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Point at the front of the pack so the brand and product name are readable.
          </Text>

          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[styles.option, styles.optionPrimary]}
              onPress={() => pick('camera')}
              activeOpacity={0.85}
            >
              <Ionicons name="camera-outline" size={rw(26)} color={colors.primary} />
              <Text style={[styles.optionText, styles.optionTextPrimary]}>Take a photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.option}
              onPress={() => pick('library')}
              activeOpacity={0.85}
            >
              <Ionicons name="cloud-upload-outline" size={rw(26)} color={colors.text} />
              <Text style={styles.optionText}>Upload a photo</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
    },
    sheet: {
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      padding: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: rf(17),
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: rf(13),
      color: colors.textMuted,
      marginTop: spacing.sm,
      marginBottom: spacing.lg,
      lineHeight: rf(19),
    },
    optionsRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    option: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: radii.md,
      paddingVertical: spacing.lg,
      gap: spacing.sm,
    },
    optionPrimary: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.primarySoft,
    },
    optionText: {
      fontSize: rf(13),
      fontWeight: '600',
      color: colors.text,
    },
    optionTextPrimary: {
      color: colors.primaryDark,
    },
  });
