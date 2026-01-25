import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:go_router/go_router.dart';
import '../../core/branding/branding.dart';

class RoleSelectionScreen extends StatefulWidget {
  const RoleSelectionScreen({super.key});

  @override
  State<RoleSelectionScreen> createState() => _RoleSelectionScreenState();
}

class _RoleSelectionScreenState extends State<RoleSelectionScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.04).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

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
              const Color(0xFF051020), // Very dark blue
              branding.primaryColor.withOpacity(0.3),
            ],
            stops: const [0.0, 0.6, 1.0],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo
                  Hero(
                    tag: 'app_logo',
                    child: Container(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        boxShadow: [
                            BoxShadow(
                                color: branding.primaryColor.withOpacity(0.2),
                                blurRadius: 40,
                                spreadRadius: 10,
                            )
                        ]
                      ),
                      child: Image.asset(
                        branding.logoAsset,
                        height: 160,
                        fit: BoxFit.contain,
                        errorBuilder: (context, error, stackTrace) {
                          return Icon(
                            Icons.security,
                            size: 100,
                            color: branding.primaryColor,
                          );
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Company Name
                  Text(
                    branding.companyName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                      fontFamily: 'Roboto', // Assuming default font, but making it explicit helps if we import one
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    branding.city,
                    style: TextStyle(
                        color: Colors.white.withOpacity(0.7),
                        fontSize: 18,
                        letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 60),

                  // Client Button
                  _roleButton(
                    context: context,
                    title: 'role_client'.tr(),
                    route: '/client/login', // Changed to login
                    icon: Icons.person_outline,
                    gradientColors: [
                      const Color(0xFF0D47A1), 
                      const Color(0xFF1976D2)
                    ],
                    shadowColor: const Color(0xFF0D47A1),
                  ),
                  const SizedBox(height: 24),

                  // Staff Button
                  AnimatedBuilder(
                    animation: _pulseAnimation,
                    builder: (context, child) {
                      return Transform.scale(
                        scale: _pulseAnimation.value,
                        child: _roleButton(
                          context: context,
                          title: 'role_staff'.tr(),
                          route: '/staff/login',
                          icon: Icons.admin_panel_settings_outlined,
                          gradientColors: [
                            const Color(0xFFBF360C), // Darker orange/red
                            const Color(0xFFFF5722)
                          ],
                          shadowColor: const Color(0xFFFF5722),
                        ),
                      );
                    },
                  ),

                  const SizedBox(height: 80),

                  // Copyright
                  Text(
                    "© 2025 ${branding.companyName}",
                    style: TextStyle(
                        color: Colors.white.withOpacity(0.4), 
                        fontSize: 12),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _roleButton({
    required BuildContext context,
    required String title,
    required String route,
    required IconData icon,
    required List<Color> gradientColors,
    required Color shadowColor,
  }) {
    return Container(
      height: 80,
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: shadowColor.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onPressed: () => context.go(route),
          borderRadius: BorderRadius.circular(20),
          child: Ink(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: gradientColors,
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: Colors.white.withOpacity(0.1),
                width: 1,
              ),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, color: Colors.white, size: 28),
                ),
                const SizedBox(width: 20),
                Expanded(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.centerLeft,
                    child: Text(
                      title,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 1.0,
                      ),
                      maxLines: 1,
                    ),
                  ),
                ),
                Icon(Icons.arrow_forward_ios, 
                     color: Colors.white.withOpacity(0.7), 
                     size: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
