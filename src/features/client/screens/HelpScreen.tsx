import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { branding } from "../../../config/branding";
import FadeInView from "../../../components/animations/FadeInView";

const FAQItem = ({ question, answer }: any) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => setExpanded(!expanded)}
      style={styles.faqItem}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.question}>{question}</Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#888"
        />
      </View>
      {expanded && <Text style={styles.answer}>{answer}</Text>}
    </TouchableOpacity>
  );
};

export default function HelpScreen() {
  const navigation = useNavigation();

  const handleSupportCall = () => {
    Linking.openURL("tel:+49123456789"); // Replace with real support number
  };

  const faqs = [
    {
      q: "Was passiert beim SOS-Alarm?",
      a: "Ein Signal wird sofort an unsere Sicherheitszentrale gesendet. Wir erhalten Ihren aktuellen Standort und Ihre Kontaktdaten. Ein Mitarbeiter wird versuchen, Sie zu kontaktieren, und bei Bedarf Hilfe (Polizei/Rettungsdienst) entsenden.",
    },
    {
      q: "Was ist der Stille Alarm?",
      a: "Wenn Sie den SOS-Button 6 Sekunden lang gedrückt halten, wird ein Alarm ausgelöst, ohne dass auf Ihrem Handy Töne abgespielt werden. Dies ist nützlich in Situationen, in denen Sie unbemerkt bleiben möchten.",
    },
    {
      q: "Funktioniert die App ohne Internet?",
      a: "Die App benötigt eine Internetverbindung, um den Alarm an den Server zu senden. Wenn keine Verbindung besteht, versuchen Sie bitte, direkt den Notruf 112 zu wählen.",
    },
    {
      q: "Wer sieht meinen Standort?",
      a: "Ihr Standort wird nur dann an uns übermittelt, wenn Sie einen aktiven Alarm ausgelöst haben. Sobald der Alarm beendet ist, wird die Übertragung gestoppt.",
    },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hilfe & FAQ</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <FadeInView>
            <Text style={styles.introText}>
              Haben Sie Fragen? Hier finden Sie Antworten auf die häufigsten
              Themen.
            </Text>

            <View style={styles.faqList}>
              {faqs.map((item, index) => (
                <FAQItem key={index} question={item.q} answer={item.a} />
              ))}
            </View>

            <View style={styles.contactContainer}>
              <Text style={styles.contactTitle}>Noch Fragen?</Text>
              <Text style={styles.contactText}>
                Unser Support-Team ist 24/7 für Sie da.
              </Text>

              <TouchableOpacity
                style={styles.callButton}
                onPress={handleSupportCall}
              >
                <Ionicons
                  name="call"
                  size={24}
                  color="white"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.callButtonText}>Support anrufen</Text>
              </TouchableOpacity>
            </View>
          </FadeInView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 22,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  introText: {
    color: "#aaa",
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  faqList: {
    marginBottom: 40,
  },
  faqItem: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  question: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 10,
  },
  answer: {
    color: "#ccc",
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  contactContainer: {
    alignItems: "center",
    backgroundColor: "rgba(13, 71, 161, 0.1)", // Primary with opacity
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(13, 71, 161, 0.3)",
  },
  contactTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  contactText: {
    color: "#aaa",
    marginBottom: 20,
    textAlign: "center",
  },
  callButton: {
    flexDirection: "row",
    backgroundColor: branding.primaryColor,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  callButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
