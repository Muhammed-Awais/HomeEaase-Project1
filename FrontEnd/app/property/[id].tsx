import { useTheme } from "@/context/ThemeContext";
import AmenitiesGrid from "@/components/property/AmenitiesGrid";
import ContactBar from "@/components/property/ContactBar";
import { useAuth } from "@/context/AuthContext";
import DescriptionSection from "@/components/property/DescriptionSection";
import ImageCarousel from "@/components/property/ImageCarousel";
import PropertyInfo from "@/components/property/PropertyInfo";
import { shadows, spacing, fonts, fontSize } from "@/constants/theme";
import api from "@/services/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Heart } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PropertyDetailScreen() {
  const { user, handleToggleFavorite } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await api.get(`/properties/${id}`);
        if (response.data.success) {
          setProperty(response.data.data);
        }
      } catch (err: any) {
        console.error("Error fetching property details:", err);
        setError(
          err.response?.data?.message ||
            "Could not load property details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error || !property) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || "Property not found"}</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Map backend fields to component props if needed
  const displayProperty = {
    ...property,
    id: property._id,
    currency: property.currency || "PKR",
    // Ensure all required fields for sub-components are present
    landlord: {
      name: property.landlord?.name || "Landlord",
      phone: property.landlord?.contactNo || "+92 300 0000000",
      avatar: property.landlord?.avatar || "", 
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageCarousel images={property.images} />

        {/* Floating Back / Like */}
        <View style={styles.floatingNav}>
          <TouchableOpacity
            style={[styles.floatingBtn, shadows.md]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={colors.text} strokeWidth={1.8} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.floatingBtn, shadows.md]}
            onPress={() => handleToggleFavorite(property._id)}
          >
            <Heart 
              size={20} 
              color={colors.danger} 
              strokeWidth={1.8} 
              fill={user?.favorites?.includes(property._id) ? colors.danger : "transparent"} 
            />
          </TouchableOpacity>
        </View>

        <PropertyInfo property={displayProperty} />

        <View style={styles.separator} />

        <AmenitiesGrid
          amenities={property.amenities}
          bedrooms={property.bedrooms}
          bathrooms={property.bathrooms || 1}
          area={property.sizeValue || 0}
          areaUnit={property.sizeUnit === 'sqft' ? 'sq ft' : property.sizeUnit === 'marla' ? 'Marla' : 'Kanal'}
        />

        <View style={styles.separator} />

        <DescriptionSection text={property.description} />

        <View style={{ height: 100 }} />
      </ScrollView>

      <ContactBar landlord={displayProperty.landlord} />
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  floatingNav: {
    position: "absolute",
    top: 52,
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  floatingBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.xl,
  },
  errorText: {
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: spacing.md,
  },
  backBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.accent,
    borderRadius: 8,
  },
  backBtnText: {
    color: "#FFFFFF",
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
  },
});
