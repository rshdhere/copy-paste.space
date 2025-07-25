export function random( len: number ){
    let options = process.env.OPTIONS;
    let ans = '';

    for (let i = 0; i < 6; i++){
        ans += options![Math.floor((Math.random() * 6))]
    }
    return ans;
}