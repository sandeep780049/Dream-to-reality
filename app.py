from flask import Flask, request, jsonify, send_file
from rembg import remove
from PIL import Image
import numpy as np
import io
import os

app = Flask(__name__)

# Background removal endpoint
@app.route("/remove-bg", methods=["POST"])
def remove_bg():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files["image"]
    input_image = Image.open(file.stream).convert("RGBA")
    
    # Convert to numpy array and remove background
    input_array = np.array(input_image)
    output_array = remove(input_array)
    
    # Convert back to Image
    output_image = Image.fromarray(output_array)
    
    # Save to buffer
    img_io = io.BytesIO()
    output_image.save(img_io, format="PNG")
    img_io.seek(0)
    
    return send_file(img_io, mimetype="image/png")

# Simple health check
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Backend running!"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
