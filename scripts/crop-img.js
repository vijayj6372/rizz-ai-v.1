const sharp = require('sharp');
const fs = require('fs');

async function cropImage() {
    await sharp("c:/Users/ACER/Documents/vijay's code-files/RizzAI/RizzAI/attached_assets/WhatsApp Image 2026-02-28 at 11.21.00 AM.jpeg")
        .extract({ width: 310, height: 105, left: 45, top: 96 })
        .toFile("c:/Users/ACER/Documents/vijay's code-files/RizzAI/RizzAI/assets/images/cropped-title.jpeg");
    console.log("Done cropping image!");
}

cropImage().catch(console.error);
