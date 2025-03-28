import path from 'path'
import fs from 'fs'
import sharp from 'sharp'

export const imageUploader = async (file) => {
  const uploadDir = path.join('uploads', 'converted', Date.now().toString()) // Use path.join for a relative path

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const [{ path: imagePath, filename }] = file.image

  // Define sizes and their corresponding labels
  const sizes = {
    large: 1200,
    medium: 800,
    thumb: 300,
  }

  // Generate resized images in parallel
  await Promise.all(
    Object.entries(sizes).map(([sizeLabel, width]) =>
      sharp(imagePath)
        .resize(width)
        .toFormat('webp')
        .toFile(`${uploadDir}/${sizeLabel}-${filename}.webp`)
    )
  )

  // Construct relative paths for the image data
  const imageContainer = Object.fromEntries(
    Object.keys(sizes).map((sizeLabel) => {
      const filePath = `${uploadDir}/${sizeLabel}-${filename}.webp` // Keep this relative
      return [
        sizeLabel,
        {
          imagePath: `/${filePath}`, // Ensure it starts from the root `/uploads/...`
          base64: fs.readFileSync(filePath, { encoding: 'base64url' }),
        },
      ]
    })
  )

  // Delete the original file
  fs.unlinkSync(imagePath)

  return { imageContainer }
}
