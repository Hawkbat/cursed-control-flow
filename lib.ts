
type ValueLike<T> = T | Promise<T> | (() => T) | (() => Promise<T>)

function isFunc<T>(value: ValueLike<T>): value is (() => T) | (() => Promise<T>) {
    return typeof value === 'function'
}

async function unwrap<T>(value: ValueLike<T>): Promise<T> {
    return await (isFunc<T>(value) ? value() : value)
}

export async function $if(cond: ValueLike<boolean>, then: ValueLike<void>): Promise<void>
export async function $if<T>(cond: ValueLike<boolean>, then: ValueLike<T>, ifFalse: ValueLike<T>): Promise<T>
export async function $if<T>(cond: ValueLike<boolean>, then: ValueLike<T>, ifFalse?: ValueLike<T>): Promise<T | undefined> {
    return await unwrap([ifFalse, then][Number(await unwrap(cond))])
}

export async function $while(cond: ValueLike<boolean>, body: ValueLike<void>): Promise<void> {
    await (async function loop() {
        await $if(cond, async () => { 
            await unwrap(body)
            await loop()
        })
    })()
}

export async function $doWhile(body: ValueLike<void>, cond: ValueLike<boolean>): Promise<void> {
    await (async function loop() {
        await unwrap(body)
        await $if(cond, loop)
    })()
}

export async function $for<T>(pre: ValueLike<T>, cond: (value: T) => ValueLike<boolean>, post: (value: T) => ValueLike<T>, body: (value: T) => ValueLike<void>): Promise<void> {
    let value = await unwrap(pre)
    return await $while(async () => await unwrap(cond(value)), async () => {
        await unwrap(body(value))
        value = await unwrap(post(value))
    })
}

export async function $forEach<T, U = void>(values: ValueLike<ValueLike<T>[]>, body: (value: T) => ValueLike<U>): Promise<U[]> {
    let array = await unwrap(values)
    let results: U[] = []
    await $for(0, i => i < array.length, i => i + 1, async i => {
        results.push(await unwrap(body(await unwrap(array[i]))))
    })
    return results
}

export async function $switch<T extends string | number | symbol, U = void>(value: ValueLike<T>, cases: Record<T, ValueLike<U>>, defaultCase?: ValueLike<U>) {
    return await unwrap(cases[await unwrap(value)] ?? defaultCase)
}
