#  EconIQ

### **Economic Intelligence for Africa**

> **Explore economic data. Ask questions. Discover insights.**

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Qdrant-DC244C?style=for-the-badge&logo=qdrant&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" />
  <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white" />
  <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white" />
</p>

---

## What is EconIQ?

**EconIQ** is an AI-powered economic intelligence platform designed to make economic data across Africa easier to **explore, understand, and analyze**.

Starting with **Kenya**, EconIQ combines economic datasets, official reports, analytics, machine learning, and AI-powered document search into one platform.

Instead of searching through scattered reports, spreadsheets, databases, and documents, users can interact with economic information through **analytics, visualizations, forecasts, and natural-language questions**.

---

## 🚀 Key Features

### 📊 Economic Analytics

Explore key economic indicators including:

* Inflation
* GDP growth
* Unemployment
* Interest rates
* Exchange rates
* Food prices

EconIQ transforms economic data into interactive analytics and visualizations.

### 🤖 AI Economic Q&A

Users can ask questions about economic data and reports using natural language.

For example:

> **What was Kenya's inflation rate in July 2026?**

> **What were the main drivers of inflation?**

> **How has inflation changed over time?**

EconIQ uses Retrieval-Augmented Generation (RAG) to retrieve relevant economic information before generating an answer.

### 📈 Machine Learning Forecasts

EconIQ uses machine-learning models to forecast selected economic indicators.

Current forecasting capabilities include:

* Inflation forecasting
* Food-price forecasting

### 📚 Document Intelligence

Economic reports and documents are transformed into searchable knowledge using:

**Documents → Text → Chunks → Embeddings → Vector Search → AI Answer**

This allows users to interact with economic reports without manually searching through large documents.

---

# 🧠 How EconIQ Works

```text
              ECONOMIC DATA
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
    Structured Data       Documents
          │                   │
          ▼                   ▼
     PostgreSQL           Embeddings
                              │
                              ▼
                           Qdrant
          │                   │
          └─────────┬─────────┘
                    ▼
              EconIQ Backend
                 FastAPI
                    │
             ┌──────┴──────┐
             ▼             ▼
        Analytics       AI / RAG
             │             │
             └──────┬──────┘
                    ▼
             EconIQ Frontend
               Next.js
```

---

# 🏗️ Technology Stack

| Layer               | Technology                     |
| ------------------- | ------------------------------ |
| 🐍 Programming      | Python                         |
| ⚡ Backend           | FastAPI                        |
| 🗄️ Database        | PostgreSQL                     |
| 🔎 Vector Database  | Qdrant                         |
| 🤖 Machine Learning | scikit-learn                   |
| 🧠 AI / RAG         | OpenAI + Sentence Transformers |
| 🌐 Frontend         | Next.js, React, TypeScript     |
| 🔄 ORM              | SQLAlchemy                     |
| 🗃️ Migrations      | Alembic                        |
| 🐳 Infrastructure   | Docker & Docker Compose        |
| 📦 Environment      | uv                             |
| 🔧 Version Control  | Git                            |

---

# 📊 Data Sources

EconIQ works with economic information from established sources including:

* **Kenya National Bureau of Statistics (KNBS)**
* **Central Bank of Kenya (CBK)**
* **World Bank**
* **World Food Programme (WFP)**
* Climate and weather datasets

The architecture is designed to support additional African data sources.

---

# 🤖 Machine Learning

EconIQ includes forecasting models developed using historical economic data and engineered features.

### Inflation Forecasting

A **Ridge** is used to forecast inflation based on historical economic information and engineered features.

The model uses chronological training, validation, and test datasets to preserve the time-series nature of the problem.

### Food Price Forecasting

A **Random Forest Regressor** is used to forecast food prices based on historical prices information.

The food-price model combines historical food prices with economic and environmental variables including:

* Inflation
* Interest rates
* Rainfall
* Temperature
* Humidity
* Historical price lags
* Moving averages
* Price changes

---

# 🔍 RAG Architecture

EconIQ uses **Retrieval-Augmented Generation** to connect an AI model with economic documents.

```text
             User Question
                   │
                   ▼
            Query Processing
                   │
                   ▼
              Embedding
                   │
                   ▼
            Qdrant Search
                   │
                   ▼
         Relevant Documents
                   │
                   ▼
                Context
                   │
                   ▼
                 LLM
                   │
                   ▼
          Economic Answer
```

This allows the AI system to use relevant economic documents as context when answering questions.

---

# 📁 Project Structure

```text
econiq/
│
├── app/
│   ├── api/
│   ├── core/
│   ├── db/
│   ├── rag/
│   ├── services/
│   └── main.py
│
├── data/
│   ├── raw/
│   ├── processed/
│   └── models/
│
├── notebooks/
│
├── scripts/
│
├── tests/
│
├── docker-compose.yml
├── pyproject.toml
├── .env
└── README.md
```

---

# ⚙️ Getting Started

## Requirements

* Python 3.13+
* [uv](https://docs.astral.sh/uv/)
* Docker Desktop
* Node.js
* Git

### Clone the repository

```powershell
git clone <repo url>
cd econiq
```

### Set up Python

```powershell
uv venv
.\.venv\Scripts\Activate.ps1
uv sync
```

### Start Docker services

```powershell
docker compose up -d
```

### Start the FastAPI backend

```powershell
uv run uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

### Start the frontend

From the frontend directory:

```powershell
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

# API

EconIQ provides API endpoints for accessing economic information, analytics, documents, and AI functionality.

```text
/api/v1/countries
/api/v1/indicators
/api/v1/observations
/api/v1/sources
/api/v1/rag
/api/v1/analytics
/api/v1/documents
```

Example:

```text
/api/v1/observations?country=KE&indicator=INFLATION
```

---

# 🌐 Kenya → Africa

EconIQ starts with Kenya while being designed for a broader African ecosystem.

```text
🇰🇪 Kenya
   │
   ├── 🇺🇬 Uganda
   ├── 🇹🇿 Tanzania
   ├── 🇷🇼 Rwanda
   ├── 🇬🇭 Ghana
   ├── 🇳🇬 Nigeria
   └── Africa
```

The vision is to create a unified platform where users can explore **economic data, reports, trends, and forecasts across African economies**.

---

<div align="center">

#  EconIQ

### Economic Intelligence for Africa

**Data → AI → Insights**

*Making African economic intelligence accessible through one platform.*

</div>
