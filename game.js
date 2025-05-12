// 游戏主逻辑
document.addEventListener('DOMContentLoaded', () => {
    // 游戏变量
    const gridSize = 4;
    const maxValue = 11;
    let score = 0;
    let board = [];
    let selectedElement = null;
    
    // 游戏状态控制
    let gameState = 'notStarted'; // 可能的值: 'notStarted', 'playing', 'paused'
    let deleteMode = false;
    
    // 当前选中的单元格(用于弹窗选图)
    let currentCell = null;
    
    // DOM 元素
    const gameBoard = document.getElementById('game-board');
    const scoreDisplay = document.getElementById('score');
    const newGameBtn = document.getElementById('new-game');
    const hintBtn = document.getElementById('hint');
    const hintText = document.getElementById('hint-text');
    const startGameBtn = document.getElementById('start-game');
    const pauseGameBtn = document.getElementById('pause-game');
    const deleteModeBtn = document.getElementById('delete-mode');
    const imageModal = document.getElementById('image-modal');
    const closeModal = document.querySelector('.close');
    const imagesContainer = document.getElementById('images-container');
    
    // 初始化游戏
    initGame();
    
    // 事件监听
    newGameBtn.addEventListener('click', initGame);
    hintBtn.addEventListener('click', showHint);
    startGameBtn.addEventListener('click', startGame);
    pauseGameBtn.addEventListener('click', pauseGame);
    deleteModeBtn.addEventListener('click', toggleDeleteMode);
    closeModal.addEventListener('click', () => {
        imageModal.style.display = 'none';
    });
    
    // 点击弹窗外部关闭弹窗
    window.addEventListener('click', (event) => {
        if (event.target === imageModal) {
            imageModal.style.display = 'none';
        }
    });
    
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
    
    // 游戏状态控制函数
    function startGame() {
        gameState = 'playing';
        startGameBtn.disabled = true;
        pauseGameBtn.disabled = false;
        document.body.classList.remove('game-not-started', 'game-paused');
        
        // 退出删除模式
        if (deleteMode) {
            toggleDeleteMode();
        }
        
        hintText.textContent = '游戏开始！';
        setTimeout(updateHint, 1500); // 短暂显示开始信息后更新提示
    }
    
    function pauseGame() {
        gameState = 'paused';
        startGameBtn.disabled = false;
        pauseGameBtn.disabled = true;
        document.body.classList.add('game-paused');
        document.body.classList.remove('game-not-started');
        
        // 退出删除模式
        if (deleteMode) {
            toggleDeleteMode();
        }
        
        hintText.textContent = '游戏已暂停。';
    }
    
    function toggleDeleteMode() {
        deleteMode = !deleteMode;
        
        if (deleteMode) {
            deleteModeBtn.classList.add('delete-mode');
            hintText.textContent = '删除模式：点击单元格删除元素；再次点击删除模式即可退出删除模式！';
            
            // 取消选择
            if (selectedElement) {
                selectedElement.classList.remove('selected');
                selectedElement = null;
            }
        } else {
            deleteModeBtn.classList.remove('delete-mode');
            
            // 移除所有删除选择状态
            document.querySelectorAll('.selected-for-delete').forEach(el => {
                el.classList.remove('selected-for-delete');
            });
            
            hintText.textContent = '';
        }
    }
    
    // 拖拽开始
    function handleDragStart(event) {
        // 只有在游戏进行时才允许拖拽
        if (gameState !== 'playing') return;
        
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
        if (!isDragging || gameState !== 'playing') return;
        event.preventDefault();
    }
    
    // 拖拽结束
    function handleDragEnd(event) {
        if (!isDragging || gameState !== 'playing') return;
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
            // addRandomElement();
            checkGameState();
        }
        
        isDragging = false;
    }
    
    // 初始化游戏函数
    function initGame() {
        score = 0;
        scoreDisplay.textContent = '0';
        hintText.textContent = '';
        gameState = 'notStarted';
        
        // 更新按钮状态
        startGameBtn.disabled = false;
        pauseGameBtn.disabled = true;
        
        // 添加样式表示游戏未开始
        document.body.classList.add('game-not-started');
        document.body.classList.remove('game-paused');
        
        // 退出删除模式
        if (deleteMode) {
            toggleDeleteMode();
        }
        
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
        
        // 移除原有点击事件
        document.querySelectorAll('.grid-item').forEach(item => {
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
        });
        
        // 添加新的点击事件
        document.querySelectorAll('.grid-item').forEach(item => {
            item.addEventListener('click', handleCellClick);
        });
        
        // 初始游戏后更新提示
        if (gameState === 'playing') {
            updateHint();
        }
    }
    
    // 点击格子处理
    function handleCellClick(event) {
        const gridItem = event.currentTarget;
        const x = parseInt(gridItem.getAttribute('data-x'));
        const y = parseInt(gridItem.getAttribute('data-y'));
        
        // 删除模式下的处理
        if (deleteMode) {
            if (board[x][y] !== 0) {
                board[x][y] = 0;
                updateCellDisplay(x, y);
                gridItem.classList.add('selected-for-delete');
                setTimeout(() => {
                    gridItem.classList.remove('selected-for-delete');
                }, 300);
            }
            return;
        }
        
        // 游戏未开始或暂停状态下，显示图片选择弹窗
        if (gameState === 'notStarted' || gameState === 'paused') {
            currentCell = { x, y };
            showImageModal();
            return;
        }
        
        // 游戏进行中的正常逻辑
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
    
    // 显示图片选择弹窗
    function showImageModal() {
        // 清空现有内容
        imagesContainer.innerHTML = '';
        
        // 动态加载images目录下的图片
        // 这里我们模拟11张图片，实际项目中应该动态加载images目录中的文件
        for (let i = 1; i <= 11; i++) {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-item';
            
            const img = document.createElement('img');
            img.src = `images/${i}.png`;
            img.alt = `图片 ${i}`;
            
            imageItem.appendChild(img);
            imagesContainer.appendChild(imageItem);
            
            // 添加点击事件
            imageItem.addEventListener('click', () => {
                selectImageForCell(i);
            });
        }
        
        // 显示弹窗
        imageModal.style.display = 'block';
    }
    
    // 为单元格选择图片
    function selectImageForCell(value) {
        if (currentCell) {
            board[currentCell.x][currentCell.y] = value;
            updateCellDisplay(currentCell.x, currentCell.y);
            currentCell = null;
        }
        
        // 隐藏弹窗
        imageModal.style.display = 'none';
    }
    
    // 处理键盘事件
    function handleKeyPress(event) {
        // 只有在游戏进行中才响应键盘移动
        if (gameState !== 'playing') return;
        
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
            // addRandomElement();
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
        
        // 更新提示
        updateHint();
        
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
        if (moved) updateHint();
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
        if (moved) updateHint();
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
        if (moved) updateHint();
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
        if (moved) updateHint();
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
        let hasEmptyCell = false;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (board[i][j] === 0) {
                    hasEmptyCell = true;
                    break;
                }
            }
            if (hasEmptyCell) break;
        }
        
        // 检查是否有可合并的格子
        let hasMergeable = false;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (
                    (i < gridSize - 1 && board[i][j] === board[i + 1][j] && board[i][j] !== maxValue) || 
                    (j < gridSize - 1 && board[i][j] === board[i][j + 1] && board[i][j] !== maxValue)
                ) {
                    hasMergeable = true;
                    break;
                }
            }
            if (hasMergeable) break;
        }
        
        // 游戏结束条件
        if (!hasEmptyCell && !hasMergeable) {
            hintText.textContent = "游戏结束！没有更多的移动可以进行。";
            return;
        }
        
        // 游戏继续，更新提示
        updateHint();
    }
    
    // 显示提示
    function showHint() {
        const hint = findBestMove();
        if (hint) {
            if (hint.type === "direction") {
                hintText.textContent = `提示: ${hint.suggestion}`;
            } else {
                hintText.textContent = `提示: 考虑将 (${hint.fromX+1}, ${hint.fromY+1}) 的元素与 (${hint.toX+1}, ${hint.toY+1}) 的元素合并`;
            }
        } else {
            hintText.textContent = "没有找到最优移动";
        }
    }
    
    // 寻找最佳移动
    function findBestMove() {
        // 定义目标角落 - 右下角
        const targetCorner = {x: gridSize - 1, y: gridSize - 1};
        
        // 按优先级排序的可能移动
        let possibleMoves = [];
        
        // 1. 寻找所有可能的合并
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (board[i][j] === 0) continue;
                
                // 检查右侧
                if (j < gridSize - 1 && board[i][j] === board[i][j + 1] && board[i][j] !== maxValue) {
                    possibleMoves.push({
                        fromX: i,
                        fromY: j,
                        toX: i,
                        toY: j + 1,
                        value: board[i][j],
                        distanceToCorner: Math.abs(i - targetCorner.x) + Math.abs(j + 1 - targetCorner.y),
                        priority: calculateMovePriority(i, j, i, j + 1, board[i][j])
                    });
                }
                
                // 检查下方
                if (i < gridSize - 1 && board[i][j] === board[i + 1][j] && board[i][j] !== maxValue) {
                    possibleMoves.push({
                        fromX: i,
                        fromY: j,
                        toX: i + 1,
                        toY: j,
                        value: board[i][j],
                        distanceToCorner: Math.abs(i + 1 - targetCorner.x) + Math.abs(j - targetCorner.y),
                        priority: calculateMovePriority(i, j, i + 1, j, board[i][j])
                    });
                }
            }
        }
        
        // 没有可能的合并，返回移动建议
        if (possibleMoves.length === 0) {
            return getBestDirectionMove();
        }
        
        // 按照优先级排序
        possibleMoves.sort((a, b) => b.priority - a.priority);
        
        return possibleMoves.length > 0 ? possibleMoves[0] : null;
    }

    // 计算移动的优先级
    function calculateMovePriority(fromX, fromY, toX, toY, value) {
        let priority = 0;
        
        // 基础优先级：数值越大优先级越高
        priority += value * 10;
        
        // 目标角落是右下角
        const targetCorner = {x: gridSize - 1, y: gridSize - 1};
        
        // 距离角落越近优先级越高(对大数字)
        const distanceToCorner = Math.abs(toX - targetCorner.x) + Math.abs(toY - targetCorner.y);
        if (value >= 5) {  // 对于5及以上的数值，鼓励向角落移动
            priority -= distanceToCorner * 5;  // 距离越远，扣的分越多
        } else {
            // 对于小数字，我们更关心它们的合并可能性
            priority += (4 - distanceToCorner) * 2;  // 小数字适当远离角落
        }
        
        // 避免在边缘形成不同值的"锯齿状"布局
        if ((toX === 0 || toX === gridSize - 1) && value < 5) {
            priority -= 15;  // 降低小数字靠边的优先级
        }
        
        // 特殊处理1和2，鼓励它们尽快合并
        if (value <= 2) {
            priority += 20;  // 提高1和2合并的优先级
        }
        
        return priority;
    }

    // 当没有直接合并时，获取最佳移动方向的建议
    function getBestDirectionMove() {
        // 分析当前布局
        const targetCorner = {x: gridSize - 1, y: gridSize - 1};
        const hasLargeNumberInCorner = board[targetCorner.x][targetCorner.y] >= 5;
        
        // 评估每个方向的移动优势
        let directions = {
            right: 0,
            down: 0, 
            left: 0,
            up: 0
        };
        
        // 评估横向移动
        let hasRightMerge = false;
        let hasLeftMerge = false;
        for (let i = 0; i < gridSize; i++) {
            // 检查向右移动是否能合并或移动
            let canMoveRight = false;
            for (let j = gridSize - 2; j >= 0; j--) {
                if (board[i][j] !== 0 && (board[i][j+1] === 0 || board[i][j+1] === board[i][j])) {
                    canMoveRight = true;
                    if (board[i][j+1] === board[i][j]) {
                        hasRightMerge = true;
                        // 给较大数字的合并更高权重
                        directions.right += board[i][j] * 2;
                    } else {
                        directions.right += 1;
                    }
                }
            }
            
            // 检查向左移动是否能合并或移动
            let canMoveLeft = false;
            for (let j = 1; j < gridSize; j++) {
                if (board[i][j] !== 0 && (board[i][j-1] === 0 || board[i][j-1] === board[i][j])) {
                    canMoveLeft = true;
                    if (board[i][j-1] === board[i][j]) {
                        hasLeftMerge = true;
                        directions.left += board[i][j] * 2;
                    } else {
                        directions.left += 1;
                    }
                }
            }
        }
        
        // 评估纵向移动
        let hasDownMerge = false;
        let hasUpMerge = false;
        for (let j = 0; j < gridSize; j++) {
            // 检查向下移动是否能合并或移动
            let canMoveDown = false;
            for (let i = gridSize - 2; i >= 0; i--) {
                if (board[i][j] !== 0 && (board[i+1][j] === 0 || board[i+1][j] === board[i][j])) {
                    canMoveDown = true;
                    if (board[i+1][j] === board[i][j]) {
                        hasDownMerge = true;
                        directions.down += board[i][j] * 2;
                    } else {
                        directions.down += 1;
                    }
                }
            }
            
            // 检查向上移动是否能合并或移动
            let canMoveUp = false;
            for (let i = 1; i < gridSize; i++) {
                if (board[i][j] !== 0 && (board[i-1][j] === 0 || board[i-1][j] === board[i][j])) {
                    canMoveUp = true;
                    if (board[i-1][j] === board[i][j]) {
                        hasUpMerge = true;
                        directions.up += board[i][j] * 2;
                    } else {
                        directions.up += 1;
                    }
                }
            }
        }
        
        // 右下角策略加权
        if (hasLargeNumberInCorner) {
            // 如果右下角有大数字，优先选择能维持该数字在角落的方向
            directions.right += 10;
            directions.down += 10;
        } else {
            // 促进向右下角移动的策略
            directions.right += 5;
            directions.down += 5;
        }
        
        // 对于小数字(1和2)，增加其合并权重
        if (hasRightMerge && countSmallNumbers().right > 0) directions.right += 15;
        if (hasDownMerge && countSmallNumbers().down > 0) directions.down += 15;
        if (hasLeftMerge && countSmallNumbers().left > 0) directions.left += 5;
        if (hasUpMerge && countSmallNumbers().up > 0) directions.up += 5;
        
        // 找出得分最高的方向
        let bestDirection = "right"; // 默认向右
        let maxScore = directions.right;
        
        if (directions.down > maxScore) {
            bestDirection = "down";
            maxScore = directions.down;
        }
        if (directions.left > maxScore) {
            bestDirection = "left";
            maxScore = directions.left;
        }
        if (directions.up > maxScore) {
            bestDirection = "up";
            maxScore = directions.up;
        }
        
        // 返回具体的方向指示
        let directionMap = {
            "right": "向右移动 ➡️",
            "down": "向下移动 ⬇️",
            "left": "向左移动 ⬅️",
            "up": "向上移动 ⬆️"
        };
        
        return {
            suggestion: directionMap[bestDirection],
            type: "direction",
            direction: bestDirection
        };
    }
    
    // 计算每个方向上的小数字(1和2)数量
    function countSmallNumbers() {
        let counts = {
            right: 0,
            down: 0,
            left: 0,
            up: 0
        };
        
        // 统计右边缘的小数字
        for (let i = 0; i < gridSize; i++) {
            if (board[i][gridSize-1] === 1 || board[i][gridSize-1] === 2) {
                counts.right++;
            }
        }
        
        // 统计下边缘的小数字
        for (let j = 0; j < gridSize; j++) {
            if (board[gridSize-1][j] === 1 || board[gridSize-1][j] === 2) {
                counts.down++;
            }
        }
        
        // 统计左边缘的小数字
        for (let i = 0; i < gridSize; i++) {
            if (board[i][0] === 1 || board[i][0] === 2) {
                counts.left++;
            }
        }
        
        // 统计上边缘的小数字
        for (let j = 0; j < gridSize; j++) {
            if (board[0][j] === 1 || board[0][j] === 2) {
                counts.up++;
            }
        }
        
        return counts;
    }

    // 在游戏状态改变时自动更新提示
    function updateHint() {
        if (gameState === 'playing') {
            showHint();
        }
    }

});
