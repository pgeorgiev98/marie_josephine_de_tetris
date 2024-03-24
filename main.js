const windowWidth = 7;
const windowHeight = 10;

const pieces = [
	{name: 'o', x: 0, y: 0, angle: 0, pixels: [[0, 0, 0, 0], [0, 1, 2, 0], [0, 3, 4, 0], [0, 0, 0, 0]]},
	{name: 'i', x: 0, y: 0, angle: 0, pixels: [[0, 1, 0, 0], [0, 2, 0, 0], [0, 3, 0, 0], [0, 4, 0, 0]]},
	{name: 't', x: 0, y: 0, angle: 0, pixels: [[0, 0, 0, 0], [1, 2, 3, 0], [0, 4, 0, 0], [0, 0, 0, 0]]},
	{name: 'l', x: 0, y: 0, angle: 0, pixels: [[4, 0, 0, 0], [3, 0, 0, 0], [1, 2, 0, 0], [0, 0, 0, 0]]},
	{name: 'j', x: 0, y: 0, angle: 0, pixels: [[0, 4, 0, 0], [0, 3, 0, 0], [1, 2, 0, 0], [0, 0, 0, 0]]},
	{name: 's', x: 0, y: 0, angle: 0, pixels: [[0, 3, 4, 0], [1, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]},
	{name: 'z', x: 0, y: 0, angle: 0, pixels: [[1, 2, 0, 0], [0, 3, 4, 0], [0, 0, 0, 0], [0, 0, 0, 0]]},
];
var currentPiece = null;
var blockTags = null;
var placedBlocks = null;

function setBlock(x, y, imageName, angle) {
	var bg = document.getElementById('background');
	var w = bg.offsetWidth;
	var h = bg.offsetHeight;
	var xOffset = 0, yOffset = 0;
	if (w / 100 * windowHeight / windowWidth > windowHeight) {
		var blockSize = h / windowHeight;
		xOffset = (w - blockSize * windowWidth) / 2;
	} else {
		var blockSize = w / windowWidth;
		yOffset = (h - blockSize * windowHeight) / 2;
	}

	var img = blockTags[y][x];
	if (!img) {
		img = document.createElement('img');
		img.style.position = 'absolute';
		document.getElementById('blocks').appendChild(img);
		blockTags[y][x] = img;
	}
	img.style.width = (blockSize + 1) + 'px';
	img.style.height = (blockSize + 1) + 'px';
	img.style.left = (xOffset + blockSize * x) + 'px';
	img.style.top = (yOffset + blockSize * y) + 'px';
	img.src = 'images/' + imageName + '.png';
	img.style.transform = 'rotate(' + angle + 'deg)';
}

function getCurrentBlock(x, y) {
	if (currentPiece) {
		var localX = x - currentPiece.x;
		var localY = y - currentPiece.y;
		if (localX >= 0 && localX < 4 && localY >= 0 && localY < 4 && currentPiece.pixels[localY][localX])
			return {name: currentPiece.name + '_' + currentPiece.pixels[localY][localX], angle: currentPiece.angle};
	}
	return placedBlocks[y][x];
}

function clearLine(lineY) {
	for (var y = lineY; y > 0; --y)
		for (var x = 0; x < windowWidth; ++x)
			placedBlocks[y][x] = placedBlocks[y - 1][x];
	for (var x = 0; x < windowWidth; ++x)
		placedBlocks[0][x] = {name: 'empty', angle: 0};
}

function clearFullLines() {
	for (var y = 0; y < windowHeight; ++y)
		if (placedBlocks[y].every((block) => block.name != 'empty'))
			clearLine(y);
}

function insertCurrentPiece() {
	for (var y = 0; y < windowHeight; ++y)
		for (var x = 0; x < windowWidth; ++x)
			placedBlocks[y][x] = getCurrentBlock(x, y);
	currentPiece = null;

	clearFullLines();
}

function updateBlocks() {
	for (var y = 0; y < windowHeight; ++y) {
		for (var x = 0; x < windowWidth; ++x) {
			var block = getCurrentBlock(x, y);
			setBlock(x, y, block.name, block.angle);
		}
	}
}

function getPieceWidth() {
	return getPieceMaxX() - getPieceMinX() + 1;
}

function getPieceHeight() {
	return getPieceMaxY() - getPieceMinY() + 1;
}

function getPieceMinX() {
	for (var x = 0; x < 4; ++x)
		for (var y = 0; y < 4; ++y)
			if (currentPiece.pixels[y][x])
				return currentPiece.x + x;
}

function getPieceMaxX() {
	for (var x = 3; x >= 0; --x)
		for (var y = 0; y < 4; ++y)
			if (currentPiece.pixels[y][x])
				return currentPiece.x + x;
}

function getPieceMinY() {
	for (var y = 0; y < 4; ++y)
		for (var x = 0; x < 4; ++x)
			if (currentPiece.pixels[y][x])
				return currentPiece.y + y;
}

function getPieceMaxY() {
	for (var y = 3; y >= 0; --y)
		for (var x = 0; x < 4; ++x)
			if (currentPiece.pixels[y][x])
				return currentPiece.y + y;
}

function isValidPosition() {
	var p = currentPiece;
	if (getPieceMinX() < 0 || getPieceMaxX() >= windowWidth || getPieceMaxY() >= windowHeight)
		return false;
	for (var localY = 0; localY < 4; ++localY) {
		for (var localX = 0; localX < 4; ++localX) {
			if (p.pixels[localY][localX]) {
				if (localY + p.y >= windowHeight)
					return false;
				if (localY + p.y >= 0 && placedBlocks[localY + p.y][localX + p.x].name != 'empty')
					return false;
			}
		}
	}
	return true;
}

function rotateCW() {
	var size = Math.max(getPieceWidth(), getPieceHeight()) == 3 ? 3 : 4;
	var newPixels = [[], [], [], []];
	for (var y = 0; y < size; ++y)
		for (var x = 0; x < size; ++x)
			newPixels[y][x] = currentPiece.pixels[size - x - 1][y];
	currentPiece.pixels = newPixels;
	currentPiece.angle += 90;
}

function rotateCCW() {
	var size = Math.max(getPieceWidth(), getPieceHeight()) == 3 ? 3 : 4;
	var newPixels = [[], [], [], []];
	for (var y = 0; y < size; ++y)
		for (var x = 0; x < size; ++x)
			newPixels[y][x] = currentPiece.pixels[x][size - y - 1];
	currentPiece.pixels = newPixels;
	currentPiece.angle -= 90;
}

function restart() {
	document.getElementById('blocks').innerHTML = '';
	blockTags = [];
	placedBlocks = [];
	for (var y = 0; y < windowHeight; ++y) {
		blockTags[y] = [];
		placedBlocks[y] = [];
		for (var x = 0; x < windowWidth; ++x)
			placedBlocks[y][x] = {name: 'empty', angle: 0};
	}
	updateBlocks();
}

function mainLoop() {
	if (!currentPiece) {
        currentPiece = Object.assign({}, pieces[Math.floor(Math.random() * pieces.length)]);
        currentPiece.y = -getPieceMaxY() - 1;
        currentPiece.x -= Math.ceil((getPieceMinX() + getPieceMaxX() - windowWidth) / 2);
	} else {
		currentPiece.y += 1;
		if (!isValidPosition()) {
			currentPiece.y -= 1;
			if (getPieceMinY() < 0)
				restart();
			else
				insertCurrentPiece();
		}
	}
	updateBlocks();
}

function handleKeyPress(event) {
	if (currentPiece) {
		if (event.key === 'a') {
			currentPiece.x -= 1;
			if (isValidPosition())
				updateBlocks();
			else
				currentPiece.x += 1;
		} else if (event.key === 'd') {
			currentPiece.x += 1;
			if (isValidPosition())
				updateBlocks();
			else
				currentPiece.x -= 1;
		} else if (event.key === 'w') {
			rotateCCW();
			if (isValidPosition())
				updateBlocks();
			else
				rotateCW();
		} else if (event.key === 's') {
			rotateCW();
			if (isValidPosition())
				updateBlocks();
			else
				rotateCCW();
		}
	}
}

document.addEventListener('DOMContentLoaded', function () {
	restart();
	setInterval(mainLoop, 1000);
	document.addEventListener('keydown', handleKeyPress);
});

window.addEventListener('resize', updateBlocks);
