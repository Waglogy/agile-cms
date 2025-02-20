import passport from 'passport'

const authenticateUser = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err)
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: err,
      })

    if (!user) return res.status(401).json({ message: 'Unauthorized' })

    req.user = user // Attach user info to request
    next()
  })(req, res, next) // Invoke the Passport middleware
}

export default authenticateUser
