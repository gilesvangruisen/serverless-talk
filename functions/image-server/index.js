const AWS = require('aws-sdk')

const s3 = new AWS.S3()

const BUCKET = process.env.S3_BUCKET
const DIRECTORY = process.env.DIRECTORY

exports.handle = function(event, context, callback) {
  s3.listObjectsV2({
    Bucket: BUCKET
  }).promise()
    .then((data) => {
      const files = data.Contents.map(makeFileItem)

      console.log(files)
      callback(null, files.join(''))
    })
}

function makeFileItem(file) {
  const base = `http://${BUCKET}.s3.amazonaws.com/`
  const url = `${base}${file.Key}`

  return `<li><a href="${url}">${file.Key}</a></li>`
}
