const asyncHandler = (controller) => async (req, res, next) => {
  try {
    await controller(req, res)
  } catch (error) {
    next(error)
  }
}

export default asyncHandler
