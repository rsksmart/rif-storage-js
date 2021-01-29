/* global self */
// @ts-ignore: No types yet
import IPFSRepo from 'ipfs-repo'
import { nanoid } from 'nanoid'

// @ts-ignore: Browser types
const idb = self.indexedDB || self.mozIndexedDB || self.webkitIndexedDB || self.msIndexedDB

export default function createTempRepo (repoPath?: string): any {
  const resolvedRepoPath = repoPath ?? '/ipfs-' + nanoid()

  const repo = new IPFSRepo(resolvedRepoPath)

  repo.teardown = async () => {
    try {
      await repo.close()
    } catch (err) {
      if (!err.message.includes('already closed')) {
        throw err
      }
    }

    idb.deleteDatabase(resolvedRepoPath)
    idb.deleteDatabase(repoPath + '/blocks')
  }

  return repo
}
