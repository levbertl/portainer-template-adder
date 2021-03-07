'use strict'

// [START app]
const express = require('express')
const app = express()
const fs = require('fs')
const https = require('https')
const templateUrls = [
  'https://raw.githubusercontent.com/portainer/templates/master/templates-2.0.json',
  'https://raw.githubusercontent.com/SelfhostedPro/selfhosted_templates/master/Template/template.json',
]
let combinedJSON = {
  version: '2',
  templates: [],
}
for (const key in process.env) {
  if (
    Object.hasOwnProperty.call(process.env, key) &&
    key.toLowerCase().startsWith('ptu')
  ) {
    templateUrls.push(process.env[key])
  }
}
function appendTemplate(data, url) {
  data.forEach((te) => {
    if (!combinedJSON.templates.filter((t) => t.title === te.title).length) {
      combinedJSON.templates.push(te)
    }
  })
  console.log('appended: '+ url)
}
function getData(url) {
  https
    .get(url, (resp) => {
      let data = ''
      resp.on('data', (chunk) => {
        data += chunk
      })
      resp.on('end', () => {
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
          console.log(e)
        }
      })
    })
    .on('error', (err) => {
      console.log('Error: ' + err.message)
    })
}

templateUrls.forEach((templateUrl) => {
  getData(templateUrl)
})

app.get('/templates.json', (req, res) => {
  res.send(combinedJSON)
})

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8020
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`)
})
// [END app]

module.exports = app
