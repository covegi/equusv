import { Hash, Utils } from '@bsv/sdk'
import fs from 'fs'

const fileData = fs.readFileSync('downloaded.bin')
const hasher = new Hash.SHA256()
hasher.update(Array.from(new Uint8Array(fileData)))
const hash = hasher.digest()
console.log('SDK hash:', Buffer.from(hash).toString('hex'))

const uhrpUrl = 'XUToep3SdNAR1rh1UhPrtmxk1pV4VHBHLWiLCNUsBi4WQwi4bPrx'
const decoded = Utils.toArray(uhrpUrl, 'base58')
console.log('UHRP decoded hex:', Buffer.from(decoded).toString('hex'))
console.log('OS shasum:        780d4c13f159553fbbc784cf6f327c5617d33b7451dc48f8e252d73d4611d33b')
