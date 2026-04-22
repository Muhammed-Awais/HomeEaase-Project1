import PropertyCard from "@/components/browse/PropertyCard";
import { fonts, fontSize, spacing } from "@/constants/theme";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import api from "@/services/api";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import Toast from "react-native-toast-message";

export default function MyListingsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMyProperties = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await api.get("/properties/my");
      if (response.data.success) {
        setProperties(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching my properties:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleDelete = (id: string) => {
    setPropertyToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await api.delete(`/properties/${propertyToDelete}`);
      if (response.data.success) {
        setProperties(prev => prev.filter(p => (p._id || p.id) !== propertyToDelete));
        Toast.show({
          type: "success",
          text1: "Deleted",
          text2: "Property listing removed successfully.",
        });
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not delete property. Please try again.",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    }
  };

  const handleEdit = (property: any) => {
    router.push(`/edit-property/${property._id || property.id}` as any);
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyProperties();
    }, [])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchMyProperties(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>My Listings</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item._id || item.id}
          renderItem={({ item }) => (
            <PropertyCard 
              property={item} 
              layout="list" 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                You haven't posted any properties yet.
              </Text>
            </View>
          }
        />
      )}

      <ConfirmationModal
        isVisible={showDeleteModal}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        title="Delete Listing"
        description="Are you sure you want to delete this property? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        type="danger"
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xl,
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing["3xl"],
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.textTertiary,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
});
