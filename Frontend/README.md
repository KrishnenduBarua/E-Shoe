# E-Shoe Frontend

A secure, modern e-commerce frontend built with React, Tailwind CSS, and Vite.

## 🚀 Features

- **Secure by Design**: Built with security best practices from the ground up
  - XSS Protection with input sanitization
  - CSRF Token support
  - Rate limiting for API calls
  - Secure headers configuration
  - Content Security Policy
  - Password strength validation
  - Protected routes

- **Modern Tech Stack**:
  - React 18
  - Tailwind CSS for styling
  - Vite for fast development
  - Zustand for state management
  - React Router for navigation
  - Axios for API calls

- **Features**:
  - Responsive design
  - Product browsing and search
  - Shopping cart functionality
  - Secure checkout flow
  - User authentication
  - Profile management
  - Order tracking

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## 🛠️ Installation

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:

```env
VITE_API_URL=http://localhost:5000/api
VITE_API_TIMEOUT=10000
VITE_ENABLE_HTTPS=true
VITE_CSRF_ENABLED=true
VITE_APP_NAME=E-Shoe
VITE_APP_URL=http://localhost:3000
VITE_ENABLE_ANALYTICS=false
```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🔒 Security Features

### Input Validation

- All user inputs are sanitized to prevent XSS attacks
- Email, phone, and password validation
- Maximum length restrictions on all inputs

### API Security

- CSRF token support
- Request rate limiting
- Automatic token refresh
- Secure cookie handling
- Request timestamp validation

### Authentication

- Secure password requirements
- Protected routes
- Session management
- Auto-logout on token expiration

### Headers

- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- Referrer-Policy

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── Auth/           # Authentication components
│   ├── Common/         # Common components
│   ├── Layout/         # Layout components
│   └── Product/        # Product-related components
├── pages/              # Page components
│   └── Auth/          # Authentication pages
├── store/             # State management
├── utils/             # Utility functions
│   ├── api.js         # API client
│   └── security.js    # Security utilities
├── App.jsx            # Main app component
├── main.jsx           # Entry point
└── index.css          # Global styles
```

## 🔧 Configuration

### Vite Configuration

The `vite.config.js` includes:

- Security headers
- Build optimization
- Console removal in production
- Source map configuration

### Tailwind Configuration

Custom theme with:

- Primary and secondary color schemes
- Custom components
- Responsive breakpoints

## 🎨 Styling

The project uses Tailwind CSS with custom utilities:

- `.btn-primary`, `.btn-secondary`, `.btn-outline` for buttons
- `.input-field` for form inputs
- `.card` for card components
- `.container-custom` for responsive containers

## 🧪 Best Practices

1. **Always sanitize user input** using the `sanitizeInput` function
2. **Validate all forms** before submission
3. **Use HTTPS** in production
4. **Keep dependencies updated** regularly
5. **Never expose sensitive data** in client-side code
6. **Use environment variables** for configuration
7. **Implement proper error handling**

## 🔗 API Integration

The frontend expects a backend API running at the URL specified in `VITE_API_URL`.

Required API endpoints:

- `/auth/*` - Authentication endpoints
- `/products/*` - Product endpoints
- `/cart/*` - Shopping cart endpoints
- `/orders/*` - Order management endpoints
- `/categories/*` - Category endpoints

## 📝 License

This project is proprietary and confidential.

## 🤝 Contributing

Please read the contributing guidelines before making any changes.

## 📞 Support

For support, email support@e-shoe.com or contact the development team.
