import path from 'path'
import co from 'co'
import fs from 'co-fs'
import mustache from 'mustache'
import rest from 'restling'

const TEMPLATE_DIR = path.resolve('./template')
const POST_URL = process.env.POST_URL || 'http://localhost'

co(function *(){
  console.log('START')
  
  yield post_scripts(TEMPLATE_DIR)
  
}).then(val=>{
  console.log('END')
}).catch(err=>{
  console.error(err)
})

function *post_scripts(rootPath){
  let files = yield fs.readdir(rootPath)
  yield files.map(filename => function *(){
    
    let filepath = path.resolve(rootPath, filename)
    let file = yield fs.stat(filepath)
    if (file.isFile()){
      let scriptpath = filepath.replace(TEMPLATE_DIR, '')
      console.log(scriptpath)
      
      let template = yield fs.readFile(filepath, 'utf8')
      yield rest.post(POST_URL + scriptpath, {
        headers: {
          Authorization: `Basic ${process.env.AUTH_KEY}`
        },
        data: mustache.render(template, process.env)
      })
    } else if (file.isDirectory()) {
      yield post_scripts(filepath)
    }
  })
}