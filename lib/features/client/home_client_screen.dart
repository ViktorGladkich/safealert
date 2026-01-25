import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:geolocator/geolocator.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/safe_sos_button.dart';

class ClientHomeScreen extends StatefulWidget {
  const ClientHomeScreen({super.key});

  @override
  State<ClientHomeScreen> createState() => _ClientHomeScreenState();
}

class _ClientHomeScreenState extends State<ClientHomeScreen> {
  Future<void> _triggerPanic({required bool silent}) async {
    if (!silent) {
      HapticFeedback.heavyImpact();
    }

    try {
      final position = await Geolocator.getCurrentPosition(
        locationSettings:
            const LocationSettings(accuracy: LocationAccuracy.high),
      ).timeout(const Duration(seconds: 10));

      // Отправляем тревогу и получаем ID
      final docRef =
          await FirebaseFirestore.instance.collection('emergencies').add({
        'latitude': position.latitude,
        'longitude': position.longitude,
        'timestamp': FieldValue.serverTimestamp(),
        'status': 'new',
        'type': silent ? 'silent' : 'normal',
        'clientName': 'A.S.S Client',
      });

      final emergencyId = docRef.id;

      if (!mounted) return;

      // Сразу открываем чат с охранником
      context.go('/client/chat/$emergencyId');
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Fehler: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              "SafeAlert",
              style: TextStyle(
                fontSize: 48,
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 100),
            SafeSosButton(
              onAlarm: (type) =>
                  _triggerPanic(silent: type == AlarmType.silent),
            ),
            const SizedBox(height: 100),
            const Text(
              "Drücken Sie SOS im Notfall",
              style: TextStyle(color: Colors.white70, fontSize: 18),
            ),
          ],
        ),
      ),
    );
  }
}
