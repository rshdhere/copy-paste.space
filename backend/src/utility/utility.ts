export function random( len: number ){
    let options = process.env.OPTIONS ?? "abcd1234";
    let ans = '';

    for (let i = 0; i < len; i++) {
        ans += options![Math.floor(Math.random() * options.length)];
    }
    return ans;
}