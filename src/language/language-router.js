const express = require('express')
const LanguageService = require('./language-service')
const xss = require('xss')
const { requireAuth } = require('../middleware/jwt-auth')
const LinkedList = require('./linked-list')

const languageRouter = express.Router()
const json = express.json()

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

languageRouter.post('/guess', json, async (req, res, next) => {
	try {
		/**
		 * grab user input - req.body
		 */
		const { guess } = req.body
		const sanitizeGuess = xss(guess)

		if (
			sanitizeGuess === '' ||
			!req.body.hasOwnProperty('guess')
		) {
			res.status(400).json({ error: 'Guess cannot be blank' })
		}

		const ll = new LinkedList()

		const words = await LanguageService.populateLinkedlist(
			req.app.get('db'),
			req.language.id,
			ll
		)
		const language = await LanguageService.getUsersLanguage(
			req.app.get('db'),
			req.user.id
		)

		let response = {
			nextWord: words[1].original,
			wordCorrectCount: words[1].correct_count,
			wordIncorrectCount: words[1].incorrect_count,
			totalScore: language.totalScore,
			answer: words[0].translation,
			isCorrect: false,
		}

		if (sanitizeGuess === ll.head.value.translation) {
			ll.head.value.memoryValue *= 2
			ll.head.value.correct_count++
			language.totalScore += 1

			response = { ...response, isCorrect: true }
		} else {
			ll.head.value.incorrect_count++
			ll.head.value.memoryValue = 1
			response = { ...response, isCorrect: false }
		}

		let memory = ll.head.value.memoryValue
		let temp = ll.head
		//
		while (temp.next !== null && memory > 0) {
			let tempOriginal = temp.value.original
			let tempTranslation = temp.value.translation
			let tempCorrectCount = temp.value.correct_count
			let tempInCorrectCount = temp.value.incorrect_count
			let tempMemory = temp.value.memoryValue

			temp.value.original = temp.next.value.original
			temp.value.translation = temp.next.value.translation
			temp.value.correct_count = temp.next.value.correct_count
			temp.value.incorrect_count =
				temp.next.value.incorrect_count
			temp.value.memoryValue = temp.next.value.memoryValue

			temp.next.value.original = tempOriginal
			temp.next.value.translation = tempTranslation
			temp.next.value.correct_count = tempCorrectCount
			temp.next.value.incorrect_count = tempInCorrectCount
			temp.next.value.memoryValue = tempMemory

			temp = temp.next
			memory--
		}

		let arrTemp = ll.head
		let llArray = []

		while (arrTemp) {
			ll.push(arrTemp.value)
			arrTemp = arrTemp.next
		}

		LanguageService.insertNewLinkedList(
			req.app.get('db'),
			llArray
		)
		LanguageService.updateLanguagetotalScore(
			req.app.get('db'),
			language
		)

		res.json(response)
		next()
	} catch (error) {
		next(error)
	}
})

module.exports = languageRouter
