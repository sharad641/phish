# 🛡️ PhishGuard AI — Real-Time Phishing Detection with AI

**PhishGuard AI** is a lightweight, real-time phishing and social engineering detection tool powered by machine learning and natural language processing. It inspects emails, messages, and URLs for malicious patterns and warns users about potential threats with a simple, clean interface.

![PhishGuard AI Banner](https://github.com/yourusername/phishguard-ai/blob/main/public/banner.png)

---

## 📌 Project Title
**Phishing and Social Engineering Defense using AI**

---

## 🔍 Problem Statement

Phishing and social engineering attacks are increasingly sophisticated, targeting human behavior rather than exploiting system vulnerabilities. Traditional filters struggle to keep up. This project introduces an intelligent, AI-based defense system that can identify and flag suspicious content or links before users fall victim.

---

## 🎯 Objective

To build an AI-powered system that detects phishing attempts in real time by analyzing message content and URLs, alerting users with intuitive insights and warnings.

---

## 🧠 Core Features

✅ **Content Analysis**  
- NLP-based feature extraction (urgency cues, emotional triggers, link presence)  
- Classify content as `Safe` or `Phishing` using a trained ML model

✅ **URL Inspection**  
- Domain reputation checking  
- Detect suspicious redirects, domain spoofing, missing HTTPS

✅ **Real-Time Dashboard**  
- Input fields for email/text and URL  
- Visual safety score and red warning indicators  
- Simple and responsive layout for quick analysis

---

## 🖥️ UI Design Guidelines

- **Primary**: White or Light Gray
- **Secondary**: Dark Gray (text/UI)
- **Accent**: Red `#FF4136` for phishing alerts  
- **Typography**: Clean, Sans-serif fonts  
- **Icons**: Shield, Lock, Warning signs  
- **Layout**: Single-column, responsive, mobile-friendly

---

## 🛠️ Tech Stack

| Layer       | Technology                          |
|-------------|--------------------------------------|
| Frontend    | React.js                            |
| Backend     | Python + Flask                      |
| Machine Learning | Scikit-learn, CountVectorizer, Random Forest |
| Database (optional) | MongoDB or local file-based |
| Optional APIs | [VirusTotal](https://www.virustotal.com/), [URLScan.io](https://urlscan.io/) |

---

## ⚙️ System Architecture

```text
[React Frontend]
      |
      v
[Flask API Backend]
      |
      v
[NLP & ML Model]
      |
      v
[Phishing or Safe Result]

User inputs email content or URL

Flask API sends the text to ML model

Text is preprocessed with NLP techniques

ML model (Random Forest) predicts threat level

Response is displayed with a safety score and warning indicator

🧪 Model Details
Algorithm: Random Forest Classifier

Features: Links, suspicious keywords, urgency, text length

Accuracy: ~90% on phishing dataset

Data: Preprocessed and labeled phishing + legitimate messages

Future: Option to upgrade to BERT/RoBERTa models

📦 Folder Structure

phishguard-ai/
├── backend/
│   ├── app.py                # Flask server
│   ├── model.pkl             # Pre-trained ML model
│   └── utils.py              # Text processing
├── frontend/
│   ├── public/
│   │   └── favicon, banner, etc.
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── App.js
│   │   └── index.js
├── dataset/                  # (Optional) Raw and cleaned datasets
├── .env                      # API keys
├── README.md
└── requirements.txt

⚙️ Setup Instructions
✅ Prerequisites
Python 3.x, Node.js, npm

OMDB / VirusTotal API key (optional)

model.pkl file in backend/

🔧 Backend (Flask)

cd backend/
pip install -r requirements.txt
python app.py

💻 Frontend (React)
cd frontend/
npm install
npm start

📈 Example Usage
📨 Sample Email Input:
"Your account has been suspended! Click the link below to reactivate: http://fakebank-login.com"

✅ Output:
⚠️ Alert: "Phishing attempt detected"

🔒 Confidence Score: 91%

🛑 Keywords: "suspended", "click here", non-HTTPS URL

🚀 Future Enhancements
🔍 BERT integration for better contextual understanding

📩 Gmail/Outlook browser extension

🧪 URL sandboxing (headless browser inspection)

🎙️ Vishing detection via voice transcript analysis

📊 Admin dashboard for logging/reporting phishing attempts

📂 Deliverables
✅ Source Code (Frontend + Backend)

✅ Pre-trained model (.pkl)

✅ REST API for ML inference

✅ Real-time interactive UI

✅ README and documentation

🙋 Author
Sharad S
📧 Email
🔗 GitHub

