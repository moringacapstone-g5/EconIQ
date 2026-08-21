# EconIQ

**Economic Intelligence Platform for Kenya and Africa**

EconIQ combines economic, agricultural, financial, weather, and other public data sources into one platform for analysis, forecasting, and decision-making.

## Current Focus

* 📊 Economic indicators such as CPI, inflation, GDP, unemployment, interest rates, and exchange rates
* 📄 Automated document ingestion and extraction
* 🔗 Data provenance — every observation can be traced back to its source document
* 🤖 Machine learning and forecasting
* 🔎 RAG-based economic intelligence
* 🌍 Designed to scale from Kenya to Africa

## Tech Stack

**Backend:** Python, FastAPI
**Database:** PostgreSQL
**Infrastructure:** Docker
**Data/ML:** Pandas, Scikit-learn
**AI/RAG:** Qdrant + LLMs

## Team Workflow

1. Pull the latest changes before starting work.
2. Create a feature branch for your task.
3. Keep commits small and descriptive.
4. Test your changes before pushing.
5. Open a Pull Request for review.
6. Don't push directly to `main` unless agreed by the team.

```bash
git pull origin main
git checkout -b feature/your-feature
```

## Project Structure

```text
econiq/
├── app/
│   ├── ingestion/
│   ├── models/
│   ├── api/
│   └── ...
├── alembic/
├── data/
├── docker-compose.yml
├── pyproject.toml
└── README.md
```

> **Goal:** Build a reliable, scalable economic intelligence system that turns fragmented African data into useful insights.
