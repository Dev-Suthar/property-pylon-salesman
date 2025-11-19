# Pylon Salesman

Mobile application for salesmen to onboard new broker companies to the Property Pylon system.

## Features

- **Login**: Authenticate as a salesman
- **Onboard Companies**: Create new broker company accounts
- **Generate Credentials**: Automatically create initial admin user with secure password
- **Share Credentials**: Share company credentials via native share functionality

## Setup

1. Install dependencies:
```bash
npm install
```

2. For iOS:
```bash
cd ios && pod install && cd ..
```

3. Run the app:
```bash
# iOS
npm run ios

# Android
npm run android
```

## Backend API

The app connects to the backend API at: `http://98.92.75.163:3000/api/v1`

Make sure the backend server is running and accessible.

## User Roles

- **Salesman**: Can create companies and initial admin users
- The created admin user will have `admin` role for the new company

## Project Structure

```
src/
├── screens/          # App screens
├── services/         # API services
├── navigation/       # Navigation setup
├── components/       # Reusable components
├── theme/           # Theme and colors
└── utils/           # Utility functions
```

