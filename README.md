# 🏛️ E-TaxPay | Digital Tax Collection System

**E-TaxPay** is a full-stack digital tax collection platform built for the **Uttarakhand Zila Panchayat** to modernize shop-tax management, complaint handling, and government notice publication across **13 districts**.

---

## 📱📥 Download  
➡️ **E-TaxPay Android APK**  
*(Add your download link here)*

---

## 🚀 Key Features

### 🌐 Admin Dashboard
- Real-time analytics & district-wise revenue metrics  
- Dashboard graphs & tax insights  

### 🧾 Taxpayer Panel
- Secure login for shop owners  
- View pending taxes  
- Pay tax online using Razorpay  

### 📰 Government Notices & Updates
- Admin can publish official updates  
- District-wise notification system  

### 🛠️ Complaint Management System
- Users can raise complaints  
- Track complaint status in real time  

### 🗣️ Multilingual Support
- Fully available in **Hindi** and **English**  
- Implemented using **i18next**

---

## 🛠️ Technology Stack

### 🔹 Frontend
- React.js (Vite)  
- Framer Motion (Animations)  
- i18next (Multilingual)  
- Supabase JS Client (Auth + Realtime)

### 🔹 Backend
- Node.js + Express  
- Supabase (PostgreSQL + Auth)  
- Razorpay (Payment Gateway)  
- Nodemailer (Auto Email Alerts)

---

## 📂 Project Structure
e-taxpay/
├── frontend/ # React + Vite Frontend
│ ├── src/assets/ # Images, Logos, Emblems
│ ├── src/components/ # UI Components
│ └── public/ # Static Files (Favicons)
│
├── backend/ # Node.js Backend
│ ├── src/controllers/ # Business Logic
│ └── src/routes/ # REST API Endpoints
│
└── supabase/ # Database Schema & SQL Migrations  


---

## 🔧 Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/raju/Major-Project.git


### 2️⃣ Setup Frontend
cd frontend
npm install
npm run dev

### 3️⃣ Setup Backend
cd ../backend
npm install

# Add your .env credentials here
npm run dev


🛡️ Admin Credentials
Supports Super Admin + District Admins (13 districts of Uttarakhand)

Super Admin ID: super****
Default Password: super******
Master Passkey: ADMIN*****

🚩 Disclaimer

This project is part of a digital transformation initiative for the Uttarakhand region.
All government emblems, logos, and branding are used strictly for official representation.

