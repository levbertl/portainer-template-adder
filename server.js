'use strict'
const express = require('express')
const fetch = require('node-fetch')

const app = express()
const portainerDefaultTemplates =
  'https://raw.githubusercontent.com/portainer/templates/master/templates-2.0.json'
const templateUrls = [portainerDefaultTemplates]
const combinedJSON = {
  version: '2',
  templates: [],
}

function removePortainerDefaultTemplate() {
  let index = templateUrls.indexOf(portainerDefaultTemplates)
  if (index === 0) {
    templateUrls.shift()
  } else if (index > 0) {
    templateUrls.slice(index, 1)
  }
  console.log('removed default')
}

function appendTemplate(data, url) {
  const templates = Object.assign(combinedJSON.templates, {})
  try {
    data.forEach((te) => {
      if (!templates.filter((t) => t.title === te.title).length) {
        templates.push(te)
      }
    })
    combinedJSON.templates = templates
    console.log(`appended: ${url}`)
  } catch (e) {
    console.log(`error appending: ${url}`)
  }
}

async function getData(url) {
  const response = await fetch(url)
  let data = await response.text()
  try {
    data = JSON.parse(data)
    if (Array.isArray(data)) {
      appendTemplate(data, url)
    } else if (
      Object.keys(data).includes('templates') &&
      Array.isArray(data.templates)
    ) {
      appendTemplate(data.templates, url)
    }
  } catch (e) {
    console.log(`Error Appending: ${url}`)
  }
}

async function getTemplates() {
  console.log(`Number of Urls: ${templateUrls.length}`)
  for (let i = 0; i < templateUrls.length; i++) {
    await getData(templateUrls[i])
  }
}

for (const key in process.env) {
  if (
    Object.hasOwnProperty.call(process.env, key) &&
    key.toLowerCase().startsWith('ptu')
  ) {
    templateUrls.push(process.env[key])
    console.log('added from env: ' + process.env[key])
  } else if (
    Object.hasOwnProperty.call(process.env, key) &&
    key.toLowerCase() == 'pte_default'
  ) {
    if (process.env[key] === false || process.env[key] === 'false') {
      removePortainerDefaultTemplate()
    }
  }
}

app.get('/templates.json', async (req, res) => {
  await getTemplates()
  res.send(combinedJSON)
})

const PORT = process.env.PORT || 8020
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`)
})
module.exports = app
