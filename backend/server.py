from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import cv2
import numpy as np
from PIL import Image
import io
import base64
from pdf2image import convert_from_bytes
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / 'uploads'
RESULTS_DIR = ROOT_DIR / 'results'
UPLOADS_DIR.mkdir(exist_ok=True)
RESULTS_DIR.mkdir(exist_ok=True)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class ScanProject(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_name: str
    location: Optional[str] = None
    coordinates: Optional[str] = None
    sanctioned_map_path: Optional[str] = None
    satellite_image_path: Optional[str] = None
    analysis_complete: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnalysisResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    deviation_percentage: float
    encroached_areas: int
    overlay_image: str  # base64 encoded
    comparison_image: str  # base64 encoded
    summary: str
    analyzed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProjectCreate(BaseModel):
    project_name: str
    location: Optional[str] = None
    coordinates: Optional[str] = None

# AI/CV Analysis Functions
def preprocess_image(image_bytes, target_size=(800, 800)):
    """Convert uploaded image to OpenCV format and resize"""
    try:
        # Try to load as regular image first
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            # Try as PDF
            images = convert_from_bytes(image_bytes)
            if images:
                img_pil = images[0]
                img = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)
        
        if img is None:
            raise ValueError("Could not decode image")
        
        # Resize to target size
        img = cv2.resize(img, target_size)
        return img
    except Exception as e:
        logging.error(f"Error preprocessing image: {str(e)}")
        raise

def detect_buildings(image):
    """Detect building outlines using edge detection"""
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Apply Canny edge detection
    edges = cv2.Canny(blurred, 50, 150)
    
    # Dilate edges to close gaps
    kernel = np.ones((3, 3), np.uint8)
    dilated = cv2.dilate(edges, kernel, iterations=2)
    
    # Find contours
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Filter contours by area (remove noise)
    min_area = 500
    filtered_contours = [cnt for cnt in contours if cv2.contourArea(cnt) > min_area]
    
    return filtered_contours, edges

