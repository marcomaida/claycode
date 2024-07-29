function loadImage(texture, sprite_dimension) {
    return new Promise((resolve, reject) => {
        let image = new Image();
        image.src = texture.baseTexture.resource.url;

        image.onload = () => {
            let canvas = document.createElement('canvas');
            canvas.width = sprite_dimension;
            canvas.height = sprite_dimension;
            let context = canvas.getContext('2d');
            context.drawImage(image, 0, 0, sprite_dimension, sprite_dimension);

            resolve(convertCanvasToBinaryImage(canvas))
        };

        image.onerror = (error) => {
            reject(error);
        };
    });
}

function convertCanvasToBinaryImage(canvas) {
    const context = canvas.getContext('2d');

    // Get the image data from the canvas
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Initialize the binaryImage
    const binaryImage = [];
    for (let y = 0; y < canvas.height; y++) {
        const row = [];
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            const alpha = data[index + 3]; // Alpha channel value
            row.push(alpha === 0 ? 0 : 1);
        }
        binaryImage.push(row);
    }

    return binaryImage;
}

export async function createBinaryImage(texture, sprite_dimension) {
    try {
        return await loadImage(texture, sprite_dimension);
    } catch (error) {
        console.error("Error loading image:", error);
    }
}


// Inverse function, used to test
export function convertBinaryImageToPIXISprite(binaryImage, app, width, height) {
    // Create a new PIXI.Graphics object
    const graphics = new PIXI.Graphics();

    // Draw the binary binaryImage onto the PIXI.Graphics object
    for (let y = 0; y < binaryImage.length; y++) {
        for (let x = 0; x < binaryImage[y].length; x++) {
            if (binaryImage[y][x] === 1) {
                graphics.beginFill(0xFFFFFF); // Fill white
            } else {
                graphics.beginFill(0x000000); // fill black
            }
            graphics.drawRect(x, y, 1, 1); // Draw a 1x1 pixel rectangle
            graphics.endFill();
        }
    }

    // Generate a texture from the graphics object
    const texture = app.renderer.generateTexture(graphics);

    // Create a sprite from the texture
    const sprite = new PIXI.Sprite(texture);

    // Set the sprite dimensions
    sprite.width = width;
    sprite.height = height;

    return sprite;
}