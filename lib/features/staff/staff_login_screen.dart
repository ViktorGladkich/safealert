import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../core/branding/branding.dart';

class StaffLoginScreen extends StatefulWidget {
  const StaffLoginScreen({super.key});

  @override
  State<StaffLoginScreen> createState() => _StaffLoginScreenState();
}

class _StaffLoginScreenState extends State<StaffLoginScreen> {
  final _idController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    // Staff branding uses Orange/Red accents usually
    const staffColor = Color(0xFFFF5722);
    final branding = CompanyBranding.current;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.black,
              const Color(0xFF200505), // Dark red tint
              staffColor.withOpacity(0.2),
            ],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                   Hero(
                    tag: 'app_logo_staff', // Different tag if possible or same if shared transition
                    child: Icon(Icons.admin_panel_settings, size: 80, color: staffColor),
                  ),
                  const SizedBox(height: 32),
                  Text(
                    'staff_login_title'.tr(defaultValue: 'Staff Access'),
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'staff_login_subtitle'.tr(defaultValue: 'Authorized personnel only'),
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white.withOpacity(0.6),
                    ),
                  ),
                  const SizedBox(height: 48),

                  // ID Input
                  _buildTextField(
                    controller: _idController,
                    label: 'Staff ID',
                    icon: Icons.badge_outlined,
                    accentColor: staffColor,
                  ),
                  const SizedBox(height: 20),

                  // Password Input
                  _buildTextField(
                    controller: _passwordController,
                    label: 'Password',
                    icon: Icons.lock_outline,
                    isPassword: true,
                    accentColor: staffColor,
                  ),
                  const SizedBox(height: 48),

                  // Login Button
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : () async {
                        setState(() => _isLoading = true);
                        await Future.delayed(const Duration(milliseconds: 1500));
                        if (mounted) {
                           context.go('/staff/map');
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: staffColor,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        elevation: 8,
                        shadowColor: staffColor.withOpacity(0.5),
                      ),
                      child: _isLoading 
                        ? const CircularProgressIndicator(color: Colors.white)
                        : Text(
                            'login_button'.tr(defaultValue: 'Enter System'),
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                    ),
                  ),
                  
                  const SizedBox(height: 40),
                  
                  // Back button
                   IconButton(
                    onPressed: () => context.pop(),
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                   ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    required Color accentColor,
    bool isPassword = false,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: TextField(
        controller: controller,
        obscureText: isPassword,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
          prefixIcon: Icon(icon, color: accentColor.withOpacity(0.8)),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        ),
      ),
    );
  }
}