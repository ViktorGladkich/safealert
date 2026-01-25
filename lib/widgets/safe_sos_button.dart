import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

enum AlarmType { normal, silent }

class SafeSosButton extends StatefulWidget {
  final void Function(AlarmType type) onAlarm;
  const SafeSosButton({super.key, required this.onAlarm});

  @override
  State<SafeSosButton> createState() => _SafeSosButtonState();
}

class _SafeSosButtonState extends State<SafeSosButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scale;
  bool _isHolding = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 6),
      vsync: this,
    );
    _scale = Tween<double>(begin: 1.0, end: 1.4).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onLongPressStart(LongPressStartDetails details) {
    setState(() => _isHolding = true);
    _controller.forward();
  }

  void _onLongPressEnd(LongPressEndDetails details) {
    final progress = _controller.value;

    if (progress >= 0.5) {
      if (progress >= 1.0) {
        // 6 секунд — тихая тревога
        widget.onAlarm(AlarmType.silent);
      } else {
        // 3 секунды — обычная тревога
        HapticFeedback.heavyImpact();
        widget.onAlarm(AlarmType.normal);
      }
    }

    _controller.reset();
    setState(() => _isHolding = false);
  }

  @override
  Widget build(BuildContext context) {
    final progress = _controller.value;
    final isSilentZone = progress > 0.8;

    return GestureDetector(
      onLongPressStart: _onLongPressStart,
      onLongPressEnd: _onLongPressEnd,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Transform.scale(
            scale: _scale.value,
            child: Container(
              width: 240,
              height: 240,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: isSilentZone
                      ? [Colors.purple.shade900, Colors.purple.shade600]
                      : [Colors.red.shade800, Colors.red.shade900],
                ),
                boxShadow: [
                  BoxShadow(
                    color: isSilentZone
                        ? Colors.purple.withValues(alpha: 0.9)
                        : Colors.red.withValues(alpha: 0.8),
                    blurRadius: isSilentZone ? 120 : 80,
                    spreadRadius: isSilentZone ? 60 : 40,
                  ),
                ],
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    isSilentZone ? "SILENT" : "SOS",
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 64,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 10),
                  if (_isHolding)
                    Text(
                      isSilentZone ? "Stille Alarm..." : "Halten für Alarm...",
                      style: const TextStyle(color: Colors.white70, fontSize: 18),
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}