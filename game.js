// 游戏主逻辑
document.addEventListener('DOMContentLoaded', () => {
    // 游戏变量
    const gridSize = 4;
    const maxValue = 11;
    let score = 0;
    let board = [];
    let selectedElement = null;
    
    // DOM 元素
    const gameBoard = document.getElementById('game-board');
    const scoreDisplay = document.getElementById('score');
    const newGameBtn = document.getElementById('new-game');
    const hintBtn = document.getElementById('hint');
    const hintText = document.getElementById('hint-text');
    
    // 初始化游戏
    initGame();
    
    // 事件监听
    newGameBtn.addEventListener('click', initGame);
    hintBtn.addEventListener('click', showHint);
    
    // 键盘事件
    document.addEventListener('keydown', handleKeyPress);
    
    // 添加拖拽支持
    let startX, startY;
    let isDragging = false;
    
    // 鼠标事件
    gameBoard.addEventListener('mousedown', handleDragStart);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    
    // 触摸事件
    gameBoard.addEventListener('touchstart', handleDragStart);
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('touchend', handleDragEnd);
    
    // 拖拽开始
    function handleDragStart(event) {
        event.preventDefault();
        
        // 获取触摸或鼠标坐标
        if (event.type === 'touchstart') {
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
        } else {
            startX = event.clientX;
            startY = event.clientY;
        }
        
        isDragging = true;
    }
    
    // 拖拽移动
    function handleDragMove(event) {
        if (!isDragging) return;
        event.preventDefault();
    }
    
    // 拖拽结束
    function handleDragEnd(event) {
        if (!isDragging) return;
        event.preventDefault();
        
        let endX, endY;
        if (event.type === 'touchend') {
            endX = event.changedTouches[0].clientX;
            endY = event.changedTouches[0].clientY;
        } else {
            endX = event.clientX;
            endY = event.clientY;
        }
        
        // 计算拖拽距离和方向
        const diffX = endX - startX;
        const diffY = endY - startY;
        
        // 确保拖拽距离足够，防止轻点触发
        const minDistance = 30;
        
        let moved = false;
        
        // 判断主要拖拽方向
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // 水平方向
            if (Math.abs(diffX) > minDistance) {
                if (diffX > 0) {
                    moved = moveRight(); // 右移
                } else {
                    moved = moveLeft(); // 左移
                }
            }
        } else {
            // 垂直方向
            if (Math.abs(diffY) > minDistance) {
                if (diffY > 0) {
                    moved = moveDown(); // 下移
                } else {
                    moved = moveUp(); // 上移
                }
            }
        }
        
        // 如果发生移动，添加新元素并检查游戏状态
        if (moved) {
            addRandomElement();
            checkGameState();
        }
        
        isDragging = false;
    }
    
    // 初始化游戏函数
    function initGame() {
        score = 0;
        scoreDisplay.textContent = '0';
        hintText.textContent = '';
        
        // 清空选择
        if (selectedElement) {
            selectedElement.classList.remove('selected');
            selectedElement = null;
        }
        
        // 初始化棋盘
        board = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
        
        // 清空网格
        document.querySelectorAll('.grid-item .item-content').forEach(item => {
            item.style.backgroundImage = '';
            item.innerHTML = '';
        });
        
        // 添加初始元素
        addRandomElement();
        addRandomElement();
        
        // 添加点击事件
        document.querySelectorAll('.grid-item').forEach(item => {
            item.addEventListener('click', handleCellClick);
        });
    }
    
    // 点击格子处理
    function handleCellClick(event) {
        const gridItem = event.currentTarget;
        const x = parseInt(gridItem.getAttribute('data-x'));
        const y = parseInt(gridItem.getAttribute('data-y'));
        
        // 如果单元格为空，不做任何操作
        if (board[x][y] === 0) return;
        
        // 如果已经选中了一个元素
        if (selectedElement) {
            // 如果点击的是同一个元素，取消选择
            if (selectedElement === gridItem) {
                selectedElement.classList.remove('selected');
                selectedElement = null;
                return;
            }
            
            const selectedX = parseInt(selectedElement.getAttribute('data-x'));
            const selectedY = parseInt(selectedElement.getAttribute('data-y'));
            
            // 检查是否相邻
            const isAdjacent = (
                (Math.abs(x - selectedX) === 1 && y === selectedY) ||
                (Math.abs(y - selectedY) === 1 && x === selectedX)
            );
            
            // 如果相邻且数值相同，合并
            if (isAdjacent && board[x][y] === board[selectedX][selectedY]) {
                mergeElements(selectedX, selectedY, x, y);
                selectedElement.classList.remove('selected');
                selectedElement = null;
            } else {
                // 否则切换选择
                selectedElement.classList.remove('selected');
                selectedElement = gridItem;
                selectedElement.classList.add('selected');
            }
        } else {
            // 选择元素
            selectedElement = gridItem;
            selectedElement.classList.add('selected');
        }
    }
    
    // 处理键盘事件
    function handleKeyPress(event) {
        let moved = false;
        
        switch(event.key) {
            case 'ArrowUp':
                moved = moveUp();
                break;
            case 'ArrowDown':
                moved = moveDown();
                break;
            case 'ArrowLeft':
                moved = moveLeft();
                break;
            case 'ArrowRight':
                moved = moveRight();
                break;
        }
        
        if (moved) {
            addRandomElement();
            checkGameState();
        }
    }
    
    // 添加随机元素
    function addRandomElement() {
        const emptyCells = [];
        
        // 找出所有空白格子
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (board[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }
        
        if (emptyCells.length === 0) return false;
        
        // 随机选择一个格子
        const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        
        // 90%的概率生成1，10%的概率生成2
        const value = Math.random() < 0.9 ? 1 : 2;
        board[cell.x][cell.y] = value;
        updateCellDisplay(cell.x, cell.y);
        
        return true;
    }
    
    // 更新格子显示
    function updateCellDisplay(x, y) {
        const value = board[x][y];
        const cell = document.querySelector(`.grid-item[data-x="${x}"][data-y="${y}"] .item-content`);
        
        if (value === 0) {
            cell.style.backgroundImage = '';
        } else {
            cell.style.backgroundImage = `url('images/${value}.png')`;
        }
    }
    
    // 合并元素
    function mergeElements(fromX, fromY, toX, toY) {
        const fromValue = board[fromX][fromY];
        const toValue = board[toX][toY];
        
        // 只有相同值才能合并
        if (fromValue !== toValue || fromValue === 0 || fromValue === maxValue) return false;
        
        // 计算新值
        const newValue = fromValue + 1;
        
        // 更新棋盘
        board[fromX][fromY] = 0;
        board[toX][toY] = newValue > maxValue ? maxValue : newValue;
        
        // 更新显示
        updateCellDisplay(fromX, fromY);
        updateCellDisplay(toX, toY);
        
        // 更新分数
        score += newValue;
        scoreDisplay.textContent = score;
        
        return true;
    }
    
    // 移动函数
    function moveUp() {
        let moved = false;
        
        for (let col = 0; col < gridSize; col++) {
            for (let row = 1; row < gridSize; row++) {
                if (board[row][col] === 0) continue;
                
                let currentRow = row;
                while (currentRow > 0 && board[currentRow - 1][col] === 0) {
                    board[currentRow - 1][col] = board[currentRow][col];
                    board[currentRow][col] = 0;
                    currentRow--;
                    moved = true;
                }
                
                if (currentRow > 0 && board[currentRow - 1][col] === board[currentRow][col] && board[currentRow][col] !== maxValue) {
                    mergeElements(currentRow, col, currentRow - 1, col);
                    moved = true;
                }
            }
        }
        
        updateDisplay();
        return moved;
    }
    
    function moveDown() {
        let moved = false;
        
        for (let col = 0; col < gridSize; col++) {
            for (let row = gridSize - 2; row >= 0; row--) {
                if (board[row][col] === 0) continue;
                
                let currentRow = row;
                while (currentRow < gridSize - 1 && board[currentRow + 1][col] === 0) {
                    board[currentRow + 1][col] = board[currentRow][col];
                    board[currentRow][col] = 0;
                    currentRow++;
                    moved = true;
                }
                
                if (currentRow < gridSize - 1 && board[currentRow + 1][col] === board[currentRow][col] && board[currentRow][col] !== maxValue) {
                    mergeElements(currentRow, col, currentRow + 1, col);
                    moved = true;
                }
            }
        }
        
        updateDisplay();
        return moved;
    }
    
    function moveLeft() {
        let moved = false;
        
        for (let row = 0; row < gridSize; row++) {
            for (let col = 1; col < gridSize; col++) {
                if (board[row][col] === 0) continue;
                
                let currentCol = col;
                while (currentCol > 0 && board[row][currentCol - 1] === 0) {
                    board[row][currentCol - 1] = board[row][currentCol];
                    board[row][currentCol] = 0;
                    currentCol--;
                    moved = true;
                }
                
                if (currentCol > 0 && board[row][currentCol - 1] === board[row][currentCol] && board[row][currentCol] !== maxValue) {
                    mergeElements(row, currentCol, row, currentCol - 1);
                    moved = true;
                }
            }
        }
        
        updateDisplay();
        return moved;
    }
    
    function moveRight() {
        let moved = false;
        
        for (let row = 0; row < gridSize; row++) {
            for (let col = gridSize - 2; col >= 0; col--) {
                if (board[row][col] === 0) continue;
                
                let currentCol = col;
                while (currentCol < gridSize - 1 && board[row][currentCol + 1] === 0) {
                    board[row][currentCol + 1] = board[row][currentCol];
                    board[row][currentCol] = 0;
                    currentCol++;
                    moved = true;
                }
                
                if (currentCol < gridSize - 1 && board[row][currentCol + 1] === board[row][currentCol] && board[row][currentCol] !== maxValue) {
                    mergeElements(row, currentCol, row, currentCol + 1);
                    moved = true;
                }
            }
        }
        
        updateDisplay();
        return moved;
    }
    
    // 更新显示
    function updateDisplay() {
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                updateCellDisplay(i, j);
            }
        }
    }
    
    // 检查游戏状态
    function checkGameState() {
        // 检查是否有最大值
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (board[i][j] === maxValue) {
                    hintText.textContent = "恭喜！你已达到最高级别！";
                    return;
                }
            }
        }
        
        // 检查是否还有空格
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (board[i][j] === 0) {
                    return; // 还有空格，游戏继续
                }
            }
        }
        
        // 检查是否有可合并的格子
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (
                    (i < gridSize - 1 && board[i][j] === board[i + 1][j] && board[i][j] !== maxValue) || 
                    (j < gridSize - 1 && board[i][j] === board[i][j + 1] && board[i][j] !== maxValue)
                ) {
                    return; // 有可合并的格子，游戏继续
                }
            }
        }
        
        // 没有空格且没有可合并的格子，游戏结束
        hintText.textContent = "游戏结束！没有更多的移动可以进行。";
    }
    
    // 显示提示
    function showHint() {
        const hint = findBestMove();
        if (hint) {
            hintText.textContent = `提示: 考虑将 (${hint.fromX+1}, ${hint.fromY+1}) 的元素与 (${hint.toX+1}, ${hint.toY+1}) 的元素合并`;
        } else {
            hintText.textContent = "没有找到最优移动";
        }
    }
    
    // 寻找最佳移动
    function findBestMove() {
        let bestMoves = [];
        
        // 检查所有相邻且数值相同的格子
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (board[i][j] === 0) continue;
                
                // 检查右侧
                if (j < gridSize - 1 && board[i][j] === board[i][j + 1] && board[i][j] !== maxValue) {
                    bestMoves.push({
                        fromX: i,
                        fromY: j,
                        toX: i,
                        toY: j + 1,
                        value: board[i][j]
                    });
                }
                
                // 检查下方
                if (i < gridSize - 1 && board[i][j] === board[i + 1][j] && board[i][j] !== maxValue) {
                    bestMoves.push({
                        fromX: i,
                        fromY: j,
                        toX: i + 1,
                        toY: j,
                        value: board[i][j]
                    });
                }
            }
        }
        
        // 按照数值从大到小排序
        bestMoves.sort((a, b) => b.value - a.value);
        
        return bestMoves.length > 0 ? bestMoves[0] : null;
    }

});
