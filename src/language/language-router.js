const express = require('express')
const LanguageService = require('./language-service')
const xss = require('xss')
const { requireAuth } = require('../middleware/jwt-auth')
const LinkedList = require('./linked-list')

const languageRouter = express.Router()
const jsonParser = express.json()

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
		if (!head) {
			return res.status(400).send({ error: 'Missing head' })
		}
		if (head) {
			serviceObject = {
				nextWord: head.original,
				total_score: req.language.total_score,
				wordCorrectCount: head.correct_count,
				wordIncorrectCount: head.incorrect_count,
				hex: head.hex,
				script: head.script,
			}
		}

		res.json(serviceObject)
	} catch (error) {
		next(error)
	}
})

languageRouter.post('/guess', jsonParser, async (req, res, next) => {
	try {
		/**
		 *
		 * grab user input - req.body
		 *
		 */
		const { guess } = req.body
		const sanitizeGuess = xss(guess)
		if (
			sanitizeGuess === '' ||
			// eslint-disable-next-line no-prototype-builtins
			!req.body.hasOwnProperty('guess')
		) {
			return res.status(400).json({
				error: "Missing 'guess' in request body",
			})
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
			wordCorrectCount: words[0].correct_count,
			wordIncorrectCount: words[0].incorrect_count,
			hex: words[0].hex,
			script: words[0].script,
			total_score: language.total_score,
			answer: words[0].translation,
			original: words[0].original,
			isCorrect: false,
		}

		if (
			sanitizeGuess.toLowerCase() ===
			ll.head.value.translation.toLowerCase()
		) {
			ll.head.value.memory_value *= 2
			ll.head.value.correct_count += 1
			response.wordCorrectCount++
			response.total_score++
			language.total_score++
			response = { ...response, isCorrect: true }
		} else {
			ll.head.value.incorrect_count++
			response.wordIncorrectCount++
			ll.head.value.memory_value = 1
			response = { ...response, isCorrect: false }
		}

		let memory = ll.head.value.memory_value
		let temp = ll.head
		//
		while (temp.next !== null && memory > 0) {
			let tempOriginal = temp.value.original
			let tempTranslation = temp.value.translation
			let tempCorrectCount = temp.value.correct_count
			let tempInCorrectCount = temp.value.incorrect_count
			let tempMemory = temp.value.memory_value
			let tempHex = temp.value.hex
			let tempScript = temp.value.script

			temp.value.original = temp.next.value.original
			temp.value.translation = temp.next.value.translation
			temp.value.correct_count = temp.next.value.correct_count
			temp.value.incorrect_count =
				temp.next.value.incorrect_count
			temp.value.memory_value = temp.next.value.memory_value
			temp.value.hex = temp.next.value.hex
			temp.value.script = temp.next.value.script

			temp.next.value.original = tempOriginal
			temp.next.value.translation = tempTranslation
			temp.next.value.correct_count = tempCorrectCount
			temp.next.value.incorrect_count = tempInCorrectCount
			temp.next.value.memory_value = tempMemory
			temp.next.value.hex = tempHex
			temp.next.value.script = tempScript

			temp = temp.next
			memory--
		}

		let arrTemp = ll.head
		let llArray = []

		while (arrTemp) {
			llArray.push(arrTemp.value)
			arrTemp = arrTemp.next
		}

		await LanguageService.insertNewLinkedList(
			req.app.get('db'),
			llArray
		)
		await LanguageService.updateLanguagetotalScore(
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
