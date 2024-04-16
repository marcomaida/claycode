
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from PyPDF2 import PdfReader, PdfWriter
import glob
import os
import io

PDF_FILENAME = "sample_claycodes.pdf"

def add_images_to_pdf(pdf_writer, img_paths):
    packet = io.BytesIO()
    can = canvas.Canvas(packet, pagesize=A4)
    can.setFontSize(7)

    # Calculate dimensions for arranging images on the page
    max_images_per_row = 3
    max_images_per_col = 3
    image_width = 595 / max_images_per_row
    image_height = 842 / max_images_per_col

    # Calculate padding
    padding_x = 5
    padding_y = 25

    # Iterate through image paths and add them to the page
    for i, img_path in enumerate(img_paths):
        col = i % max_images_per_row
        row = max_images_per_col - 1 - (i // max_images_per_row)
        x = col * image_width + padding_x
        y = row * image_height + padding_y
        can.drawImage(img_path, x, y, width=image_width - 2*padding_x, height=image_height - 2*padding_y)
        can.drawString(x, y - padding_y // 2, os.path.basename(img_path)[:-4])
    
    can.showPage()
    can.save()

    packet.seek(0)
    img_pdf = PdfReader(packet)
    page = img_pdf.pages[0]
    pdf_writer.add_page(page)

if __name__ == "__main__":
    pdf_writer = PdfWriter()

    dir = os.path.dirname(os.path.realpath(__file__))

    images = glob.glob(dir + "/samples/*.png")
    images.sort()
    num_images = len(images)

    images_per_page = 9 # Change this value to set the number of images per page
    for i in range(0, num_images, images_per_page):
        add_images_to_pdf(pdf_writer, images[i:i+images_per_page])

    with open(os.path.join(dir, PDF_FILENAME), "wb") as f:
        pdf_writer.write(f)
