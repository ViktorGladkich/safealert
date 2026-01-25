import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:easy_localization/easy_localization.dart';

class StaffMapScreen extends StatefulWidget {
  const StaffMapScreen({super.key});

  @override
  State<StaffMapScreen> createState() => _StaffMapScreenState();
}

class _StaffMapScreenState extends State<StaffMapScreen> {
  final Set<Marker> _markers = {}; // ← теперь используется!

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: const Color(0xFFFF5800),
        title: Text('active_emergencies'.tr()),
        centerTitle: true,
      ),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance
            .collection('emergencies')
            .where('status', isEqualTo: 'new')
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
                child: CircularProgressIndicator(color: Colors.orange));
          }

          _markers.clear();
          if (snapshot.hasData) {
            for (var doc in snapshot.data!.docs) {
              final data = doc.data() as Map<String, dynamic>;
              final lat = data['latitude'] as double;
              final lng = data['longitude'] as double;

              _markers.add(Marker(
                markerId: MarkerId(doc.id),
                position: LatLng(lat, lng),
                icon: BitmapDescriptor.defaultMarkerWithHue(
                    BitmapDescriptor.hueRed),
                infoWindow: const InfoWindow(
                  title: "NOTFALL!",
                  snippet: "Klicken für Navigation",
                ),
              ));
            }
          }

          return GoogleMap(
            initialCameraPosition: const CameraPosition(
              target: LatLng(51.0504, 13.7373), // Dresden
              zoom: 10,
            ),
            markers: _markers,
            myLocationEnabled: true,
            myLocationButtonEnabled: true,
            onMapCreated: (controller) {
              // Анимируем камеру к первому маркеру, если есть
              if (_markers.isNotEmpty) {
                controller.animateCamera(
                  CameraUpdate.newLatLng(_markers.first.position),
                );
              }
            },
          );
        },
      ),
    );
  }
}
