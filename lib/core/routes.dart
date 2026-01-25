import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../features/client/chat_screen.dart';
import '../features/auth/role_selection_screen.dart';
import '../features/client/home_client_screen.dart';
import '../features/client/emergency_active_screen.dart';
import '../features/client/client_login_screen.dart'; // Added import
import '../features/staff/staff_login_screen.dart';
import '../features/staff/staff_map_screen.dart';

final router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const RoleSelectionScreen(),
    ),
    GoRoute(
      path: '/client/login', // New route
      builder: (context, state) => const ClientLoginScreen(),
    ),
    GoRoute(
      path: '/client/home',
      builder: (context, state) => const ClientHomeScreen(),
    ),
    
    GoRoute(
      path: '/client/emergency-active/:emergencyId',
      builder: (context, state) => EmergencyActiveScreen(
        emergencyId: state.pathParameters['emergencyId']!,
      ),
    ),
    GoRoute(
      path: '/staff/login',
      builder: (context, state) => const StaffLoginScreen(),
    ),
    GoRoute(
      path: '/staff/map',
      builder: (context, state) => const StaffMapScreen(),
    ),
    GoRoute(
      path: '/client/chat/:emergencyId',
      builder: (context, state) => ChatScreen(
        emergencyId: state.pathParameters['emergencyId']!,
      ),
    ),
  ],
  errorBuilder: (context, state) => Scaffold(
    backgroundColor: Colors.black,
    body: Center(
      child: Text(
        'Ошибка маршрута!\n${state.uri}',
        style: const TextStyle(color: Colors.red, fontSize: 24),
        textAlign: TextAlign.center,
      ),
    ),
  ),
);