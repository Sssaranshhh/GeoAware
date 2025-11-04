# ⚙️ Installation
1️⃣ Clone the repository
git clone https://github.com/<your-username>/GeoAware_NEW.git
cd GeoAware_NEW

2️⃣ Create and activate a virtual environment
python -m venv venv
# Activate it:
venv\Scripts\activate      # On Windows
source venv/bin/activate   # On macOS/Linux

3️⃣ Install dependencies
pip install -r requirements.txt

🧠 Run the Backend (FastAPI)



Before starting Flask, you must have your FastAPI backend running for model predictions.

uvicorn backend.main:app --reload --port 8000

🌐 Run the Frontend (Flask)



After the backend is up, start the Flask server:

python app.py




Visit:
👉 http://127.0.0.1:5000

🧩 Tech Stack
Layer	Technology
Frontend	HTML5, CSS3, Bootstrap 5
Backend	Flask + FastAPI
Models	Scikit-learn, TensorFlow
Language	Python 3.10+
🧾 Example API Endpoints
Model	Endpoint	Method
Cyclone	/predict/cyclone	POST
Earthquake	/predict/earthquake	POST
Flood	/predict/flood	POST
Forest Fire	/predict/forestfire	POST



Example (for testing FastAPI directly):

curl -X POST http://127.0.0.1:8000/predict/earthquake \
-H "Content-Type: application/json" \
-d '{"Latitude": 32.5, "Longitude": 75.2, "Depth": 15.3}'
