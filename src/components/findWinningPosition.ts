export function findWinningPosition(role, squares) {
  const winningPosition = [
    [0,1,2],
    [1,2,0],
    [3,4,5],
    [4,5,3],
    [6,7,8],
    [7,8,6],
    [0,3,6],
    [3,6,0],
    [1,4,7],
    [4,7,1],
    [2,5,8],
    [5,8,2],
    [0,4,8],
    [4,8,0],
    [2,4,6],
    [4,6,2],
    [0,2,1],
    [3,5,4],
    [6,8,7],
    [0,6,3],
    [1,7,4],
    [2,8,5],
    [0,8,4],
    [2,6,4]
  ];
  const mark = role === "user" ? "X" : "O"
  for (let i = 0; i < winningPosition.length; i++) {
    const [a, b, c] = winningPosition[i];
    if (squares[a]=== mark && squares[b] === mark) {
      if(!squares[c]){
        return c;
      } else {
        continue;
      }
    }
  }
  return -1;
}