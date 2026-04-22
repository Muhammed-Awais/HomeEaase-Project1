import PhotoUploader from "@/components/post-property/PhotoUploader";
import StepIndicator from "@/components/post-property/StepIndicator";
import { AMENITIES_LIST } from "@/constants/mockData";
import { fonts, fontSize, radius, spacing } from "@/constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { X, ArrowLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import api from "@/services/api";
import { useTheme } from "@/context/ThemeContext";

const STEPS = ["Photos", "Details", "Amenities", "Preview"];

export default function EditPropertyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1); // Start at Details for edit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [bedrooms, setBedrooms] = useState("2");
  const [bathrooms, setBathrooms] = useState("1");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [sizeValue, setSizeValue] = useState("");
  const [sizeUnit, setSizeUnit] = useState("marla");
  const [currency, setCurrency] = useState("PKR");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await api.get(`/properties/${id}`);
        if (response.data.success) {
          const p = response.data.data;
          
          // Verify ownership
          if (user && p.landlord._id !== user.id && user.role !== "admin") {
             Alert.alert("Error", "You are not authorized to edit this property.");
             router.back();
             return;
          }

          setTitle(p.title);
          setPrice(p.price.toString());
          setLocation(p.location);
          setCity(p.city || "");
          setBedrooms(p.bedrooms);
          setBathrooms(p.bathrooms?.toString() || "1");
          setDescription(p.description);
          setSizeValue(p.sizeValue?.toString() || "");
          setSizeUnit(p.sizeUnit || "marla");
          setCurrency(p.currency || "PKR");
          setSelectedAmenities(p.amenities || []);
          setPhotos(p.images || []);
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Could not load property details.",
        });
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProperty();
  }, [id, user]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 3 - photos.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newUris = result.assets.map(asset => asset.uri);
      setPhotos([...photos, ...newUris]);
    }
  };

  const toggleAmenity = (a: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );
  };

  const handleUpdate = async () => {
    if (!title || !price || !location || !city || !description || !sizeValue || photos.length === 0) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please provide all details, including city.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("location", location);
      formData.append("city", city);
      formData.append("bedrooms", bedrooms);
      formData.append("bathrooms", bathrooms);
      formData.append("sizeValue", sizeValue);
      formData.append("sizeUnit", sizeUnit);
      formData.append("amenities", JSON.stringify(selectedAmenities));
      formData.append("currency", currency);

      // Append images - only append new ones or just re-send all?
      // Logic for editing images can be tricky. Here we re-send everything.
      // Remote URLs stay as they are, backend might need to handle them or we just append local URIs.
      
      photos.forEach((uri, index) => {
        if (!uri.startsWith('http')) {
          const fileName = uri.split("/").pop() || `photo_${index}.jpg`;
          const match = /\.(\w+)$/.exec(fileName);
          const type = match ? `image/${match[1]}` : `image/jpeg`;
          const formattedUri = uri.startsWith('file://') ? uri : `file://${uri}`;

          // @ts-ignore
          formData.append("photos", {
            uri: formattedUri,
            name: fileName,
            type,
          } as any);
        } else {
           // If it's a remote URL, we might want to tell the backend to keep it.
           // For this implementation, I'll send the existing URLs as a field or just handle it in backend.
           // Simplified: Just re-send existing URLs as part of the data.
           formData.append("existingImages", uri);
        }
      });

      const response = await api.put(`/properties/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        transformRequest: (data) => data,
      });

      if (response.data.success) {
        Toast.show({
          type: "success",
          text1: "Listing Updated!",
          text2: "Your changes have been saved.",
        });
        router.back();
      }
    } catch (error: any) {
      console.error("Error updating listing:", error);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: error.response?.data?.message || "Could not update listing.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <PhotoUploader
            photos={photos}
            onAdd={pickImage}
            onRemove={(i) => setPhotos(photos.filter((_, idx) => idx !== i))}
          />
        );
      case 1:
        return (
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Property Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Modern Apartment"
              placeholderTextColor={colors.textTertiary}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.fieldLabel}>Monthly Rent (PKR)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 45000"
              placeholderTextColor={colors.textTertiary}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <Text style={styles.fieldLabel}>Location Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Gulberg, Lahore"
              placeholderTextColor={colors.textTertiary}
              value={location}
              onChangeText={setLocation}
            />

            <Text style={styles.fieldLabel}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Lahore"
              placeholderTextColor={colors.textTertiary}
              value={city}
              onChangeText={setCity}
            />

            <Text style={styles.fieldLabel}>Property Size</Text>
            <View style={styles.sizeSection}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="e.g., 10"
                placeholderTextColor={colors.textTertiary}
                value={sizeValue}
                onChangeText={setSizeValue}
                keyboardType="numeric"
              />
              <View style={styles.unitRow}>
                {["marla", "kanal", "sqft"].map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[
                      styles.unitBtn,
                      sizeUnit === u && styles.unitBtnActive,
                    ]}
                    onPress={() => setSizeUnit(u)}
                  >
                    <Text
                      style={[
                        styles.unitText,
                        sizeUnit === u && styles.unitTextActive,
                      ]}
                    >
                      {u === "sqft" ? "Sq Ft" : u.charAt(0).toUpperCase() + u.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.fieldLabel}>Bedrooms</Text>
            <View style={styles.bedroomRow}>
              {["1", "2", "3", "4", "5+"].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.bedroomBtn,
                    bedrooms === val && styles.bedroomBtnActive,
                  ]}
                  onPress={() => setBedrooms(val)}
                >
                  <Text
                    style={[
                      styles.bedroomText,
                      bedrooms === val && styles.bedroomTextActive,
                    ]}
                  >
                    {val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Bathrooms</Text>
            <View style={styles.bedroomRow}>
              {["1", "2", "3", "4+"].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.bedroomBtn,
                    bathrooms === val && styles.bedroomBtnActive,
                  ]}
                  onPress={() => setBathrooms(val)}
                >
                  <Text
                    style={[
                      styles.bedroomText,
                      bathrooms === val && styles.bedroomTextActive,
                    ]}
                  >
                    {val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your property..."
              placeholderTextColor={colors.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        );
      case 2:
        return (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Select Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {AMENITIES_LIST.map((amenity) => {
                const isActive = selectedAmenities.includes(amenity);
                return (
                  <TouchableOpacity
                    key={amenity}
                    style={[
                      styles.amenityChip,
                      isActive && styles.amenityChipActive,
                    ]}
                    onPress={() => toggleAmenity(amenity)}
                  >
                    <Text
                      style={[
                        styles.amenityText,
                        isActive && styles.amenityTextActive,
                      ]}
                    >
                      {amenity}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Review Your Changes</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Title</Text>
                <Text style={styles.previewValue}>{title}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Rent</Text>
                <Text style={styles.previewValue}>PKR {Number(price).toLocaleString()}/mo</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Location</Text>
                <Text style={styles.previewValue}>{location}, {city}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Bedrooms / Bathrooms</Text>
                <Text style={styles.previewValue}>{bedrooms} BR / {bathrooms} BA</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Size</Text>
                <Text style={styles.previewValue}>{sizeValue} {sizeUnit}</Text>
              </View>
            </View>
          </View>
        );
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <ArrowLeft size={20} color={colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Listing</Text>
        <View style={{ width: 38 }} />
      </View>

      <StepIndicator
        currentStep={step}
        totalSteps={STEPS.length}
        labels={STEPS}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
        >
          {renderStep()}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, step === 0 && { flex: 1 }, isSubmitting && { opacity: 0.7 }]}
          disabled={isSubmitting}
          onPress={() => {
            if (step < STEPS.length - 1) {
              setStep(step + 1);
            } else {
              handleUpdate();
            }
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.nextBtnText}>
              {step === STEPS.length - 1 ? "Save Changes" : "Next"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  formSection: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: fontSize.lg,
    color: colors.text,
    marginBottom: spacing.base,
  },
  fieldLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: 14,
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  bedroomRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  bedroomBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  bedroomBtnActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  bedroomText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  bedroomTextActive: {
    color: "#FFFFFF",
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  amenityChip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  amenityChipActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  amenityText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  amenityTextActive: {
    color: "#FFFFFF",
  },
  previewCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
  },
  previewRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  previewLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  previewValue: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.base,
    color: colors.text,
  },
  sizeSection: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  unitRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  unitBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  unitBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  unitText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  unitTextActive: {
    color: "#FFFFFF",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
    paddingBottom: Platform.OS === "ios" ? spacing["2xl"] : spacing.base,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  backBtn: {
    flex: 0.4,
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.base,
    color: colors.text,
  },
  nextBtn: {
    flex: 0.6,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: "#FFFFFF",
  },
});
