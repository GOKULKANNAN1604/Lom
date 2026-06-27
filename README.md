# 🧠 Life OS Tracker

A Django + PostgreSQL application to track your three core life pillars:

| Pillar | Focus |
|---|---|
| 🏋️ **Performance** | Fitness, Gym, Cardio, Yoga |
| 📈 **Wealth** | SIPs, Stocks, Portfolio, Financial Study |
| 💻 **Tech** | Coding, Courses, Projects, DSA |

---

## ⚡ Quick Start

```bash
# 1. Clone & navigate
cd "Life Operating System"

# 2. Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
copy .env.example .env         # Windows
# cp .env.example .env         # macOS/Linux
# Edit .env with your DB credentials

# 5. Run migrations
python manage.py makemigrations tracker
python manage.py migrate

# 6. Create superuser
python manage.py createsuperuser

# 7. Start dev server
python manage.py runserver
```

Visit **http://127.0.0.1:8000/admin** for the Admin panel.

---

## 🗂️ Project Structure

```
Life Operating System/
├── life_os/                 # Django project config
│   ├── settings.py          # All settings (reads from .env)
│   ├── urls.py              # Root URL routing
│   ├── wsgi.py
│   └── asgi.py
├── tracker/                 # Core app — all 3 pillars
│   ├── models.py            # PerformanceLog, WealthLog, TechLog
│   ├── admin.py             # Django Admin registration
│   ├── serializers.py       # DRF serializers
│   ├── views.py             # DRF ViewSets
│   ├── urls.py              # /api/ routes
│   ├── signals.py           # Auto-streak update on save
│   ├── utils.py             # calculate_streak() helper
│   └── migrations/
├── static/                  # CSS / JS assets
├── templates/               # HTML templates
├── .env.example             # Copy → .env
├── .gitignore
├── manage.py
└── requirements.txt
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/performance/` | List / Create performance logs |
| GET/PUT/DELETE | `/api/performance/<id>/` | Retrieve / Update / Delete |
| GET | `/api/performance/streak/` | Current & longest streak |
| GET/POST | `/api/wealth/` | List / Create wealth logs |
| GET | `/api/wealth/streak/` | Wealth streak summary |
| GET/POST | `/api/tech/` | List / Create tech logs |
| GET | `/api/tech/streak/` | Tech streak summary |

---

## 🐘 PostgreSQL Setup

```sql
CREATE DATABASE life_os_db;
CREATE USER life_os_user WITH PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE life_os_db TO life_os_user;
```

Then update your `.env` file with the credentials.
