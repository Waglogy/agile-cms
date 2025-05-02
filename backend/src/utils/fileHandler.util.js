import path from 'path'
import fs from 'fs'
import sharp from 'sharp'

/**
 * @param {Array<{ path: string, filename: string }>} files
 * @returns {Promise<Array<object>>} an array of image‐container JSONs
 */
export const imageUploader = async (files) => {
  // 1) ensure upload directory
  const uploadDir = path.join('uploads', 'converted', Date.now().toString())
  fs.mkdirSync(uploadDir, { recursive: true })

  // 2) define your sizes
  const sizes = { large: 1200, medium: 800, thumb: 300 }

  // 3) process each file in parallel
  const containers = await Promise.all(
    files.map(async ({ path: src, filename }) => {
      // resize each variant
      await Promise.all(
        Object.entries(sizes).map(([label, width]) =>
          sharp(src)
            .resize(width)
            .toFormat('webp')
            .toFile(path.join(uploadDir, `${label}-${filename}.webp`))
        )
      )

      // remove the original upload
      fs.unlinkSync(src)

      // build and return the JSON‐friendly container
      return Object.fromEntries(
        Object.keys(sizes).map((label) => {
          const filePath = `/uploads/converted/${path.basename(uploadDir)}/${label}-${filename}.webp`
          const base64 = fs.readFileSync(
            path.join(uploadDir, `${label}-${filename}.webp`),
            { encoding: 'base64url' }
          )
          return [label, { imagePath: filePath, base64 }]
        })
      )
    })
  )

  return containers
}
