const AWS = require('aws-sdk')
const Sharp = require('sharp')

const s3 = new AWS.S3()

exports.handle = function(event, context) {
  const { w, h } = event.queryStringParameters

  const width = parseInt(w || 500)
  const height = parseInt(h || 500)

  const resizes = event.Records.map(record => {
    const Bucket = record.s3.bucket.name
    const Key = record.s3.object.key

    return s3.getObject({ Bucket, Key }).promise()
      .then(resizeImage(width, height))
      .then(saveToS3(Bucket, Key, width, height))
  })

  Promise.all(resizes)
    .then((objects) => {
      console.log(objects)
      context.succeed(objects)
    })
    .catch((error) => {
      console.log(error)
    })
}

function resizeImage(width, height) {
  return (data) => {
    return Sharp(data.Body)
      .resize(width, height)
      .toFormat('jpeg')
      .toBuffer()
  }
}

function saveToS3(bucket, key, w, h) {
  const newKey = imageKey(key, w, h)

  return (buffer) => {
    return s3.putObject({
      Body: buffer,
      Bucket: bucket,
      ContentType: 'image/jpeg',
      Key: newKey,
      ACL: 'public-read'
    }).promise()
  }
}

function imageKey(original, width, height) {
  const filename = original.split('/')[1]
  const parts = filename.split('.')
  const name = parts[0]
  const extension = parts[1]

  return `resized/${name}${width}x${height}.${extension}`
}
