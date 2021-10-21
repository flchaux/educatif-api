const playlistManager = require('./playlist')
const fs = require('fs');

const testLevel = {
    name: 'playlist-test',
    levels:[
        'test', 
        'fruit',
        'fruit3',
        'ministre'
    ]
}

beforeEach(() => {
    fs.writeFileSync(playlistManager.computePlaylistPath(testLevel.name), JSON.stringify(testLevel))
});
  
test('playlist.load', async () => {
    expect(await playlistManager.load(testLevel.name)).toEqual(testLevel)
})

test('playlist.create', async () =>  {
    const name = 'playlist-test-created'
    const playlistExpected = {
        name: name,
        levels: testLevel.levels
    }
    expect(playlistManager.create(name, testLevel.levels)).toEqual(playlistExpected)
    expect(await playlistManager.load(name)).toEqual(playlistExpected)
})

test('playlist.update', async () =>  {
    const name = 'playlist-test'
    const newLevels = [
        'test', 
        'fruit',
        'fruit3',
        'ministre'
    ]
    const playlistExpected = {
        name, levels: newLevels
    }
    expect(playlistManager.update(testLevel.name, playlistExpected)).toEqual(playlistExpected)
    expect(await playlistManager.load(testLevel.name)).toEqual(playlistExpected)
})

test('playlist.delete', async () =>  {
    const name = 'playlist-test'
    playlistManager.delete(name)
    await expect(playlistManager.load(name)).rejects.toThrow();
})