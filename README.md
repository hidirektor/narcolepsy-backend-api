# IoT Project

This project is designed as a comprehensive IoT solution with multiple components including backend services, mobile
apps, desktop applications, an admin panel, and a landing page. The system leverages various technologies to ensure
smooth operation, scalability, and user engagement.

## Repositories

- **[Backend](https://github.com/hidirektor/iot-solution-backend)**: Core backend services, including database
  management, API endpoints, and message queue.
- **[Admin Panel](https://github.com/hidirektor)**: Angular-based admin interface for managing system operations,
  including user and device management.
- **[iOS](https://github.com/hidirektor)**: iOS application developed using Swift and SwiftUI for managing IoT devices.
- **[Android](https://github.com/hidirektor)**: Android application developed using Java and Kotlin for IoT device
  management.
- **[Desktop](https://github.com/hidirektor)**: Desktop application using Java and JavaFX for managing IoT devices and
  configurations.
- **[Landing Page](https://github.com/hidirektor)**: Landing page for the IoT system built with Angular.

## Technologies

### Backend

- **MySQL**: Relational database for storing system data.
- **PhpMyAdmin**: Web-based MySQL administration tool.
- **Redis**: In-memory data structure store used for caching.
- **Redis Insight**: GUI tool for managing and analyzing Redis.
- **Node.js**: Server-side JavaScript runtime environment.
- **RabbitMQ**: Message broker for managing communication between microservices.
- **OneSignal**: Push notification service for sending notifications to mobile and desktop apps.

### Mobile (iOS and Android)

- **Android**:
    - **Java**: Primary language for Android development.
    - **Kotlin**: Secondary language for Android development.
    - **XML Layout**: For designing Android app interfaces.

- **iOS**:
    - **Swift**: Primary language for iOS app development.
    - **SwiftUI**: For building UI in iOS applications.

### Desktop

- **Java**: Primary language for desktop application development.
- **JavaFX**: Framework for building desktop applications.

### Admin Panel

- **Angular**: Web framework for building the admin panel.

### Landing Page

- **Angular**: Framework used for building a responsive landing page.

## System Features

- [ ] **Notification Management**: Admins can send notifications separately to mobile and desktop applications.
- [ ] **Custom Email & SMS Templates**: Admins can create and send customized email and SMS templates.
- [ ] **SMS Integration with netGSM**: SMS functionality is powered by netGSM API.
- [ ] **Identity Verification**: Users can authenticate their identities through **Persona**, ensuring secure login.

## Setup

1. Clone the repositories:
   ```bash
   git clone https://github.com/hidirektor/iot-solution-backend.git
   git clone https://github.com/hidirektor
   git clone https://github.com/hidirektor
   git clone https://github.com/hidirektor
   git clone https://github.com/hidirektor
   git clone https://github.com/hidirektor

2. Clone the repositories:

- Install dependencies and set up MySQL, Redis, and RabbitMQ as required.

3. Set up the admin panel, mobile apps, desktop app, and landing page by following their respective documentation for
   specific setup instructions.


4. Configure and integrate third-party services like OneSignal and netGSM for notifications and SMS.

### Contributing

Feel free to fork the repository, create issues, and submit pull requests for improvements or bug fixes. For major
changes, please open an issue first to discuss the modification.