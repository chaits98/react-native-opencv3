var RNFS = require('react-native-fs')
import UUIDGenerator from 'react-native-uuid-generator';

function getFilename(source_uri) {
  let filePortion = ''
  if (source_uri.lastIndexOf('?') != -1) {
    filePortion = source_uri.substring(source_uri.lastIndexOf('/'), source_uri.lastIndexOf('?'))
  }
  else {
    filePortion = source_uri.substring(source_uri.lastIndexOf('/'))
  }
  if (RNFS) {
    return RNFS.DocumentDirectoryPath + filePortion
  }
  else {
    console.error('RNFS is null filePortion is: ' + filePortion)
    return ''
  }
}

async function downloadAssetSource(uri) {
  return new Promise((resolve, reject) => {
    const filename = getFilename(uri)
    let isLocalFile = RNFS.exists(uri);
    if (isLocalFile) {
      UUIDGenerator.getRandomUUID((uuid) => {
        const cachePath = `${RNFS.CachesDirectoryPath}/${uuid}.${filename.split('.').pop()}`;
        RNFS.copyFile(uri, cachePath)
          .then(() => {
            resolve(cachePath);
          })
          .catch(err => console.error(err))
      });
      return;
    }

    RNFS.exists(filename)
      .then((itExists) => {
        if (itExists) {
          RNFS.unlink(filename)
            .then(() => { })
            .catch((err) => {
              console.error(err)
              reject('Unable to unlink file at: ' + filename)
            })
        }

        const ret = RNFS.downloadFile({
          fromUrl: uri,
          toFile: filename
        })

        ret.promise.then((res) => {
          console.log('statusCode is: ' + res.statusCode)
          if (res.statusCode === 200) {
            resolve(filename)
          }
          else {
            reject('File at ' + filename + ' not downloaded.  Status code: ' + ret.statusCode)
          }
        })
          .catch((err) => {
            console.error(err)
            reject('File at ' + filename + ' not downloaded')
          })

      })
      .catch((err) => {
        console.error(err)
        reject('File at ' + filename + ' not downloaded')
      })
  })
}

module.exports = downloadAssetSource;