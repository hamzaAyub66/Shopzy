import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Vibration } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppScreensParamsList } from '@app/types';
import { Audio } from 'expo-av';

const GlobalOrderModal = () => {
  const [latestOrder, setLatestOrder] = useState<any>(null);
  const [lastOrderId, setLastOrderId] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const navigation = useNavigation<NativeStackNavigationProp<AppScreensParamsList>>();

  // 🔊 Play notification sound
  async function playNotificationSound() {
    try {
      const { sound } = await Audio.Sound.createAsync({
        uri: 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3',
      });
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.log("Sound error:", error);
    }
  }

  // Cleanup sound
 useEffect(() => {
  return () => {
    if (sound) {
      sound.unloadAsync().catch(() => {});
    }
  };
}, [sound]);

  useEffect(() => {
  const checkFromPush = async () => {
    if (global.triggerOrderPopupFromPush) {
      global.triggerOrderPopupFromPush = false; // reset flag

      try {
        const res = await fetch("https://drshawarma.co.uk/wp-json/mobile/v1/orders/latest");
        const order = await res.json();

        console.log("Fetched latest order:", order);
        setLatestOrder(order);
        setVisible(true);

        Vibration.vibrate([0, 500, 200, 500]);
        playNotificationSound();

      } catch (err) {
        console.log("Error fetching latest order:", err);
      }
    }
  };

  // Check every 1 sec ONLY for push
  const interval = setInterval(checkFromPush, 1000);

  return () => clearInterval(interval);
}, []);


  // MARK SENT + OPEN INVOICE SCREEN
  const handleAccept = async () => {
    setVisible(false);

    navigation.navigate('InvoiceScreen', { order: latestOrder });

    try {
      await fetch('https://drshawarma.co.uk/wp-json/mobile/v1/orders/mark-sent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: latestOrder.id }),
      });
    } catch (error) {
      console.log("Status update failed:", error);
    }
  };

  const handleDecline = () => setVisible(false);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>🛒 New Order Received</Text>

          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Order#</Text>
            <Text style={styles.infoValue}>{latestOrder?.id}</Text>

            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>{latestOrder?.created_at}</Text>

            <Text style={styles.infoLabel}>Payment Method</Text>
            <Text style={styles.infoValue}>{latestOrder?.payment_method_title}</Text>

            <Text style={styles.infoLabel}>Order Total</Text>
            <Text style={styles.infoValue}>£{latestOrder?.total}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Customer</Text>
            <Text style={styles.infoValue}>{latestOrder?.customer?.name}</Text>

            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{latestOrder?.customer?.email}</Text>

            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{latestOrder?.customer?.phone}</Text>

            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>
              {latestOrder?.customer?.address?.address_1}, {latestOrder?.customer?.address?.city}, {latestOrder?.customer?.address?.country}, {latestOrder?.customer?.address?.state}, {latestOrder?.customer?.address?.postcode}            
            </Text>
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
              <Text style={styles.btnText}>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.declineBtn} onPress={handleDecline}>
              <Text style={styles.btnText}>Reject</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

export default GlobalOrderModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    width: '88%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoBlock: { width: '100%', marginBottom: 10 },
  infoLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 8 },
  infoValue: { fontSize: 16, color: '#000', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#ddd', width: '100%', marginVertical: 12 },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  acceptBtn: { backgroundColor: 'green', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8 },
  declineBtn: { backgroundColor: 'red', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
