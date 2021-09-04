import validator from 'express-validator'

const { validationResult } = validator;
export default function (req, res, next) {
    if (!validationResult(req).isEmpty()) {
        return res.status(400).json({ message: 'validation error' })
    }
    next()
}