def compare_images(sanctioned_img, satellite_img):
    """Compare two images and detect encroachments"""
    # Detect buildings in both images
    sanctioned_contours, sanctioned_edges = detect_buildings(sanctioned_img)
    satellite_contours, satellite_edges = detect_buildings(satellite_img)
    
    # Create masks for comparison
    sanctioned_mask = np.zeros(sanctioned_img.shape[:2], dtype=np.uint8)
    satellite_mask = np.zeros(satellite_img.shape[:2], dtype=np.uint8)
    
    cv2.drawContours(sanctioned_mask, sanctioned_contours, -1, 255, -1)
    cv2.drawContours(satellite_mask, satellite_contours, -1, 255, -1)
    
    # Find differences (encroachments are areas in satellite but not in sanctioned)
    encroachment_mask = cv2.subtract(satellite_mask, sanctioned_mask)
    
    # Apply threshold to get binary mask
    _, encroachment_binary = cv2.threshold(encroachment_mask, 127, 255, cv2.THRESH_BINARY)
    
    # Find encroachment contours
    encroachment_contours, _ = cv2.findContours(encroachment_binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Calculate deviation percentage
    sanctioned_area = cv2.countNonZero(sanctioned_mask)
    encroachment_area = cv2.countNonZero(encroachment_binary)
    deviation_percentage = (encroachment_area / sanctioned_area * 100) if sanctioned_area > 0 else 0
    
    # Create overlay visualization
    overlay = satellite_img.copy()
    
    # Draw sanctioned boundaries in green
    cv2.drawContours(overlay, sanctioned_contours, -1, (0, 255, 0), 2)
    
    # Draw encroachments in red
    cv2.drawContours(overlay, encroachment_contours, -1, (0, 0, 255), -1)
    
    # Make encroachments semi-transparent
    alpha = 0.4
    overlay_with_alpha = cv2.addWeighted(satellite_img, 1-alpha, overlay, alpha, 0)
    
    # Create side-by-side comparison
    comparison = np.hstack([sanctioned_img, satellite_img, overlay_with_alpha])
    
    return {
        'deviation_percentage': round(deviation_percentage, 2),
        'encroached_areas': len(encroachment_contours),
        'overlay': overlay_with_alpha,
        'comparison': comparison
    }

def encode_image_to_base64(image):
    """Convert OpenCV image to base64 string"""
    _, buffer = cv2.imencode('.png', image)
    return base64.b64encode(buffer).decode('utf-8')

# API Routes
@api_router.get("/")
async def root():
    return {"message": "EncroachScan API - Detecting housing encroachments with AI"}

@api_router.post("/project/create", response_model=ScanProject)
async def create_project(input: ProjectCreate):
    project = ScanProject(**input.model_dump())
    doc = project.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.scan_projects.insert_one(doc)
    return project

@api_router.get("/projects", response_model=List[ScanProject])
async def get_projects():
    projects = await db.scan_projects.find({}, {"_id": 0}).to_list(1000)
    for project in projects:
        if isinstance(project['created_at'], str):
            project['created_at'] = datetime.fromisoformat(project['created_at'])
    return projects

@api_router.get("/project/{project_id}", response_model=ScanProject)
async def get_project(project_id: str):
    project = await db.scan_projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if isinstance(project['created_at'], str):
        project['created_at'] = datetime.fromisoformat(project['created_at'])
    return project

@api_router.post("/upload-sanctioned-map/{project_id}")
async def upload_sanctioned_map(project_id: str, file: UploadFile = File(...)):
    try:
        contents = await file.read()
        file_path = str(UPLOADS_DIR / f"{project_id}_sanctioned.{file.filename.split('.')[-1]}")
        
        with open(file_path, 'wb') as f:
            f.write(contents)
        
        await db.scan_projects.update_one(
            {"id": project_id},
            {"$set": {"sanctioned_map_path": file_path}}
        )
        
        return {"message": "Sanctioned map uploaded successfully", "file_path": file_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/upload-satellite-image/{project_id}")
async def upload_satellite_image(project_id: str, file: UploadFile = File(...)):
    try:
        contents = await file.read()
        file_path = str(UPLOADS_DIR / f"{project_id}_satellite.{file.filename.split('.')[-1]}")
        
        with open(file_path, 'wb') as f:
            f.write(contents)
        
        await db.scan_projects.update_one(
            {"id": project_id},
            {"$set": {"satellite_image_path": file_path}}
        )
        
        return {"message": "Satellite image uploaded successfully", "file_path": file_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/analyze/{project_id}")
async def analyze_project(project_id: str):
    try:
        project = await db.scan_projects.find_one({"id": project_id}, {"_id": 0})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        if not project.get('sanctioned_map_path') or not project.get('satellite_image_path'):
            raise HTTPException(status_code=400, detail="Both images must be uploaded before analysis")
        
        # Load and preprocess images
        with open(project['sanctioned_map_path'], 'rb') as f:
            sanctioned_bytes = f.read()
        with open(project['satellite_image_path'], 'rb') as f:
            satellite_bytes = f.read()
        
        sanctioned_img = preprocess_image(sanctioned_bytes)
        satellite_img = preprocess_image(satellite_bytes)
        
        # Perform comparison
        result = compare_images(sanctioned_img, satellite_img)
        
        # Create analysis result
        summary = f"Analysis detected {result['encroached_areas']} encroached area(s) with {result['deviation_percentage']}% deviation from sanctioned map."
        
        if result['deviation_percentage'] > 15:
            summary += " CRITICAL: Significant encroachment detected."
        elif result['deviation_percentage'] > 5:
            summary += " WARNING: Moderate encroachment detected."
        else:
            summary += " Minor or no encroachment detected."
        
        analysis = AnalysisResult(
            project_id=project_id,
            deviation_percentage=result['deviation_percentage'],
            encroached_areas=result['encroached_areas'],
            overlay_image=encode_image_to_base64(result['overlay']),
            comparison_image=encode_image_to_base64(result['comparison']),
            summary=summary
        )
        
        doc = analysis.model_dump()
        doc['analyzed_at'] = doc['analyzed_at'].isoformat()
        await db.analysis_results.insert_one(doc)
        
        await db.scan_projects.update_one(
            {"id": project_id},
            {"$set": {"analysis_complete": True}}
        )
        
        return analysis
    except Exception as e:
        logging.error(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/results/{project_id}", response_model=AnalysisResult)
async def get_results(project_id: str):
    result = await db.analysis_results.find_one({"project_id": project_id}, {"_id": 0})
    if not result:
        raise HTTPException(status_code=404, detail="Analysis results not found")
    if isinstance(result['analyzed_at'], str):
        result['analyzed_at'] = datetime.fromisoformat(result['analyzed_at'])
    return result

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()