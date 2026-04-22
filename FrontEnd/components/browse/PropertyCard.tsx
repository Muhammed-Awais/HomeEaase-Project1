import { useTheme } from "@/context/ThemeContext";
import {
  fonts,
  fontSize,
  radius,
  shadows,
  spacing,
} from "@/constants/theme";
import { Property } from "@/constants/types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Bath, BedDouble, MapPin } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface PropertyCardProps {
  property: Property;
  layout?: "grid" | "list";
  onEdit?: (p: Property) => void;
  onDelete?: (id: string) => void;
}

export default function PropertyCard({
  property,
  layout = "grid",
  onEdit,
  onDelete,
}: PropertyCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const isGrid = layout === "grid";
  const cardWidth = isGrid
    ? (width - spacing.xl * 2 - spacing.md) / 2
    : width - spacing.xl * 2;

  return (
    <View style={{ width: cardWidth }}>
      <TouchableOpacity
        style={[
          styles.card,
          shadows.sm,
          !isGrid && styles.listCard,
        ]}
        activeOpacity={0.9}
        onPress={() => router.push(`/property/${property._id || (property as any).id}`)}
      >
        <Image
          source={{ uri: property.images[0] }}
          style={[styles.image, !isGrid && styles.listImage]}
          contentFit="cover"
          transition={200}
        />
        {property.isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
        <View style={[styles.info, !isGrid && styles.listInfo]}>
          <Text style={styles.price}>
            {property.currency} {property.price.toLocaleString()}
            <Text style={styles.perMonth}>/mo</Text>
          </Text>
          <Text
            style={[styles.title, !isGrid && styles.listTitle]}
            numberOfLines={isGrid ? 1 : 2}
          >
            {property.title}
          </Text>
          <View style={styles.metaRow}>
            <MapPin size={11} color={colors.textSecondary} strokeWidth={1.8} />
            <Text style={styles.metaText} numberOfLines={1}>
              {property.city}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <BedDouble size={11} color={colors.textSecondary} strokeWidth={1.8} />
            <Text style={styles.metaText}>{property.bedrooms}</Text>
            <Bath size={11} color={colors.textSecondary} strokeWidth={1.8} />
            <Text style={styles.metaText}>{property.bathrooms}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {(onEdit || onDelete) && (
        <View style={styles.actionRow}>
          {onEdit && (
            <TouchableOpacity 
              style={[styles.actionBtn, { borderColor: colors.border }]} 
              onPress={() => onEdit(property)}
            >
              <Text style={[styles.actionBtnText, { color: colors.text }]}>Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity 
              style={[styles.actionBtn, { borderColor: colors.danger + '30', backgroundColor: colors.danger + '10' }]} 
              onPress={() => onDelete(property._id || (property as any).id)}
            >
              <Text style={[styles.actionBtnText, { color: colors.danger }]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  listCard: {
    flexDirection: "row",
    height: 130,
  },
  image: {
    width: "100%",
    height: 130,
  },
  listImage: {
    width: 130,
    height: "100%",
  },
  featuredBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  featuredText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  info: {
    padding: spacing.md,
  },
  listInfo: {
    flex: 1,
    justifyContent: "center",
  },
  price: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.accent,
    marginBottom: 2,
  },
  perMonth: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  title: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  listTitle: {
    fontSize: fontSize.base,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  metaText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginRight: 6,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    height: 36,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
});
