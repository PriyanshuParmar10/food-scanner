# 🍔 PantryOS — Smart Food Scanner & Kitchen Assistant

> **Minor Project** — Built with React, Node.js, MongoDB & Google Gemini AI

PantryOS is a full-stack intelligent kitchen management system that helps users scan food products via barcode, manage their pantry inventory, get AI-generated recipes from available ingredients, and receive personalized health analysis based on their health profile.

---

## ✨ Features

### 🔍 Barcode Scanner
- Scan barcodes using your device camera (powered by `html5-qrcode`)
- Auto-lookup product info from **OpenFoodFacts** global database
- Fallback to manual entry if product not found

### 📦 Smart Pantry Inventory
- View all scanned/added items in a beautiful card grid
- Select multiple items for bulk actions
- AI-powered nutritional analysis for each product

### 👨‍🍳 AI Chef (Recipe Generator)
- Select ingredients from your pantry
- Choose cuisine style, meal type, and difficulty
- **Google Gemini AI** generates a complete, creative recipe in Markdown

### 🛒 Smart Shopping List
- Add shopping items manually
- **AI Health Audit** — analyzes items against your health profile
- Get healthier alternatives with one-click swap

### 🏥 Health Profile
- Set conditions: Diabetes, High BP, Gluten Intolerance, Vegan, Lactose Intolerant
- All AI features adapt to your health profile automatically

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, TailwindCSS, Framer Motion |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **AI** | Google Gemini 2.0 Flash API |
| **Auth** | JWT (JSON Web Tokens) + bcrypt |
| **Barcode** | html5-qrcode + OpenFoodFacts API |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key

### 1. Clone the repo
```bash
git clone https://github.com/PriyanshuParmar10/food-scanner.git
cd food-scanner
```

### 2. Install dependencies
```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### 3. Configure Environment Variables

**Backend** (`backend/.env`):
```env
PORT=5000
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_atlas_uri
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`.env.local`):
```env
VITE_API_URL=http://localhost:5000
```

### 4. Run the project
```bash
# From root directory — starts both frontend & backend
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 📁 Project Structure

```
food-scanner/
├── src/                    # React Frontend
│   ├── App.jsx             # Main layout with sidebar + routing
│   ├── Login.jsx           # Interactive login page with animated mascots
│   ├── Inventory.jsx       # Pantry management with AI analysis
│   ├── Scan.jsx            # Barcode scanner + manual entry
│   ├── Chef.jsx            # AI recipe generator
│   ├── ShoppingList.jsx    # Smart shopping list with health audit
│   ├── AlertToast.jsx      # Reusable notification component
│   ├── api.js              # Axios instance with auth interceptor
│   └── context/            # Toast context provider
│
├── backend/
│   ├── server.js           # Express server + MongoDB connection
│   ├── routes/
│   │   ├── authRoutes.js   # Register + Login
│   │   ├── inventoryRoutes.js  # CRUD for pantry items
│   │   ├── aiRoutes.js     # Gemini AI endpoints (recipe, analyze, barcode)
│   │   ├── shoppingRoutes.js   # Shopping list + AI audit
│   │   └── productRoutes.js    # Barcode lookup (OpenFoodFacts)
│   ├── models/             # Mongoose schemas
│   └── middleware/          # Auth, error handling
│
└── package.json            # Concurrently runs frontend + backend
```

---

## 👤 Author

**Priyanshu Parmar**

---

## 📄 License

This project is for educational purposes (Minor Project).
