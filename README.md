# 🛡️ SafeAlert

**SafeAlert** is a next-generation security and panic button application designed for **A.S.S. Security**. It bridges the gap between clients in distress and rapid response teams, providing real-time location tracking, instant alerts, and seamless communication.

<p align="center">
  <img src="assets/branding/app_logo.png" alt="SafeAlert Logo" width="120">
</p>

---

## 🚀 Features

### for Clients

- **🆘 Instant Panic Button**: One-tap emergency activation.
- **📍 Live Location Sharing**: Automatically shares precise coordinates with security personnel.
- **💬 Secure Chat**: Real-time communication with the control operation center.
- **🔔 Real-time Status**: Updates on security team arrival time.

### for Security Staff

- **🗺️ Tactical Map**: Visual overview of all active emergencies in the vicinity.
- **⚡ Rapid Deployment**: Instant notifications with optimal routes to the client.
- **📋 Incident Management**: Tools to manage and resolve security alerts efficiently.

---

## 🛠️ Tech Stack

Built with a focus on performance, reliability, and security.

- **Framework**: [Flutter](https://flutter.dev/) (Dart)
- **Navigation**: [GoRouter](https://pub.dev/packages/go_router)
- **State Management**: [Riverpod](https://riverpod.dev/)
- **Backend**: [Firebase](https://firebase.google.com/) (Auth, Firestore, Messaging)
- **Maps**: Google Maps Platform
- **Localization**: [Easy Localization](https://pub.dev/packages/easy_localization) (Support for DE 🇩🇪, EN 🇺🇸)
- **Design**: Custom modern UI with glassmorphism and animated elements.

---

## 📱 Screenshots

|                      Role Selection                       |                        Client Login                         |                         Staff Login                          |
| :-------------------------------------------------------: | :---------------------------------------------------------: | :----------------------------------------------------------: |
| _Modern entry point allowing users to select their role._ | _Secure login interface for clients requesting protection._ | _Dedicated access portal for authorized security personnel._ |

_(Screenshots to be added)_

---

## 🏁 Getting Started

### Prerequisites

- Flutter SDK (3.x)
- CocoaPods (for iOS)
- Android Studio / Xcode

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/ViktorGladkich/safealert.git
    cd safealert
    ```

2.  **Install dependencies**

    ```bash
    flutter pub get
    ```

3.  **Setup Firebase**
    - Add `google-services.json` to `android/app/`
    - Add `GoogleService-Info.plist` to `ios/Runner/`

4.  **Run the app**
    ```bash
    flutter run
    ```

---

## 🔐 Permissions

This app requires the following permissions to function correctly:

- **Location**: To track client position during emergencies (Always/When in Use).
- **Notifications**: To receive critical alerts and chat messages.
- **Vibration**: For haptic feedback during alerts.

---

## 📄 License

Proprietary software developed for **A.S.S. Security**. All rights reserved.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/ViktorGladkich">Viktor Gladkich</a>
</p>
