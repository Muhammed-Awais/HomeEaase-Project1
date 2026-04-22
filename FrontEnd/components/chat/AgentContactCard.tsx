import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Linking } from "react-native";
import { fonts, fontSize, radius, spacing, shadows } from "@/constants/theme";
import { Phone, MessageCircle, Copy } from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import * as Clipboard from 'expo-clipboard';
import Toast from "react-native-toast-message";

interface AgentContactCardProps {
  agentName: string;
  phone: string;
}

export default function AgentContactCard({ agentName, phone }: AgentContactCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const cleanPhone = phone.replace(/\D/g, '');
  const displayPhone = phone.startsWith('0') ? '92' + cleanPhone.substring(1) : cleanPhone;
  const whatsappUrl = `https://wa.me/${displayPhone}`;

  const handleCall = () => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = () => {
    Linking.openURL(whatsappUrl);
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(phone);
    Toast.show({
      type: "success",
      text1: "Copied!",
      text2: "Phone number copied to clipboard",
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Agent Contact Information</Text>
      <View style={styles.divider} />
      <Text style={styles.name}>{agentName || "Property Agent"}</Text>
      <Text style={styles.phone}>{phone}</Text>
      
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.callBtn]} onPress={handleCall}>
          <Phone size={18} color="#FFF" strokeWidth={2.5} />
          <Text style={styles.btnText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.btn, styles.waBtn]} onPress={handleWhatsApp}>
          <MessageCircle size={18} color="#FFF" strokeWidth={2.5} />
          <Text style={styles.btnText}>WhatsApp</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.btn, styles.copyBtn]} onPress={handleCopy}>
          <Copy size={18} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  header: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  name: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.text,
  },
  phone: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    gap: spacing.xs,
  },
  callBtn: {
    backgroundColor: colors.accent,
    flex: 2,
    justifyContent: "center",
  },
  waBtn: {
    backgroundColor: "#25D366",
    flex: 2,
    justifyContent: "center",
  },
  copyBtn: {
    backgroundColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    justifyContent: "center",
  },
  btnText: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
    color: "#FFF",
  },
});
