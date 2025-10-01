
from transformers import pipeline  #type: ignore
from ultralytics import YOLO
import os
from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline

def load_models():
    """Load all ml  models and return them as dictionary"""
    print("Loading models... This might take a momentt.")

    # NLP Models
    # sentiment_analyzer = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment")          #type: ignore
   
    model_name = "cardiffnlp/twitter-roberta-base-sentiment"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(
    model_name,
    device_map="auto",
    load_in_8bit=True   # <- quantized 
    )
    sentiment_analyzer = pipeline("sentiment-analysis",model=model,tokenizer=tokenizer)


    summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-6-6")
    
    topic_classifier = pipeline("zero-shot-classification",model="facebook/bart-large-mnli")
    

    # Computer Vision Models
    # image_classifier = pipeline("image-classification", model="google/vit-base-patch16-224")
    

    # image_classifier=YOLO("yolov8n-cls.pt")

    yolo_model_path = os.getenv("YOLO_MODEL_PATH", "backend/yolov8n-cls.pt")
    image_classifier = YOLO(yolo_model_path)
    



    # Toxicity Model
    toxicity_classifier = pipeline("text-classification", model="unitary/toxic-bert")


    models= {
        "sentiment": sentiment_analyzer,
        "summarizer":  summarizer,
        "topic": topic_classifier,
        "image_classification": image_classifier,
        "toxicity": toxicity_classifier,

    }
    return models


# to check if the models are working
# models = load_models()

# print("NLP Models:")
# for name in models:
#     print(f"- {name}")
