import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../core/branding/branding.dart';

class ClientLoginScreen extends StatefulWidget {
  const ClientLoginScreen({super.key});

  @override
  State<ClientLoginScreen> createState() => _ClientLoginScreenState();
}

class _ClientLoginScreenState extends State<ClientLoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final branding = CompanyBranding.current;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.black,
              const Color(0xFF051020),
              branding.primaryColor.withOpacity(0.2),
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
                    tag: 'app_logo',
                    child: Image.asset(
                      branding.logoAsset,
                      height: 100,
                      color: branding.primaryColor,
                      errorBuilder: (_,__,___) => Icon(Icons.security, size: 80, color: branding.primaryColor),
                    ),
                  ),
                  const SizedBox(height: 32),
                  Text(
                    'client_login_title'.tr(defaultValue: 'Client Login'),
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'client_login_subtitle'.tr(defaultValue: 'Please sign in to continue'),
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white.withOpacity(0.6),
                    ),
                  ),
                  const SizedBox(height: 48),

                  // Email Input
                  _buildTextField(
                    controller: _emailController,
                    label: 'Email',
                    icon: Icons.email_outlined,
                    branding: branding,
                  ),
                  const SizedBox(height: 20),

                  // Password Input
                  _buildTextField(
                    controller: _passwordController,
                    label: 'Password',
                    icon: Icons.lock_outline,
                    isPassword: true,
                    branding: branding,
                  ),
                  const SizedBox(height: 48),

                  // Login Button
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : () async {
                        setState(() => _isLoading = true);
                        await Future.delayed(const Duration(milliseconds: 1500)); // Simulate net
                        if (mounted) {
                           context.go('/client/home');
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: branding.primaryColor,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        elevation: 8,
                        shadowColor: branding.primaryColor.withOpacity(0.5),
                      ),
                      child: _isLoading 
                        ? const CircularProgressIndicator(color: Colors.white)
                        : Text(
                            'login_button'.tr(defaultValue: 'Sign In'),
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  TextButton(
                    onPressed: () {},
                    child: Text(
                      'forgot_password'.tr(defaultValue: 'Forgot Password?'),
                      style: TextStyle(color: Colors.white.withOpacity(0.6)),
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
    required CompanyBranding branding,
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
          prefixIcon: Icon(icon, color: branding.primaryColor.withOpacity(0.8)),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        ),
      ),
    );
  }
}
