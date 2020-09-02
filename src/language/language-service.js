const knex = require('knex')

const LanguageService = {
	getUsersLanguage(db, user_id) {
		return db
			.from('language')
			.select(
				'language.id',
				'language.name',
				'language.user_id',
				'language.head',
				'language.total_score'
			)
			.where('language.user_id', user_id)
			.first()
	},

	getLanguageWords(db, language_id) {
		return db
			.from('word')
			.select(
				'id',
				'language_id',
				'original',
				'translation',
				'next',
				'memory_value',
				'correct_count',
				'incorrect_count',
				'hex',
				'script'
			)
			.where({ language_id })
	},
	populateLinkedlist(db, language_id, ll) {
		const temp = db
			.from('word')
			.select(
				'id',
				'language_id',
				'original',
				'translation',
				'next',
				'memory_value',
				'correct_count',
				'incorrect_count'
			)
			.where({ language_id })
		//a.map is populating the LL
		let list = temp.map((word) => ll.insertLast(word))
		//return a is returning the aray of words from db
		return list
	},
	async insertNewLinkedList(db, ll) {
		for (let i = 0; i < ll.length; i++) {
			await db('word').where('id', '=', ll[i].id).update(ll[i])
		}
		return
	},
	async updateLanguagetotalScore(db, language) {
		await db('language')
			.where('user_id', '=', language.user_id)
			.update(language)
	},
}

module.exports = LanguageService
