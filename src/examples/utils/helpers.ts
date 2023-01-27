import { faker } from '@faker-js/faker'
import fakeUsers from './fakeUsers'

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getImageUrl(inputUser: {
  first_name: string
  last_name: string
}): string {
  const name = `${inputUser.first_name} ${inputUser.last_name}`
  return `https://avatars.dicebear.com/api/pixel-art/${encodeURIComponent(
    name
  )}.svg?scale=96&translateY=10`
}

export function mapToSelectOption(inputUser: {
  username: string
  first_name: string
  last_name: string
  email: string
}) {
  const name = `${inputUser.first_name} ${inputUser.last_name}`
  return {
    ...inputUser,
    value: inputUser.username,
    label: name,
    description: inputUser.email,
    imageUrl: `https://avatars.dicebear.com/api/pixel-art/${encodeURIComponent(
      name
    )}.svg?scale=96&translateY=10`,
  }
}

export function mapToIntervalUser(inputUser: {
  first_name: string
  last_name: string
  email: string
  username: string
}) {
  const name = `${inputUser.first_name} ${inputUser.last_name}`
  return {
    id: inputUser.username,
    name: name,
    email: inputUser.email,
    imageUrl: `https://avatars.dicebear.com/api/pixel-art/${encodeURIComponent(
      name
    )}.svg?scale=96&translateY=10`,
  }
}

export const fakeDb = (function fakeDb() {
  const data = fakeUsers

  return {
    async find(input: string) {
      await sleep(500)
      const inputLower = input.toLowerCase()
      return data
        .filter(v => {
          const searchStr = (v.email + v.first_name + v.last_name).toLowerCase()
          return searchStr.includes(inputLower)
        })
        .slice(0, 10)
    },
  }
})()

export function generateRows(count: number, offset = 0) {
  return Array(count)
    .fill(null)
    .map((_, i) => ({
      id: offset + i,
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      email: faker.internet.email(),
      description: faker.helpers.arrayElement([
        faker.random.word(),
        faker.random.words(),
        faker.lorem.paragraph(),
      ]),
      number: faker.datatype.number(100),
      boolean: faker.datatype.boolean(),
      date: faker.datatype.datetime(),
      image: faker.image.imageUrl(
        480,
        Math.random() < 0.25 ? 300 : 480,
        undefined,
        true
      ),
      array: Array(10)
        .fill(null)
        .map(() => faker.word.noun()),
    }))
}
