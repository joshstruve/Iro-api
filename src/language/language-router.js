const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')

const languageRouter = express.Router()

languageRouter.use(requireAuth).use(async (req, res, next) => {
	try {
		const language = await LanguageService.getUsersLanguage(
			req.app.get('db'),
			req.user.id
		)

		if (!language)
			return res.status(404).json({
				error: `You don't have any languages`,
			})

		req.language = language
		next()
	} catch (error) {
		next(error)
	}
})

languageRouter.get('/', async (req, res, next) => {
	try {
		const words = await LanguageService.getLanguageWords(
			req.app.get('db'),
			req.language.id
		)

		res.json({
			language: req.language,
			words,
		})
		next()
	} catch (error) {
		next(error)
	}
})

languageRouter.get('/head', async (req, res, next) => {
	try {
		const words = await LanguageService.getLanguageWords(
			req.app.get('db'),
			req.language.id
		)

		let copy = [...words]
		let head
		let serviceObject
		if (words) {
			head = copy[0]
		}
		if (head) {
			serviceObject = {
				nextWord: head.original,
				totalScore: head.correct_count - head.incorrect_count,
				wordCorrectCount: head.correct_count,
				wordIncorrectCount: head.incorrect_count,
			}
		}
		if (!head) {
			res.status(400).send({ error: 'Missing head' })
		}
		console.log(serviceObject)
		res.json(serviceObject)
	} catch (error) {
		next(error)
	}
})

languageRouter.post('/guess', async (req, res, next) => {
	// implement me
	res.send('implement me!')
})

module.exports = languageRouter
