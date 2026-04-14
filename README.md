<div align="center">

# 🛰️ EncroachScan — AI-Powered Land Encroachment Detection

**Automated detection of unauthorized land encroachments using Computer Vision & Satellite Imagery**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.12-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)](https://opencv.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

---

</div>

## 📸 Output — Encroachment Detection in Action

<div align="center">

![EncroachScan Output — Sanctioned Map vs Satellite Image vs Detected Encroachments](assets/output.png)

**Left:** Sanctioned / Approved Building Layout Map &nbsp;|&nbsp; **Center:** Live Satellite Imagery &nbsp;|&nbsp; **Right:** AI-Detected Encroachments (highlighted in red)

</div>

---

## 🔍 Problem Statement

**Unauthorized land encroachment** is a pervasive issue in rapidly urbanizing regions, particularly in India. Illegal constructions extend beyond sanctioned plot boundaries, encroach upon public land, and violate approved building plans — often going undetected for years until the damage is irreversible.

### The Core Challenges:

| Challenge | Description |
|-----------|-------------|
| **Manual Inspection** | Traditional surveying is time-consuming, expensive, and prone to human error |
| **Scale** | Urban local bodies manage thousands of plots — manual comparison of each against sanctioned maps is infeasible |
| **Delayed Detection** | Encroachments are often identified only after complaints or legal disputes, making remediation costly |
| **Lack of Evidence** | Authorities lack quantifiable, visual evidence to take enforcement action |

---

## 🧠 Our Approach

EncroachScan solves this by combining **Computer Vision** with **satellite imagery analysis** to automate the detection of land encroachments at scale.

### Pipeline Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  Sanctioned Map  │     │ Satellite Image   │     │   AI/CV Pipeline    │
│  (Approved Plan) │────▶│ (Current State)   │────▶│                     │
└─────────────────┘     └──────────────────┘     │  1. Preprocessing   │
                                                  │  2. Edge Detection  │
                                                  │  3. Contour Mapping │
                                                  │  4. Mask Diffing    │
                                                  │  5. Overlay Gen     │
                                                  └────────┬────────────┘
                                                           │
                                                  ┌────────▼────────────┐
                                                  │   Analysis Report   │
                                                  │  • Deviation %      │
                                                  │  • Encroached Areas │
                                                  │  • Visual Overlay   │
                                                  │  • Severity Rating  │
                                                  └─────────────────────┘
```

### How It Works

1. **Image Preprocessing** — Both the sanctioned map (PDF/image) and satellite imagery are normalized to a consistent resolution (800×800) using OpenCV.

2. **Building Detection** — Canny edge detection + Gaussian blur isolate structural outlines. Contours are extracted and filtered by area to remove noise.

3. **Mask Generation** — Binary masks are created for both images — representing approved vs. actual building footprints.

4. **Encroachment Identification** — Pixel-level subtraction (`satellite_mask − sanctioned_mask`) reveals areas present in reality but absent from the approved plan — i.e., **encroachments**.

5. **Visualization** — Encroached regions are highlighted in **red** with semi-transparent overlays. Sanctioned boundaries are drawn in **green**. A side-by-side comparison image is generated for instant visual assessment.

6. **Severity Classification** — Deviation percentage is computed and classified:
   - 🟢 `< 5%` — Minor / No Encroachment
   - 🟡 `5% – 15%` — Moderate Encroachment (Warning)
   - 🔴 `> 15%` — Critical Encroachment (Immediate Action Required)

---

## 🚀 Impact

<div align="center">

| Metric | Before EncroachScan | After EncroachScan |
|--------|--------------------|--------------------|
| **Detection Time** | Weeks–Months | Seconds |
| **Accuracy** | Subjective (human) | Quantifiable (pixel-level %) |
| **Cost per Survey** | ₹10,000–50,000+ | Near Zero (automated) |
| **Evidence Quality** | Verbal / Paper-based | Visual overlay + deviation report |
| **Scalability** | 1 surveyor = ~5 plots/day | Unlimited parallel processing |

</div>

### Real-World Applications

- 🏛️ **Municipal Corporations** — Automate encroachment detection across entire city wards
- 📋 **Revenue Departments** — Validate land records against ground reality before property registration
- ⚖️ **Legal Proceedings** — Generate court-admissible visual evidence of boundary violations
- 🏗️ **Urban Planning** — Monitor unauthorized construction activity over time with periodic satellite feeds
- 🌍 **Smart City Initiatives** — Integrate with GIS dashboards for real-time encroachment monitoring

---

## 🏗️ Technology Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Python 3.10+** | Core language |
| **FastAPI** | High-performance async REST API |
| **OpenCV** | Computer Vision — edge detection, contour analysis, image processing |
| **NumPy** | Numerical operations on image matrices |
| **Pillow** | Image format handling and conversion |
| **pdf2image** | PDF sanctioned map conversion |
| **ReportLab** | PDF report generation |
| **Motor** | Async MongoDB driver |
| **MongoDB Atlas** | Cloud database for projects & analysis results |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **React Router v7** | Client-side routing |
| **Tailwind CSS** | Utility-first styling |
| **Radix UI** | Accessible component primitives |
| **Lucide React** | Icon system |
| **Axios** | HTTP client |
| **Sonner** | Toast notifications |

---

## 📁 Project Structure

```
Land_Encroachment/
├── backend/
│   ├── server.py              # FastAPI application — API routes & CV pipeline
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables (MongoDB URI, DB name)
│   └── uploads/               # Uploaded sanctioned maps & satellite images
│
├── frontend/
│   ├── src/
│   │   ├── App.js             # Root component with routing
│   │   ├── pages/
│   │   │   ├── HomePage.js    # Landing page
│   │   │   ├── UploadPage.js  # Image upload interface
│   │   │   ├── AnalysisPage.js # Results visualization
│   │   │   └── ProjectsPage.js # Project management
│   │   ├── components/
│   │   │   └── ui/            # Radix UI component library
│   │   └── lib/               # Utility functions
│   ├── package.json
│   └── tailwind.config.js
│
├── tests/                     # Test suites
├── backend_test.py            # API integration tests
├── assets/
│   └── output.png             # Sample output image
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** & **Yarn**
- **MongoDB Atlas** account (or local MongoDB instance)
- **Poppler** (required by `pdf2image` for PDF processing)

### 1. Clone the Repository

```bash
git clone https://github.com/9SERG4NT/Land_Encroachment.git
cd Land_Encroachment
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Create/edit .env file with:
# MONGO_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/
# DB_NAME=encroachscan

# Start the server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
yarn install

# Configure environment variables
# Create/edit .env file with:
# REACT_APP_BACKEND_URL=http://localhost:8001

# Start the development server
yarn start
```

### 4. Access the Application

| Service | URL |
|---------|-----|
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:8001/api` |
| API Docs (Swagger) | `http://localhost:8001/docs` |

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/` | Health check |
| `POST` | `/api/project/create` | Create a new scan project |
| `GET` | `/api/projects` | List all projects |
| `GET` | `/api/project/{id}` | Get project details |
| `POST` | `/api/upload-sanctioned-map/{id}` | Upload sanctioned/approved map |
| `POST` | `/api/upload-satellite-image/{id}` | Upload satellite imagery |
| `POST` | `/api/analyze/{id}` | Run encroachment analysis |
| `GET` | `/api/results/{id}` | Retrieve analysis results |

### Example — Create & Analyze

```bash
# 1. Create a project
curl -X POST http://localhost:8001/api/project/create \
  -H "Content-Type: application/json" \
  -d '{"project_name": "Ward 42 Survey", "location": "Mumbai, Maharashtra"}'

# 2. Upload sanctioned map
curl -X POST http://localhost:8001/api/upload-sanctioned-map/{PROJECT_ID} \
  -F "file=@sanctioned_map.pdf"

# 3. Upload satellite image
curl -X POST http://localhost:8001/api/upload-satellite-image/{PROJECT_ID} \
  -F "file=@satellite.png"

# 4. Run analysis
curl -X POST http://localhost:8001/api/analyze/{PROJECT_ID}
```

---

## 🧪 Running Tests

```bash
# From the project root
python backend_test.py
```

The test suite covers:
- ✅ API endpoint availability
- ✅ Project CRUD operations
- ✅ Image upload workflows
- ✅ End-to-end analysis pipeline
- ✅ Result retrieval

---

## 🗺️ Roadmap

- [ ] 🤖 Integrate deep learning models (U-Net / Mask R-CNN) for higher accuracy
- [ ] 📡 Direct satellite feed integration (Google Earth Engine / Sentinel-2)
- [ ] 🗺️ GIS coordinate-based alignment for precise geo-referencing
- [ ] 📊 Historical comparison — track encroachment progression over time
- [ ] 📱 Mobile app for on-site field surveys with GPS tagging
- [ ] 🔔 Automated alert system for newly detected encroachments

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---
## Sample Output
![WhatsApp Image 2026-04-14 at 1 13 07 PM](https://github.com/user-attachments/assets/b7328c3b-12cd-4f10-9fe1-29f304cc651a)


## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for smarter urban governance**

⭐ Star this repository if you found it useful!

</div>
