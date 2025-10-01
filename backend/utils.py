import pytesseract 
from PIL import Image
import os

# Use environment variable if set, otherwise fallback to local Windows path
pytesseract.pytesseract.tesseract_cmd = os.getenv(
    "TESSERACT_CMD", 
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# function for analysis
# def analyze_sentiment(pipe, text: str):
#   return pipe(text)[0]

def analyze_sentiment(pipe, text: str):
    result = pipe(text)[0]

    label_map = {
        "LABEL_0": "NEGATIVE ",
        "LABEL_1": "NEUTRAL ",
        "LABEL_2": "POSITIVE "
    }
    return {
        "label": label_map.get(result["label"], result["label"]),
        "score": round(result["score"], 2)
    }

def summarize_text(pipe, text:str):
  if len(text.split()) > 50:
    return pipe(text, max_length=50, min_length=25, do_sample=False)[0]['summary_text']
  return "Text is too short too summarize."

def topic_classification(pipe,text: str):
  candidate_labels = ['news', 'product review', 'restaurant review','personal comment','tech support']
  result = pipe(text,candidate_labels)
  return {"label":result['labels'][0], "score":round(result['scores'][0],2)}

# def image_classification(pipe, image:Image.Image):
#   return pipe(image)[0]

def image_classification(pipe, image:Image.Image):
  results=pipe(image)
  for result in results:
        probs = result.probs  # probabilities
        top_class = probs.top1  # best class index
        class_name = pipe.names[top_class]  # class label
        confidence = probs.top1conf.item()  #confident score
  return {"label": class_name, "score": confidence}





def text_from_image(image:Image.Image):
  return pytesseract.image_to_string(image).strip()

def check_toxicity(pipe, text:str):
  if not text:
    return {'label': 'NON-TOXIC', 'score': 1.0}
  return pipe(text)[0]



def generate_multimodal_response(text_analysis, image_analysis):
    sentiment = text_analysis.get('sentiment', {}).get('label')
    topic = text_analysis.get('topic', {}).get('label')
    # Get labels, defaulting to None if key/nested key doesn't exist
    ocr_toxicity_label = image_analysis.get('ocr_toxicity', {}).get('label')
    text_toxicity_label = text_analysis.get('text_toxicity', {}).get('label')

    # 1. Toxicity check
    # Check if 'TOXIC' is present in either label (case-insensitive check for robustness)
    toxic_labels = (
        ocr_toxicity_label.upper() if ocr_toxicity_label else '',
        text_toxicity_label.upper() if text_toxicity_label else ''
    )
  

    
    # Check if both topic and sentiment are present
    if topic and sentiment:
        # Normalize sentiment for easier checking if needed, but assuming 'POSITIVE'/'NEGATIVE'
        
        if topic == "news":
            # Swapped logic: POSITIVE should be positive message, NEGATIVE should be negative message
            return "📰 Thank you for sharing this good news!" if sentiment == "POSITIVE" else "📰 Noted the concern in the news."

        if topic == "product review":
            # Swapped logic
            return " 🎉 Glad you liked the product!" if sentiment == "POSITIVE" else " 😔 Sorry the product didn't meet expectations."

        if topic == "restaurant review":
            # Swapped logic
            return "🍽️ Delighted you enjoyed your restaurant experience!" if sentiment == "POSITIVE" else "🍽️ Sorry your restaurant experience wasn't satisfactory."

        if topic == "personal comment":
            # Swapped logic
            return "😊 Thank you for your kind comment!" if sentiment == "POSITIVE" else "😕 We understand your concern from the comment."

        if topic == "tech support":
            # Swapped logic
            return "💻 Glad our tech support helped!" if sentiment == "POSITIVE" else " 💻 Sorry you faced issues with our tech support."

    # 3. Fallback if topic is unknown but sentiment exists
    if sentiment == "POSITIVE":
        return "🎉 Thank you for your positive feedback!"
    elif sentiment == "NEGATIVE":
        return "😔 We acknowledge your concern and will work on it."
    # Added a check for neutral/other sentiment if topic is also missing
    elif sentiment == "NEUTRAL":
        return "👍 Thank you for your feedback."


    # 4. Last fallback (if no topic, sentiment, or toxicity was found/identified)
    return "✅ Thank you for your submission."









    # if 'TOXIC' in (ocr_toxicity_label, text_toxicity_label):
    #     return "Warning: Toxic content has been detected. Please maintain a respectful environment."

    # if sentiment == 'NEGATIVE' and 'review' in topic:
    #     return "We are very sorry to hear about your negative experience. Your feedback is valuable and we will look into this matter."

    # if sentiment == 'POSITIVE' and 'product' in topic:
    #     return "Thank you for the positive feedback! We're thrilled you enjoy the product."

    # return "Thank you for your submission. We have received your feedback."



  