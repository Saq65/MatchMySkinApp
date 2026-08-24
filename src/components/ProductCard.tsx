import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Product } from '../types/product';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../theme/colors';
import { getScoreTier } from '../theme/scoreTier';
import { rf, rh, rw } from '../theme/responsive';
import { radii, spacing } from '../theme/spacing';
import { useThemedStyles } from '../theme/useThemedStyles';

type Props = {
  product: Product;
  wishlisted: boolean;
  onPress: () => void;
  onToggleWishlist: () => void;
};

export function ProductCard({ product, wishlisted, onPress, onToggleWishlist }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(colors, createStyles);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = product.imageUrl && !imageFailed;
  const hasScore = product.matchScore !== undefined;
  const tier = hasScore ? getScoreTier(product.matchLabel, product.matchScore!, colors) : null;
  const hasDiscount = product.mrp !== undefined && product.mrp > product.price;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageArea}>
        {showImage ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="contain"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <Ionicons name="flask-outline" size={rw(32)} color={colors.textMuted} />
        )}
      </View>

      {tier && (
        <View style={[styles.scoreBadge, { backgroundColor: tier.color }]}>
          <Text style={styles.scoreBadgeNumber}>{product.matchScore}</Text>
          <Text style={styles.scoreBadgeLabel}>{tier.label.toUpperCase()}</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.priceRow}>
          {hasDiscount && <Text style={styles.mrp}>₹{product.mrp!.toFixed(0)}</Text>}
          <Text style={styles.price}>₹{product.price.toFixed(0)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, wishlisted && styles.saveButtonActive]}
          onPress={onToggleWishlist}
          activeOpacity={0.8}
        >
          <Ionicons
            name={wishlisted ? 'heart' : 'heart-outline'}
            size={rw(14)}
            color={colors.primary}
          />
          <Text style={styles.saveButtonText} numberOfLines={1}>
            {wishlisted ? 'Saved' : hasScore ? 'Save my match' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flex: 1,
      minWidth: 0,
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      borderWidth: 1.5,
      borderColor: colors.border,
      overflow: 'visible',
    },
    imageArea: {
      aspectRatio: 1.1,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      borderTopLeftRadius: radii.md,
      borderTopRightRadius: radii.md,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    scoreBadge: {
      position: 'absolute',
      top: rh(-10),
      right: spacing.sm,
      width: rw(44),
      height: rw(44),
      borderRadius: rw(22),
      borderWidth: 2,
      borderColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scoreBadgeNumber: {
      fontSize: rf(14),
      fontWeight: '800',
      color: colors.surface,
      lineHeight: rf(16),
    },
    scoreBadgeLabel: {
      fontSize: rf(7),
      fontWeight: '700',
      color: colors.surface,
      letterSpacing: 0.3,
    },
    info: {
      padding: spacing.sm,
    },
    brand: {
      fontSize: rf(11),
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    name: {
      fontSize: rf(13),
      fontWeight: '600',
      color: colors.text,
      marginTop: rh(2),
      minHeight: rh(34),
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: rw(6),
      marginTop: spacing.xs,
    },
    mrp: {
      fontSize: rf(12),
      color: colors.textMuted,
      textDecorationLine: 'line-through',
    },
    price: {
      fontSize: rf(14),
      fontWeight: '700',
      color: colors.text,
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: rw(4),
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderRadius: radii.lg,
      paddingVertical: rh(8),
      marginTop: spacing.sm,
    },
    saveButtonActive: {
      backgroundColor: colors.primarySoft,
    },
    saveButtonText: {
      fontSize: rf(12),
      fontWeight: '700',
      color: colors.primary,
    },
  });
