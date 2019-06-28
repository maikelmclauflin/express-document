import pkg from '../package.json'

const info = {
  description: pkg.description,
  version: pkg.version,
  title: pkg.name,
  contact: {
    email: (pkg.author as any).email
  }
}

const tags = [{
  name: 'examples',
  description: 'An example tag description'
}]

export {
  info,
  tags
}
