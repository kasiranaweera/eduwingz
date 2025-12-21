# Eduwingz

**Eduwingz** is an **AI-powered teaching assistant web application** designed to enhance modern education through intelligent interaction and automation. Built with a **React (Material UI)** frontend and a **Django** backend, Eduwingz integrates artificial intelligence to support teachers and learners with personalized educational insights and seamless classroom management. 

---

## 🧠 Key Features

- **AI Teaching Assistant** – Provides intelligent responses, explanations, and content generation to support both teachers and students.  
- **Interactive Dashboard** – Visualize performance metrics, learning progress, and class activities through a clean and intuitive interface.  
- **Seamless Integration** – Connects effortlessly between the React frontend and Django backend via RESTful APIs.  
- **User Authentication** – Secure login and role-based access for students, teachers, and administrators.  
- **Modern UI Design** – Built with Material UI for a consistent, responsive, and accessible user experience.  

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React, Material UI |
| **Backend** | Django, Django REST Framework |
| **Database** | PostgreSQL / SQLite (development) |
| **AI Integration** | Python-based AI/ML models or third-party APIs |
| **Version Control** | Git & GitHub |
| **Deployment (optional)** | Docker / Render / Vercel |

## 🚀 Installation & Setup

Follow these steps to set up the project locally.

### 1. Clone the Repository
```bash
git clone https://github.com/kasiranaweera/eduwingz.git
cd eduwingz
````

### 2. Backend Setup (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup (React)

```bash
cd frontend
npm install
npm start
```

### 4. Access the Application

Visit: [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
eduwingz/
│
├── backend/              # Django backend API
│   ├── eduwingz/         # Django project configuration
│   ├── ai_module/        # AI assistant logic and ML models
│   └── requirements.txt
│
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components (MUI)
│   │   ├── pages/        # Application pages
│   │   ├── services/     # API integration and utility functions
│   │   └── App.js
│   └── package.json
│
└── README.md
```

---

## 🌟 Future Enhancements

* Enhanced AI feedback for teachers and students
* Voice-based interaction using NLP
* Integration with LMS (Learning Management Systems)
* Analytics dashboard for personalized learning insights

---

## 👨‍💻 Author

**K.A. Sithija Ishan Ranaweera**
*Co-Chairman – Venturify’24 | Vice Chairman – SEDS SLTC*
[GitHub Profile](https://github.com/kasiranaweera) • [LinkedIn](#)

---

## 🪪 License

This project is licensed under the **MIT License** – feel free to use, modify, and distribute with proper credit.

---

```

---

Would you like me to include a **project banner** (a header image with the Eduwingz logo or tagline) section at the top too? That makes the README look even more professional on GitHub.
```
