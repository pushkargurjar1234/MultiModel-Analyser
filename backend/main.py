from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import  Image
import utils 
import models
from io  import BytesIO



app = FastAPI()

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"],allow_headers=["*"])

ml_models = models.load_models()

@app.post("/analyze/")
async def analyze_data(text:str = Form(...), image:UploadFile = File(...)):
  pil_image = Image.open(BytesIO(await image.read()))

  # use function from utils.py
  sentiment = utils.analyze_sentiment(ml_models["sentiment"], text)
  topic = utils.topic_classification(ml_models["topic"], text)
  summary = utils.summarize_text(ml_models["summarizer"], text)
  text_toxicity = utils.check_toxicity(ml_models["toxicity"], text) 

  image_class = utils.image_classification(ml_models["image_classification"], pil_image)
  ocr_text = utils.text_from_image(pil_image)
  ocr_toxicity = utils.check_toxicity(ml_models["toxicity"], ocr_text) 


  text_analysis_results = {
       "sentiment": sentiment,
        "topic": topic,
        "summary": summary,
        "text_toxicity": text_toxicity,
    }
  image_analysis_results = {
        "image_classification":image_class,
        "ocr_text": ocr_text,
        "ocr_toxicity": ocr_toxicity,
    }
  
  automated_response = utils.generate_multimodal_response(text_analysis_results, image_analysis_results)

# --- 4. Return everything in a structured format ---
  return {
        "text_analysis": text_analysis_results,
        "image_analysis": image_analysis_results,
        "automated_response": automated_response,
    }


@app.get("/")
def read_root():
    return {"message": "Backend is running!"}