import 'dart:async';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:go_router/go_router.dart';

class EmergencyActiveScreen extends StatefulWidget {
  final String emergencyId; 

  const EmergencyActiveScreen({
    super.key,
    required this.emergencyId, 
  });

  @override
  State<EmergencyActiveScreen> createState() => _EmergencyActiveScreenState();
}

class _EmergencyActiveScreenState extends State<EmergencyActiveScreen> {
  int _secondsLeft = 10;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsLeft <= 0) {
        timer.cancel();
        return;
      }
      setState(() => _secondsLeft--);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _cancelAlarm() {
    // Можно добавить удаление тревоги из Firebase
    context.go('/client/home');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.check_circle, size: 120, color: Colors.green),
            const SizedBox(height: 40),
            Text(
              'alarm_sent'.tr(),
              style: const TextStyle(fontSize: 42, color: Colors.white, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            Text(
              'cancel_in_seconds'.tr(namedArgs: {'seconds': '$_secondsLeft'}),
              style: const TextStyle(fontSize: 22, color: Colors.white70),
            ),
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: _secondsLeft > 0 ? _cancelAlarm : null,
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              child: Text('cancel_alarm'.tr(), style: const TextStyle(fontSize: 20)),
            ),
            const SizedBox(height: 30),
            ElevatedButton(
              onPressed: () => context.go('/client/chat/${widget.emergencyId}'),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
              child: Text('chat_with_security'.tr(), style: const TextStyle(fontSize: 20)),
            ),
          ],
        ),
      ),
    );
  }
}