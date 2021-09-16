import { $forEach } from './lib'

async function getData() {
    return [
        async () => 5,
        async () => 6,
        async () => 7,
        async () => 8,
        async () => 9,
    ]
}

async function run() {
    console.log('Starting')
    await $forEach(getData, d => console.log(d))
    console.log('Done')
}

run()