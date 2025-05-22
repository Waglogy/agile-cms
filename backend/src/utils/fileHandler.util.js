import path from 'path'
import fs from 'fs'
import sharp from 'sharp'

/**
 * @param {Array<{ path: string, filename: string }>} files
 * @returns {Promise<Array<object>>} an array of image‐container JSONs
 */
export const imageUploader = async (files) => {
  const uploadDir = path.join('uploads', 'converted', Date.now().toString())
  fs.mkdirSync(uploadDir, { recursive: true })

  const sizes = { large: 1200, medium: 800, thumb: 300 }

  const containers = await Promise.all(
    files.map(async ({ path: src, filename }) => {
      await Promise.all(
        Object.entries(sizes).map(([label, width]) =>
          sharp(src)
            .resize(width)
            .toFormat('webp')
            .toFile(path.join(uploadDir, `${label}-${filename}.webp`))
        )
      )

      fs.unlinkSync(src)

      return Object.fromEntries(
        Object.keys(sizes).map((label) => {
          const filePath = `/uploads/converted/${path.basename(uploadDir)}/${label}-${filename}.webp`
          const base64Raw = fs.readFileSync(
            path.join(uploadDir, `${label}-${filename}.webp`),
            { encoding: 'base64' }
          )
          const base64 = `data:image/webp;base64,${base64Raw}`
          return [label, { imagePath: filePath, base64 }]
        })
      )
    })
  )

  return containers
}
