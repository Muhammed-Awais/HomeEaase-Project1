import AuthButton from "@/components/auth/AuthButton";
import AuthInput from "@/components/auth/AuthInput";
import { fonts, fontSize, radius, spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { deleteAccount, updateProfile } from "@/services/api";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ArrowLeft, Camera, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useTheme } from "@/context/ThemeContext";

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { user, updateUser, logout } = useAuth();
  
  const [name, setName] = useState(user?.name || "");
  const [contactNo, setContactNo] = useState(user?.contactNo || "");
  const [avatarUri, setAvatarUri] = useState(user?.avatar || "");
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      Toast.show({ type: "error", text1: "Validation", text2: "Name cannot be empty" });
      return;
    }

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("contactNo", contactNo);

      // Append image if a local file was picked (it will be an absolute path starting with file:// or similar, unlike an http URL)
      if (avatarUri && !avatarUri.startsWith("http")) {
        const fileName = avatarUri.split("/").pop() || "avatar.jpg";
        const match = /\.(\w+)$/.exec(fileName);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        
        const formattedUri = avatarUri.startsWith('file://') ? avatarUri : `file://${avatarUri}`;
        
        // @ts-ignore
        formData.append("avatar", {
          uri: formattedUri,
          name: fileName,
          type,
        } as any);
      }

      const response = await updateProfile(formData);
      
      if (response.data.success) {
        // Update global context so the whole app updates immediately
        await updateUser({
          name: response.data.data.name,
          contactNo: response.data.data.contactNo,
          avatar: response.data.data.avatar,
        });
        
        Toast.show({
          type: "success",
          text1: "Profile Updated",
          text2: "Your profile has been updated successfully.",
        });
        router.back();
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: error.response?.data?.message || "Could not update profile.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteAccount();
      if (response.data.success) {
        setShowDeleteModal(false);
        Toast.show({
          type: "success",
          text1: "Account Deleted",
          text2: "We're sorry to see you go.",
        });
        await logout();
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Deletion Failed",
        text2: error.response?.data?.message || "Could not delete account.",
      });
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const currentAvatar = avatarUri 
    ? { uri: avatarUri } 
    : { uri: `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=random` };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image source={currentAvatar} style={styles.avatar} />
              <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                <Camera size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.emailText}>{user?.email}</Text>
          </View>

          <View style={styles.form}>
            <AuthInput
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
            />

            <AuthInput
              label="Contact Number"
              placeholder="e.g., +92 300 1234567"
              value={contactNo}
              onChangeText={setContactNo}
              keyboardType="phone-pad"
            />

            {isUpdating ? (
              <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: spacing.lg }} />
            ) : (
              <View style={{ marginTop: spacing.md }}>
                <AuthButton title="Save Changes" onPress={handleUpdate} />
              </View>
            )}
          </View>

          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>Danger Zone</Text>
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={colors.danger} />
              ) : (
                <>
                  <Trash2 size={18} color={colors.danger} />
                  <Text style={styles.deleteButtonText}>Delete Account</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmationModal
        isVisible={showDeleteModal}
        onConfirm={confirmDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
        title="Delete Account"
        description="Are you sure you want to permanently delete your account? This will also delete all properties you have listed. This action cannot be undone."
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
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  backBtn: {
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
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: spacing["2xl"],
  },
  avatarContainer: {
    position: "relative",
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.accent,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.background,
  },
  emailText: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: spacing["2xl"],
  },
  dangerZone: {
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  dangerTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.danger,
    marginBottom: spacing.lg,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger + "50",
    backgroundColor: colors.danger + "10",
    gap: spacing.sm,
  },
  deleteButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.danger,
  },
});
