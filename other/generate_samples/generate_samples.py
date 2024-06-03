# # Generate samples. 
# # Note: the `claycode_sample__` prefix must match the prefix in `generator/scenes/scene_generate_samples.js`

import subprocess, time, os, glob, json
from datetime import date
from PIL import Image
from fpdf import FPDF
from fpdf.enums import XPos, YPos

DOWNLOAD_DIR = os.path.expanduser("~/Downloads/")
SAMPLE_FILE_PREFIX = "claycode_sample___"
METADATA_FILE_NAME = f"{SAMPLE_FILE_PREFIX}metadata.json"

# Delete old claycode samples
print("*** Delete old samples")
files_to_remove = glob.glob(os.path.expanduser(os.path.join(DOWNLOAD_DIR,f"{SAMPLE_FILE_PREFIX}*")))
if files_to_remove:
    subprocess.run(["rm", "-rf"] + files_to_remove)

# Start HTTP server
print("*** Start HTTP server")
server_path = os.path.abspath(os.path.join(os.getcwd(), "../../", "generator"))
process = subprocess.Popen(["python3", "-m", "http.server", "731"], cwd=server_path)
pid = process.pid
print(f"*** HTTP server started with PID: {pid}")

# Open sample generator scene
print(f"*** Open website")
time.sleep(1)
subprocess.run(["open", "http://localhost:731/pages/scene_generate_samples.html"]) 

# Kill the server. The opened page is not going to refresh, so we can do this immediately.
time.sleep(2)
os.kill(pid, 9)
print(f"*** HTTP server killed")

# Wait for all images to be generated
while not METADATA_FILE_NAME in os.listdir(DOWNLOAD_DIR):
    files = [img for img in os.listdir(DOWNLOAD_DIR) if img.startswith(SAMPLE_FILE_PREFIX)]
    print(f"Waiting for generator to finish: {len(files)} files detected.")
    time.sleep(1)

# Count generated images
images = [img for img in os.listdir(DOWNLOAD_DIR) if img.startswith(SAMPLE_FILE_PREFIX) and img.endswith(".png")]
print(f"*** {len(images)} images found")

# Reading metadata
print(f"*** Reading metadata")
metadata_path = os.path.join(DOWNLOAD_DIR, METADATA_FILE_NAME)
assert os.path.exists(metadata_path), "Metadata file not found"
with open(metadata_path) as json_data:
    metadata = json.load(json_data)
    sample_page_title = f"{date.today()} | {metadata['encoding_metadata']}"
    samples_list = metadata['samples']

print(f"*** Composing PDF")

# Claycode samples come in the form "[prefix]__[index].png"
def get_input_text(img_name):
    img_name = str(img_name)
    sample_index = img_name.replace(SAMPLE_FILE_PREFIX, "")
    sample_index = sample_index.replace(".png", "")

    # This bit is slightly cursed: 
    # We extract the index from the file name, then use the metadata
    # To get the original input name.
    sample_index = int(sample_index)
    input_text = samples_list[sample_index][0]
    return input_text

# Define PDF dimensions and layout
pdf = FPDF('P', 'mm', 'A4')
pdf.set_auto_page_break(auto=True, margin=15)
IMAGES_PER_PAGE = 6
WIDTH, HEIGHT = 210, 297  # A4 dimensions in mm
HORIZONTAL_PADDING = 20  # Increased horizontal padding
VERTICAL_PADDING = 30    # Increased vertical padding

def add_images_to_pdf(pdf, images, download_dir):
    img_count = 0
    for img in images:
        if img_count % IMAGES_PER_PAGE == 0:
            pdf.add_page()
            # Add title at the top of the page
            pdf.set_font("Helvetica", size=14)
            pdf.cell(0, 10, sample_page_title, XPos.CENTER, new_y=YPos.NEXT, link='C')

        # Open image and maintain aspect ratio
        image_path = os.path.join(download_dir, img)
        image = Image.open(image_path)
        aspect_ratio = image.width / image.height
        
        # Calculate the size of the images to fit 2 columns and 3 rows per page
        column_width = (WIDTH - 3 * HORIZONTAL_PADDING) / 2  # Leave more margin
        row_height = (HEIGHT - 4 * VERTICAL_PADDING - 20) / 3  # Leave more margin, account for title
        if aspect_ratio >= 1:
            width_mm = column_width
            height_mm = width_mm / aspect_ratio
            if height_mm > row_height:
                height_mm = row_height
                width_mm = height_mm * aspect_ratio
        else:
            height_mm = row_height
            width_mm = height_mm * aspect_ratio
            if width_mm > column_width:
                width_mm = column_width
                height_mm = width_mm / aspect_ratio

        # Positioning images: 3 rows and 2 columns
        x_pos = HORIZONTAL_PADDING + (img_count % 2) * (column_width + HORIZONTAL_PADDING)
        y_pos = VERTICAL_PADDING + (img_count // 2 % 3) * (row_height + VERTICAL_PADDING) + 20  # Account for title
        
        # Add image
        pdf.image(image_path, x=x_pos, y=y_pos, w=width_mm, h=height_mm)
        
        # Add filename below the image
        pdf.set_xy(x_pos, y_pos + height_mm + 2)
        pdf.set_font("Helvetica", size=8)

        pdf.cell(column_width, 10, get_input_text(os.path.basename(img)), XPos.CENTER, new_y=YPos.NEXT, link='C')
        
        img_count += 1

# Add images to PDF
add_images_to_pdf(pdf, images, DOWNLOAD_DIR)

# Save the PDF to the same directory
pdf.output("Claycode samples.pdf")
print(f"*** PDF saved.")
