# NutriAI 🥗

NutriAI is a premium, AI-powered nutrition platform designed to help users track their health and diet through advanced image analysis and data synthesis. Built with the MERN stack, it leverages state-of-the-art AI models to provide real-time nutritional insights.

## 🚀 Features

- **AI-Powered Scanning**: Capture or upload photos of your meals for instant nutritional analysis using Gemini 2.5 Flash.
- **Daily Nutritional Synthesis**: Automatically summarize your daily intake and get personalized AI coaching using Gemini 2.0 Flash.
- **Interactive Dashboard**: Visualize your health data with dynamic charts and progress tracking.
- **Secure Authentication**: Robust user authentication with JWT and bcrypt.
- **Mobile Responsive**: Premium design that works seamlessly on both desktop and mobile devices.

## 🛠️ Technology Stack

### Frontend
- **React 19** (Vite)
- **Framer Motion** (Animations)
- **Recharts** (Data Visualization)
- **Zustand** (State Management)
- **Tailwind CSS** (Styling)
- **React Router 7** (Navigation)

### Backend
- **Node.js & Express 5**
- **MongoDB & Mongoose** (Database)
- **Google Generative AI (Gemini)** & **Anthropic SDK**
- **Cloudinary** (Image Storage)
- **Sharp & Multer** (Image Processing)
- **JWT** (Security)

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- MongoDB account
- Google AI (Gemini) API Key
- Cloudinary account

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nutriai
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory and add:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_ORIGIN=http://localhost:5173
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   GEMINI_API_KEY=your_gemini_key
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```
   Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

## 🏃 Running the Application

### Start Backend
```bash
cd server
npm run dev
```

### Start Frontend
```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173`.

## 🛡️ Security Features
- **Rate Limiting**: Protection against brute-force attacks.
- **Helmet**: Secure HTTP headers.
- **Data Validation**: Express-validator for sanitizing inputs.
- **Secure Password Hashing**: Using bcryptjs.

## 📄 License
This project is licensed under the ISC License.
