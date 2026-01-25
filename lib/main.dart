import 'dart:typed_data'; 
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'core/routes.dart';
import 'core/theme.dart';

final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    FlutterLocalNotificationsPlugin();

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  await _showNotification();
}

Future<void> _showNotification() async {
  final Int64List vibrationPattern =
      Int64List.fromList([0, 1000, 500, 1000, 500, 1000]);

  final AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
    'emergency_channel',
    'Notfall-Alarme',
    channelDescription: 'Kritische Sicherheitsalarme',
    importance: Importance.max,
    priority: Priority.high,
    playSound: false,
    enableVibration: true,
    vibrationPattern: vibrationPattern,
  );

  final NotificationDetails details = NotificationDetails(
    android: androidDetails,
    iOS: const DarwinNotificationDetails(
      presentSound: true,
      presentBadge: true,
      presentAlert: true,
    ),
  );

  await flutterLocalNotificationsPlugin.show(
    999,
    '🚨 NOTFALL!',
    'Ein Klient braucht sofortige Hilfe!',
    details,
  );
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  // Инициализация уведомлений
  const AndroidInitializationSettings androidInit =
      AndroidInitializationSettings('@mipmap/ic_launcher');
  
  const DarwinInitializationSettings darwinInit = DarwinInitializationSettings(
    requestSoundPermission: true,
    requestBadgePermission: true,
    requestAlertPermission: true,
  );

  final InitializationSettings initSettings = InitializationSettings(
    android: androidInit,
    iOS: darwinInit,
  );

  await flutterLocalNotificationsPlugin.initialize(initSettings);

  // FCM
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  await EasyLocalization.ensureInitialized();

  runApp(
    EasyLocalization(
      supportedLocales: const [Locale('en'), Locale('de')],
      path: 'assets/translations',
      fallbackLocale: const Locale('de'),
      child: const SafeAlertApp(),
    ),
  );
}

class SafeAlertApp extends StatelessWidget {
  const SafeAlertApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ScreenUtilInit(
      designSize: const Size(390, 844),
      builder: (context, child) => MaterialApp.router(
        title: 'SafeAlert',
        debugShowCheckedModeBanner: false,
        theme: appTheme,
        localizationsDelegates: context.localizationDelegates,
        supportedLocales: context.supportedLocales,
        locale: context.locale,
        routerConfig: router,
      ),
    );
  }
}