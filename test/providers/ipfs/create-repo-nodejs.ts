// @ts-ignore: No types yet
import IPFSRepo from 'ipfs-repo'
import os from 'os'
import path from 'path'
import { nanoid } from 'nanoid'
import { promises as fs } from 'fs'
import { promisify } from 'util'
import rimraf from 'rimraf'

async function clean (dir: string): Promise<void> {
  try {
    await fs.access(dir)
  } catch (err) {
    // Does not exist so all good
    return
  }

  return promisify(rimraf)(dir)
}

export default function createTempRepo (repoPath?: string): any {
  const resolvedRepoPath = repoPath ?? path.join(os.tmpdir(), '/ipfs-test-' + nanoid())

  const repo = new IPFSRepo(resolvedRepoPath)

  repo.teardown = async () => {
    try {
      await repo.close()
    } catch (err) {
      if (!err.message.includes('already closed')) {
        throw err
      }
    }

    await clean(resolvedRepoPath)
  }

  return repo
}
