import path from 'path'
import fs from 'fs'
import sharp from 'sharp'

export const imageUploader = async (file) => {
  const uploadDir = path.resolve('uploads', 'resized', Date.now().toString())

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

  // Read and structure the image data
  const imageContainer = Object.fromEntries(
    Object.keys(sizes).map((sizeLabel) => {
      const filePath = path.resolve(uploadDir, `${sizeLabel}-${filename}.webp`)
      return [
        sizeLabel,
        {
          imagePath: filePath,
          base64: fs.readFileSync(filePath, { encoding: 'base64' }),
        },
      ]
    })
  )

  return { imageContainer }
}
