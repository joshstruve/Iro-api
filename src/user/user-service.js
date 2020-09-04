const bcrypt = require('bcryptjs')

// eslint-disable-next-line no-useless-escape
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UserService = {
	hasUserWithUserName(db, username) {
		return db('sr_user')
			.where({ username })
			.first()
			.then((user) => !!user)
	},
	insertUser(db, newUser) {
		return db
			.insert(newUser)
			.into('sr_user')
			.returning('*')
			.then(([user]) => user)
	},
	validatePassword(password) {
		if (password.length < 8) {
			return 'Password be longer than 8 characters'
		}
		if (password.length > 72) {
			return 'Password be less than 72 characters'
		}
		if (password.startsWith(' ') || password.endsWith(' ')) {
			return 'Password must not start or end with empty spaces'
		}
		if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
			return 'Password must contain one upper case, lower case, number and special character'
		}
		return null
	},
	hashPassword(password) {
		return bcrypt.hash(password, 12)
	},
	serializeUser(user) {
		return {
			id: user.id,
			name: user.name,
			username: user.username,
		}
	},
	populateUserWords(db, user_id) {
		return db.transaction(async (trx) => {
			const [languageId] = await trx
				.into('language')
				.insert([{ name: 'Japanese', user_id }], ['id'])

			// when inserting words,
			// we need to know the current sequence number
			// so that we can set the `next` field of the linked language
			const seq = await db
				.from('word_id_seq')
				.select('last_value')
				.first()
			const languageWords = [
				['Orange', 'Orenji', 2, '#FFB74D', 'orange.svg'],
				['Yellow', 'Ki-iro', 3, '#FFF07F', 'yellow.svg'],
				['Blue', 'Ao', 4, '#84B3FD', 'blue.svg'],
				['Red', 'Aka', 5, '#B51F23', 'red.svg'],
				['Green', 'Midori', 6, '#6FEFB0', 'green.svg'],
				['Black', 'Kuro', 7, '#000000', 'black.svg'],
				['Brown', 'Cha-iro', 8, '#8D6E64', 'brown.svg'],
				['Pink', 'Pinku', 9, '#FD4482', 'pink.svg'],
				['Purple', 'Murasaki', 10, '#BA68C8', 'purple.svg'],
				['White', 'Shiro', 11, '#FFFFFF', 'white.svg'],
				['Gray', 'Hai-iro', 12, '#BDBDBD', 'gray.svg'],
				['Lilac', 'Rairakku', null, '#C8A2C8', 'lilac.svg'],
			]

			const [languageHeadId] = await trx.into('word').insert(
				languageWords.map(
					([
						original,
						translation,
						nextInc,
						hex,
						script,
					]) => ({
						language_id: languageId.id,
						original,
						translation,
						next: nextInc
							? Number(seq.last_value) + nextInc
							: null,
						hex,
						script,
					})
				),
				['id']
			)

			await trx('language').where('id', languageId.id).update({
				head: languageHeadId.id,
			})
		})
	},
}

module.exports = UserService
