import 'package:flutter/material.dart';

class CompanyBranding {
  final String companyName;
  final String city;
  final Color primaryColor;
  final Color accentColor;
  final String logoAsset;
  final String appName;

  const CompanyBranding({
    required this.companyName,
    required this.city,
    required this.primaryColor,
    required this.accentColor,
    required this.logoAsset,
    this.appName = "SafeAlert",
  });

  static final assSecurity = CompanyBranding(
    companyName: "A.S.S Security",
    city: "Dresden",
    primaryColor: const Color(0xFF0D47A1),
    accentColor: Colors.red.shade700,
    logoAsset: "assets/branding/app_logo.png",
  );

  // Текущий бренд — меняем только эту строку
  static CompanyBranding current = assSecurity;
}
