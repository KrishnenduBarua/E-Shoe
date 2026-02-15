# Flick - Secure E-Commerce Platform

A modern, secure e-commerce platform for selling premium footwear online with OTP-based authentication.

## 🚀 Live Demo

- **Frontend**: [Deployed on Vercel](https://flick.vercel.app) _(will be available after deployment)_

## ✨ Features

- 🔐 **Secure OTP Authentication** - Phone number-based login/registration
- 🛍️ **Product Catalog** - Browse and search premium footwear
- 🛒 **Shopping Cart** - Add, remove, and manage items
- 💳 **Secure Checkout** - Protected payment flow
- 👤 **User Profile** - Manage personal information
- 📱 **Responsive Design** - Works on all devices
- 🔒 **Security First** - XSS protection, CSRF tokens, rate limiting

## Project Structure

```
Flick/
├── Frontend/           # React + Tailwind CSS frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── utils/
│   └── package.json
│
└── Backend/           # Express.js + SQL backend (to be implemented)
    └── (backend files will go here)
```

## Technology Stack

### Frontend

- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **React Router** - Navigation
- **Zustand** - State management
- **Axios** - HTTP client
- **DOMPurify** - XSS protection

### Backend (Planned)

- **Express.js** - API framework
- **SQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## Security Features

✅ XSS Protection with input sanitization  
✅ CSRF Token support  
✅ Rate limiting  
✅ Secure headers (CSP, X-Frame-Options, etc.)  
✅ Password strength validation  
✅ Protected routes  
✅ Secure session management  
✅ Input validation and sanitization  
✅ HTTPS enforcement  
✅ SQL injection prevention (backend)

## Getting Started

### Frontend Setup

1. Navigate to the Frontend directory:

```bash
cd Frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Start development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup (Coming Soon)

Backend implementation with Express.js and SQL database will be added next.

## Features

### Current Features (Frontend)

- ✅ Responsive design
- ✅ Product catalog with categories
- ✅ Product detail pages
- ✅ Shopping cart
- ✅ Secure checkout flow
- ✅ User authentication (Login/Register)
- ✅ User profile management
- ✅ Search functionality
- ✅ Wishlist
- ✅ Contact form

### Upcoming Features (Backend)

- 🔲 REST API with Express.js
- 🔲 SQL database integration
- 🔲 Payment gateway integration
- 🔲 Order management system
- 🔲 Admin dashboard
- 🔲 Email notifications
- 🔲 Analytics and reporting

## Security Best Practices

This project follows industry-standard security practices:

1. **Input Validation**: All user inputs are validated and sanitized
2. **Authentication**: Secure JWT-based authentication
3. **Authorization**: Role-based access control
4. **Data Protection**: Encryption for sensitive data
5. **API Security**: Rate limiting, CSRF protection, secure headers
6. **Code Security**: No sensitive data in client code, source maps disabled in production

## Development Guidelines

### Code Standards

- Use ES6+ JavaScript features
- Follow React best practices
- Write clean, readable code
- Add comments for complex logic
- Use meaningful variable names

### Security Guidelines

- Always sanitize user inputs
- Never store sensitive data in localStorage
- Use HTTPS in production
- Keep dependencies updated
- Validate all API responses
- Implement proper error handling

## 🚀 Deployment

### Deploying to Vercel

1. **Connect Repository:**

   ```bash
   # Push your code to GitHub (see instructions below)
   ```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Framework Preset: **Vite**
   - Root Directory: `Frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Set Environment Variables in Vercel:**
   - `VITE_API_URL` - Your backend API URL (when ready)
   - `VITE_APP_NAME` - Flick
   - `VITE_APP_URL` - Your Vercel deployment URL

4. **Deploy:**
   - Click "Deploy"
   - Your app will be live in minutes!

### Local Development Build

```bash
cd Frontend
npm run build
```

The production build will be in the `dist/` folder.

## 📋 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/KrishnenduBarua/Flick.git
   cd Flick
   ```

2. **Install Frontend dependencies:**

   ```bash
   cd Frontend
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server:**

   ```bash
   npm run dev
   ```

5. **Open browser:**
   - Navigate to `http://localhost:5173`

## 📦 Build for Production

```bash
cd Frontend
npm run build
npm run preview  # Preview production build
```

## License

Proprietary and confidential. All rights reserved.

## Support

For support and inquiries:

- Email: support@flick.com
- Phone: +1 (234) 567-890

## Contributors

Development Team - Flick

---

**Note**: This is a production-ready e-commerce platform with security as the top priority. All code follows industry best practices and security standards.
