import requests
import sys
import json
import os
from datetime import datetime
from io import BytesIO
from PIL import Image
import numpy as np

class EncroachScanAPITester:
    def __init__(self, base_url="https://encroachdetect.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.project_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else f"{self.api_url}/"
        headers = {}
        if data and not files:
            headers['Content-Type'] = 'application/json'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files)
                else:
                    response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def create_test_image(self, width=800, height=800, color=(255, 255, 255)):
        """Create a test image for upload"""
        img = Image.new('RGB', (width, height), color)
        # Add some simple shapes to simulate building outlines
        pixels = np.array(img)
        
        # Add some rectangles to simulate buildings
        pixels[100:200, 100:300] = [0, 0, 0]  # Black rectangle
        pixels[300:400, 200:500] = [128, 128, 128]  # Gray rectangle
        pixels[500:600, 400:700] = [64, 64, 64]  # Dark gray rectangle
        
        img = Image.fromarray(pixels)
        
        # Convert to bytes
        img_bytes = BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        return img_bytes

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_create_project(self):
        """Test project creation"""
        project_data = {
            "project_name": f"Test Project {datetime.now().strftime('%H%M%S')}",
            "location": "Mumbai, Maharashtra",
            "coordinates": "19.0760° N, 72.8777° E"
        }
        
        success, response = self.run_test(
            "Create Project",
            "POST",
            "project/create",
            200,
            data=project_data
        )
        
        if success and 'id' in response:
            self.project_id = response['id']
            print(f"   Created project with ID: {self.project_id}")
            return True
        return False

    def test_get_projects(self):
        """Test getting all projects"""
        success, response = self.run_test(
            "Get All Projects",
            "GET",
            "projects",
            200
        )
        return success

    def test_get_project(self):
        """Test getting specific project"""
        if not self.project_id:
            print("❌ No project ID available for testing")
            return False
            
        success, response = self.run_test(
            "Get Specific Project",
            "GET",
            f"project/{self.project_id}",
            200
        )
        return success

    def test_upload_sanctioned_map(self):
        """Test uploading sanctioned map"""
        if not self.project_id:
            print("❌ No project ID available for testing")
            return False
            
        # Create test image
        test_image = self.create_test_image(color=(200, 200, 200))
        
        files = {
            'file': ('sanctioned_map.png', test_image, 'image/png')
        }
        
        success, response = self.run_test(
            "Upload Sanctioned Map",
            "POST",
            f"upload-sanctioned-map/{self.project_id}",
            200,
            files=files
        )
        return success

    def test_upload_satellite_image(self):
        """Test uploading satellite image"""
        if not self.project_id:
            print("❌ No project ID available for testing")
            return False
            
        # Create test image with different pattern
        test_image = self.create_test_image(color=(150, 150, 150))
        
        files = {
            'file': ('satellite_image.png', test_image, 'image/png')
        }
        
        success, response = self.run_test(
            "Upload Satellite Image",
            "POST",
            f"upload-satellite-image/{self.project_id}",
            200,
            files=files
        )
        return success

    def test_analyze_project(self):
        """Test project analysis"""
        if not self.project_id:
            print("❌ No project ID available for testing")
            return False
            
        success, response = self.run_test(
            "Analyze Project",
            "POST",
            f"analyze/{self.project_id}",
            200
        )
        
        if success:
            print(f"   Analysis Results:")
            print(f"   - Deviation: {response.get('deviation_percentage', 'N/A')}%")
            print(f"   - Encroached Areas: {response.get('encroached_areas', 'N/A')}")
            print(f"   - Summary: {response.get('summary', 'N/A')[:100]}...")
        
        return success

    def test_get_results(self):
        """Test getting analysis results"""
        if not self.project_id:
            print("❌ No project ID available for testing")
            return False
            
        success, response = self.run_test(
            "Get Analysis Results",
            "GET",
            f"results/{self.project_id}",
            200
        )
        return success

def main():
    print("🚀 Starting EncroachScan API Tests")
    print("=" * 50)
    
    tester = EncroachScanAPITester()
    
    # Test sequence
    tests = [
        ("Root Endpoint", tester.test_root_endpoint),
        ("Create Project", tester.test_create_project),
        ("Get All Projects", tester.test_get_projects),
        ("Get Specific Project", tester.test_get_project),
        ("Upload Sanctioned Map", tester.test_upload_sanctioned_map),
        ("Upload Satellite Image", tester.test_upload_satellite_image),
        ("Analyze Project", tester.test_analyze_project),
        ("Get Analysis Results", tester.test_get_results),
    ]
    
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())