const blocks = [
  [
    [
      [1, 1],
      [1, 1]
    ]
  ],
  [
    [
      [2, 2, 2, 2]
    ],
    [
      [2],
      [2],
      [2],
      [2]
    ]
  ],
  [
    [
      [3, 3, 0],
      [0, 3, 3]
    ],
    [
      [0, 3],
      [3, 3],
      [3, 0]
    ]
  ],
  [
    [
      [0, 4, 4],
      [4, 4, 0]
    ],
    [
      [4, 0],
      [4, 4],
      [0, 4]
    ]
  ],
  [
    [
      [5, 0, 0],
      [5, 5, 5]
    ],
    [
      [5, 5],
      [5, 0],
      [5, 0]
    ],
    [
      [5, 5, 5],
      [0, 0, 5]
    ],
    [
      [0, 5],
      [0, 5],
      [5, 5]
    ]
  ],
  [
    [
      [0, 0, 6],
      [6, 6, 6]
    ],
    [
      [6, 6],
      [0, 6],
      [0, 6]
    ],
    [
      [6, 6, 6],
      [6, 0, 0]
    ],
    [
      [6, 0],
      [6, 0],
      [6, 6]
    ]
  ],
  [
    [
      [0, 7, 0],
      [7, 7, 7]
    ],
    [
      [7, 7, 7],
      [0, 7, 0]
    ],
    [
      [7, 0],
      [7, 7],
      [7, 0]
    ],
    [
      [0, 7],
      [7, 7],
      [0, 7]
    ]
  ],
  [
    [
      [0, 8, 0],
      [8, 8, 8],
      [0, 8, 0]
    ]
  ],
  [
    [
      [9]
    ]
  ],
  [
    [
      [10, 10]
    ],
    [
      [10],
      [10]
    ]
  ],
  [
    [
      [11, 11],
      [11, 0],
    ],
    [
      [11, 11],
      [0, 11],
    ],
    [
      [0, 11],
      [11, 11],
    ],
    [
      [11, 0],
      [11, 11],
    ],
  ]
];

let row, column, solvingTable, solvingBlockNums, results;
let lastSolvingBlockNums;

function getSortedBlockIndexes(nums) {
  return nums
    .map((value, index) => ({ value, index }))
    .sort((a, b) => {
      // 最先使用 8 号
      if (a.index === 7) return -1
      // 最后使用 9~11 号
      if (a.index > 7) return 1
      // 普通方块
      return b.value - a.value
    })
    .map(item => item.index)
}

function getBlockSize(type) {
  if (type===-1){
    return 0
  }
  return blocks[type][0].flat().filter(i => i > 0).length
}

function getBlockUsed(result) {
  return result.flat().reduce((a, c) => {
    if (a[c]) {
      a[c] += 1
    } else {
      a[c] = 1
    }
    return a
  }, []).map((n, t) => n / getBlockSize(t - 1))
}

function variance(arr) {
  let mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
  let squaredDiffs = arr.map(val => Math.pow(val - mean, 2));
  let powSum = squaredDiffs.reduce((acc, val) => acc + val, 0);
  return powSum / (arr.length - 1);
}

function varianceOfResult(blockNums, result) {
  if (result.number) return result.number
  let blockUsed = getBlockUsed(result)
  let blockUsedNums = blockNums.map((x, i) => blockUsed[i + 1] ? x - blockUsed[i + 1] : x)
  let arr = blockUsedNums.slice(0, 7)
  let number = variance(arr)
  result.number = number
  return number
}

function Solve(table, blockNums) {

  results = [];
  row = table.length;
  column = table[0].length;

  solvingTable = new Array(row);
  for (let i = 0; i < row; ++i) {
    solvingTable[i] = table[i].map(x => x);
  }

  solvingBlockNums = blockNums.map(x => x);

  let specialBlockNums = []
  for (let i = 8; i < 11; ++i) {
    specialBlockNums[i] = solvingBlockNums[i]
    solvingBlockNums[i] = 0
  }

  while (results.length === 0) {
    lastSolvingBlockNums = solvingBlockNums.map(x => x)
    dfs(0)
    if (results.length) {
      console.log("at less 1 found, end.")
      break
    }
    if (!specialBlockNums.reduce((p, c) => p + c)) {
      console.log("no more special blocks, break!!")
      break
    }

    let specialBlockIndexMax = specialBlockNums.indexOf(Math.max(specialBlockNums[8], specialBlockNums[9], specialBlockNums[10]))
    ++solvingBlockNums[specialBlockIndexMax]
    --specialBlockNums[specialBlockIndexMax]
  }

  results.sort((a, b) => varianceOfResult(blockNums, a) - varianceOfResult(blockNums, b))

  return results
}

function canPlaceBlock(x, y, blockIndex, direction) {
  const pat = blocks[blockIndex][direction];
  let offset = 0;
  while (!pat[0][offset]) ++offset;
  y -= offset;
  if (y < 0) return false;
  for (let i = 0; i < pat.length; ++i) {
    for (let j = 0; j < pat[0].length; ++j) {
      if (pat[i][j] && (x + i >= row || y + j >= column || solvingTable[x + i][y + j] !== -1)) return false;
    }
  }
  return true;
}

function placeBlock(x, y, blockIndex, direction, solvedBlockType) {
  const pat = blocks[blockIndex][direction];
  let offset = 0;
  while (!pat[0][offset]) ++offset;
  y -= offset;
  for (let i = 0; i < pat.length; ++i) {
    for (let j = 0; j < pat[0].length; ++j) {
      if (pat[i][j]) solvingTable[x + i][y + j] = solvedBlockType;
    }
  }
}

function dfs(positionIndex) {
  if (positionIndex === row * column) {
    const solvedTable = new Array(row);
    for (let i = 0; i < row; ++i) {
      solvedTable[i] = solvingTable[i].map(x => x);
    }
    results.push(solvedTable);
    return results.length >= 9999;

  }
  const x = Math.floor(positionIndex / column), y = positionIndex % column;
  if (solvingTable[x][y] !== -1) {
    return dfs(positionIndex + 1);
  }
  for (const blockIndex of getSortedBlockIndexes(solvingBlockNums)) {
    if (!solvingBlockNums[blockIndex]) continue;
    for (let direction = 0; direction < blocks[blockIndex].length; ++direction) {
      if (!canPlaceBlock(x, y, blockIndex, direction)) continue;
      placeBlock(x, y, blockIndex, direction, blockIndex + 1);
      --solvingBlockNums[blockIndex];
      if (dfs(positionIndex + 1)) return true;
      ++solvingBlockNums[blockIndex];
      placeBlock(x, y, blockIndex, direction, -1);
    }
  }
  return false;
}