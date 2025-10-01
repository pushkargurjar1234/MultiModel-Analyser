import gradio as gr
import requests

# Function to call your FastAPI backend
def analyze(text, image):
    files = {"image": image}
    data = {"text": text}
    response = requests.post("http://127.0.0.1:8000/analyze/", data=data, files=files)
    return response.json()

demo = gr.Interface(
    fn=analyze,
    inputs=[gr.Textbox(label="Enter text"), gr.Image(type="pil")],
    outputs=gr.JSON(label="Analysis Result"),
    title="Multimodal Analyzer",
    description="Analyze text and images for sentiment, topic, toxicity, and image classification"
)

demo.launch()
